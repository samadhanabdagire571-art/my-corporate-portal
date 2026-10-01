import { Module } from '@nestjs/common';
import { TeamLeadersController } from './team-leaders.controller';
import { TeamLeadersService } from './team-leaders.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TeamLeadersController],
  providers: [TeamLeadersService],
  exports: [TeamLeadersService],
})
export class TeamLeadersModule {}
