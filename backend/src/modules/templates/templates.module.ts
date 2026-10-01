import { Module } from '@nestjs/common';
import { TaskTemplatesController } from './templates.controller';
import { TaskTemplatesService } from './templates.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TaskTemplatesController],
  providers: [TaskTemplatesService],
  exports: [TaskTemplatesService],
})
export class TaskTemplatesModule {}

