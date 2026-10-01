import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';

@Controller(['api/teams', 'api/v1/teams'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(
    @Inject(TeamsService) private readonly teamsService: TeamsService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER, UserRole.EMPLOYEE, UserRole.INTERN)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
  ) {
    return this.teamsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      department,
      status,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER, UserRole.EMPLOYEE, UserRole.INTERN)
  async findById(@Param('id') id: string) {
    return this.teamsService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() body: any) {
    return this.teamsService.create(body);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.teamsService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.teamsService.delete(id);
  }

  @Put(':id/leader')
  @Roles(UserRole.ADMIN)
  async assignLeader(
    @Param('id') id: string,
    @Body('leaderId') leaderId: string | null,
  ) {
    return this.teamsService.assignLeader(id, leaderId);
  }

  @Post(':id/members')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async addMember(
    @Param('id') id: string,
    @Body('employeeId') employeeId: string,
    @Body('roleInTeam') roleInTeam?: string,
  ) {
    return this.teamsService.addMember(id, employeeId, roleInTeam);
  }

  @Delete(':id/members/:employeeId')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async removeMember(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.teamsService.removeMember(id, employeeId);
  }
}
