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
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('lessons/:lessonId/comments')
@UseGuards(JwtAuthGuard)
@ApiTags('Comments')
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'List lesson comments' })
  @ApiParam({ name: 'lessonId', description: 'Lesson id' })
  @ApiOkResponse({ description: 'Threaded comments for lesson.' })
  findAll(@Param('lessonId') lessonId: string) {
    return this.commentsService.findByLesson(lessonId);
  }

  @Post()
  @ApiOperation({ summary: 'Create comment' })
  @ApiParam({ name: 'lessonId', description: 'Lesson id' })
  @ApiOkResponse({ description: 'Created comment.' })
  create(
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.commentsService.create(lessonId, user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update comment' })
  @ApiParam({ name: 'lessonId', description: 'Lesson id' })
  @ApiParam({ name: 'id', description: 'Comment id' })
  @ApiOkResponse({ description: 'Updated comment.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.commentsService.update(id, user.id, user.role, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete comment' })
  @ApiParam({ name: 'lessonId', description: 'Lesson id' })
  @ApiParam({ name: 'id', description: 'Comment id' })
  @ApiNoContentResponse({ description: 'Comment deleted.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.commentsService.remove(id, user.id, user.role);
  }
}
