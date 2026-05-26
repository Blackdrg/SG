import { UserEntity } from './user.entity';
export declare class AddressEntity {
    id: string;
    userId: string;
    user: UserEntity;
    label: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    location: {
        lat: number;
        lng: number;
    };
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
