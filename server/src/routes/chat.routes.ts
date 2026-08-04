import { Router } from "express";
import { userAuth } from "../middleware/auth.middleware.js";
import {
  getConversation,
  getConversations,
  getUsers,
  markMessageAsRead,
  sendMessage,
  softDeleteMessage,
} from "../controllers/chat.controller.js";

const router = Router();

router.get("/users", userAuth, getUsers);
router.get("/conversations", userAuth, getConversations);
router.get("/conversation/:userId", userAuth, getConversation);
router.post("/conversation/:userId/message", userAuth, sendMessage);
router.patch("/messages/:messageId", userAuth, softDeleteMessage);
router.patch("/messages/:messageId/read", userAuth, markMessageAsRead);

export default router;
