import Joi from 'joi';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define Joi schema for validation
const envSchema = Joi.object({
	DB_HOST: Joi.string().hostname().required(),
	DB_PORT: Joi.number().default(5432),
	DB_USERNAME: Joi.string().required(),
	DB_PASSWORD: Joi.string().required(),
	DB_NAME: Joi.string().required(),
	JWT_SECRET: Joi.string().required(),
	PORT: Joi.number().default(5000),
}).unknown(); // Allow other unknown variables

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
	throw new Error(`Environment validation error: ${error.message}`);
}

// Export the validated environment variables
export const config = {
	dbHost: envVars.DB_HOST,
	dbPort: envVars.DB_PORT,
	dbUsername: envVars.DB_USERNAME,
	dbPassword: envVars.DB_PASSWORD,
	dbName: envVars.DB_NAME,
	jwtSecret: envVars.JWT_SECRET,
	port: envVars.PORT,
};
