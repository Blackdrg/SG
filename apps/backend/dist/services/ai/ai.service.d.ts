import { Repository } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
export declare class AiService {
    private readonly orderRepo;
    private readonly menuRepo;
    constructor(orderRepo: Repository<OrderEntity>, menuRepo: Repository<MenuItemEntity>);
    getRecommendations(userId: string): Promise<MenuItemEntity[]>;
    predictDemand(branchId: string, date: Date): Promise<{
        predictedOrders: number;
        busyHours: string[];
        confidence: number;
    }>;
    chatbotResponse(message: string): Promise<"You can track your order in the \"Active Orders\" section." | "Refunds typically take 5-7 business days to process." | "You can reach us at support@spicegarden.com or call 1800-SPICE." | "I'm sorry, I didn't quite catch that. Would you like to speak to a human agent?">;
}
