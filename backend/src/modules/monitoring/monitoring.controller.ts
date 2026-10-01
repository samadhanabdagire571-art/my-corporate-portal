import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';

@Controller(['api/monitoring', 'api/v1/monitoring'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(
    @Inject(MonitoringService) private readonly monitoringService: MonitoringService,
  ) {}

  @Get('metrics')
  @Roles(UserRole.ADMIN)
  async getMetrics() {
    return this.monitoringService.getMetrics();
  }

  @Get('overview')
  @Roles(UserRole.ADMIN)
  async getOverview() {
    return this.monitoringService.getMetrics();
  }
}
