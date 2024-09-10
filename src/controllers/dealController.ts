import { In } from 'typeorm';
import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Deal } from '../entities/Deal';
import { User } from '../entities/User';
import { Product } from '../entities/Product';
import { DealStatus } from '../utils/enums';
import { CustomerDeal } from '../entities/CustomerDeal';
import { ProductDeal } from '../entities/ProductDeal';

export class DealController {
	private dealRepo = AppDataSource.getRepository(Deal);
	private userRepo = AppDataSource.getRepository(User);
	private productRepo = AppDataSource.getRepository(Product);
	private customerDealRepo = AppDataSource.getRepository(CustomerDeal);
	private productDealRepo = AppDataSource.getRepository(ProductDeal);
	// Deal registration by partner
	async createDeal(req: any, res: any) {
		try {
			const partnerId = req.user.id; // Extract partner ID from the token or session
			const { customerIds, products } = req.body;

			// Find partner by ID
			const partner = await this.userRepo.findOneBy({ id: partnerId });
			if (!partner) {
				return res.status(404).json({ message: 'Partner not found' });
			}

			// Validate customers using In operator
			const customers = await this.userRepo.findBy({ id: In(customerIds) });
			if (customers.length !== customerIds.length) {
				return res.status(404).json({ message: 'One or more customers not found' });
			}

			// Validate products using In operator
			const productIds = products.map((p: any) => p.productId);
			const selectedProducts = await this.productRepo.findBy({ id: In(productIds) });
			if (selectedProducts.length !== products.length) {
				return res.status(400).json({ message: 'Invalid product selection' });
			}

			// Calculate deal price based on selected products and their quantities
			const deal_price = selectedProducts.reduce((sum, product, index) => {
				const productQuantity = products[index].quantity;
				return sum + product.price * productQuantity;
			}, 0);

			// Create a new deal
			const deal = this.dealRepo.create({
				partner,
				status: DealStatus.PENDING, // Default to pending
				deal_price,
			});

			// Save deal to get the deal ID
			await this.dealRepo.save(deal);

			// Create DealCustomerProduct entries (bridge table records)
			for (const customer of customers) {
				// Save all the DealCustomerProduct entries
				await this.customerDealRepo.save({
					deal,
					customer,
				});
			}

			for (const product of selectedProducts) {
				// Save all the DealCustomerProduct entries

				await this.productDealRepo.save({
					deal,
					product,
				});
			}

			return res.status(201).json(deal);
		} catch (error) {
			console.error('Error creating deal:', error);
			return res.status(500).json({ message: 'Error creating deal', error });
		}
	}

	// Approve deal (admin only)
	async approveDeal(req: Request, res: Response) {
		try {
			const { dealId } = req.params;
			const deal = await this.dealRepo.findOneBy({ id: dealId });

			if (!deal) return res.status(404).json({ message: 'Deal not found' });

			deal.status = DealStatus.APPROVED;
			await this.dealRepo.save(deal);

			return res.json(deal);
		} catch (error) {
			return res.status(500).json({ message: 'Error approving deal', error });
		}
	}
}
