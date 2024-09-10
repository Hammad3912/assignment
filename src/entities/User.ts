import { Entity, Column, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { UserRole } from '../utils/enums';
import { Deal } from './Deal';
import { BaseModel } from './baseModel';
import { Exclude } from 'class-transformer';
import { Product } from './Product';
import { CustomerDeal } from './CustomerDeal';

@Entity()
export class User extends BaseModel {
	@Column({ unique: true })
	username: string;

	@Exclude()
	@Column()
	password: string;

	@Column({
		type: 'enum',
		enum: UserRole,
		default: UserRole.CUSTOMER, // Default role can be 'partner'
	})
	role: UserRole;

	@Column({ default: false })
	approved: boolean;

	@OneToMany(() => User, (user) => user.partner)
	customers: User[];

	@OneToMany(() => Product, (product) => product.owner)
	products: Product[];

	@OneToMany(() => CustomerDeal, (customer_deal) => customer_deal.customer)
	customer_deals: CustomerDeal[];

	@OneToMany(() => Deal, (deal) => deal.partner)
	deal_partner: Deal[];

	// Self-join: customer can be associated with the partner who created them
	@ManyToOne(() => User, (user) => user.customers, { nullable: true })
	partner: User | null; // Nullable field, null for non-customer users
}
