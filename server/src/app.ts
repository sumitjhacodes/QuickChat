import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./database/db.js";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import dotenv from "dotenv";
import { env } from "./config/env.js";

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const allowedOrigins = [
  env.CORS_ORIGIN,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);

// MongoDB Connection
connectDB();

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

export default app;
