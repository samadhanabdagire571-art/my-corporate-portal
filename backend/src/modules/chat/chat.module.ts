import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { WorkloadModule } from '../workload/workload.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, WorkloadModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
