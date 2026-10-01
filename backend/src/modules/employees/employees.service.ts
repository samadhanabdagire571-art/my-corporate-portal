import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../../database/database.service';
import {
  EntityStatus,
  EmployeeType,
  PaginationParams,
  UserRole,
} from '../../common/types';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  async findAll(params: PaginationParams) {
    return this.db.findEmployeesPaginated(params);
  }

  async findById(id: string) {
    const emp = await this.db.findEmployeeById(id);
    if (!emp) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return emp;
  }

  async create(data: {
    fullName: string;
    employeeId: string;
    email: string;
    phone?: string;
    department: string;
    designation: string;
    employeeType?: EmployeeType;
    joiningDate?: string;
    profilePhotoUrl?: string;
    password?: string;
    role?: UserRole;
    teamId?: string;
  }) {
    if (!data.fullName || !data.employeeId || !data.email || !data.department || !data.designation) {
      throw new BadRequestException('Full name, Employee ID, Email, Department, and Designation are required');
    }

    // Check uniqueness
    const existing = await this.db.findUserByEmailOrEmpId(data.email);
    if (existing) {
      throw new ConflictException(`User with email "${data.email}" already exists`);
    }

    const existingEmpId = await this.db.findUserByEmailOrEmpId(data.employeeId);
    if (existingEmpId) {
      throw new ConflictException(`Employee ID "${data.employeeId}" is already assigned`);
    }

    return this.db.createEmployee(data);
  }

  async update(id: string, updates: any) {
    const existing = await this.db.findEmployeeById(id);
    if (!existing) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Check email uniqueness if email updated
    if (updates.email && updates.email !== existing.email) {
      const conflict = await this.db.findUserByEmailOrEmpId(updates.email);
      if (conflict && conflict.id !== existing.userId) {
        throw new ConflictException(`Email "${updates.email}" is already used by another account`);
      }
    }

    return this.db.updateEmployee(id, updates);
  }

  async updateStatus(id: string, status: EntityStatus) {
    const emp = await this.db.findEmployeeById(id);
    if (!emp) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return this.db.updateEmployeeStatus(id, status);
  }

  async resetPassword(id: string, newPassword?: string) {
    const emp = await this.db.findEmployeeById(id);
    if (!emp) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const generatedPassword = newPassword || `Corp@${Math.floor(100000 + Math.random() * 900000)}`;
    const hash = await bcrypt.hash(generatedPassword, 10);

    await this.db.updateUser(emp.userId, { passwordHash: hash });

    return {
      success: true,
      message: `Password reset successfully for ${emp.fullName}`,
      temporaryPassword: generatedPassword,
    };
  }

  async delete(id: string) {
    const emp = await this.db.findEmployeeById(id);
    if (!emp) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    if (emp.role === UserRole.ADMIN || emp.employeeId === 'EMP-ADM-001') {
      throw new BadRequestException('Primary system administrator account cannot be deleted');
    }

    const success = await this.db.deleteEmployee(id);
    if (!success) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return { success: true, message: 'Employee successfully removed from corporate registry' };
  }
}
