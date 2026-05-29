import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';

@Injectable()
export class BranchManagementService {
  private readonly logger = new Logger(BranchManagementService.name);

  constructor(
    @InjectRepository(RestaurantBranchEntity)
    private branchRepo: Repository<RestaurantBranchEntity>,
    @InjectRepository(RestaurantEntity)
    private restaurantRepo: Repository<RestaurantEntity>,
    private dataSource: DataSource,
  ) {}

  async createBranch(restaurantId: string, branchData: {
    branchName: string;
    address: string;
    lat: number;
    lng: number;
    openingTime?: string;
    closingTime?: string;
  }): Promise<RestaurantBranchEntity> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const branch = this.branchRepo.create({
      restaurant: { id: restaurantId } as any,
      branchName: branchData.branchName,
      address: branchData.address,
      openingTime: branchData.openingTime || '09:00',
      closingTime: branchData.closingTime || '21:00',
      location: { lat: branchData.lat, lng: branchData.lng } as any,
      isOnline: false,
    });

    const saved = await this.branchRepo.save(branch);
    return saved;
  }

  async updateBranch(branchId: string, updateData: Partial<RestaurantBranchEntity> & { lat?: number; lng?: number }): Promise<RestaurantBranchEntity> {
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const { lat, lng, ...rest } = updateData;
    const updatePayload = { ...rest };
    
    if (lat !== undefined && lng !== undefined) {
      (updatePayload as any).location = { lat, lng };
    }

    await this.branchRepo.update(branchId, updatePayload);
    const updated = await this.branchRepo.findOne({ where: { id: branchId } });
    return updated;
  }

  async toggleBranchStatus(branchId: string, isOnline: boolean): Promise<RestaurantBranchEntity> {
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    await this.branchRepo.update(branchId, { isOnline });
    this.logger.log(`Branch ${branchId} status updated to ${isOnline ? 'online' : 'offline'}`);

    return this.branchRepo.findOne({ where: { id: branchId } });
  }

  async getBranchDetails(branchId: string): Promise<RestaurantBranchEntity> {
    return this.branchRepo.findOne({
      where: { id: branchId },
      relations: ['restaurant'],
    });
  }

  async getBranchesByRestaurant(restaurantId: string): Promise<RestaurantBranchEntity[]> {
    return this.branchRepo.find({
      where: { restaurant: { id: restaurantId } } as any,
      relations: ['restaurant'],
      order: { branchName: 'ASC' } as any,
    });
  }

  async getAllBranches(filter?: { isOnline?: boolean; restaurantId?: string }): Promise<RestaurantBranchEntity[]> {
    const where: any = {};
    if (filter?.isOnline !== undefined) {
      where.isOnline = filter.isOnline;
    }
    if (filter?.restaurantId) {
      where.restaurant = { id: filter.restaurantId };
    }

    return this.branchRepo.find({
      where,
      relations: ['restaurant'],
      order: { branchName: 'ASC' } as any,
    });
  }

  async deleteBranch(branchId: string): Promise<void> {
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    await this.branchRepo.softDelete(branchId);
  }
}