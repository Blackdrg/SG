import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MenuCategoryEntity } from './menu-category.entity';
import { HSNSACEntity } from './hsn-sac.entity';

@Entity('menu_items')
export class MenuItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice!: number;

  @Column({ nullable: true })
  imageUrl!: string;

  @Column({ default: true })
  isVeg!: boolean;

  @Column({ default: 0 })
  spiceLevel!: number;

  @Column({ default: 'available' })
  status!: string;

  @ManyToOne('MenuCategoryEntity', (category: any) => category.items)
  category!: any;

  @Column({ nullable: true })
  hsnSacId?: string; // Reference to HSN/SAC code

  @ManyToOne(() => HSNSACEntity, { nullable: true })
  hsnSac?: HSNSACEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
