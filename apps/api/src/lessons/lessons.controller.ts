import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@salestrack/contracts';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('courses/:courseId/lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Lessons')
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @ApiOperation({ summary: 'List lessons by course' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiOkResponse({ description: 'Course lessons ordered by sortOrder.' })
  findAll(@Param('courseId') courseId: string) {
    return this.lessonsService.findByCourse(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by id' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiParam({ name: 'id', description: 'Lesson id' })
  @ApiOkResponse({ description: 'Lesson details.' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create lesson (admin)' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiOkResponse({ description: 'Created lesson.' })
  create(@Param('courseId') courseId: string, @Body() dto: CreateLessonDto) {
    return this.lessonsService.create(courseId, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update lesson (admin)' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiParam({ name: 'id', description: 'Lesson id' })
  @ApiOkResponse({ description: 'Updated lesson.' })
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.lessonsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete lesson (admin)' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiParam({ name: 'id', description: 'Lesson id' })
  @ApiNoContentResponse({ description: 'Lesson deleted.' })
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }

  @Post('reorder')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reorder lessons (admin)' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiOkResponse({ description: 'Reordered lessons.' })
  reorder(@Param('courseId') courseId: string, @Body() dto: ReorderLessonsDto) {
    return this.lessonsService.reorder(courseId, dto.lessonIds);
  }

  @Post(':id/progress')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Update lesson progress (agent)' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiParam({ name: 'id', description: 'Lesson id' })
  @ApiOkResponse({ description: 'Updated lesson progress.' })
  updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdateProgressDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.lessonsService.updateProgress(id, user.id, dto.progressPct, dto.lastPosition);
  }
}
