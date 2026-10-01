import { Controller, Get, Query, Res, UseGuards, Inject } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';

@Controller(['api/reports', 'api/v1/reports', 'reports'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(
    @Inject(ReportsService) private readonly reportsService: ReportsService,
  ) {}

  @Get('organization')
  @Roles(UserRole.ADMIN)
  async getOrganizationReport() {
    return this.reportsService.getOrganizationReport();
  }

  @Get('work')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async getWorkReport() {
    return this.reportsService.getWorkReport();
  }

  @Get('projects')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async getProjectsReport() {
    return this.reportsService.getProjectsReport();
  }

  @Get('employees')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async getEmployeesReport() {
    return this.reportsService.getEmployeesReport();
  }

  @Get('export')
  @Roles(UserRole.ADMIN)
  async exportReport(
    @Query('type') type: string,
    @Query('format') format: 'csv' | 'xlsx',
    @Res() res: Response,
  ) {
    const result = await this.reportsService.exportReportData(type, format || 'csv');
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.content);
  }
}
