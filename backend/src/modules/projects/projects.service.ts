import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PaginationParams } from '../../common/types';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  async findAllPaginated(params: PaginationParams, currentUserId?: string, currentUserRole?: string) {
    return this.db.findProjectsPaginated(params, currentUserId, currentUserRole);
  }

  async findOne(id: string) {
    const project = await this.db.findProjectById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async create(data: {
    name: string;
    code?: string;
    description?: string;
    department?: string;
    teamId?: string | null;
    leaderId?: string | null;
    startDate?: string;
    targetDate?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status?: any;
    templateId?: string;
  }) {
    return this.db.createProject(data);
  }

  async update(id: string, updates: any) {
    const updated = await this.db.updateProject(id, updates);
    if (!updated) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return updated;
  }

  async archive(id: string) {
    const archived = await this.db.archiveProject(id);
    if (!archived) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return archived;
  }

  async remove(id: string) {
    const deleted = await this.db.deleteProject(id);
    if (!deleted) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return { success: true, message: 'Project removed successfully' };
  }

  async getVersions(projectId: string) {
    return this.db.findTaskPlanVersions(projectId);
  }

  async createVersion(projectId: string, changedById: string, changedByName: string, summary?: string) {
    return this.db.recordTaskPlanVersion({
      projectId,
      changedById,
      changedByName,
      summary,
    });
  }
}

