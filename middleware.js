//middleware

import jwt from "jsonwebtoken";
import config from "./config.js";

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({});
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(403).json({});
    }
};

export default authMiddleware;