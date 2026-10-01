import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { TeamLeadersService } from './team-leaders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, EntityStatus } from '../../common/types';

@Controller(['api/team-leaders', 'api/v1/team-leaders'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamLeadersController {
  constructor(
    @Inject(TeamLeadersService) private readonly teamLeadersService: TeamLeadersService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
  ) {
    return this.teamLeadersService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      department,
      status,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async findById(@Param('id') id: string) {
    return this.teamLeadersService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() body: any) {
    return this.teamLeadersService.create(body);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.teamLeadersService.update(id, body);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: EntityStatus,
  ) {
    return this.teamLeadersService.updateStatus(id, status);
  }
}
