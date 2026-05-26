import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MenuItemEntity } from './menu-item.entity';

@Entity('menu_addons')
export class MenuAddonEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  menuItemId!: string;

  @ManyToOne('MenuItemEntity')
  menuItem!: any;

  @Column()
  addonName!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
