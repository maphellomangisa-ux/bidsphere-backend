import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    // ✅ 1. Validate Authorization Header
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = header.split(" ")[1];

    // ✅ 2. Ensure JWT secret exists
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    // ✅ 3. Verify Token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ✅ 4. Validate token structure
    if (!decoded?.id || !decoded?.role) {
      return res.status(401).json({
        message: "Invalid token structure",
      });
    }

    // ✅ 5. Fetch user from DB
    const user = await User.findById(decoded.id)
      .select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // ✅ 6. Block banned users
    if (user.isBanned) {
      return res.status(403).json({
        message:
          "Account banned. Please contact support.",
      });
    }

    // ✅ 7. Attach user to request
    req.user = user;

    next();
  } catch (error) {
    // ✅ Differentiate token errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;