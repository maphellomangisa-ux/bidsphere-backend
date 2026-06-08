import mongoose from "mongoose";
import User from "../models/User.js";

// ==========================================
// ✅ VERIFY SELLER
// ==========================================
export const verifySeller = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);

    if (!user || user.role !== "seller") {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    if (user.isVerifiedSeller) {
      return res.status(400).json({
        message: "Seller already verified",
      });
    }

    user.isVerifiedSeller = true;
    await user.save();

    return res.json({
      message: "Seller verified ✅",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify seller",
      error: error.message,
    });
  }
};

// ==========================================
// ✅ BAN USER
// ==========================================
export const banUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ✅ Prevent banning admin accounts
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Cannot ban admin user",
      });
    }

    if (user.isBanned) {
      return res.status(400).json({
        message: "User already banned",
      });
    }

    user.isBanned = true;
    await user.save();

    return res.json({
      message: "User banned ✅",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to ban user",
      error: error.message,
    });
  }
};