import express from "express";
import authMiddleware from "../middleware.js";
import mongoose from "mongoose";
import {Account} from "../db.js";

const router = express.Router();

router.get("/balance",authMiddleware,async(req,res) => {
    try{
    const account =  await Account.findOne({
        userId : req.userId,
    });

    if(account){
        console.log("Account had been found");
    }

    res.json({
        balance: account.balance,
    });
    }catch(e){
        console.log("There was error fetching the account",e);
        
    }
});

router.post("/transfer",authMiddleware,async (req,res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const {amount , to } = req.body ;
    //Don;t allow transfer to oneself
    if( to == req.userId){
        await session.abortTransaction();
        return res.json({
            message: "Cannot Transfer to yourself !"
        });
    }

    //Fetch the accounts within the transaction

    const account = await Account.findOne({
        userId : req.userId,
    }).session(session);

    if(!account || account.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({
            message:"Insufficient balance",
        });
    }

    //Fetch the accounts within the transaction
    const toAccount = await Account.findOne({
        userId : to,
    }).session(session);

    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            message:"Invalid account",
        });
    }

    await Account.updateOne(
        { userId : req.userId },
        {$inc : {balance : -amount} }
    ).session(session);
    
    await Account.updateOne(
        {userId : to },
        {$inc : {balance: amount}}
    ).session(session);
    
    //Commit Transaction

    await session.commitTransaction();

    res.json({
        message: "Transfer successful",
    });
    
});


export default router ;