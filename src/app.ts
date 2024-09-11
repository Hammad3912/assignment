import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDatabase } from './config/database';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import dealRoutes from './routes/dealRoutes';
import { config } from './config/validateEnv';
import { swaggerOptions } from './config/swaggerConfig'; // Import Swagger config

const app = express();
app.use(bodyParser.json());

// OR for more fine-tuned control, allow specific methods and credentials for every request
app.use(
	cors({
		origin: '*', // Allows access from any origin
		methods: 'GET,POST,PUT,DELETE', // Allows specified HTTP methods
		credentials: true, // Include cookies in CORS requests
	}),
);

// Swagger setup
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/deals', dealRoutes);

// Initialize the database
connectDatabase().then(() => {
	app.listen(config.port, () => {
		console.log(`Server is running on port ${config.port}`);
		console.log('Swagger documentation available at /api-docs');
	});
});
