import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '.env') });

const config = {
    JWT_SECRET: process.env.JWT_SECRET || 'your-default-secret-key',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/paytm',
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development'
};

export default config;