import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PaginationParams, EntityStatus } from '../../common/types';

@Injectable()
export class TeamLeadersService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  async findAll(params: PaginationParams) {
    return this.db.findTeamLeadersPaginated(params);
  }

  async findById(id: string) {
    const leader = await this.db.findEmployeeById(id);
    if (!leader) {
      throw new NotFoundException(`Team leader with ID ${id} not found`);
    }
    return leader;
  }

  async create(data: {
    fullName: string;
    employeeId: string;
    email: string;
    phone?: string;
    department: string;
    designation?: string;
    profilePhotoUrl?: string;
    password?: string;
  }) {
    if (!data.fullName || !data.employeeId || !data.email || !data.department) {
      throw new BadRequestException('Full name, Employee ID, Email, and Department are required');
    }

    const existing = await this.db.findUserByEmailOrEmpId(data.email);
    if (existing) {
      throw new ConflictException(`User with email "${data.email}" already exists`);
    }

    const existingEmpId = await this.db.findUserByEmailOrEmpId(data.employeeId);
    if (existingEmpId) {
      throw new ConflictException(`Employee ID "${data.employeeId}" is already assigned`);
    }

    return this.db.createTeamLeader(data);
  }

  async update(id: string, updates: any) {
    const leader = await this.db.findEmployeeById(id);
    if (!leader) {
      throw new NotFoundException(`Team leader with ID ${id} not found`);
    }
    return this.db.updateEmployee(id, updates);
  }

  async updateStatus(id: string, status: EntityStatus) {
    const leader = await this.db.findEmployeeById(id);
    if (!leader) {
      throw new NotFoundException(`Team leader with ID ${id} not found`);
    }
    return this.db.updateEmployeeStatus(id, status);
  }
}
