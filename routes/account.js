import express from "express";
import authMiddleware from "../middleware.js";
import mongoose from "mongoose";
import { Account, Transaction, User } from "../db.js";

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    try {
        const account = await Account.findOne({
            userId: req.userId,
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found",
                balance: 0
            });
        }

        res.json({
            balance: account.balance,
        });
    } catch (e) {
        console.log("There was error fetching the account", e);
        res.status(500).json({
            message: "Error fetching account",
            balance: 0
        });
    }
});

// Get transaction history
router.get("/transactions", authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get transactions where user is either sender or receiver
        const transactions = await Transaction.find({
            $or: [
                { fromUser: req.userId },
                { toUser: req.userId }
            ]
        })
        .sort({ createdAt: -1 }) // Most recent first
        .skip(skip)
        .limit(limit)
        .populate('fromUser', 'firstname lastname username')
        .populate('toUser', 'firstname lastname username');

        // Get total count for pagination
        const total = await Transaction.countDocuments({
            $or: [
                { fromUser: req.userId },
                { toUser: req.userId }
            ]
        });

        res.json({
            transactions,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({
            message: "Error fetching transaction history"
        });
    }
});

router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount, to } = req.body;

        // Don't allow transfer to oneself
        if (to == req.userId) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Cannot transfer to yourself!"
            });
        }

        // Create transaction record first as 'pending'
        const transaction = new Transaction({
            fromUser: req.userId,
            toUser: to,
            amount: amount,
            type: 'transfer',
            status: 'pending'
        });

        // Fetch the accounts within the transaction
        const account = await Account.findOne({
            userId: req.userId
        }).session(session);

        if (!account || account.balance < amount) {
            await session.abortTransaction();
            // Update transaction status to failed
            transaction.status = 'failed';
            await transaction.save();
            return res.status(400).json({
                message: "Insufficient balance"
            });
        }

        const toAccount = await Account.findOne({
            userId: to
        }).session(session);

        if (!toAccount) {
            await session.abortTransaction();
            // Update transaction status to failed
            transaction.status = 'failed';
            await transaction.save();
            return res.status(400).json({
                message: "Invalid account"
            });
        }

        // Perform the transfer
        await Account.updateOne(
            { userId: req.userId },
            { $inc: { balance: -amount } }
        ).session(session);

        await Account.updateOne(
            { userId: to },
            { $inc: { balance: amount } }
        ).session(session);

        // Save the transaction as successful
        transaction.status = 'success';
        await transaction.save();

        // Commit the transaction
        await session.commitTransaction();

        res.json({
            message: "Transfer successful"
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Transfer error:", error);
        res.status(500).json({
            message: "Transfer failed"
        });
    } finally {
        session.endSession();
    }
});

export default router;