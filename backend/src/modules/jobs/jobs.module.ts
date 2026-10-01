import { Module, Global } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JobsController } from './jobs.controller';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [JobsController],
  providers: [QueueService],
  exports: [QueueService],
})
export class JobsModule {}
