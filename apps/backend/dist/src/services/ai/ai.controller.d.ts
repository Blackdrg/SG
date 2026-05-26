import { AiService } from './ai.service';
export declare class AiController {
    private aiService;
    constructor(aiService: AiService);
    getRecs(req: any): Promise<import("../../db/entities/menu-item.entity").MenuItemEntity[]>;
    askChatbot(message: string): Promise<{
        reply: string;
    }>;
    getForecast(branchId: string): Promise<{
        predictedOrders: number;
        busyHours: string[];
        confidence: number;
    }>;
}
