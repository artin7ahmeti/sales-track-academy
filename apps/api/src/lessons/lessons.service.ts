import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageAppService } from '../storage/storage-app.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import type { Prisma } from '@salestrack/database';

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageAppService,
  ) {}

  async findByCourse(courseId: string) {
    return this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async create(courseId: string, dto: CreateLessonDto) {
    const maxOrder = await this.prisma.lesson.aggregate({
      where: { courseId },
      _max: { sortOrder: true },
    });

    return this.prisma.lesson.create({
      data: {
        courseId,
        title: dto.title,
        description: dto.description,
        type: dto.type as any,
        content: dto.content as Prisma.InputJsonValue,
        durationSec: dto.durationSec,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });
  }

  async update(id: string, dto: UpdateLessonDto) {
    const existing = await this.ensureExists(id);
    if (dto.content !== undefined) {
      const oldKey = this.extractS3Key(existing.content);
      const newKey = this.extractS3Key(dto.content);
      if (oldKey && oldKey !== newKey) {
        this.storage.deleteFile(oldKey).catch(() => {});
      }
    }
    const data: Prisma.LessonUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.content !== undefined) data.content = dto.content as Prisma.InputJsonValue;
    if (dto.durationSec !== undefined) data.durationSec = dto.durationSec;

    return this.prisma.lesson.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await this.ensureExists(id);
    const s3Key = this.extractS3Key(existing.content);
    if (s3Key) {
      this.storage.deleteFile(s3Key).catch(() => {});
    }
    await this.prisma.lesson.delete({ where: { id } });
  }

  async reorder(courseId: string, lessonIds: string[]) {
    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
      select: { id: true },
    });
    const validIds = new Set(lessons.map((l) => l.id));
    const invalid = lessonIds.filter((id) => !validIds.has(id));
    if (invalid.length > 0) {
      throw new BadRequestException('Some lesson IDs do not belong to this course');
    }

    await this.prisma.$transaction(
      lessonIds.map((id, index) =>
        this.prisma.lesson.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
  }

  async updateProgress(
    lessonId: string,
    userId: string,
    progressPct: number,
    lastPosition?: number,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const assignment = await this.prisma.courseAssignment.findFirst({
      where: { courseId: lesson.courseId, userId },
    });
    if (!assignment) {
      throw new ForbiddenException('You are not assigned to this course');
    }

    const isCompleted = progressPct >= 100;
    const completedAt = isCompleted ? new Date() : undefined;

    const progress = await this.prisma.lessonProgress.upsert({
      where: { lessonId_userId: { lessonId, userId } },
      create: {
        lessonId,
        userId,
        progressPct,
        lastPosition,
        isCompleted,
        completedAt,
      },
      update: {
        progressPct,
        lastPosition,
        isCompleted,
        completedAt,
      },
    });

    // Check if all lessons in the course are completed to update assignment status
    if (isCompleted) {
      await this.checkCourseCompletion(lesson.courseId, userId);
    }

    return progress;
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

  private extractS3Key(content: unknown): string | null {
    if (content && typeof content === 'object' && 's3Key' in content) {
      const key = (content as Record<string, unknown>).s3Key;
      return typeof key === 'string' && key.length > 0 ? key : null;
    }
    return null;
  }

  private async ensureExists(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }
}
