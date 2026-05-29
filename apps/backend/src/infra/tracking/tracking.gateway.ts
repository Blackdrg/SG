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
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from '../../db/entities/notification.entity';
import { NotificationStatus } from '../../db/entities/notification-status.enum';

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
  timestamp?: number;
}

interface AcknowledgedMessage {
  id: string;
  event: string;
  data: any;
  timestamp: Date;
  ack?: boolean;
}

interface SocketConnection {
  id: string;
  namespace?: string;
  userId?: string;
  lastPing?: Date;
  acknowledgedMessages: Map<string, AcknowledgedMessage>;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/',
  pingInterval: 10000,
  pingTimeout: 20000,
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);
  private readonly connectedClients = new Map<string, SocketConnection>();
  private readonly messageQueue = new Map<string, AcknowledgedMessage[]>();
  private readonly pendingAcks = new Map<string, { resolve: (value: any) => void; reject: (reason?: any) => void; timeout: NodeJS.Timeout }>();
  private readonly ackTimeoutMs: number;

  constructor(
    private configService: ConfigService,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {
    this.ackTimeoutMs = this.configService.get<number>('WS_ACK_TIMEOUT_MS', 5000);
  }

  handleConnection(client: Socket) {
    const namespace = client.nsp.name;
    this.connectedClients.set(client.id, {
      id: client.id,
      namespace,
      acknowledgedMessages: new Map(),
    });
    this.logger.log(`Client ${client.id} connected to ${namespace}`);
    
    client.emit('connected', { status: 'ok', serverTime: Date.now() });
  }

  handleDisconnect(client: Socket) {
    this.cleanupPendingAcks(client.id);
    this.connectedClients.delete(client.id);
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    const conn = this.connectedClients.get(client.id);
    if (conn) {
      conn.lastPing = new Date();
    }
    return { status: 'pong', serverTime: Date.now() };
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.join(data.room);
    this.logger.log(`Client ${client.id} joined room ${data.room}`);
    return { status: 'joined', room: data.room };
  }

  @SubscribeMessage('ack')
  handleAcknowledgement(@MessageBody() data: { messageId: string }, @ConnectedSocket() client: Socket) {
    const conn = this.connectedClients.get(client.id);
    if (conn && conn.acknowledgedMessages.has(data.messageId)) {
      conn.acknowledgedMessages.get(data.messageId)!.ack = true;
      
      const pending = this.pendingAcks.get(data.messageId);
      if (pending) {
        clearTimeout(pending.timeout);
        pending.resolve({ status: 'acknowledged' });
        this.pendingAcks.delete(data.messageId);
      }
    }
    return { status: 'ack_received' };
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: AcknowledgedMessage,
    @ConnectedSocket() client: Socket
  ) {
    const conn = this.connectedClients.get(client.id);
    if (!conn) return { error: 'Not connected' };

    data.timestamp = new Date();
    conn.acknowledgedMessages.set(data.id, data);

    if (data.ack) {
      const ackResult = await new Promise((resolve, reject) => {
        this.pendingAcks.set(data.id, {
          resolve,
          reject,
          timeout: setTimeout(() => {
            this.pendingAcks.delete(data.id);
            resolve({ status: 'timeout', message: 'Acknowledgement timeout' });
          }, this.ackTimeoutMs),
        });
      });
      return ackResult;
    }

    return { status: 'received' };
  }

  @SubscribeMessage('updateLocation')
  async handleLocationUpdate(@MessageBody() data: LocationUpdate, @ConnectedSocket() client: Socket) {
    if (!this.isValidLocation(data)) {
      return { error: 'Invalid location data' };
    }

    const messageId = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const topic = `tracking:${data.driverId}`;
    
    this.server.to(topic).emit('locationUpdate', {
      ...data,
      timestamp: new Date().toISOString(),
      messageId,
    });

    this.checkOfflineTimeout(data.driverId);
    
    return { status: 'ok', messageId };
  }

  @SubscribeMessage('kdsUpdate')
  async handleKDSUpdate(@MessageBody() data: { orderId: string; status: string; branchId: string; timestamp?: Date }) {
    const messageId = `kds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const topic = `kds:${data.branchId}`;
    
    this.server.to(topic).emit('kdsUpdate', {
      ...data,
      timestamp: data.timestamp || new Date(),
      messageId,
    });
    
    return { status: 'ok', messageId };
  }

  @SubscribeMessage('driverEvent')
  async handleDriverEvent(@MessageBody() data: { driverId: string; orderId?: string; event: string }) {
    const messageId = `drv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const topic = `driver:${data.driverId}`;
    
    this.server.to(topic).emit('driverEvent', { 
      ...data, 
      timestamp: new Date().toISOString(),
      messageId,
    });
    
    return { status: 'ok', messageId };
  }

  async publish(topic: string, data: any, requireAck: boolean = false): Promise<any> {
    const messageId = `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (requireAck) {
      return this.waitForAcknowledgement(`${topic}`, { ...data, messageId });
    }
    
    this.server.emit(topic, { ...data, messageId });
    return { status: 'sent', messageId };
  }

  async publishToRoom(room: string, data: any, requireAck: boolean = false): Promise<any> {
    const messageId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (requireAck) {
      return this.waitForAcknowledgement(`room:${room}`, { ...data, messageId });
    }
    
    this.server.to(room).emit(room, { ...data, messageId });
    return { status: 'sent', messageId };
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
    const timeout = 30000;
  }

  private async waitForAcknowledgement(roomOrTopic: string, data: any): Promise<any> {
    const messageId = data.messageId;
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingAcks.delete(messageId);
        resolve({ status: 'timeout', messageId });
      }, this.ackTimeoutMs);

      this.pendingAcks.set(messageId, { resolve, reject, timeout });
      this.server.to(roomOrTopic).emit('message', data);
    });
  }

  private cleanupPendingAcks(clientId: string) {
    for (const [messageId, pending] of this.pendingAcks.entries()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Client disconnected'));
    }
    this.pendingAcks.clear();
  }

  async getQueuedMessages(driverId: string): Promise<AcknowledgedMessage[]> {
    return this.messageQueue.get(driverId) || [];
  }

  async requeueUndeliveredMessages(driverId: string, messageIds: string[]) {
    const queue = this.messageQueue.get(driverId) || [];
    const conn = this.connectedClients.get(driverId);
    
    if (conn) {
      const undelivered = Array.from(conn.acknowledgedMessages.values())
        .filter(m => messageIds.includes(m.id) && !m.ack);
      
      queue.push(...undelivered);
      this.messageQueue.set(driverId, queue);
    }
  }
}