import { Router } from "express";
import { userAuth } from "../middleware/auth.middleware.js";
import { getConversation, getUsers } from "../controllers/chat.controller.js";

const router = Router();

router.get("/users", userAuth, getUsers);
router.get("/conversation/:userId", userAuth, getConversation);

export default router;
