import express from "express";
import * as messageController from "../controllers/messageController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// ✅ PROTECTED MESSAGING ROUTES (JWT Required)
// ==========================================

// Get all conversations for logged-in user
router.get(
  "/conversations",
  authMiddleware,
  messageController.getConversations
);

// Get messages for a specific conversation
router.get(
  "/messages/:conversationId",
  authMiddleware,
  messageController.getMessages
);

// Send a new message
router.post(
  "/messages",
  authMiddleware,
  messageController.sendMessage
);

export default router;