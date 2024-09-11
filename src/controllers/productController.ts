import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Product } from '../entities/Product';
import { UserRole } from '../utils/enums';

export class ProductController {
	private productRepository = AppDataSource.getRepository(Product);

	// Add product (only admin)
	async addProduct(req: any, res: any) {
		try {
			const user = req.user; // Assuming req.user contains the decoded token data

			if (user.role !== UserRole.ADMIN) {
				return res.status(403).json({ message: 'Only admin can add products.' });
			}

			const { name, description, price, imagePath } = req.body;
			const product = this.productRepository.create({ name, description, price, imagePath, owner: user });

			await this.productRepository.save(product);
			return res.status(201).json(product);
		} catch (error) {
			return res.status(500).json({ message: 'Error adding product', error });
		}
	}

	// Get all products
	async getAllProducts(req: any, res: any) {
		try {
			const user = req.user; // Assume this contains user info, including role and possibly userId
			const isAdmin = user.role === UserRole.ADMIN;

			let products;
			if (isAdmin) {
				// Admin can see all products
				products = await this.productRepository.find();
			} else {
				// Partner can see only products owned by them
				const userId = user.id; // Assuming `user.id` is the ID of the current user
				products = await this.productRepository.find({
					where: { owner: { id: userId } }, // Adjust based on your entity schema
				});
			}

			return res.status(200).json(products);
		} catch (error) {
			return res.status(500).json({ message: 'Error fetching products', error });
		}
	}

	// Get product by id
	async getProductById(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const product = await this.productRepository.findOne({ where: { id } });

			if (!product) {
				return res.status(404).json({ message: 'Product not found' });
			}

			return res.status(200).json(product);
		} catch (error) {
			return res.status(500).json({ message: 'Error fetching product', error });
		}
	}

	// Update product (admin only)
	async updateProduct(req: any, res: any) {
		try {
			const user = req.user;
			if (user.role !== UserRole.ADMIN) {
				return res.status(403).json({ message: 'Only admin can update products.' });
			}

			const { id } = req.params;
			const { name, description, price, imagePath } = req.body;

			let product = await this.productRepository.findOne({ where: { id } });
			if (!product) {
				return res.status(404).json({ message: 'Product not found' });
			}

			product.name = name;
			product.description = description;
			product.price = price;
			product.imagePath = imagePath;

			await this.productRepository.save(product);
			return res.status(200).json(product);
		} catch (error) {
			return res.status(500).json({ message: 'Error updating product', error });
		}
	}

	// Delete product (admin only)
	async deleteProduct(req: any, res: any) {
		try {
			const user = req.user;
			if (user.role !== UserRole.ADMIN) {
				return res.status(403).json({ message: 'Only admin can delete products.' });
			}

			const { id } = req.params;
			const product = await this.productRepository.findOne({ where: { id } });

			if (!product) {
				return res.status(404).json({ message: 'Product not found' });
			}

			await this.productRepository.remove(product);
			return res.status(200).json({ message: 'Product deleted successfully' });
		} catch (error) {
			return res.status(500).json({ message: 'Error deleting product', error });
		}
	}
}
