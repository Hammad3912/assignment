import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: process.env.DB_HOST || 'localhost',
	port: Number(process.env.DB_PORT) || 5432,
	username: process.env.DB_USERNAME,
	password: String(process.env.DB_PASSWORD),
	database: process.env.DB_NAME,
	synchronize: true, // For production, set this to false and use migrations
	logging: false,
	entities: ['src/entities/**/*.ts'],
	migrations: ['src/migration/**/*.ts'],
	subscribers: ['src/subscriber/**/*.ts'],
});
