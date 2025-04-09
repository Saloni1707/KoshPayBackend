import express from "express";
import zod from "zod";
import jwt from "jsonwebtoken";
import JWT_SECRET from "../config.js";
import {User,Account} from "../db.js";
import authMiddleware from "../middleware.js";
import bcrypt from "bcrypt";
const router = express.Router();

const signupBody = zod.object({
    username:zod.string(),
    firstname:zod.string(),
    lastname:zod.string(),
    password: zod.string()
})

// USER SIGN UP
router.post("/signup",async(req,res) => {
    const body = req.body;
    const {success} = signupBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            message:"Email already taken / Incorrect Inputs"
        });
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if(existingUser){
        return res.json({
            message:"Email already taken"
        });
    }

    const {username, firstname,lastname , password} = req.body;
    //Hash the password before saving it to the database
    const saltRounds = 10 ;
    const hashedPassword = await bcrypt.hash(body.password,saltRounds);

    //save the user to the db with the hashed passwords
    const dbUser = await User.create({
        ...body,
        password : hashedPassword
    });

    const userId =dbUser._id;

    //------ Creating New Account ----///
    await Account.create({
        userId,
        balance: parseInt(Math.random() * 10000),
    });

    //Create a JWT token for the user
    const token = jwt.sign(
        {
        userId ,
        },
         JWT_SECRET
    );

    res.status(200).json({
        message: "User created successfully",
        token:token
    })

});

const signinBody = zod.object({
    username: zod.string(),
    password: zod.string()
});

router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Incorrect Inputs"
        });
    }

    // ✅ Only search by username
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
        return res.status(404).json({ message: "User not found!" });
    }

    // ✅ Compare entered password with hashed password
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
        return res.status(401).json({ message: "Wrong credentials" });
    }

    // ✅ Create JWT token
    // const token = jwt.sign(
    //     { userId: user._id },
    //     JWT_SECRET
    // );

    return res.status(200).json({ 
        
        message:"User found !"
    });
});

//FOR UPDATING USER INFO

const updateBody = zod.object({
    password: zod.string().optional,
    firstname: zod.string().optional(),
    lastname: zod.string().optional(),
});

router.put("/",authMiddleware,async(req,res) => {
    const {success} = updateBody.safeParse(req.body);
    if(!success){
        res.status(411).json({
            message: "Error while updating the information",
        });
    }

    await User.updateOne({_id: req.userId}, req.body);

    res.json({
        message: "Updated successfully",
    });
});

//For getting the users with the filter query

router.get("/bulk",async(req,res) => {
    const filter = req.query.filter || " ";     // to filter out the users
    const users = await User.find({
        $or: [{
            firstname:{
                "$regex":filter
            }
        },{
            lastname:{
                "$regex":filter
            }
        }]
    })

    res.json({
        user: users.map( user => ({
            username : user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            _id : user._id
        })),
    });
});

//FOR GETTING THE CURRENT USER INFO
router.get("/getUser",authMiddleware,async(req,res) => {
    const user = await User.findOne({
        _id: req.userId,
    });
    res.json(user);
});

export default router ;