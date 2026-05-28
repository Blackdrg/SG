import { BatchEntity } from './batch.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';
export declare class FoodPrepEntity {
    id: string;
    batch: BatchEntity;
    staffId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    startedAt: Date;
    completedAt: Date;
    actualPrepTimeMinutes: number;
    estimatedPrepTimeMinutes: number;
    delayMinutes: number;
    qualityCheck: {
        taste: number;
        temperature: number;
        appearance: number;
        notes?: string;
        passed: boolean;
    };
    issues: string[];
    delayReasons: string[];
    branch: RestaurantBranchEntity;
    createdAt: Date;
    updatedAt: Date;
}
