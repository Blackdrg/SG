import { RecipeEntity } from './recipe.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';
export declare class BatchEntity {
    id: string;
    name: string;
    description: string;
    recipe: RecipeEntity;
    quantityPrepared: number;
    quantityUnit: string;
    status: 'preparing' | 'ready' | 'used' | 'discarded';
    startedAt: Date;
    completedAt: Date;
    expiresAt: Date;
    branch: RestaurantBranchEntity;
    createdAt: Date;
    updatedAt: Date;
}
