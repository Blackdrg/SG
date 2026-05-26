import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class KdsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    notifyNewOrder(branchId: string, order: any): void;
    handleStatusUpdate(data: {
        orderId: string;
        status: string;
        branchId: string;
    }): void;
}
