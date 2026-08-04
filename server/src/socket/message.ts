import type { Server, Socket } from "socket.io";
import Message from "../models/message.models.js";
import User from "../models/user.models.js";
import Conversation from "../models/conversation.models.js";

export const buildRoomName = (userA: string, userB: string) => {
  return [userA, userB].sort().join("_");
};

export const registerMessageEvents = (io: Server, socket: Socket) => {
  socket.on(
    "send_message",
    async (
      payload:
        | { receiverId?: string; content?: string; clientMessageId?: string }
        | undefined,
      callback?: (response: {
        status: string;
        message?: string;
        data?: { message?: unknown };
      }) => void,
    ) => {
      try {
        const userId = (socket as any).user?.id as string | undefined;
        if (!userId) {
          callback?.({ status: "fail", message: "Unauthorized" });
          return;
        }

        const { receiverId, content, clientMessageId } = payload ?? {};
        if (!receiverId || !content) {
          callback?.({
            status: "fail",
            message: "Receiver and content are required",
          });
          return;
        }

        const existingMessage = clientMessageId
          ? await Message.findOne({ clientMessageId, sender: userId })
          : null;

        if (existingMessage) {
          callback?.({ status: "success", data: { message: existingMessage } });
          return;
        }

        const targetUser = await User.findOne({
          _id: receiverId,
          isDeleted: false,
        });
        if (!targetUser) {
          callback?.({ status: "fail", message: "Recipient not found" });
          return;
        }

        let conversation = await Conversation.findOne({
          participants: { $all: [userId, receiverId], $size: 2 },
          type: "private",
          deletedAt: null,
        });

        if (!conversation) {
          conversation = await Conversation.create({
            participants: [userId, receiverId],
            type: "private",
            createdBy: userId,
          });
        }

        const room = buildRoomName(userId, receiverId);
        const message = (await Message.create({
          sender: userId,
          receiver: receiverId,
          conversationId: conversation._id,
          room,
          content,
          ...(clientMessageId ? { clientMessageId } : {}),
        })) as any;

        await Conversation.findByIdAndUpdate(conversation._id, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        const populated = await message.populate([
          { path: "sender", select: "id username status" },
          { path: "receiver", select: "id username status" },
        ]);

        io.to(room).emit("new_message", populated);
        callback?.({ status: "success", data: { message: populated } });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to send message";
        callback?.({ status: "fail", message });
      }
    },
  );

  socket.on(
    "typing",
    ({ receiverId, isTyping }: { receiverId?: string; isTyping?: boolean }) => {
      const userId = (socket as any).user?.id as string | undefined;
      if (!userId || !receiverId) {
        return;
      }

      const room = buildRoomName(userId, receiverId);
      socket.to(room).emit("typing", { userId, isTyping: Boolean(isTyping) });
    },
  );

  socket.on("message_delivered", async (messageId: string) => {
    try {
      const userId = (socket as any).user?.id as string | undefined;
      if (!userId || !messageId) {
        return;
      }
      await Message.findByIdAndUpdate(messageId, { status: "delivered" });
      socket.emit("message_status_updated", { messageId, status: "delivered" });
    } catch {
      // noop
    }
  });

  socket.on("message_read", async (messageId: string) => {
    try {
      const userId = (socket as any).user?.id as string | undefined;
      if (!userId || !messageId) {
        return;
      }

      const message = await Message.findOneAndUpdate(
        { _id: messageId, isDeleted: false },
        { $addToSet: { readBy: userId }, status: "seen" },
        { new: true },
      );

      if (message) {
        socket.emit("message_status_updated", { messageId, status: "seen" });
      }
    } catch {
      // noop
    }
  });
};
