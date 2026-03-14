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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@salestrack/contracts';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ManageMembersDto } from './dto/manage-members.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiTags('Groups')
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiOperation({ summary: 'List groups (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Paginated group list.' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.groupsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by id (admin)' })
  @ApiParam({ name: 'id', description: 'Group id' })
  @ApiOkResponse({ description: 'Group details with members.' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create group (admin)' })
  @ApiOkResponse({ description: 'Created group.' })
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update group (admin)' })
  @ApiParam({ name: 'id', description: 'Group id' })
  @ApiOkResponse({ description: 'Updated group.' })
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete group (admin)' })
  @ApiParam({ name: 'id', description: 'Group id' })
  @ApiNoContentResponse({ description: 'Group deleted.' })
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add group members (admin)' })
  @ApiParam({ name: 'id', description: 'Group id' })
  @ApiOkResponse({ description: 'Updated group with members.' })
  addMembers(@Param('id') id: string, @Body() dto: ManageMembersDto) {
    return this.groupsService.addMembers(id, dto.userIds);
  }

  @Delete(':id/members')
  @ApiOperation({ summary: 'Remove group members (admin)' })
  @ApiParam({ name: 'id', description: 'Group id' })
  @ApiOkResponse({ description: 'Updated group with remaining members.' })
  removeMembers(@Param('id') id: string, @Body() dto: ManageMembersDto) {
    return this.groupsService.removeMembers(id, dto.userIds);
  }
}
