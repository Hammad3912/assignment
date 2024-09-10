import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import { connectDatabase } from './config/database';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import dealRoutes from './routes/dealRoutes';
import { swaggerOptions } from './config/swaggerConfig'; // Import Swagger config

const app = express();
app.use(bodyParser.json());

// Swagger setup
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/deals', dealRoutes);

// Initialize the database
connectDatabase().then(() => {
	app.listen(5000, () => {
		console.log('Server is running on port 5000');
		console.log('Swagger documentation available at /api-docs');
	});
});
