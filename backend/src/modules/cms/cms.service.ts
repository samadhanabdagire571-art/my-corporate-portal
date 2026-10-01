import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PaginationParams } from '../../common/types';

@Injectable()
export class CmsService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  // ============================================================================
  // ANNOUNCEMENTS
  // ============================================================================

  async findAnnouncements(params: PaginationParams = {}) {
    return this.db.findAnnouncementsPaginated(params);
  }

  async findAnnouncementById(id: string) {
    const item = await this.db.findAnnouncementById(id);
    if (!item) throw new NotFoundException(`Announcement with ID ${id} not found`);
    return item;
  }

  async createAnnouncement(data: any, userId?: string) {
    if (!data.title || !data.content) {
      throw new BadRequestException('Announcement title and content are required');
    }
    return this.db.createAnnouncement({ ...data, createdBy: userId });
  }

  async updateAnnouncement(id: string, updates: any) {
    const updated = await this.db.updateAnnouncement(id, updates);
    if (!updated) throw new NotFoundException(`Announcement with ID ${id} not found`);
    return updated;
  }

  async deleteAnnouncement(id: string) {
    const deleted = await this.db.deleteAnnouncement(id);
    if (!deleted) throw new NotFoundException(`Announcement with ID ${id} not found`);
    return { success: true, message: 'Announcement deleted successfully' };
  }

  // ============================================================================
  // COMPANY RESOURCES
  // ============================================================================

  async findResources(params: PaginationParams = {}) {
    return this.db.findResourcesPaginated(params);
  }

  async findResourceById(id: string) {
    const item = await this.db.findResourceById(id);
    if (!item) throw new NotFoundException(`Resource with ID ${id} not found`);
    return item;
  }

  async createResource(data: any, userId?: string) {
    if (!data.title || !data.fileUrl) {
      throw new BadRequestException('Resource title and file URL are required');
    }
    return this.db.createResource({ ...data, uploadedBy: userId });
  }

  async updateResource(id: string, updates: any) {
    const updated = await this.db.updateResource(id, updates);
    if (!updated) throw new NotFoundException(`Resource with ID ${id} not found`);
    return updated;
  }

  async deleteResource(id: string) {
    const deleted = await this.db.deleteResource(id);
    if (!deleted) throw new NotFoundException(`Resource with ID ${id} not found`);
    return { success: true, message: 'Resource deleted successfully' };
  }

  // ============================================================================
  // KNOWLEDGE BASE / HELP CENTER
  // ============================================================================

  async findKnowledgeBase(params: PaginationParams = {}) {
    return this.db.findKnowledgeBasePaginated(params);
  }

  async findKnowledgeBaseById(id: string) {
    const item = await this.db.findKnowledgeBaseById(id);
    if (!item) throw new NotFoundException(`Knowledge base entry with ID ${id} not found`);
    return item;
  }

  async createKnowledgeBase(data: any, userId?: string) {
    if (!data.question || !data.answer) {
      throw new BadRequestException('Question and answer are required');
    }
    return this.db.createKnowledgeBase({ ...data, createdBy: userId });
  }

  async updateKnowledgeBase(id: string, updates: any) {
    const updated = await this.db.updateKnowledgeBase(id, updates);
    if (!updated) throw new NotFoundException(`Knowledge base entry with ID ${id} not found`);
    return updated;
  }

  async deleteKnowledgeBase(id: string) {
    const deleted = await this.db.deleteKnowledgeBase(id);
    if (!deleted) throw new NotFoundException(`Knowledge base entry with ID ${id} not found`);
    return { success: true, message: 'Knowledge base entry deleted successfully' };
  }
}
