import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { User } from '../entities/User';
import { UserRole } from '../utils/enums';

export class UserController {
	async signup(req: any, res: Response) {
		try {
			const { username, password, role, partnerId } = req.body;
			const userRepo = AppDataSource.getRepository(User);

			// Check if the user already exists
			const existingUser = await userRepo.findOneBy({ username });
			if (existingUser) {
				return res.status(400).json({ message: 'User already exists.' });
			}

			// Hash the password
			const hashedPassword = await bcrypt.hash(password ? password : '12345678', 10);

			let partner = null;
			if (role === UserRole.CUSTOMER && partnerId) {
				// If role is CUSTOMER and partnerId is provided, find the partner
				partner = await userRepo.findOneBy({
					id: partnerId,
					role: UserRole.PARTNER,
					approved: true,
				});
				if (!partner) {
					return res.status(400).json({ message: 'Invalid partner ID.' });
				}
			}

			// Create the user (with partner association if provided)
			const user = userRepo.create({
				username,
				password: hashedPassword,
				role,
				partner, // Associate the partner if it's a customer
			});

			// Save the new user
			await userRepo.save(user);

			// Return the created user
			res.status(201).json(user);
		} catch (error) {
			console.error('Error during signup:', error);
			res.status(500).json({ message: 'Error creating user', error });
		}
	}

	async login(req: Request, res: Response) {
		const { username, password } = req.body;
		const userRepo = AppDataSource.getRepository(User);

		const user = await userRepo.findOneBy({ username });
		if (!user) return res.status(400).send('Invalid credentials.');

		if (!user.approved) return res.status(400).send('Admin approval pending.');

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) return res.status(400).send('Invalid credentials.');

		const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
		res.json({ token });
	}

	async getUsers(req: any, res: any) {
		try {
			// Assuming req.user is populated by the authMiddleware with user details
			const currentUser = req.user;
			const userRepo = AppDataSource.getRepository(User);

			if (!currentUser) {
				return res.status(401).json({ message: 'Unauthorized' });
			}

			// If the user is an admin, return all users
			if (currentUser.role === 'admin') {
				const users = await userRepo.find();
				return res.json(users);
			}

			// If the user is a partner, return only the customers under this partner
			if (currentUser.role === 'partner') {
				const customers = await userRepo.find({
					where: { partner: { id: currentUser.id } }, // Customers whose partner's ID matches the current user
					relations: ['partner'], // Include partner relationship
				});
				return res.json(customers);
			}

			// If the user role is not admin or partner, return forbidden
			return res.status(403).json({ message: 'Forbidden' });
		} catch (error) {
			return res.status(500).json({ message: 'Error fetching users', error });
		}
	}

	// Update user details
	async updateUser(req: any, res: any) {
		const { id } = req.params; // user ID to update
		const { approved, password, role } = req.body; // fields to update
		const userRepo = AppDataSource.getRepository(User);

		try {
			const currentUserRole = req.user.role; // From the auth middleware
			const currentUserId = req.user.id;
			const userToUpdate = await userRepo.findOneBy({ id });
			if (!userToUpdate) return res.status(404).json({ message: 'User not found' });

			// Check if the current user is allowed to approve this user
			if (typeof approved !== 'undefined') {
				// Only admins can approve partners, but both admins and partners can approve customers
				if (userToUpdate.role === 'partner' && currentUserRole !== 'admin') {
					return res.status(403).json({ message: 'Only admins can approve partners.' });
				}

				if (userToUpdate.role === 'customer') {
					// Partners can only approve their own customers
					if (currentUserRole === 'partner' && userToUpdate.partner?.id !== currentUserId) {
						return res.status(403).json({ message: 'Partners can only approve their own customers.' });
					}
				}

				// Proceed with approval
				userToUpdate.approved = approved;
			}

			if (role) {
				if (currentUserRole !== 'admin') {
					return res.status(403).json({ message: 'Only admins can change role.' });
				}
				userToUpdate.role = role;
			}

			// Update password if provided
			if (password) {
				const hashedPassword = await bcrypt.hash(password, 10);
				userToUpdate.password = hashedPassword;
			}

			await userRepo.save(userToUpdate);

			res.json({ message: 'User updated successfully', user: userToUpdate });
		} catch (error) {
			res.status(500).json({ message: 'Error updating user', error });
		}
	}

	async deleteUser(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const userRepo = AppDataSource.getRepository(User);
			// Find the user by id
			const user = await userRepo.findOneBy({ id });
			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			// Delete the user
			await userRepo.remove(user);

			return res.status(200).json({ message: 'User deleted successfully' });
		} catch (error) {
			return res.status(500).json({ message: 'Error deleting user', error });
		}
	}
}
