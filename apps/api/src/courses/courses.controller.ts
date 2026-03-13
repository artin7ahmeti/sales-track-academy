import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@salestrack/contracts';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AssignCourseDto } from './dto/assign-course.dto';
import { CourseListQueryDto } from './dto/course-list-query.dto';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() query: CourseListQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Get('my')
  @Roles(Role.AGENT)
  findForAgent(@CurrentUser() user: { id: string }) {
    return this.coursesService.findForAgent(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Post(':id/assign')
  @Roles(Role.ADMIN)
  assign(@Param('id') id: string, @Body() dto: AssignCourseDto) {
    return this.coursesService.assign(id, dto);
  }
}
