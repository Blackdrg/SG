import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(RestaurantBranchEntity)
    private readonly branchRepo: Repository<RestaurantBranchEntity>,
    private readonly dataSource: DataSource
  ) {}

  async getAllRestaurants() {
    return this.restaurantRepo.find({
      relations: ['branches'],
      where: { status: 'active' },
    });
  }

  async findNearby(lat: number, lng: number, radiusInKm: number = 5) {
    // Radius in meters
    const radius = radiusInKm * 1000;

    // Enhanced spatial search with sorting by distance and online status
    return this.branchRepo
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.restaurant', 'restaurant')
      .select([
        'branch',
        'restaurant',
        `ST_DistanceSphere(branch.location::geometry, ST_MakePoint(:lng, :lat)::geometry) AS distance`
      ])
      .where(
        `ST_DistanceSphere(branch.location::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`,
        { lng, lat, radius }
      )
      .andWhere('branch.isOnline = :isOnline', { isOnline: true })
      .orderBy('distance', 'ASC')
      .getMany();
  }

  async getRestaurantDetails(slug: string) {
    return this.restaurantRepo.findOne({
      where: { slug },
      relations: ['branches', 'branches.categories', 'branches.categories.items'],
    });
  }

  async searchRestaurants(query: string) {
    return this.restaurantRepo.find({
      where: [
        { name: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
      ],
      relations: ['branches'],
    });
  }

  async updateBranchStatus(branchId: string, isOnline: boolean) {
    return this.branchRepo.update(branchId, { isOnline });
  }
}
