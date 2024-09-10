import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { BaseModel } from './baseModel';
import { ProductDeal } from './ProductDeal';

@Entity()
export class Product extends BaseModel {
	@Column()
	name: string;

	@Column({ nullable: true })
	description: string;

	@Column()
	price: number;

	@Column({ nullable: true })
	imagePath: string;

	@OneToMany(() => ProductDeal, (product_deal) => product_deal.product)
	product_deals: ProductDeal[];

	@ManyToOne(() => User, (user) => user.products)
	owner: User;
}
