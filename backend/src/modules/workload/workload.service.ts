import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../cache/cache.service';
import { UserRole, EmployeeWorkloadSummary, TeamWorkloadSummary, OrganizationWorkloadSummary } from '../../common/types';

@Injectable()
export class WorkloadService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(CacheService) private readonly cache: CacheService,
  ) {}

  async getMyWorkload(userId: string): Promise<EmployeeWorkloadSummary> {
    const employee = await this.db.findEmployeeByUserId(userId);
    if (!employee) {
      throw new NotFoundException('Employee profile not found for authenticated user');
    }

    const cacheKey = `workload:emp:${employee.id}`;
    const cached = await this.cache.get<EmployeeWorkloadSummary>(cacheKey);
    if (cached) return cached;

    const summary = await this.db.getEmployeeWorkloadSummary(employee.id);
    if (!summary) throw new NotFoundException('Workload data unavailable');

    await this.cache.set(cacheKey, summary, 30);
    return summary;
  }

  async getEmployeeWorkload(targetEmployeeId: string, user: { userId: string; role: UserRole }): Promise<EmployeeWorkloadSummary> {
    const targetEmployee = await this.db.findEmployeeById(targetEmployeeId);
    if (!targetEmployee) {
      throw new NotFoundException(`Employee ${targetEmployeeId} not found`);
    }

    // RBAC Authorization Check
    if (user.role === UserRole.EMPLOYEE || user.role === UserRole.INTERN) {
      if (targetEmployee.userId !== user.userId) {
        throw new ForbiddenException('Access denied: You cannot view workload statistics for other staff members.');
      }
    } else if (user.role === UserRole.TEAM_LEADER) {
      const leaderEmployee = await this.db.findEmployeeByUserId(user.userId);
      if (leaderEmployee) {
        const teams = await this.db.findTeamsByLeader(leaderEmployee.id);
        const leaderTeamIds = teams.map((t) => t.id);
        const members = await this.db.findTeamMembersByEmployee(targetEmployee.id);
        const isInLeaderTeam = members.some((m) => leaderTeamIds.includes(m.teamId));
        if (!isInLeaderTeam && targetEmployee.userId !== user.userId) {
          throw new ForbiddenException('Access denied: You can only view workload statistics for members of teams you supervise.');
        }
      }
    }

    const summary = await this.db.getEmployeeWorkloadSummary(targetEmployee.id);
    if (!summary) throw new NotFoundException('Workload data unavailable');
    return summary;
  }

  async getTeamWorkload(teamId: string, user: { userId: string; role: UserRole }): Promise<TeamWorkloadSummary> {
    const team = await this.db.findTeamById(teamId);
    if (!team) throw new NotFoundException(`Team ${teamId} not found`);

    if (user.role === UserRole.TEAM_LEADER) {
      const leaderEmployee = await this.db.findEmployeeByUserId(user.userId);
      if (!leaderEmployee || team.leaderId !== leaderEmployee.id) {
        throw new ForbiddenException('Access denied: You can only inspect workload for teams you directly supervise.');
      }
    } else if (user.role === UserRole.EMPLOYEE || user.role === UserRole.INTERN) {
      throw new ForbiddenException('Access denied: Regular staff members cannot access team-wide workload dashboards.');
    }

    const cacheKey = `workload:team:${teamId}`;
    const cached = await this.cache.get<TeamWorkloadSummary>(cacheKey);
    if (cached) return cached;

    const summary = await this.db.getTeamWorkloadSummary(teamId);
    if (!summary) throw new NotFoundException('Team workload data unavailable');

    await this.cache.set(cacheKey, summary, 45);
    return summary;
  }

  async getOrganizationWorkload(user: { userId: string; role: UserRole }, filters?: any): Promise<OrganizationWorkloadSummary> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied: Organization-level workload summary requires Administrator privileges.');
    }

    const cacheKey = `workload:org:${JSON.stringify(filters || {})}`;
    const cached = await this.cache.get<OrganizationWorkloadSummary>(cacheKey);
    if (cached) return cached;

    const summary = await this.db.getOrganizationWorkloadSummary(filters);
    await this.cache.set(cacheKey, summary, 60);
    return summary;
  }
}
