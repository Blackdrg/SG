import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RestaurantBranchEntity } from './restaurant-branch.entity';
import { RestaurantGSTEntity } from './restaurant-gst.entity';

@Entity('restaurants')
export class RestaurantEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  logoUrl!: string;

  @Column({ nullable: true })
  bannerUrl!: string;

  @Column({ default: 'active' })
  status!: string;

   @OneToMany(() => RestaurantBranchEntity, (branch) => branch.restaurant)
   branches!: RestaurantBranchEntity[];

   @OneToOne(() => RestaurantGSTEntity, gstDetail => gstDetail.restaurant)
   gstDetail?: RestaurantGSTEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
