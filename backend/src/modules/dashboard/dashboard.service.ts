import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  async getOverview() {
    return this.db.getDashboardOverview();
  }

  async getLeaderOverview(userId: string) {
    return this.db.getLeaderDashboardOverview(userId);
  }

  async getEmployeeOverview(userId: string) {
    return this.db.getEmployeeDashboardOverview(userId);
  }
}


