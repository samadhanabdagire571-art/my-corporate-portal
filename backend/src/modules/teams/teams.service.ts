import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PaginationParams } from '../../common/types';

@Injectable()
export class TeamsService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  async findAll(params: PaginationParams) {
    return this.db.findTeamsPaginated(params);
  }

  async findById(id: string) {
    const team = await this.db.findTeamById(id);
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  async create(data: {
    name: string;
    department: string;
    leaderId?: string | null;
    description?: string;
    memberIds?: string[];
  }) {
    if (!data.name || !data.department) {
      throw new BadRequestException('Team name and department are required');
    }
    return this.db.createTeam(data);
  }

  async update(id: string, updates: any) {
    const existing = await this.db.findTeamById(id);
    if (!existing) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return this.db.updateTeam(id, updates);
  }

  async delete(id: string) {
    const success = await this.db.deleteTeam(id);
    if (!success) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return { success: true, message: 'Team successfully removed' };
  }

  async assignLeader(teamId: string, leaderId: string | null) {
    const team = await this.db.findTeamById(teamId);
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }
    return this.db.assignTeamLeader(teamId, leaderId);
  }

  async addMember(teamId: string, employeeId: string, roleInTeam = 'MEMBER') {
    const success = await this.db.addMemberToTeam(teamId, employeeId, roleInTeam);
    if (!success) {
      throw new BadRequestException('Failed to add employee to team. Verify team and employee existence.');
    }
    return { success: true, message: 'Employee added to team' };
  }

  async removeMember(teamId: string, employeeId: string) {
    const success = await this.db.removeMemberFromTeam(teamId, employeeId);
    if (!success) {
      throw new NotFoundException('Membership record not found');
    }
    return { success: true, message: 'Employee removed from team' };
  }
}
