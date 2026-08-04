import type { Server, Socket } from "socket.io";

export const registerPresenceEvents = (_io: Server, socket: Socket) => {
  socket.on("presence:ping", (userId: string) => {
    socket.emit("presence:reply", { userId, online: true });
  });
};
