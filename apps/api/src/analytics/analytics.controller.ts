import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@salestrack/contracts';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('org')
  @Roles(Role.ADMIN)
  getOrgAnalytics() {
    return this.analyticsService.getOrgAnalytics();
  }

  @Get('me')
  @Roles(Role.AGENT)
  getMyProgress(@CurrentUser() user: { id: string }) {
    return this.analyticsService.getAgentProgress(user.id);
  }

  @Get('agents/:id')
  @Roles(Role.ADMIN)
  getAgentProgress(@Param('id') id: string) {
    return this.analyticsService.getAgentProgress(id);
  }

  @Get('groups/:id')
  @Roles(Role.ADMIN)
  getGroupAnalytics(@Param('id') id: string) {
    return this.analyticsService.getGroupAnalytics(id);
  }
}
