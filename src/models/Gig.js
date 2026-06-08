import mongoose from "mongoose";

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "General",
    },

    budget: {
      type: Number,
      default: 0,
      min: 0,
    },

    isUrgent: {
      type: Boolean,
      default: false,
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["open", "assigned", "completed", "archived"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Gig", gigSchema);