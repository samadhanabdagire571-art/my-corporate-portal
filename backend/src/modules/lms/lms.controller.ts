import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Inject,
  Request,
} from '@nestjs/common';
import { LmsService } from './lms.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/types';

@Controller(['api/lms', 'api/v1/lms'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class LmsController {
  constructor(
    @Inject(LmsService) private readonly lmsService: LmsService,
  ) {}

  @Get('courses')
  async findCourses(@Query() query: any) {
    return this.lmsService.findCourses({
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
      search: query.search,
      category: query.category,
      status: query.status,
    });
  }

  @Get('my-training')
  async findMyTraining(@Request() req: any) {
    return this.lmsService.findMyCourses(req.user?.userId);
  }

  @Get('courses/:id')
  async findCourseById(@Param('id') id: string) {
    return this.lmsService.findCourseById(id);
  }

  @Post('courses')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async createCourse(@Body() body: any, @Request() req: any) {
    return this.lmsService.createCourse(body, req.user?.userId);
  }

  @Put('courses/:id')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async updateCourse(@Param('id') id: string, @Body() body: any) {
    return this.lmsService.updateCourse(id, body);
  }

  @Delete('courses/:id')
  @Roles(UserRole.ADMIN)
  async deleteCourse(@Param('id') id: string) {
    return this.lmsService.deleteCourse(id);
  }

  @Post('enroll')
  @Roles(UserRole.ADMIN, UserRole.TEAM_LEADER)
  async enrollEmployee(@Body() body: { courseId: string; employeeId: string }) {
    return this.lmsService.enrollEmployee(body.courseId, body.employeeId);
  }

  @Patch('enrollments/:id/progress')
  async updateModuleProgress(
    @Param('id') id: string,
    @Body() body: { moduleId: string; isCompleted: boolean },
    @Request() req: any
  ) {
    return this.lmsService.updateModuleProgress(id, body.moduleId, body.isCompleted, req.user?.userId);
  }
}
