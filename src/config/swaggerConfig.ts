import { SwaggerOptions } from 'swagger-jsdoc';

const swaggerDefinition = {
	openapi: '3.0.0',
	info: {
		title: 'API Documentation',
		version: '1.0.0',
		description: 'API documentation for your application',
	},
	servers: [
		{
			url: 'http://localhost:5000', // Change to your production URL if needed
		},
	],
};

export const swaggerOptions: SwaggerOptions = {
	swaggerDefinition,
	apis: ['./src/routes/*.ts'], // Point to your route files for automatic documentation
};
