import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AssignCourseDto } from './dto/assign-course.dto';
import { CourseListQueryDto } from './dto/course-list-query.dto';
import type { Prisma } from '@salestrack/database';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CourseListQueryDto) {
    const where: Prisma.CourseWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.isPublished !== undefined) where.isPublished = query.isPublished;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { lessons: true, quizzes: true, assignments: true },
          },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        thumbnailUrl: c.thumbnailUrl,
        isPublished: c.isPublished,
        lessonCount: c._count.lessons,
        quizCount: c._count.quizzes,
        assignmentCount: c._count.assignments,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id, deletedAt: null },
      include: {
        _count: { select: { lessons: true, quizzes: true, assignments: true } },
        lessons: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true, title: true, type: true,
            sortOrder: true, durationSec: true,
          },
        },
        quizzes: {
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { questions: true } } },
        },
      },
    });

    if (!course) throw new NotFoundException('Course not found');

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      isPublished: course.isPublished,
      lessonCount: course._count.lessons,
      quizCount: course._count.quizzes,
      assignmentCount: course._count.assignments,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      lessons: course.lessons,
      quizzes: course.quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        lessonId: q.lessonId,
        passingScore: q.passingScore,
        questionCount: q._count.questions,
        sortOrder: q.sortOrder,
      })),
    };
  }

  async findForAgent(userId: string) {
    const assignments = await this.prisma.courseAssignment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            _count: { select: { lessons: true } },
            lessons: {
              select: { id: true },
            },
          },
        },
      },
    });

    const lessonIds = assignments.flatMap((a) =>
      a.course.lessons.map((l) => l.id),
    );

    const progress = await this.prisma.lessonProgress.findMany({
      where: { userId, lessonId: { in: lessonIds } },
    });

    const progressMap = new Map(progress.map((p) => [p.lessonId, p]));

    return assignments.map((a) => {
      const totalLessons = a.course._count.lessons;
      const completedLessons = a.course.lessons.filter(
        (l) => progressMap.get(l.id)?.isCompleted,
      ).length;
      const progressPct =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        id: a.course.id,
        title: a.course.title,
        description: a.course.description,
        thumbnailUrl: a.course.thumbnailUrl,
        lessonCount: totalLessons,
        completedLessons,
        progressPct,
        status: a.status,
        assignedAt: a.assignedAt,
        dueDate: a.dueDate,
      };
    });
  }

  async create(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: dto,
      select: {
        id: true, title: true, description: true, thumbnailUrl: true,
        isPublished: true, createdAt: true, updatedAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateCourseDto) {
    await this.ensureExists(id);
    return this.prisma.course.update({
      where: { id },
      data: dto,
      select: {
        id: true, title: true, description: true, thumbnailUrl: true,
        isPublished: true, createdAt: true, updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async assign(id: string, dto: AssignCourseDto) {
    await this.ensureExists(id);

    const assignments: Prisma.CourseAssignmentCreateManyInput[] = [];
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : undefined;

    if (dto.userIds?.length) {
      for (const userId of dto.userIds) {
        assignments.push({ courseId: id, userId, dueDate });
      }
    }

    if (dto.groupIds?.length) {
      for (const groupId of dto.groupIds) {
        assignments.push({ courseId: id, groupId, dueDate });
      }

      // Also create individual assignments for group members
      const members = await this.prisma.groupMember.findMany({
        where: { groupId: { in: dto.groupIds } },
        select: { userId: true },
      });
      for (const m of members) {
        assignments.push({ courseId: id, userId: m.userId, dueDate });
      }
    }

    await this.prisma.courseAssignment.createMany({
      data: assignments,
      skipDuplicates: true,
    });

    return { message: 'Course assigned successfully' };
  }

  private async ensureExists(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id, deletedAt: null },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }
}
