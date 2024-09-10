import { Entity, ManyToOne } from 'typeorm';
import { BaseModel } from './baseModel';
import { Deal } from './Deal';
import { User } from './User';

@Entity()
export class CustomerDeal extends BaseModel {
	@ManyToOne(() => User, (user) => user.customer_deals)
	customer: User;

	@ManyToOne(() => Deal, (deal) => deal.customer_deals)
	deal: Deal;
}
