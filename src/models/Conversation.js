import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true, // ✅ Speeds up user conversation lookups
      },
    ],

    lastMessage: {
      type: String,
      default: "",
      trim: true,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true, // ✅ Important for sorting conversations
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Compound index to quickly fetch conversations by user + recent activity
conversationSchema.index({
  participants: 1,
  lastMessageAt: -1,
});

export default mongoose.model(
  "Conversation",
  conversationSchema
);