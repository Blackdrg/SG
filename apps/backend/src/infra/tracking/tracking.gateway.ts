import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum SocketNamespace {
  TRACKING = '/tracking',
  KDS = '/kds',
  ADMIN = '/admin',
  DRIVER = '/driver',
}

interface LocationUpdate {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
}

interface KDSEvent {
  orderId: string;
  status: string;
  branchId: string;
  timestamp: Date;
}

interface DriverEvent {
  driverId: string;
  orderId?: string;
  event: 'assigned' | 'accepted' | 'picked_up' | 'delivered';
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/',
  pingInterval: 30000,
  pingTimeout: 60000,
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);
  private readonly connectedClients = new Map<string, { namespace?: string; userId?: string }>();

  constructor(private configService: ConfigService) {}

  handleConnection(client: Socket) {
    const namespace = client.nsp.name;
    this.connectedClients.set(client.id, { namespace });
    this.logger.log(`Client ${client.id} connected to ${namespace}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.join(data.room);
    this.logger.log(`Client ${client.id} joined room ${data.room}`);
    return { status: 'joined', room: data.room };
  }

  @SubscribeMessage('updateLocation')
  handleLocationUpdate(@MessageBody() data: LocationUpdate, @ConnectedSocket() client: Socket) {
    if (!this.isValidLocation(data)) {
      return { error: 'Invalid location data' };
    }

    const topic = `tracking:${data.driverId}`;
    this.server.to(topic).emit(topic, {
      ...data,
      timestamp: new Date().toISOString(),
    });

    this.checkOfflineTimeout(data.driverId);
    return { status: 'ok' };
  }

  @SubscribeMessage('kdsUpdate')
  handleKDSUpdate(@MessageBody() data: KDSEvent) {
    const topic = `kds:${data.branchId}`;
    this.server.to(topic).emit(topic, data);
    return { status: 'ok' };
  }

  @SubscribeMessage('driverEvent')
  handleDriverEvent(@MessageBody() data: DriverEvent) {
    const topic = `driver:${data.driverId}`;
    this.server.to(topic).emit(topic, { ...data, timestamp: new Date().toISOString() });
    return { status: 'ok' };
  }

  async publish(topic: string, data: any): Promise<void> {
    this.server.emit(topic, data);
  }

  async publishToRoom(room: string, data: any): Promise<void> {
    this.server.to(room).emit(room, data);
  }

  getActiveConnections(): number {
    return this.server.engine.clientsCount;
  }

  getNamespaceStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.connectedClients.forEach((client) => {
      const ns = client.namespace || 'unknown';
      stats[ns] = (stats[ns] || 0) + 1;
    });
    return stats;
  }

  private isValidLocation(data: LocationUpdate): boolean {
    return (
      typeof data.driverId === 'string' &&
      typeof data.lat === 'number' &&
      typeof data.lng === 'number' &&
      data.lat >= -90 &&
      data.lat <= 90 &&
      data.lng >= -180 &&
      data.lng <= 180
    );
  }

  private checkOfflineTimeout(driverId: string) {
    // Track driver last seen time for offline detection
    const now = Date.now();
    const timeout = 30000; // 30 seconds
    // Implementation would check if driver has timed out
  }
}

@Injectable()
@WebSocketGateway({
  namespace: SocketNamespace.TRACKING,
  cors: { origin: '*' },
})
export class TrackingNamespaceGateway extends TrackingGateway {}

@Injectable()
@WebSocketGateway({
  namespace: SocketNamespace.KDS,
  cors: { origin: '*' },
})
export class KDSNamespaceGateway extends TrackingGateway {}

@Injectable()
@WebSocketGateway({
  namespace: SocketNamespace.ADMIN,
  cors: { origin: '*' },
})
export class AdminNamespaceGateway extends TrackingGateway {}

@Injectable()
@WebSocketGateway({
  namespace: SocketNamespace.DRIVER,
  cors: { origin: '*' },
})
export class DriverNamespaceGateway extends TrackingGateway {}