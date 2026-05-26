import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RestaurantBranchEntity } from './restaurant-branch.entity';

@Entity('recipes')
export class RecipeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 5, scale: 2 })
  prepTimeMinutes: number; // Preparation time in minutes

  @Column('decimal', { precision: 5, scale: 2 })
  cookTimeMinutes: number; // Cooking time in minutes

  @Column('decimal', { precision: 10, scale: 2 })
  yieldQuantity: number; // How much this recipe makes

  @Column()
  yieldUnit: string; // Unit for yield (e.g., 'servings', 'kg', 'pcs')

  @Column({ default: 1 })
  servingsNumber: number; // Number of servings this recipe yields

  @Column('simple-json', { nullable: true })
  ingredients: { // Standardized ingredient list
    inventoryItemId: string;
    quantity: number;
    unit: string;
    notes?: string;
  }[];

  @Column('simple-json', { nullable: true })
  instructions: string[]; // Step-by-step instructions

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => RestaurantBranchEntity)
  branch: RestaurantBranchEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}