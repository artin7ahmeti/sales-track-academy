import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
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
@ApiTags('Courses')
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List courses (admin)' })
  @ApiOkResponse({ description: 'Paginated course list.' })
  findAll(@Query() query: CourseListQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Get('my')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'List my assigned courses (agent)' })
  @ApiOkResponse({ description: 'Courses assigned to authenticated agent.' })
  findForAgent(@CurrentUser() user: { id: string }) {
    return this.coursesService.findForAgent(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by id' })
  @ApiParam({ name: 'id', description: 'Course id' })
  @ApiOkResponse({ description: 'Course details.' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create course (admin)' })
  @ApiOkResponse({ description: 'Created course.' })
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update course (admin)' })
  @ApiParam({ name: 'id', description: 'Course id' })
  @ApiOkResponse({ description: 'Updated course.' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete course (admin)' })
  @ApiParam({ name: 'id', description: 'Course id' })
  @ApiNoContentResponse({ description: 'Course deleted.' })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Post(':id/assign')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign course to users/groups (admin)' })
  @ApiParam({ name: 'id', description: 'Course id' })
  @ApiOkResponse({ description: 'Assignment result.' })
  assign(@Param('id') id: string, @Body() dto: AssignCourseDto) {
    return this.coursesService.assign(id, dto);
  }
}
