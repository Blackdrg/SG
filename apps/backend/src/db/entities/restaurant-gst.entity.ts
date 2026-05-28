import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';

@Entity('restaurant_gst')
export class RestaurantGSTEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => RestaurantEntity)
  restaurant!: RestaurantEntity;

  @Column()
  restaurantId!: string;

  @Column({ unique: true })
  gstin!: string; // GST Identification Number (15 characters)

  @Column()
  legalNameOfBusiness!: string; // Legal name as per GST registration

  @Column()
  tradeName!: string; // Trade name of the business

  @Column()
  address!: string; // Principal place of business

  @Column()
  stateCode!: string; // State code (first 2 digits of GSTIN)

  @Column()
  state!: string; // State name

  @Column({ nullable: true })
  registrationDate?: Date; // Date of GST registration

  @Column({ nullable: true })
  cancellationDate?: Date; // Date of GST cancellation (if applicable)

  @Column({ default: true })
  isActive!: boolean; // Whether GST registration is active

  @Column({ nullable: true })
  email?: string; // Email for GST communications

  @Column({ nullable: true })
  phone?: string; // Phone number for GST communications

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}