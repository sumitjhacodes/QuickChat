import express, { type Express, type Request, type Response } from "express";
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
const io = new Server(server);

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "*" }));

// MongoDB Connection
connectDB();

app.use("/api/auth", authRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Hello world</h1>");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  console.log(socket.id);
});

export { app, server };
