import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, EntityStatus } from '../../common/types';

@Controller(['api/employees', 'api/v1/employees'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(
    @Inject(EmployeesService) private readonly employeesService: EmployeesService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER, UserRole.EMPLOYEE, UserRole.INTERN)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.employeesService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      department,
      status,
      type,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER, UserRole.EMPLOYEE, UserRole.INTERN)
  async findById(@Param('id') id: string) {
    return this.employeesService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() body: any) {
    return this.employeesService.create(body);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.employeesService.update(id, body);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: EntityStatus,
  ) {
    return this.employeesService.updateStatus(id, status);
  }

  @Post(':id/reset-password')
  @Roles(UserRole.ADMIN)
  async resetPassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword?: string,
  ) {
    return this.employeesService.resetPassword(id, newPassword);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.employeesService.delete(id);
  }
}
