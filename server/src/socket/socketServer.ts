import { createServer } from "node:http";
import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { verifyJWTToken } from "../utils/jwt.js";
import { registerMessageEvents } from "./message.js";
import { registerPresenceEvents } from "./presence.js";
import { registerRoomEvents } from "./rooms.js";

export const attachSocketServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const payload = verifyJWTToken(token);
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    registerMessageEvents(io, socket);
    registerPresenceEvents(io, socket);
    registerRoomEvents(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};
