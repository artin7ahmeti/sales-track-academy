import {
  Controller, Get, Post, Delete,
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
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@salestrack/contracts';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@Controller('courses/:courseId/quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Quizzes')
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  @ApiOperation({ summary: 'List quizzes by course' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiOkResponse({ description: 'Quizzes for the selected course.' })
  findAll(@Param('courseId') courseId: string) {
    return this.quizzesService.findByCourse(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by id' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiParam({ name: 'id', description: 'Quiz id' })
  @ApiOkResponse({ description: 'Quiz details; correct answers included only for admins.' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { role: string },
  ) {
    // Admins see correct answers, agents don't
    return this.quizzesService.findOne(id, user.role === 'ADMIN');
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create quiz (admin)' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiOkResponse({ description: 'Created quiz.' })
  create(@Param('courseId') courseId: string, @Body() dto: CreateQuizDto) {
    return this.quizzesService.create(courseId, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete quiz (admin)' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiParam({ name: 'id', description: 'Quiz id' })
  @ApiNoContentResponse({ description: 'Quiz deleted.' })
  remove(@Param('id') id: string) {
    return this.quizzesService.remove(id);
  }

  @Post(':id/submit')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Submit quiz attempt (agent)' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiParam({ name: 'id', description: 'Quiz id' })
  @ApiOkResponse({ description: 'Attempt result with score and pass/fail status.' })
  submit(
    @Param('id') id: string,
    @Body() dto: SubmitAttemptDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.quizzesService.submitAttempt(id, user.id, dto.answers);
  }

  @Get(':id/attempts')
  @ApiOperation({ summary: 'Get my attempts for quiz' })
  @ApiParam({ name: 'courseId', description: 'Course id' })
  @ApiParam({ name: 'id', description: 'Quiz id' })
  @ApiOkResponse({ description: 'Current user attempts for the quiz.' })
  getAttempts(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.quizzesService.getAttempts(id, user.id);
  }
}
