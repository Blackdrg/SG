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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KdsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let KdsGateway = class KdsGateway {
    handleConnection(client) {
        const branchId = client.handshake.query.branchId;
        if (branchId) {
            client.join(`branch:${branchId}`);
            console.log(`Kitchen staff joined branch: ${branchId}`);
        }
    }
    handleDisconnect(client) {
        console.log(`Kitchen staff disconnected: ${client.id}`);
    }
    notifyNewOrder(branchId, order) {
        this.server.to(`branch:${branchId}`).emit('newOrder', order);
    }
    handleStatusUpdate(data) {
        console.log(`Order ${data.orderId} status updated to ${data.status} by kitchen`);
        this.server.to(`branch:${data.branchId}`).emit('orderStatusUpdated', data);
    }
};
exports.KdsGateway = KdsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], KdsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('updatePrepStatus'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KdsGateway.prototype, "handleStatusUpdate", null);
exports.KdsGateway = KdsGateway = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        namespace: 'kds',
        cors: { origin: '*' },
    })
], KdsGateway);
//# sourceMappingURL=kds.gateway.js.map