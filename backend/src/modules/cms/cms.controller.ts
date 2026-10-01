import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Inject,
  Request,
} from '@nestjs/common';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';

@Controller(['api/cms', 'api/v1/cms'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class CmsController {
  constructor(
    @Inject(CmsService) private readonly cmsService: CmsService,
  ) {}

  // ============================================================================
  // ANNOUNCEMENTS
  // ============================================================================

  @Get('announcements')
  async findAnnouncements(@Query() query: any) {
    return this.cmsService.findAnnouncements({
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 10,
      search: query.search,
      status: query.status,
    });
  }

  @Get('announcements/:id')
  async findAnnouncementById(@Param('id') id: string) {
    return this.cmsService.findAnnouncementById(id);
  }

  @Post('announcements')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async createAnnouncement(@Body() body: any, @Request() req: any) {
    return this.cmsService.createAnnouncement(body, req.user?.userId);
  }

  @Put('announcements/:id')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async updateAnnouncement(@Param('id') id: string, @Body() body: any) {
    return this.cmsService.updateAnnouncement(id, body);
  }

  @Delete('announcements/:id')
  @Roles(UserRole.ADMIN)
  async deleteAnnouncement(@Param('id') id: string) {
    return this.cmsService.deleteAnnouncement(id);
  }

  // ============================================================================
  // COMPANY RESOURCES / DOCUMENTS
  // ============================================================================

  @Get('resources')
  async findResources(@Query() query: any) {
    return this.cmsService.findResources({
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
      search: query.search,
      category: query.category,
    });
  }

  @Get('resources/:id')
  async findResourceById(@Param('id') id: string) {
    return this.cmsService.findResourceById(id);
  }

  @Post('resources')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async createResource(@Body() body: any, @Request() req: any) {
    return this.cmsService.createResource(body, req.user?.userId);
  }

  @Put('resources/:id')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async updateResource(@Param('id') id: string, @Body() body: any) {
    return this.cmsService.updateResource(id, body);
  }

  @Delete('resources/:id')
  @Roles(UserRole.ADMIN)
  async deleteResource(@Param('id') id: string) {
    return this.cmsService.deleteResource(id);
  }

  // ============================================================================
  // KNOWLEDGE BASE / HELP CENTER
  // ============================================================================

  @Get('knowledge-base')
  async findKnowledgeBase(@Query() query: any) {
    return this.cmsService.findKnowledgeBase({
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
      search: query.search,
      category: query.category,
      status: query.status,
    });
  }

  @Get('knowledge-base/:id')
  async findKnowledgeBaseById(@Param('id') id: string) {
    return this.cmsService.findKnowledgeBaseById(id);
  }

  @Post('knowledge-base')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async createKnowledgeBase(@Body() body: any, @Request() req: any) {
    return this.cmsService.createKnowledgeBase(body, req.user?.userId);
  }

  @Put('knowledge-base/:id')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async updateKnowledgeBase(@Param('id') id: string, @Body() body: any) {
    return this.cmsService.updateKnowledgeBase(id, body);
  }

  @Delete('knowledge-base/:id')
  @Roles(UserRole.ADMIN)
  async deleteKnowledgeBase(@Param('id') id: string) {
    return this.cmsService.deleteKnowledgeBase(id);
  }
}
