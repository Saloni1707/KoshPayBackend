import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB with URI:", config.MONGODB_URI);
        await mongoose.connect(config.MONGODB_URI);
        console.log("MongoDB connection successful!");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
}, { timestamps: true });

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

// New Transaction Schema
const transactionSchema = new mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'pending'
    },
    type: {
        type: String,
        enum: ['transfer', 'deposit', 'withdrawal'],
        default: 'transfer'
    }
}, { 
    timestamps: true 
});

const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

export { User, Account, Transaction, connectDB };
