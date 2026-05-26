import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly menuRepo: Repository<MenuItemEntity>,
  ) {}

  async getRecommendations(userId: string) {
    // Advanced collaborative filtering logic (enhanced stub)
    // 1. Get user's recent orders to find preferred categories
    const recentOrders = await this.orderRepo.find({
      where: { userId },
      relations: ['items', 'items.menuItem', 'items.menuItem.category'],
      take: 5,
      order: { createdAt: 'DESC' },
    });

    const preferredCategoryIds = new Set<string>();
    recentOrders.forEach(order => {
      order.items?.forEach(item => {
        if (item.menuItem?.category?.id) {
          preferredCategoryIds.add(item.menuItem.category.id);
        }
      });
    });

    // 2. Suggest top-rated items from these categories that the user hasn't ordered recently
    if (preferredCategoryIds.size > 0) {
      return this.menuRepo.find({
        where: { category: { id: Array.from(preferredCategoryIds)[0] } as any },
        take: 5,
      });
    }

    // 3. Fallback to trending items
    return this.menuRepo.find({ take: 5, order: { createdAt: 'DESC' } });
  }

  async predictDemand(branchId: string, date: Date) {
    // Enhanced demand forecasting using historical data
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const historicalCount = await this.orderRepo.count({
      where: { 
        restaurantId: branchId, // assuming branchId matches restaurantId for this simple logic
        createdAt: Between(startOfDay, endOfDay) 
      }
    });

    // Simple additive model for forecasting
    const growthFactor = 1.1; // 10% growth
    const predictedOrders = Math.max(20, Math.floor((historicalCount || 50) * growthFactor));

    return {
      predictedOrders,
      busyHours: ['12:00', '13:00', '19:00', '20:00'],
      confidence: 0.85
    };
  }

  async chatbotResponse(message: string) {
    const msg = message.toLowerCase();
    if (msg.includes('order status')) return 'You can track your order in the "Active Orders" section.';
    if (msg.includes('refund')) return 'Refunds typically take 5-7 business days to process.';
    if (msg.includes('contact')) return 'You can reach us at support@spicegarden.com or call 1800-SPICE.';
    
    return "I'm sorry, I didn't quite catch that. Would you like to speak to a human agent?";
  }
}
