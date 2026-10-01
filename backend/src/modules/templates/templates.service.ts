import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class TaskTemplatesService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  async findAll() {
    return this.db.findAllTaskTemplates();
  }

  async findOne(id: string) {
    const template = await this.db.findTaskTemplateById(id);
    if (!template) {
      throw new NotFoundException(`Task template with ID ${id} not found`);
    }
    return template;
  }

  async create(data: any) {
    return this.db.createTaskTemplate(data);
  }

  async update(id: string, updates: any) {
    const updated = await this.db.updateTaskTemplate(id, updates);
    if (!updated) {
      throw new NotFoundException(`Task template with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.db.deleteTaskTemplate(id);
    if (!deleted) {
      throw new NotFoundException(`Task template with ID ${id} not found`);
    }
    return { success: true, message: 'Template deleted successfully' };
  }
}
