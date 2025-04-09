import dotenv from 'dotenv';
dotenv.config();

const config = {
    JWT_SECRET: process.env.JWT_SECRET || 'your-default-secret-key',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/paytm',
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development'
};

export default config;