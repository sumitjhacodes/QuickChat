import { type Request, type Response } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import Conversation from "../models/conversation.models.js";
import Message from "../models/message.models.js";
import User from "../models/user.models.js";
import { buildRoomName } from "../socket/message.js";

const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  clientMessageId: z.string().trim().min(1).optional(),
});

export const getConversation = async (req: Request, res: Response) => {
  try {
    const currentUserId =
      typeof (req as any).user?.id === "string"
        ? (req as any).user.id
        : undefined;
    const userId =
      typeof req.params.userId === "string" ? req.params.userId : undefined;
    const limit = Math.min(Number(req.query.limit ?? 30), 100);
    const cursor =
      typeof req.query.cursor === "string" ? req.query.cursor : undefined;

    if (!currentUserId || !userId) {
      return res.status(400).json({
        status: "fail",
        message: "Missing user identifier.",
      });
    }

    const room = buildRoomName(currentUserId, userId);
    const query: Record<string, any> = { room, isDeleted: false };

    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const messages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate("sender", "id username status")
      .populate("receiver", "id username status");

    const hasMore = messages.length > limit;
    const sliced = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor =
      hasMore && sliced.length > 0
        ? sliced[sliced.length - 1]?._id?.toString()
        : null;

    return res.status(200).json({
      status: "success",
      data: { messages: sliced.reverse(), nextCursor, hasMore },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch conversation";
    return res.status(500).json({ status: "error", message });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const currentUserId =
      typeof (req as any).user?.id === "string"
        ? (req as any).user.id
        : undefined;
    const limit = Math.min(Number(req.query.limit ?? 20), 50);
    const cursor =
      typeof req.query.cursor === "string" ? req.query.cursor : undefined;

    if (!currentUserId) {
      return res.status(400).json({
        status: "fail",
        message: "Missing user identifier.",
      });
    }

    const query: Record<string, any> = {
      participants: currentUserId,
      deletedAt: null,
    };

    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const conversations = await Conversation.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate("participants", "id username status")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "id username status" },
      });

    const hasMore = conversations.length > limit;
    const sliced = hasMore ? conversations.slice(0, limit) : conversations;
    const nextCursor =
      hasMore && sliced.length > 0
        ? sliced[sliced.length - 1]?._id?.toString()
        : null;

    return res.status(200).json({
      status: "success",
      data: { conversations: sliced, nextCursor, hasMore },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch conversations";
    return res.status(500).json({ status: "error", message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const currentUserId =
      typeof (req as any).user?.id === "string"
        ? (req as any).user.id
        : undefined;
    const userId =
      typeof req.params.userId === "string" ? req.params.userId : undefined;
    const parsed = sendMessageSchema.safeParse(req.body);

    if (!currentUserId || !userId) {
      return res.status(400).json({
        status: "fail",
        message: "Missing user identifier.",
      });
    }

    if (!parsed.success) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide valid message content.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const targetUser = await User.findOne({ _id: userId, isDeleted: false });
    if (!targetUser) {
      return res.status(404).json({
        status: "fail",
        message: "Recipient not found.",
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, userId], $size: 2 },
      type: "private",
      deletedAt: null,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, userId],
        type: "private",
        createdBy: currentUserId,
      });
    }

    const room = buildRoomName(currentUserId, userId);
    const existingMessage = parsed.data.clientMessageId
      ? await Message.findOne({
          clientMessageId: parsed.data.clientMessageId,
          sender: currentUserId,
        })
      : null;

    if (existingMessage) {
      return res.status(200).json({
        status: "success",
        data: { message: existingMessage },
      });
    }

    const message = (await Message.create({
      sender: currentUserId,
      receiver: userId,
      conversationId: conversation._id,
      room,
      content: parsed.data.content,
      ...(parsed.data.clientMessageId
        ? { clientMessageId: parsed.data.clientMessageId }
        : {}),
    })) as any;

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    const populatedMessage = await message.populate([
      { path: "sender", select: "id username status" },
      { path: "receiver", select: "id username status" },
    ]);

    return res.status(201).json({
      status: "success",
      data: { message: populatedMessage },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to send message";
    return res.status(500).json({ status: "error", message });
  }
};

export const softDeleteMessage = async (req: Request, res: Response) => {
  try {
    const currentUserId =
      typeof (req as any).user?.id === "string"
        ? (req as any).user.id
        : undefined;
    const messageId =
      typeof req.params.messageId === "string"
        ? req.params.messageId
        : undefined;

    if (!currentUserId || !messageId) {
      return res.status(400).json({
        status: "fail",
        message: "Missing message identifier.",
      });
    }

    const message = await Message.findOneAndUpdate(
      { _id: messageId, sender: currentUserId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy: currentUserId },
      { new: true },
    );

    if (!message) {
      return res.status(404).json({
        status: "fail",
        message: "Message not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      data: { message },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete message";
    return res.status(500).json({ status: "error", message });
  }
};

export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const currentUserId =
      typeof (req as any).user?.id === "string"
        ? (req as any).user.id
        : undefined;
    const messageId =
      typeof req.params.messageId === "string"
        ? req.params.messageId
        : undefined;

    if (!currentUserId || !messageId) {
      return res.status(400).json({
        status: "fail",
        message: "Missing message identifier.",
      });
    }

    const message = await Message.findOneAndUpdate(
      { _id: messageId, isDeleted: false },
      { $addToSet: { readBy: currentUserId }, status: "seen" },
      { new: true },
    );

    if (!message) {
      return res.status(404).json({
        status: "fail",
        message: "Message not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      data: { message },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update read state";
    return res.status(500).json({ status: "error", message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const currentUserId =
      typeof (req as any).user?.id === "string"
        ? (req as any).user.id
        : undefined;
    const users = await User.find({
      _id: { $ne: currentUserId },
      isDeleted: false,
    }).select("id username email status createdAt");

    return res.status(200).json({
      status: "success",
      data: { users },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch users";
    return res.status(500).json({ status: "error", message });
  }
};
