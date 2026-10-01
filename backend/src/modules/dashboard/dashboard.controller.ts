import { Controller, Get, UseGuards, Inject, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';

@Controller(['api/dashboard', 'api/v1/dashboard'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(
    @Inject(DashboardService) private readonly dashboardService: DashboardService,
  ) {}

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('leader')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async getLeaderOverview(@Request() req: any) {
    return this.dashboardService.getLeaderOverview(req.user?.userId);
  }

  @Get('employee')
  async getEmployeeOverview(@Request() req: any) {
    return this.dashboardService.getEmployeeOverview(req.user?.userId);
  }
}


