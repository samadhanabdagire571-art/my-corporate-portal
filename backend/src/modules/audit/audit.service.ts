import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PaginationParams } from '../../common/types';

@Injectable()
export class AuditService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  async getAuditLogs(params: PaginationParams) {
    return this.db.findAuditLogsPaginated(params);
  }

  async recordLog(params: {
    userId?: string;
    userName: string;
    userRole: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: string;
    previousValue?: any;
    newValue?: any;
    ipAddress?: string;
  }) {
    return this.db.recordAuditLog(params);
  }
}
