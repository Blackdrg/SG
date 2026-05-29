import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RestaurantBranchEntity } from './restaurant-branch.entity';
import { OrderEntity } from './order.entity';

@Entity('sla_alerts')
export class SLAAlertEntity {
   @PrimaryGeneratedColumn('uuid')
   id!: string;

   @ManyToOne(() => RestaurantBranchEntity)
   branch!: RestaurantBranchEntity;

   @Column()
    slaType!: 'prep_time' | 'order_wait_time' | 'delivery_time' | 'food_quality' | 'prep_delay';

   @Column()
   targetValue!: number; // Target SLA value (e.g., 15 minutes for prep)

   @Column()
   actualValue!: number;

   @Column()
   isBreached!: boolean; // Whether SLA is breached

   @Column({ nullable: true })
   breachSeverity?: 'low' | 'medium' | 'high'; // Severity of breach

   @Column({ nullable: true })
   relatedOrderId?: string; // If related to a specific order

   @ManyToOne(() => OrderEntity, { nullable: true })
   relatedOrder?: OrderEntity;

   @Column({ default: false })
   isNotified!: boolean; // Whether alert has been sent

   @Column({ nullable: true })
   notifiedAt?: Date; // When notification was sent

   @CreateDateColumn()
   createdAt!: Date;

   @UpdateDateColumn()
   updatedAt!: Date;
}