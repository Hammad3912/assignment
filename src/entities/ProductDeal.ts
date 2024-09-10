import { Entity, ManyToOne } from 'typeorm';
import { BaseModel } from './baseModel';
import { Deal } from './Deal';
import { Product } from './Product';

@Entity()
export class ProductDeal extends BaseModel {
	@ManyToOne(() => Product, (product) => product.product_deals)
	product: Product;

	@ManyToOne(() => Deal, (deal) => deal.product_deals)
	deal: Deal;
}
