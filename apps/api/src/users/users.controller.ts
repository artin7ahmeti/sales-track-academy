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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@salestrack/contracts';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UserListQueryDto } from './dto/user-list-query.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Users')
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @ApiOperation({ summary: 'Update own profile' })
  @ApiOkResponse({ description: 'Updated user profile.' })
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List users (admin)' })
  @ApiOkResponse({ description: 'Paginated user list.' })
  findAll(@Query() query: UserListQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get user by id (admin)' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiOkResponse({ description: 'User details.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create user (admin)' })
  @ApiOkResponse({ description: 'Created user.' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user (admin)' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiOkResponse({ description: 'Updated user.' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (soft delete, admin)' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiNoContentResponse({ description: 'User deleted.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('invite')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Invite user (admin)' })
  @ApiOkResponse({ description: 'Invitation created with delivery status and a fallback invite URL when email is not sent.' })
  invite(@Body() dto: InviteUserDto, @CurrentUser() user: { id: string }) {
    return this.usersService.invite(dto, user.id);
  }
}
