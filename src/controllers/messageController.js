import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// ==========================================
// ✅ GET USER CONVERSATIONS
// ==========================================
export const getConversations = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username avatarUrl")
      .sort({ lastMessageAt: -1 })
      .lean();

    const formatted = conversations.map((conversation) => {
      const otherUser =
        conversation.participants.find(
          (participant) =>
            participant._id.toString() !== userId.toString()
        ) || conversation.participants[0];

      return {
        _id: conversation._id,
        otherUserName: otherUser?.username || "Unknown",
        otherUserAvatar: otherUser?.avatarUrl || null,
        lastMessage: conversation.lastMessage || "",
        updatedAt:
          conversation.lastMessageAt ||
          conversation.updatedAt,
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

// ==========================================
// ✅ GET MESSAGES FOR A CONVERSATION
// ==========================================
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversationId,
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

// ==========================================
// ✅ SEND MESSAGE
// ==========================================
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user?._id || req.user?.id;
    const { conversationId, receiverId, content } =
      req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    let conversation = null;

    // ✅ Existing conversation
    if (conversationId) {
      conversation = await Conversation.findById(
        conversationId
      );
    }

    // ✅ Create new conversation if not exists
    if (!conversation) {
      if (!receiverId) {
        return res.status(400).json({
          message:
            "receiverId is required for a new conversation",
        });
      }

      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        lastMessage: content,
        lastMessageAt: new Date(),
      });
    }

    // ✅ Create message
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      receiverId: receiverId || null,
      content,
    });

    // ✅ Update conversation metadata
    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const payload = {
      _id: message._id,
      conversationId: conversation._id,
      senderId,
      receiverId: receiverId || null,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
    };

    // ✅ Emit via Socket.IO
    const io = req.app.get("io");

    if (io) {
      io.to(conversation._id.toString()).emit(
        "newMessage",
        payload
      );
    }

    return res.status(201).json(payload);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};