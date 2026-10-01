import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { OrganizationSettings } from '../../common/types';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  async getSettings() {
    return this.db.getOrganizationSettings();
  }

  async updateSettings(updates: Partial<OrganizationSettings>) {
    return this.db.updateOrganizationSettings(updates);
  }
}
