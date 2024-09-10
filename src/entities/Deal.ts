import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { User } from './User';
import { DealStatus } from '../utils/enums';
import { BaseModel } from './baseModel';
import { ProductDeal } from './ProductDeal';
import { CustomerDeal } from './CustomerDeal';

@Entity()
export class Deal extends BaseModel {
	@Column({
		type: 'enum',
		enum: DealStatus,
		default: DealStatus.PENDING,
	})
	status: DealStatus;

	@Column()
	deal_price: number;

	@OneToMany(() => CustomerDeal, (customer_deal) => customer_deal.deal)
	customer_deals: CustomerDeal[];

	@OneToMany(() => ProductDeal, (product_deal) => product_deal.deal)
	product_deals: ProductDeal[];

	@ManyToOne(() => User, (user) => user.deal_partner)
	partner: User;
}
