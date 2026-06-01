"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TrackingGateway_1;
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingGateway = exports.SocketNamespace = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const notification_entity_1 = require("../../db/entities/notification.entity");
var SocketNamespace;
(function (SocketNamespace) {
    SocketNamespace["TRACKING"] = "/tracking";
    SocketNamespace["KDS"] = "/kds";
    SocketNamespace["ADMIN"] = "/admin";
    SocketNamespace["DRIVER"] = "/driver";
})(SocketNamespace || (exports.SocketNamespace = SocketNamespace = {}));
let TrackingGateway = TrackingGateway_1 = class TrackingGateway {
    constructor(configService, notificationRepo) {
        this.configService = configService;
        this.notificationRepo = notificationRepo;
        this.logger = new common_1.Logger(TrackingGateway_1.name);
        this.connectedClients = new Map();
        this.messageQueue = new Map();
        this.pendingAcks = new Map();
        this.ackTimeoutMs = this.configService.get('WS_ACK_TIMEOUT_MS', 5000);
    }
    handleConnection(client) {
        const namespace = client.nsp.name;
        this.connectedClients.set(client.id, {
            id: client.id,
            namespace,
            acknowledgedMessages: new Map(),
        });
        this.logger.log(`Client ${client.id} connected to ${namespace}`);
        client.emit('connected', { status: 'ok', serverTime: Date.now() });
    }
    handleDisconnect(client) {
        this.cleanupPendingAcks(client.id);
        this.connectedClients.delete(client.id);
        this.logger.log(`Client ${client.id} disconnected`);
    }
    handlePing(client) {
        const conn = this.connectedClients.get(client.id);
        if (conn) {
            conn.lastPing = new Date();
        }
        return { status: 'pong', serverTime: Date.now() };
    }
    handleJoin(data, client) {
        client.join(data.room);
        this.logger.log(`Client ${client.id} joined room ${data.room}`);
        return { status: 'joined', room: data.room };
    }
    handleAcknowledgement(data, client) {
        const conn = this.connectedClients.get(client.id);
        if (conn && conn.acknowledgedMessages.has(data.messageId)) {
            conn.acknowledgedMessages.get(data.messageId).ack = true;
            const pending = this.pendingAcks.get(data.messageId);
            if (pending) {
                clearTimeout(pending.timeout);
                pending.resolve({ status: 'acknowledged' });
                this.pendingAcks.delete(data.messageId);
            }
        }
        return { status: 'ack_received' };
    }
    async handleMessage(data, client) {
        const conn = this.connectedClients.get(client.id);
        if (!conn)
            return { error: 'Not connected' };
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
    async handleLocationUpdate(data, client) {
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
    async handleKDSUpdate(data) {
        const messageId = `kds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const topic = `kds:${data.branchId}`;
        this.server.to(topic).emit('kdsUpdate', {
            ...data,
            timestamp: data.timestamp || new Date(),
            messageId,
        });
        return { status: 'ok', messageId };
    }
    async handleDriverEvent(data) {
        const messageId = `drv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const topic = `driver:${data.driverId}`;
        this.server.to(topic).emit('driverEvent', {
            ...data,
            timestamp: new Date().toISOString(),
            messageId,
        });
        return { status: 'ok', messageId };
    }
    async publish(topic, data, requireAck = false) {
        const messageId = `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (requireAck) {
            return this.waitForAcknowledgement(`${topic}`, { ...data, messageId });
        }
        this.server.emit(topic, { ...data, messageId });
        return { status: 'sent', messageId };
    }
    async publishToRoom(room, data, requireAck = false) {
        const messageId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (requireAck) {
            return this.waitForAcknowledgement(`room:${room}`, { ...data, messageId });
        }
        this.server.to(room).emit(room, { ...data, messageId });
        return { status: 'sent', messageId };
    }
    getActiveConnections() {
        return this.server.engine.clientsCount;
    }
    getNamespaceStats() {
        const stats = {};
        this.connectedClients.forEach((client) => {
            const ns = client.namespace || 'unknown';
            stats[ns] = (stats[ns] || 0) + 1;
        });
        return stats;
    }
    isValidLocation(data) {
        return (typeof data.driverId === 'string' &&
            typeof data.lat === 'number' &&
            typeof data.lng === 'number' &&
            data.lat >= -90 &&
            data.lat <= 90 &&
            data.lng >= -180 &&
            data.lng <= 180);
    }
    checkOfflineTimeout(driverId) {
        const timeout = 30000;
    }
    async waitForAcknowledgement(roomOrTopic, data) {
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
    cleanupPendingAcks(clientId) {
        for (const [messageId, pending] of this.pendingAcks.entries()) {
            clearTimeout(pending.timeout);
            pending.reject(new Error('Client disconnected'));
        }
        this.pendingAcks.clear();
    }
    async getQueuedMessages(driverId) {
        return this.messageQueue.get(driverId) || [];
    }
    async requeueUndeliveredMessages(driverId, messageIds) {
        const queue = this.messageQueue.get(driverId) || [];
        const conn = this.connectedClients.get(driverId);
        if (conn) {
            const undelivered = Array.from(conn.acknowledgedMessages.values())
                .filter(m => messageIds.includes(m.id) && !m.ack);
            queue.push(...undelivered);
            this.messageQueue.set(driverId, queue);
        }
    }
};
exports.TrackingGateway = TrackingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_a = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _a : Object)
], TrackingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handlePing", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ack'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleAcknowledgement", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_e = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], TrackingGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('updateLocation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_f = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], TrackingGateway.prototype, "handleLocationUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('kdsUpdate'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrackingGateway.prototype, "handleKDSUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('driverEvent'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrackingGateway.prototype, "handleDriverEvent", null);
exports.TrackingGateway = TrackingGateway = TrackingGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/',
        pingInterval: 10000,
        pingTimeout: 20000,
    }),
    __param(1, (0, typeorm_2.InjectRepository)(notification_entity_1.NotificationEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_1.Repository])
], TrackingGateway);
//# sourceMappingURL=tracking.gateway.js.map