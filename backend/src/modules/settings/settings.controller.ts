import { Controller, Get, Patch, Body, UseGuards, Inject } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, OrganizationSettings } from '../../common/types';

@Controller(['api/settings', 'api/v1/settings', 'settings'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(
    @Inject(SettingsService) private readonly settingsService: SettingsService,
  ) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @Roles(UserRole.ADMIN)
  async updateSettings(@Body() updates: Partial<OrganizationSettings>) {
    return this.settingsService.updateSettings(updates);
  }
}
