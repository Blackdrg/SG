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
exports.DeliveryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const driver_entity_1 = require("../../db/entities/driver.entity");
const wallet_entity_1 = require("../../db/entities/wallet.entity");
const wallet_transaction_entity_1 = require("../../db/entities/wallet-transaction.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const order_interface_1 = require("../../shared/domain/order.interface");
let DeliveryService = class DeliveryService {
    constructor(driverRepo, walletRepo, transactionRepo, orderRepo, dataSource) {
        this.driverRepo = driverRepo;
        this.walletRepo = walletRepo;
        this.transactionRepo = transactionRepo;
        this.orderRepo = orderRepo;
        this.dataSource = dataSource;
    }
    async registerDriver(userId, data) {
        const driver = this.driverRepo.create({
            userId,
            ...data,
            kycStatus: 'pending',
        });
        const savedDriver = await this.driverRepo.save(driver);
        const wallet = this.walletRepo.create({ userId, balance: 0 });
        await this.walletRepo.save(wallet);
        return savedDriver;
    }
    async updateLocation(driverId, lat, lng) {
        return this.driverRepo.update(driverId, {
            currentLocation: { lat, lng },
        });
    }
    async findAvailableDrivers(lat, lng, radiusInKm = 5) {
        const radius = radiusInKm * 1000;
        return this.driverRepo
            .createQueryBuilder('driver')
            .where('driver.isOnline = :online', { online: true })
            .andWhere('driver.kycStatus = :status', { status: 'approved' })
            .andWhere(`ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`, { lng, lat, radius })
            .getMany();
    }
    async assignOrderToDriver(orderId, driverId) {
        return this.orderRepo.update(orderId, {
            driverId,
            status: order_interface_1.OrderStatus.DRIVER_ASSIGNED,
        });
    }
    async completeDelivery(orderId, driverId, earning) {
        return this.dataSource.transaction(async (manager) => {
            await manager.update(order_entity_1.OrderEntity, orderId, { status: order_interface_1.OrderStatus.DELIVERED });
            const wallet = await manager.findOne(wallet_entity_1.WalletEntity, { where: { userId: driverId } });
            if (wallet) {
                wallet.balance = Number(wallet.balance) + earning;
                await manager.save(wallet);
                const transaction = this.transactionRepo.create({
                    walletId: wallet.id,
                    amount: earning,
                    type: 'credit',
                    description: `Earning for order #${orderId}`,
                    referenceId: orderId,
                });
                await manager.save(transaction);
            }
        });
    }
};
exports.DeliveryService = DeliveryService;
exports.DeliveryService = DeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_entity_1.WalletEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(wallet_transaction_entity_1.WalletTransactionEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], DeliveryService);
//# sourceMappingURL=delivery.service.js.map