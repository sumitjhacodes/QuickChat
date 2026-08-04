import type { Server, Socket } from "socket.io";

export const registerRoomEvents = (_io: Server, socket: Socket) => {
  socket.on("join_room", (room: string) => {
    socket.join(room);
  });

  socket.on("leave_room", (room: string) => {
    socket.leave(room);
  });
};
