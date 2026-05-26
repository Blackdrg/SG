import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';
import { MenuCategoryEntity } from './menu-category.entity';

@Entity('restaurant_branches')
export class RestaurantBranchEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  branchName!: string;

  @Column()
  address!: string;

  @Index({ spatial: true })
  @Column({
    type: 'point',
    transformer: {
      from: (v: string | { x: number; y: number }) => {
        if (typeof v === 'string') {
          const match = v.match(/\((.*)\)/);
          if (match) {
            const [lng, lat] = match[1].split(' ').map(Number);
            return { lat, lng };
          }
        }
        return v;
      },
      to: (v: { lat: number; lng: number }) => {
        return `(${v.lng} ${v.lat})`;
      },
    },
  })
  location!: { lat: number; lng: number };

  @Column({ type: 'time' })
  openingTime!: string;

  @Column({ type: 'time' })
  closingTime!: string;

  @Column({ default: true })
  isOnline!: boolean;

  @ManyToOne(() => RestaurantEntity, (restaurant) => restaurant.branches)
  restaurant!: RestaurantEntity;

  @OneToMany('MenuCategoryEntity', (category: any) => category.branch)
  categories!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
