import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
    try {
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

const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);

export { User, Account, connectDB };
