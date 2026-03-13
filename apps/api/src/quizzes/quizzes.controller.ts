import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
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
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  findAll(@Param('courseId') courseId: string) {
    return this.quizzesService.findByCourse(courseId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { role: string },
  ) {
    // Admins see correct answers, agents don't
    return this.quizzesService.findOne(id, user.role === 'ADMIN');
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Param('courseId') courseId: string, @Body() dto: CreateQuizDto) {
    return this.quizzesService.create(courseId, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.quizzesService.remove(id);
  }

  @Post(':id/submit')
  @Roles(Role.AGENT)
  submit(
    @Param('id') id: string,
    @Body() dto: SubmitAttemptDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.quizzesService.submitAttempt(id, user.id, dto.answers);
  }

  @Get(':id/attempts')
  getAttempts(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.quizzesService.getAttempts(id, user.id);
  }
}
