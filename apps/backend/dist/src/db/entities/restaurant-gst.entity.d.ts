import { RestaurantEntity } from './restaurant.entity';
export declare class RestaurantGSTEntity {
    id: string;
    restaurant: RestaurantEntity;
    restaurantId: string;
    gstin: string;
    legalNameOfBusiness: string;
    tradeName: string;
    address: string;
    stateCode: string;
    state: string;
    registrationDate?: Date;
    cancellationDate?: Date;
    isActive: boolean;
    email?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
}
