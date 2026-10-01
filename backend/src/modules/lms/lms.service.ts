import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PaginationParams } from '../../common/types';

@Injectable()
export class LmsService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  async findCourses(params: PaginationParams = {}) {
    return this.db.findCoursesPaginated(params);
  }

  async findCourseById(id: string) {
    const course = await this.db.findCourseById(id);
    if (!course) throw new NotFoundException(`Course with ID ${id} not found`);
    return course;
  }

  async createCourse(data: any, userId?: string) {
    if (!data.title) throw new BadRequestException('Course title is required');
    return this.db.createCourse({ ...data, createdById: userId });
  }

  async updateCourse(id: string, updates: any) {
    const updated = await this.db.updateCourse(id, updates);
    if (!updated) throw new NotFoundException(`Course with ID ${id} not found`);
    return updated;
  }

  async deleteCourse(id: string) {
    const deleted = await this.db.deleteCourse(id);
    if (!deleted) throw new NotFoundException(`Course with ID ${id} not found`);
    return { success: true, message: 'Course deleted successfully' };
  }

  async findMyCourses(userId: string) {
    const employee = await this.db.findEmployeeByUserId(userId);
    const empId = employee?.id || 'c0000000-0000-0000-0000-000000000010';
    return this.db.findEmployeeCourses(empId);
  }

  async enrollEmployee(courseId: string, employeeId: string) {
    return this.db.enrollEmployeeInCourse(courseId, employeeId);
  }

  async updateModuleProgress(enrollmentId: string, moduleId: string, isCompleted: boolean, userId: string) {
    const employee = await this.db.findEmployeeByUserId(userId);
    const empId = employee?.id;
    const updated = await this.db.updateModuleProgress(enrollmentId, moduleId, isCompleted, empId);
    if (!updated) throw new NotFoundException('Enrollment or course module not found');
    return updated;
  }
}
