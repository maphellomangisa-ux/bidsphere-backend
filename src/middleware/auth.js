import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    // 1. Check if the header exists and follows Bearer format
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];

    // 2. Verify the token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ 3. Structural Protection: Ensure essential claims exist
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({ message: "Invalid token structure" });
    }

    // 4. Fetch the user from the database
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ 5. Security Check: Block banned users instantly
    if (user.isBanned) {
      return res.status(403).json({ message: "Account banned. Please contact support." });
    }

    // 6. Attach full user object to the request for use in controllers
    req.user = user;
    next();
  } catch (error) {
    // Catch-all for expired or tampered tokens
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;