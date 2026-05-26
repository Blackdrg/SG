import { RestaurantBranchEntity } from './restaurant-branch.entity';
export declare class RecipeEntity {
    id: string;
    name: string;
    description: string;
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    yieldQuantity: number;
    yieldUnit: string;
    ingredients: {
        inventoryItemId: string;
        quantity: number;
        unit: string;
        notes?: string;
    }[];
    instructions: string[];
    isActive: boolean;
    branch: RestaurantBranchEntity;
    createdAt: Date;
    updatedAt: Date;
}
