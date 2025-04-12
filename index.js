import express from "express";
import mainRouter from "./routes/index.js";
import cors from "cors";
import { connectDB } from "./db.js";
import config from "./config.js";

const app = express();

// More permissive CORS configuration for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Connect to MongoDB
connectDB();

app.use("/api/v1",mainRouter);

app.listen(config.PORT);

console.log(`Server has started on port ${config.PORT}`);





