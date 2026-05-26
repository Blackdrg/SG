import { Repository } from 'typeorm';
import { AddressEntity } from '../../db/entities/address.entity';
export declare class AddressService {
    private readonly addressRepo;
    constructor(addressRepo: Repository<AddressEntity>);
    getUserAddresses(userId: string): Promise<AddressEntity[]>;
    addAddress(userId: string, data: any): Promise<AddressEntity[]>;
    setDefault(userId: string, addressId: string): Promise<import("typeorm").UpdateResult>;
}
