import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByLesson(lessonId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { lessonId, parentId: null, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, role: true } },
        replies: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, role: true } },
          },
        },
      },
    });

    return comments.map((c) => ({
      id: c.id,
      lessonId: c.lessonId,
      userId: c.userId,
      parentId: c.parentId,
      body: c.body,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      user: c.user,
      replies: c.replies.map((r) => ({
        id: r.id,
        lessonId: r.lessonId,
        userId: r.userId,
        parentId: r.parentId,
        body: r.body,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: r.user,
        replies: [],
      })),
    }));
  }

  async create(lessonId: string, userId: string, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        lessonId,
        userId,
        body: dto.body,
        parentId: dto.parentId,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, role: true } },
      },
    });
  }

  async update(id: string, userId: string, role: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment || comment.deletedAt) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Cannot edit another user\'s comment');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { body: dto.body },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, role: true } },
      },
    });
  }

  async remove(id: string, userId: string, role: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment || comment.deletedAt) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Cannot delete another user\'s comment');
    }

    await this.prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
