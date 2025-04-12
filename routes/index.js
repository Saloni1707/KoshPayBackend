import express from "express";
import userRouter from "./user.js";
import accountRouter from "./account.js";

const router = express.Router();

// User routes
router.use("/user", userRouter);
// Account routes
router.use("/account", accountRouter);

export default router;
