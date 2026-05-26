import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressEntity } from '../../db/entities/address.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressRepo: Repository<AddressEntity>,
  ) {}

  async getUserAddresses(userId: string) {
    return this.addressRepo.find({ where: { userId } });
  }

  async addAddress(userId: string, data: any) {
    if (data.isDefault) {
      await this.addressRepo.update({ userId }, { isDefault: false });
    }
    const address = this.addressRepo.create({ ...data, userId });
    return this.addressRepo.save(address);
  }

  async setDefault(userId: string, addressId: string) {
    await this.addressRepo.update({ userId }, { isDefault: false });
    return this.addressRepo.update({ userId, id: addressId }, { isDefault: true });
  }
}
