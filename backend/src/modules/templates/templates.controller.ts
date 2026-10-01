import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Inject,
  Request,
} from '@nestjs/common';
import { TaskTemplatesService } from './templates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';

@Controller(['api/task-templates', 'api/v1/task-templates'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskTemplatesController {
  constructor(
    @Inject(TaskTemplatesService) private readonly templatesService: TaskTemplatesService,
  ) {}

  @Get()
  async findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async create(@Body() body: any, @Request() req: any) {
    return this.templatesService.create({
      ...body,
      createdById: req.user?.userId,
    });
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.templatesService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
