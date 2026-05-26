import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { OrderStatus } from '../../shared/domain/order.interface';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DriverEntity)
    private driverRepo: Repository<DriverEntity>,
    @InjectRepository(WalletEntity)
    private walletRepo: Repository<WalletEntity>,
    @InjectRepository(WalletTransactionEntity)
    private transactionRepo: Repository<WalletTransactionEntity>,
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    private dataSource: DataSource
  ) {}

  async registerDriver(userId: string, data: any) {
    const driver = this.driverRepo.create({
      userId,
      ...data,
      kycStatus: 'pending',
    });
    const savedDriver = await this.driverRepo.save(driver);
    
    // Create wallet for driver
    const wallet = this.walletRepo.create({ userId, balance: 0 });
    await this.walletRepo.save(wallet);
    
    return savedDriver;
  }

  async updateLocation(driverId: string, lat: number, lng: number) {
    return this.driverRepo.update(driverId, {
      currentLocation: { lat, lng },
    });
  }

  async findAvailableDrivers(lat: number, lng: number, radiusInKm: number = 5) {
    const radius = radiusInKm * 1000;
    return this.driverRepo
      .createQueryBuilder('driver')
      .where('driver.isOnline = :online', { online: true })
      .andWhere('driver.kycStatus = :status', { status: 'approved' })
      .andWhere(
        `ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`,
        { lng, lat, radius }
      )
      .getMany();
  }

  async assignOrderToDriver(orderId: string, driverId: string) {
    return this.orderRepo.update(orderId, {
      driverId,
      status: OrderStatus.DRIVER_ASSIGNED,
    });
  }

  async completeDelivery(orderId: string, driverId: string, earning: number) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Update order status
      await manager.update(OrderEntity, orderId, { status: OrderStatus.DELIVERED });

      // 2. Update driver wallet
      const wallet = await manager.findOne(WalletEntity, { where: { userId: driverId } });
      if (wallet) {
        wallet.balance = Number(wallet.balance) + earning;
        await manager.save(wallet);

        // 3. Record transaction
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
}
