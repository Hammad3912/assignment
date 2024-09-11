import { In } from 'typeorm';
import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Deal } from '../entities/Deal';
import { User } from '../entities/User';
import { Product } from '../entities/Product';
import { DealStatus, UserRole } from '../utils/enums';
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
			const productIds = products.map((p: any) => p);
			const selectedProducts = await this.productRepo.findBy({ id: In(productIds) });
			if (selectedProducts.length !== products.length) {
				return res.status(400).json({ message: 'Invalid product selection' });
			}

			// Calculate deal price based on selected products and their quantities
			const deal_price = selectedProducts.reduce((sum, product) => {
				return sum + product.price;
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

	// Get all deals
	async getAllDeals(req: any, res: Response) {
		try {
			const user = req.user; // Assuming you have the user object populated via authentication middleware

			let deals;

			if (user.role === UserRole.ADMIN) {
				// Admin can view all deals
				deals = await this.dealRepo.find({
					relations: ['customer_deals.customer', 'product_deals.product', 'partner'], // Include related entities
				});
			} else if (user.role === UserRole.PARTNER) {
				// Partner can only view deals where they are the assigned partner
				deals = await this.dealRepo.find({
					where: { partner: { id: user.id } }, // Only deals where the partner is the logged-in user
					relations: ['customer_deals.customer', 'product_deals.product', 'partner'],
				});
			} else {
				return res.status(403).json({ message: 'You do not have permission to view deals.' });
			}

			return res.status(200).json(deals);
		} catch (error) {
			return res.status(500).json({ message: 'Error fetching deals', error });
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

	// Delete product (admin only)
	async deleteDeal(req: any, res: any) {
		try {
			const user = req.user;

			// Only admin can delete deals
			if (user.role !== UserRole.ADMIN) {
				return res.status(403).json({ message: 'Only admin can delete deals.' });
			}

			const { id } = req.params;

			// Fetch the deal and include related customer_deals and product_deals
			const deal = await this.dealRepo.findOne({
				where: { id },
				relations: ['customer_deals', 'product_deals'], // Fetch relations
			});

			// Check if the deal exists
			if (!deal) {
				return res.status(404).json({ message: 'Deal not found' });
			}

			// Remove related customer_deals and product_deals
			if (deal.customer_deals && deal.customer_deals.length > 0) {
				await this.customerDealRepo.remove(deal.customer_deals);
			}

			if (deal.product_deals && deal.product_deals.length > 0) {
				await this.productDealRepo.remove(deal.product_deals);
			}

			// Remove the deal itself
			await this.dealRepo.remove(deal);

			return res.status(200).json({ message: 'Deal and its related entities deleted successfully' });
		} catch (error) {
			return res.status(500).json({ message: 'Error deleting deal', error });
		}
	}
}
