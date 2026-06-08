import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // ✅ Fast login lookups
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // ✅ Prevent accidental exposure in queries
    },

    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
      index: true,
    },

    isVerifiedSeller: {
      type: Boolean,
      default: false,
      index: true,
    },

    isBanned: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Optional compound index for admin dashboards
userSchema.index({ role: 1, isBanned: 1 });

export default mongoose.model("User", userSchema);