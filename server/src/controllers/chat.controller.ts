import { type Request, type Response } from "express";
import Message from "../models/message.models.js";
import User from "../models/user.models.js";

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user?.id;

    if (!currentUserId || !userId) {
      return res.status(400).json({
        status: "fail",
        message: "Missing user identifier.",
      });
    }

    const room = [currentUserId, userId].sort().join("_");

    const messages = await Message.find({ room })
      .sort({ createdAt: 1 })
      .populate("sender", "id username status")
      .populate("receiver", "id username status");

    return res.status(200).json({
      status: "success",
      data: { messages },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch conversation";
    return res.status(500).json({ status: "error", message });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({}).select(
      "id username email status createdAt",
    );

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
