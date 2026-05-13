import User from "../models/User.js";

export const verifySeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    user.isVerifiedSeller = true;
    await user.save();

    res.json({ message: "Seller verified ✅" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBanned = true;
    await user.save();

    res.json({ message: "User banned ✅" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};