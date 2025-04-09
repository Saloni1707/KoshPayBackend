import express from "express";
import userRouter from "./user.js";
import accountRouter from "./account.js";

const router = express.Router();

/**
 * API Routes
 * 
 * /api/user - User related endpoints (signup, login, etc.)
 * /api/account - Account related endpoints (balance, transfer, etc.)
 */

// User routes
router.use("/user", userRouter);

// Account routes
router.use("/account", accountRouter);

export default router;

