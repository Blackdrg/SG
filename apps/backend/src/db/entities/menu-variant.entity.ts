import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MenuItemEntity } from './menu-item.entity';

@Entity('menu_variants')
export class MenuVariantEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  menuItemId!: string;

  @ManyToOne('MenuItemEntity')
  menuItem!: any;

  @Column()
  name!: string; // e.g., 'Small', 'Medium', 'Large'

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
