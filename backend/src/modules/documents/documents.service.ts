import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { DocumentVersionEntity, UserRole } from '../../common/types';

@Injectable()
export class DocumentsService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  async getVersionHistory(documentId: string): Promise<DocumentVersionEntity[]> {
    const resource = await this.db.findResourceById(documentId);
    if (!resource) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }

    return this.db.findDocumentVersions(documentId);
  }

  async uploadNewVersion(
    documentId: string,
    data: {
      fileName: string;
      fileUrl: string;
      fileSize?: number;
      fileType?: string;
      changeDescription?: string;
    },
    user: { userId: string; role: UserRole },
  ): Promise<DocumentVersionEntity> {
    const resource = await this.db.findResourceById(documentId);
    if (!resource) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }

    const employee = await this.db.findEmployeeByUserId(user.userId);
    const uploadedByName = employee ? employee.fullName : 'Authorized User';

    const newVersion = await this.db.createDocumentVersion({
      documentId,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      fileType: data.fileType,
      uploadedBy: user.userId,
      uploadedByName,
      changeDescription: data.changeDescription || 'Updated document version',
    });

    await this.db.createAuditLog({
      organizationId: 'a0000000-0000-0000-0000-000000000001',
      userId: user.userId,
      action: 'DOCUMENT_VERSION_UPLOADED',
      entity: 'RESOURCE',
      entityId: documentId,
      details: {
        versionNumber: newVersion.versionNumber,
        fileName: newVersion.fileName,
        changeDescription: newVersion.changeDescription,
      },
    });

    return newVersion;
  }

  async restoreVersion(
    documentId: string,
    versionId: string,
    user: { userId: string; role: UserRole },
  ): Promise<DocumentVersionEntity> {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.TEAM_LEADER) {
      throw new ForbiddenException('Access denied: Restoring previous document versions requires Manager or Administrator privileges.');
    }

    const restored = await this.db.restoreDocumentVersion(documentId, versionId);
    if (!restored) {
      throw new NotFoundException(`Version ${versionId} for document ${documentId} not found`);
    }

    await this.db.createAuditLog({
      organizationId: 'a0000000-0000-0000-0000-000000000001',
      userId: user.userId,
      action: 'DOCUMENT_VERSION_RESTORED',
      entity: 'RESOURCE',
      entityId: documentId,
      details: {
        restoredVersionNumber: restored.versionNumber,
        fileName: restored.fileName,
      },
    });

    return restored;
  }

  async getVersionDownload(documentId: string, versionId: string): Promise<DocumentVersionEntity> {
    const version = await this.db.findDocumentVersionById(versionId);
    if (!version || version.documentId !== documentId) {
      throw new NotFoundException(`Document version ${versionId} not found`);
    }
    return version;
  }
}
