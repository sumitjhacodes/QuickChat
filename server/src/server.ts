import dotenv from "dotenv";
dotenv.config();
import { createServer } from "node:http";
import { Server } from "socket.io";

import app from "./app.js";

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});

const port = Number(process.env.PORT ?? 8000);

server.listen(port, () => {
  console.log(`Server is running successfully at port ${port}`);
});
