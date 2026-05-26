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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverNamespaceGateway = exports.AdminNamespaceGateway = exports.KDSNamespaceGateway = exports.TrackingNamespaceGateway = exports.TrackingGateway = exports.SocketNamespace = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
var SocketNamespace;
(function (SocketNamespace) {
    SocketNamespace["TRACKING"] = "/tracking";
    SocketNamespace["KDS"] = "/kds";
    SocketNamespace["ADMIN"] = "/admin";
    SocketNamespace["DRIVER"] = "/driver";
})(SocketNamespace || (exports.SocketNamespace = SocketNamespace = {}));
let TrackingGateway = TrackingGateway_1 = class TrackingGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TrackingGateway_1.name);
        this.connectedClients = new Map();
    }
    handleConnection(client) {
        const namespace = client.nsp.name;
        this.connectedClients.set(client.id, { namespace });
        this.logger.log(`Client ${client.id} connected to ${namespace}`);
    }
    handleDisconnect(client) {
        this.connectedClients.delete(client.id);
        this.logger.log(`Client ${client.id} disconnected`);
    }
    handleJoin(data, client) {
        client.join(data.room);
        this.logger.log(`Client ${client.id} joined room ${data.room}`);
        return { status: 'joined', room: data.room };
    }
    handleLocationUpdate(data, client) {
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
    handleKDSUpdate(data) {
        const topic = `kds:${data.branchId}`;
        this.server.to(topic).emit(topic, data);
        return { status: 'ok' };
    }
    handleDriverEvent(data) {
        const topic = `driver:${data.driverId}`;
        this.server.to(topic).emit(topic, { ...data, timestamp: new Date().toISOString() });
        return { status: 'ok' };
    }
    async publish(topic, data) {
        this.server.emit(topic, data);
    }
    async publishToRoom(room, data) {
        this.server.to(room).emit(room, data);
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
        const now = Date.now();
        const timeout = 30000;
    }
};
exports.TrackingGateway = TrackingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TrackingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('updateLocation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleLocationUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('kdsUpdate'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleKDSUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('driverEvent'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleDriverEvent", null);
exports.TrackingGateway = TrackingGateway = TrackingGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/',
        pingInterval: 30000,
        pingTimeout: 60000,
    }),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TrackingGateway);
let TrackingNamespaceGateway = class TrackingNamespaceGateway extends TrackingGateway {
};
exports.TrackingNamespaceGateway = TrackingNamespaceGateway;
exports.TrackingNamespaceGateway = TrackingNamespaceGateway = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        namespace: SocketNamespace.TRACKING,
        cors: { origin: '*' },
    })
], TrackingNamespaceGateway);
let KDSNamespaceGateway = class KDSNamespaceGateway extends TrackingGateway {
};
exports.KDSNamespaceGateway = KDSNamespaceGateway;
exports.KDSNamespaceGateway = KDSNamespaceGateway = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        namespace: SocketNamespace.KDS,
        cors: { origin: '*' },
    })
], KDSNamespaceGateway);
let AdminNamespaceGateway = class AdminNamespaceGateway extends TrackingGateway {
};
exports.AdminNamespaceGateway = AdminNamespaceGateway;
exports.AdminNamespaceGateway = AdminNamespaceGateway = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        namespace: SocketNamespace.ADMIN,
        cors: { origin: '*' },
    })
], AdminNamespaceGateway);
let DriverNamespaceGateway = class DriverNamespaceGateway extends TrackingGateway {
};
exports.DriverNamespaceGateway = DriverNamespaceGateway;
exports.DriverNamespaceGateway = DriverNamespaceGateway = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        namespace: SocketNamespace.DRIVER,
        cors: { origin: '*' },
    })
], DriverNamespaceGateway);
//# sourceMappingURL=tracking.gateway.js.map