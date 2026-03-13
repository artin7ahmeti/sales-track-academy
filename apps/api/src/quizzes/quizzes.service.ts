import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';

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
      title: q.title,
      description: q.description,
      passingScore: q.passingScore,
      sortOrder: q.sortOrder,
      questionCount: q._count.questions,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }));
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

  async create(courseId: string, dto: CreateQuizDto) {
    const maxOrder = await this.prisma.quiz.aggregate({
      where: { courseId },
      _max: { sortOrder: true },
    });

    return this.prisma.quiz.create({
      data: {
        courseId,
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

    return {
      id: attempt.id,
      quizId: attempt.quizId,
      score: attempt.score,
      passed: attempt.passed,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      correctAnswers,
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
}
