//middleware

import JWT_SECRET from "./config.js";
import jwt from "jsonwebtoken";

const authMiddleware = (req,res,next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.sta
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token,JWT_SECRET);
        if(decoded.userId){
        req.userId = decoded.userId;
        next();
        }
    }catch(e){
        return res.status(403).json({});
    }
};

export default authMiddleware ;