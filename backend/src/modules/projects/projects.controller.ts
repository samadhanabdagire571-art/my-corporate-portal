import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Inject,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';

@Controller(['api/projects', 'api/v1/projects'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  async findAll(@Query() query: any, @Request() req: any) {
    const user = req.user;
    return this.projectsService.findAllPaginated(
      {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 10,
        search: query.search,
        status: query.status,
        priority: query.priority,
        department: query.department,
        teamId: query.teamId,
        leaderId: query.leaderId,
      },
      user?.userId,
      user?.role,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async create(@Body() body: any) {
    return this.projectsService.create(body);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.projectsService.update(id, body);
  }

  @Patch(':id/archive')
  @Roles(UserRole.ADMIN)
  async archive(@Param('id') id: string) {
    return this.projectsService.archive(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Get(':id/versions')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async getVersions(@Param('id') id: string) {
    return this.projectsService.getVersions(id);
  }

  @Post(':id/versions')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async createVersion(
    @Param('id') id: string,
    @Body() body: { summary?: string },
    @Request() req: any,
  ) {
    const user = req.user;
    return this.projectsService.createVersion(
      id,
      user?.userId,
      user?.fullName || user?.email || 'User',
      body.summary,
    );
  }
}


