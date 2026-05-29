import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CommissionRuleEntity, CommissionType, CommissionStatus } from '../../db/entities/commission-rule.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';

@Injectable()
export class CommissionService {
  private readonly logger = new Logger(CommissionService.name);

  constructor(
    @InjectRepository(CommissionRuleEntity)
    private commissionRepo: Repository<CommissionRuleEntity>,
    @InjectRepository(RestaurantEntity)
    private restaurantRepo: Repository<RestaurantEntity>,
    private dataSource: DataSource,
  ) {}

  async createCommissionRule(restaurantId: string, ruleData: {
    type: CommissionType;
    value: number;
    minOrderValue?: number;
    maxOrderValue?: number;
    validFrom?: Date;
    validTo?: Date;
    applicableCategories?: string[];
  }): Promise<CommissionRuleEntity> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (ruleData.value <= 0) {
      throw new BadRequestException('Commission value must be greater than zero');
    }

    const rule = this.commissionRepo.create({
      restaurantId,
      ...ruleData,
    });

    return this.commissionRepo.save(rule);
  }

  async getCommissionRules(restaurantId: string, activeOnly: boolean = true): Promise<CommissionRuleEntity[]> {
    const where: any = { restaurantId: restaurantId as any };
    if (activeOnly) {
      where.status = CommissionStatus.ACTIVE;
    }

    return this.commissionRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async calculateCommission(restaurantId: string, orderAmount: number, categoryId?: string): Promise<number> {
    const rules = await this.commissionRepo.find({
      where: {
        restaurantId: restaurantId as any,
        status: CommissionStatus.ACTIVE,
      },
    });

    let applicableRule: CommissionRuleEntity | null = null;

    for (const rule of rules) {
      if (rule.minOrderValue && orderAmount < rule.minOrderValue) continue;
      if (rule.maxOrderValue && orderAmount > rule.maxOrderValue) continue;
      if (categoryId && rule.applicableCategories?.length && !rule.applicableCategories.includes(categoryId)) continue;

      applicableRule = rule;
      break;
    }

    if (!applicableRule) {
      return orderAmount * 0.15;
    }

    if (applicableRule.type === CommissionType.PERCENTAGE) {
      return orderAmount * (Number(applicableRule.value) / 100);
    }

    return Number(applicableRule.value);
  }

  async updateCommissionRule(ruleId: string, updateData: Partial<CommissionRuleEntity>): Promise<CommissionRuleEntity> {
    const rule = await this.commissionRepo.findOne({ where: { id: ruleId } });
    if (!rule) {
      throw new NotFoundException('Commission rule not found');
    }

    await this.commissionRepo.update(ruleId, updateData);
    return this.commissionRepo.findOne({ where: { id: ruleId } });
  }

  async deactivateRule(ruleId: string): Promise<CommissionRuleEntity> {
    return this.updateCommissionRule(ruleId, { status: CommissionStatus.CANCELLED });
  }

  async getCommissionHistory(restaurantId: string, limit: number = 20): Promise<any[]> {
    // This would typically aggregate from orders/payouts
    const rules = await this.commissionRepo.find({
      where: { restaurantId: restaurantId as any },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return rules.map(rule => ({
      ruleId: rule.id,
      type: rule.type,
      value: rule.value,
      createdAt: rule.createdAt,
    }));
  }
}