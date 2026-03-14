import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@salestrack/contracts';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Analytics')
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('org')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Organization analytics (admin)' })
  @ApiOkResponse({ description: 'Aggregated organization metrics.' })
  getOrgAnalytics() {
    return this.analyticsService.getOrgAnalytics();
  }

  @Get('me')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'My progress (agent)' })
  @ApiOkResponse({ description: 'Authenticated agent progress and scores.' })
  getMyProgress(@CurrentUser() user: { id: string }) {
    return this.analyticsService.getAgentProgress(user.id);
  }

  @Get('agents/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Agent progress by id (admin)' })
  @ApiParam({ name: 'id', description: 'Agent user id' })
  @ApiOkResponse({ description: 'Selected agent progress.' })
  getAgentProgress(@Param('id') id: string) {
    return this.analyticsService.getAgentProgress(id);
  }

  @Get('groups/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Group analytics by id (admin)' })
  @ApiParam({ name: 'id', description: 'Group id' })
  @ApiOkResponse({ description: 'Selected group analytics.' })
  getGroupAnalytics(@Param('id') id: string) {
    return this.analyticsService.getGroupAnalytics(id);
  }
}
