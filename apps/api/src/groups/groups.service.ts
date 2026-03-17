import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { Role } from '@salestrack/contracts';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const [groups, total] = await Promise.all([
      this.prisma.group.findMany({
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { members: true } } },
      }),
      this.prisma.group.count(),
    ]);

    return {
      data: groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        memberCount: g._count.members,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
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
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } },
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { joinedAt: 'desc' },
        },
      },
    });

    if (!group) throw new NotFoundException('Group not found');

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      memberCount: group._count.members,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      members: group.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        user: m.user,
        joinedAt: m.joinedAt,
      })),
    };
  }

  async create(dto: CreateGroupDto) {
    if (dto.memberIds?.length) {
      await this.ensureAssignableAgents(dto.memberIds);
    }

    const group = await this.prisma.group.create({
      data: {
        name: dto.name,
        description: dto.description,
        members: dto.memberIds?.length
          ? { create: dto.memberIds.map((userId) => ({ userId })) }
          : undefined,
      },
      include: { _count: { select: { members: true } } },
    });

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      memberCount: group._count.members,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  async update(id: string, dto: UpdateGroupDto) {
    await this.ensureExists(id);
    const group = await this.prisma.group.update({
      where: { id },
      data: dto,
      include: { _count: { select: { members: true } } },
    });

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      memberCount: group._count.members,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.group.delete({ where: { id } });
  }

  async addMembers(id: string, userIds: string[]) {
    await this.ensureExists(id);
    await this.ensureAssignableAgents(userIds);
    await this.prisma.groupMember.createMany({
      data: userIds.map((userId) => ({ groupId: id, userId })),
      skipDuplicates: true,
    });
    return this.findOne(id);
  }

  async removeMembers(id: string, userIds: string[]) {
    await this.ensureExists(id);
    await this.prisma.groupMember.deleteMany({
      where: { groupId: id, userId: { in: userIds } },
    });
    return this.findOne(id);
  }

  private async ensureExists(id: string) {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  private async ensureAssignableAgents(userIds: string[]) {
    if (userIds.length === 0) return;

    const uniqueUserIds = [...new Set(userIds)];
    const agents = await this.prisma.user.findMany({
      where: {
        id: { in: uniqueUserIds },
        role: Role.AGENT,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (agents.length !== uniqueUserIds.length) {
      throw new BadRequestException('Groups can only include active agents');
    }
  }
}
