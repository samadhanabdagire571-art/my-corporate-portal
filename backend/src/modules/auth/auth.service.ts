import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../../database/database.service';
import { UserRole, EntityStatus } from '../../common/types';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  async login(credentials: {
    identifier: string; // Email or Employee ID
    password: string;
    rememberMe?: boolean;
  }) {
    const { identifier, password, rememberMe } = credentials;

    if (!identifier || !password) {
      throw new BadRequestException('Email/Employee ID and Password are required');
    }

    const user = await this.db.findUserByEmailOrEmpId(identifier);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials. Check your email/ID and password.');
    }

    if (user.status !== EntityStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is currently inactive or suspended. Contact Admin.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials. Check your email/ID and password.');
    }

    // Get linked employee profile
    const employee = await this.db.findEmployeeByUserId(user.id);

    // Update last login
    await this.db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });

    const payload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
      organizationId: user.organizationId,
      name: employee ? employee.fullName : user.email,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: rememberMe ? '30d' : '7d',
    });

    let redirectUrl = '/employee/dashboard';
    if (user.role === UserRole.ADMIN) {
      redirectUrl = '/admin/dashboard';
    } else if (user.role === UserRole.TEAM_LEADER) {
      redirectUrl = '/leader/dashboard';
    }

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: rememberMe ? 30 * 24 * 3600 : 7 * 24 * 3600,
      redirectUrl,
      user: {
        id: user.id,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        organizationId: user.organizationId,
        name: employee ? employee.fullName : user.email,
        department: employee ? employee.department : '',
        designation: employee ? employee.designation : '',
        profilePhotoUrl: employee?.profilePhotoUrl || '',
        employeeType: employee?.employeeType || 'EMPLOYEE',
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.db.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User session not found');
    }

    const employee = await this.db.findEmployeeByUserId(user.id);

    return {
      id: user.id,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
      organizationId: user.organizationId,
      name: employee ? employee.fullName : user.email,
      department: employee ? employee.department : '',
      designation: employee ? employee.designation : '',
      profilePhotoUrl: employee?.profilePhotoUrl || '',
      employeeType: employee?.employeeType || 'EMPLOYEE',
      status: user.status,
    };
  }

  async forgotPassword(identifier: string) {
    const user = await this.db.findUserByEmailOrEmpId(identifier);
    if (!user) {
      return {
        message: 'If an account exists with the provided credentials, password reset instructions have been dispatched.',
      };
    }

    const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expires = new Date(Date.now() + 3600 * 1000).toISOString();

    await this.db.updateUser(user.id, {
      resetToken,
      resetExpires: expires,
    });

    return {
      message: 'Password reset instructions have been generated.',
      devResetToken: resetToken,
    };
  }

  async resetPassword(body: { token: string; newPassword: string }) {
    if (!body.token || !body.newPassword) {
      throw new BadRequestException('Reset token and new password are required');
    }

    if (body.newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    const user = await this.db.findUserByResetToken(body.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const hash = await bcrypt.hash(body.newPassword, 10);
    await this.db.updateUser(user.id, {
      passwordHash: hash,
      resetToken: undefined,
      resetExpires: undefined,
    });

    return {
      success: true,
      message: 'Password has been successfully updated. You may now log in.',
    };
  }

  async impersonate(body: { targetUserId?: string; targetEmployeeId?: string }, adminUser: any) {
    let targetUser: any = null;
    let employee: any = null;

    if (body.targetUserId) {
      targetUser = await this.db.findUserById(body.targetUserId);
      if (targetUser) {
        employee = await this.db.findEmployeeByUserId(targetUser.id);
      }
    } else if (body.targetEmployeeId) {
      employee = await this.db.findEmployeeById(body.targetEmployeeId);
      if (employee) {
        targetUser = await this.db.findUserById(employee.userId);
      }
    }

    if (!targetUser || !employee) {
      throw new NotFoundException('Target user/employee not found for view mode');
    }

    const payload = {
      sub: targetUser.id,
      userId: targetUser.id,
      email: targetUser.email,
      employeeId: targetUser.employeeId,
      role: targetUser.role,
      organizationId: targetUser.organizationId,
      name: employee.fullName,
      isImpersonated: true,
      originalAdminId: adminUser?.userId || adminUser?.id,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '2h' });

    let redirectUrl = '/employee/dashboard';
    if (targetUser.role === UserRole.TEAM_LEADER) {
      redirectUrl = '/leader/dashboard';
    }

    await this.db.recordAuditLog({
      organizationId: targetUser.organizationId,
      userId: adminUser?.userId || adminUser?.id,
      userName: adminUser?.name || 'Administrator',
      userRole: 'ADMIN',
      action: 'ADMIN_VIEW_MODE_START',
      entity: 'USER',
      entityId: targetUser.id,
      details: `Admin initiated view mode as ${employee.fullName} (${targetUser.role})`,
    });

    return {
      accessToken: token,
      tokenType: 'Bearer',
      isImpersonated: true,
      redirectUrl,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        employeeId: targetUser.employeeId,
        role: targetUser.role,
        organizationId: targetUser.organizationId,
        name: employee.fullName,
        department: employee.department,
        designation: employee.designation,
        profilePhotoUrl: employee.profilePhotoUrl || '',
        employeeType: employee.employeeType || 'EMPLOYEE',
        isImpersonated: true,
        impersonatedBy: adminUser?.name || 'Administrator',
      },
    };
  }
}
