import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { UserRole } from '../utils/enums';

const productController = new ProductController();
const router = Router();

// Only admin can add, update, and delete products
router.post('/', authMiddleware, roleMiddleware(UserRole.ADMIN), (req, res) => productController.addProduct(req, res));
router.get('/', authMiddleware, (req, res) => productController.getAllProducts(req, res));
router.get('/:id', authMiddleware, (req, res) => productController.getProductById(req, res));
router.put('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), (req, res) =>
	productController.updateProduct(req, res),
);
router.delete('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), (req, res) =>
	productController.deleteProduct(req, res),
);

export default router;
