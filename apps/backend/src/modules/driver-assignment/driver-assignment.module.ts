import { Module } from '@nestjs/common';
import { DriverAssignmentService } from './driver-assignment.service';
import { DriverAssignmentController } from './driver-assignment.controller';
import { DispatchEngineService } from './dispatch-engine.service';
import { ETAIntelligenceService } from './eta-intelligence.service';
import { DbModule } from '../../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [DriverAssignmentController],
  providers: [
    DriverAssignmentService,
    DispatchEngineService,
    ETAIntelligenceService
  ],
})
export class DriverAssignmentModule {}