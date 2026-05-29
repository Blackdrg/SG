import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../../db/entities/notification.entity';
export declare enum SocketNamespace {
    TRACKING = "/tracking",
    KDS = "/kds",
    ADMIN = "/admin",
    DRIVER = "/driver"
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
export declare class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private configService;
    private readonly notificationRepo;
    server: Server;
    private readonly logger;
    private readonly connectedClients;
    private readonly messageQueue;
    private readonly pendingAcks;
    private readonly ackTimeoutMs;
    constructor(configService: ConfigService, notificationRepo: Repository<NotificationEntity>);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handlePing(client: Socket): {
        status: string;
        serverTime: number;
    };
    handleJoin(data: {
        room: string;
    }, client: Socket): {
        status: string;
        room: string;
    };
    handleAcknowledgement(data: {
        messageId: string;
    }, client: Socket): {
        status: string;
    };
    handleMessage(data: AcknowledgedMessage, client: Socket): Promise<unknown>;
    handleLocationUpdate(data: LocationUpdate, client: Socket): Promise<{
        error: string;
        status?: undefined;
        messageId?: undefined;
    } | {
        status: string;
        messageId: string;
        error?: undefined;
    }>;
    handleKDSUpdate(data: {
        orderId: string;
        status: string;
        branchId: string;
        timestamp?: Date;
    }): Promise<{
        status: string;
        messageId: string;
    }>;
    handleDriverEvent(data: {
        driverId: string;
        orderId?: string;
        event: string;
    }): Promise<{
        status: string;
        messageId: string;
    }>;
    publish(topic: string, data: any, requireAck?: boolean): Promise<any>;
    publishToRoom(room: string, data: any, requireAck?: boolean): Promise<any>;
    getActiveConnections(): number;
    getNamespaceStats(): Record<string, number>;
    private isValidLocation;
    private checkOfflineTimeout;
    private waitForAcknowledgement;
    private cleanupPendingAcks;
    getQueuedMessages(driverId: string): Promise<AcknowledgedMessage[]>;
    requeueUndeliveredMessages(driverId: string, messageIds: string[]): Promise<void>;
}
export {};
