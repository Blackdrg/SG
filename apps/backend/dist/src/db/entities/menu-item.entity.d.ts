import { HSNSACEntity } from './hsn-sac.entity';
export declare class MenuItemEntity {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    imageUrl: string;
    isVeg: boolean;
    spiceLevel: number;
    status: string;
    category: any;
    hsnSacId?: string;
    hsnSac?: HSNSACEntity;
    createdAt: Date;
    updatedAt: Date;
}
