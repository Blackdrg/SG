import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RestaurantBranchEntity } from './restaurant-branch.entity';

@Entity('holiday_schedules')
export class HolidayScheduleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => RestaurantBranchEntity)
  branch!: RestaurantBranchEntity;

  @Column()
  holidayName!: string; // Name of the holiday (e.g., "Diwali", "Christmas")

  @Column()
  startDate!: Date; // Start date of the holiday period

  @Column()
  endDate!: Date; // End date of the holiday period

  @Column()
  scheduleType!: 'closed' | 'limited_hours' | 'special_menu' | 'staff_holiday'; // Type of holiday schedule

  @Column({ nullable: true })
  openingTime?: string; // Special opening time (HH:MM format)

  @Column({ nullable: true })
  closingTime?: string; // Special closing time (HH:MM format)

  @Column({ nullable: true })
  isDeliveryAvailable?: boolean; // Whether delivery is available during holiday

  @Column({ nullable: true })
  isDineInAvailable?: boolean; // Whether dine-in is available during holiday

  @Column({ nullable: true })
  isTakeawayAvailable?: boolean; // Whether takeaway is available during holiday

  @Column({ nullable: true })
  specialInstructions?: string; // Any special instructions for staff/customers

  @Column({ default: false })
  isRecurring!: boolean; // Whether this holiday repeats yearly

  @Column({ nullable: true })
  recurrenceRule?: string; // iCal recurrence rule for recurring holidays

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}