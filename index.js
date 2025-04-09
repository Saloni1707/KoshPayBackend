import express from "express";
import mainRouter from "./routes/index.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1",mainRouter);

app.listen(3000);

console.log("Server has started");





