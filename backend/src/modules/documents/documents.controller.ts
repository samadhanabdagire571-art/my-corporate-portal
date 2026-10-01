import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Inject,
  Request,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';

@Controller(['api/documents', 'api/v1/documents'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(
    @Inject(DocumentsService) private readonly documentsService: DocumentsService,
  ) {}

  @Get(':id/versions')
  async getVersionHistory(@Param('id') id: string) {
    return this.documentsService.getVersionHistory(id);
  }

  @Post(':id/versions')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async uploadNewVersion(
    @Param('id') id: string,
    @Body() body: { fileName: string; fileUrl: string; fileSize?: number; fileType?: string; changeDescription?: string },
    @Request() req: any,
  ) {
    return this.documentsService.uploadNewVersion(id, body, req.user);
  }

  @Post(':id/versions/:versionId/restore')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async restoreVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Request() req: any,
  ) {
    return this.documentsService.restoreVersion(id, versionId, req.user);
  }

  @Get(':id/versions/:versionId/download')
  async downloadVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ) {
    return this.documentsService.getVersionDownload(id, versionId);
  }
}
