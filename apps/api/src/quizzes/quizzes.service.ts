import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCourse(courseId: string) {
    const quizzes = await this.prisma.quiz.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { questions: true } } },
    });

    return quizzes.map((q) => ({
      id: q.id,
      courseId: q.courseId,
      lessonId: q.lessonId,
      title: q.title,
      description: q.description,
      passingScore: q.passingScore,
      sortOrder: q.sortOrder,
      questionCount: q._count.questions,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }));
  }

  async findByLesson(lessonId: string, includeCorrect = false) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { lessonId },
      include: {
        _count: { select: { questions: true } },
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            options: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!quiz) return null;

    return {
      id: quiz.id,
      courseId: quiz.courseId,
      lessonId: quiz.lessonId,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      sortOrder: quiz.sortOrder,
      questionCount: quiz._count.questions,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        text: q.text,
        sortOrder: q.sortOrder,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
          sortOrder: o.sortOrder,
          ...(includeCorrect && { isCorrect: o.isCorrect }),
        })),
      })),
    };
  }

  async findOne(id: string, includeCorrect = false) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        _count: { select: { questions: true } },
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            options: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                text: true,
                sortOrder: true,
                isCorrect: includeCorrect,
              },
            },
          },
        },
      },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');

    return {
      id: quiz.id,
      courseId: quiz.courseId,
      lessonId: quiz.lessonId,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      sortOrder: quiz.sortOrder,
      questionCount: quiz._count.questions,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        text: q.text,
        sortOrder: q.sortOrder,
        options: q.options,
      })),
    };
  }

  async create(courseId: string, dto: CreateQuizDto, lessonId?: string) {
    if (lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { courseId: true },
      });
      if (!lesson) throw new NotFoundException('Lesson not found');
      if (lesson.courseId !== courseId) {
        throw new BadRequestException('Lesson does not belong to this course');
      }
      const existing = await this.prisma.quiz.findUnique({ where: { lessonId } });
      if (existing) {
        throw new BadRequestException('This lesson already has a quiz');
      }
    }

    const maxOrder = await this.prisma.quiz.aggregate({
      where: { courseId },
      _max: { sortOrder: true },
    });

    return this.prisma.quiz.create({
      data: {
        courseId,
        lessonId: lessonId || null,
        title: dto.title,
        description: dto.description,
        passingScore: dto.passingScore ?? 80,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
        questions: {
          create: dto.questions.map((q, qi) => ({
            text: q.text,
            sortOrder: qi,
            options: {
              create: q.options.map((o, oi) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                sortOrder: oi,
              })),
            },
          })),
        },
      },
      include: {
        _count: { select: { questions: true } },
      },
    });
  }

  async update(id: string, courseId: string, dto: UpdateQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    // Validate lessonId change
    if (dto.lessonId !== undefined) {
      const newLessonId = dto.lessonId;
      if (newLessonId !== null) {
        const lesson = await this.prisma.lesson.findUnique({
          where: { id: newLessonId },
          select: { courseId: true },
        });
        if (!lesson) throw new NotFoundException('Lesson not found');
        if (lesson.courseId !== courseId) {
          throw new BadRequestException('Lesson does not belong to this course');
        }
        // Check no other quiz is already linked to this lesson
        const existing = await this.prisma.quiz.findUnique({ where: { lessonId: newLessonId } });
        if (existing && existing.id !== id) {
          throw new BadRequestException('This lesson already has a quiz');
        }
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.questions) {
        await tx.answerOption.deleteMany({
          where: { question: { quizId: id } },
        });
        await tx.question.deleteMany({ where: { quizId: id } });

        for (let qi = 0; qi < dto.questions.length; qi++) {
          const q = dto.questions[qi]!;
          await tx.question.create({
            data: {
              quizId: id,
              text: q.text,
              sortOrder: qi,
              options: {
                create: q.options.map((o, oi) => ({
                  text: o.text,
                  isCorrect: o.isCorrect,
                  sortOrder: oi,
                })),
              },
            },
          });
        }
      }

      return tx.quiz.update({
        where: { id },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.passingScore !== undefined && { passingScore: dto.passingScore }),
          ...(dto.lessonId !== undefined && { lessonId: dto.lessonId }),
        },
        include: {
          _count: { select: { questions: true } },
          questions: {
            orderBy: { sortOrder: 'asc' },
            include: {
              options: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      });
    });
  }

  async remove(id: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    await this.prisma.quiz.delete({ where: { id } });
  }

  async submitAttempt(
    quizId: string,
    userId: string,
    answers: Record<string, string>,
  ) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: { where: { isCorrect: true } },
          },
        },
      },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');

    const assignment = await this.prisma.courseAssignment.findFirst({
      where: { courseId: quiz.courseId, userId },
    });
    if (!assignment) {
      throw new ForbiddenException('You are not assigned to this course');
    }

    const totalQuestions = quiz.questions.length;
    if (totalQuestions === 0) {
      throw new BadRequestException('Quiz has no questions');
    }

    let correctCount = 0;
    const correctAnswers: Record<string, string> = {};

    for (const question of quiz.questions) {
      const correctOption = question.options[0];
      if (correctOption) {
        correctAnswers[question.id] = correctOption.id;
        if (answers[question.id] === correctOption.id) {
          correctCount++;
        }
      }
    }

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score,
        passed,
        answers: answers as any,
        completedAt: new Date(),
      },
    });

    // If passed and quiz is linked to a lesson, auto-complete the lesson
    if (passed && quiz.lessonId) {
      await this.prisma.lessonProgress.upsert({
        where: { lessonId_userId: { lessonId: quiz.lessonId, userId } },
        create: {
          lessonId: quiz.lessonId,
          userId,
          progressPct: 100,
          isCompleted: true,
          completedAt: new Date(),
        },
        update: {
          progressPct: 100,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      await this.checkCourseCompletion(quiz.courseId, userId);
    }

    return {
      id: attempt.id,
      quizId: attempt.quizId,
      score: attempt.score,
      passed: attempt.passed,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      correctAnswers: passed ? correctAnswers : {},
      userAnswers: answers,
    };
  }

  async getAttempts(quizId: string, userId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { quizId, userId },
      orderBy: { startedAt: 'desc' },
      select: {
        id: true, quizId: true, score: true,
        passed: true, startedAt: true, completedAt: true,
      },
    });
  }

  private async checkCourseCompletion(courseId: string, userId: string) {
    const totalLessons = await this.prisma.lesson.count({ where: { courseId } });
    const completedLessons = await this.prisma.lessonProgress.count({
      where: {
        lesson: { courseId },
        userId,
        isCompleted: true,
      },
    });

    if (completedLessons >= totalLessons) {
      await this.prisma.courseAssignment.updateMany({
        where: { courseId, userId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    } else {
      await this.prisma.courseAssignment.updateMany({
        where: { courseId, userId, status: 'ASSIGNED' },
        data: { status: 'IN_PROGRESS' },
      });
    }
  }
}
