import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { createServer } from "node:http";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? "*",
    methods: ["GET", "POST"],
  },
});

app.set("trust proxy", process.env.NODE_ENV === "production");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
    credentials: true,
  }),
);

// MongoDB Connection
connectDB();

app.use("/api/auth", authRouter);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ status: "fail", message: "Resource not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});

export { app, server };
