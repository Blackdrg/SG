import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
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
export declare class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private configService;
    server: Server;
    private readonly logger;
    private readonly connectedClients;
    constructor(configService: ConfigService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoin(data: {
        room: string;
    }, client: Socket): {
        status: string;
        room: string;
    };
    handleLocationUpdate(data: LocationUpdate, client: Socket): {
        error: string;
        status?: undefined;
    } | {
        status: string;
        error?: undefined;
    };
    handleKDSUpdate(data: KDSEvent): {
        status: string;
    };
    handleDriverEvent(data: DriverEvent): {
        status: string;
    };
    publish(topic: string, data: any): Promise<void>;
    publishToRoom(room: string, data: any): Promise<void>;
    getActiveConnections(): number;
    getNamespaceStats(): Record<string, number>;
    private isValidLocation;
    private checkOfflineTimeout;
}
export declare class TrackingNamespaceGateway extends TrackingGateway {
}
export declare class KDSNamespaceGateway extends TrackingGateway {
}
export declare class AdminNamespaceGateway extends TrackingGateway {
}
export declare class DriverNamespaceGateway extends TrackingGateway {
}
export {};
