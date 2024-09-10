import jwt from 'jsonwebtoken';

export const authMiddleware = (req: any, res: any, next: any) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader.split(' ')[1];
	if (!token) return res.status(401).send('Access denied.');

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (ex) {
		res.status(400).send('Invalid token.');
	}
};
