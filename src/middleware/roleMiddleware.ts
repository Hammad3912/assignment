import { UserRole } from '../utils/enums';

export const roleMiddleware = (...roles: UserRole[]) => {
	return (req: any, res: any, next: any) => {
		const userRole = req.user.role; // Get user role from decoded token

		if (!roles.includes(userRole)) {
			return res.status(403).json({ message: 'Access denied: insufficient permissions.' });
		}

		next();
	};
};
