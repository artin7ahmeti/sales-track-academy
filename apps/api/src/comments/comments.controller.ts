import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('lessons/:lessonId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(@Param('lessonId') lessonId: string) {
    return this.commentsService.findByLesson(lessonId);
  }

  @Post()
  create(
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.commentsService.create(lessonId, user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.commentsService.update(id, user.id, user.role, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.commentsService.remove(id, user.id, user.role);
  }
}
