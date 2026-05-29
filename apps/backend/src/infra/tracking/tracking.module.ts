import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  TrackingGateway,
  TrackingNamespaceGateway,
  KDSNamespaceGateway,
  AdminNamespaceGateway,
  DriverNamespaceGateway,
} from './tracking.gateway';
import { NotificationEntity } from '../../db/entities/notification.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  providers: [
    TrackingGateway,
    TrackingNamespaceGateway,
    KDSNamespaceGateway,
    AdminNamespaceGateway,
    DriverNamespaceGateway,
  ],
  exports: [
    TrackingGateway,
    TrackingNamespaceGateway,
    KDSNamespaceGateway,
    AdminNamespaceGateway,
    DriverNamespaceGateway,
  ],
})
export class TrackingModule {}