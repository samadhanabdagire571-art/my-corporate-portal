import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Inject,
  Request,
} from '@nestjs/common';
import { WorkloadService } from './workload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';

@Controller(['api/workload', 'api/v1/workload'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkloadController {
  constructor(
    @Inject(WorkloadService) private readonly workloadService: WorkloadService,
  ) {}

  @Get('me')
  async getMyWorkload(@Request() req: any) {
    return this.workloadService.getMyWorkload(req.user?.userId);
  }

  @Get('organization')
  @Roles(UserRole.ADMIN)
  async getOrganizationWorkload(@Query() query: any, @Request() req: any) {
    return this.workloadService.getOrganizationWorkload(req.user, query);
  }

  @Get('team/:teamId')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async getTeamWorkload(@Param('teamId') teamId: string, @Request() req: any) {
    return this.workloadService.getTeamWorkload(teamId, req.user);
  }

  @Get('employee/:employeeId')
  async getEmployeeWorkload(@Param('employeeId') employeeId: string, @Request() req: any) {
    return this.workloadService.getEmployeeWorkload(employeeId, req.user);
  }
}
