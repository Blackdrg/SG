import { Module, Global } from '@nestjs/common';
import {
  TrackingGateway,
  TrackingNamespaceGateway,
  KDSNamespaceGateway,
  AdminNamespaceGateway,
  DriverNamespaceGateway,
} from './tracking.gateway';

@Global()
@Module({
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