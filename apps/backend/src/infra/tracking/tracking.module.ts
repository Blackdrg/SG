import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingGateway } from './tracking.gateway';
import { NotificationEntity } from '../../db/entities/notification.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  providers: [TrackingGateway],
  exports: [TrackingGateway],
})
export class TrackingModule {}