import express from "express";
import {
  createAuction,
  placeBid,
  getAuctions,
  getAuction,
} from "../controllers/auctionController.js";
import authMiddleware from "../middleware/auth.js";
import roleMiddleware from "../middleware/role.js";
import bidLimiter from "../middleware/bidLimiter.js";

const router = express.Router();

// ✅ Public Routes
router.get("/", getAuctions);
router.get("/:id", getAuction);

// ✅ Protected Routes
router.post(
  "/",
  authMiddleware,
  roleMiddleware("seller"),
  createAuction
);

router.post(
  "/:id/bid",
  authMiddleware,
  bidLimiter,
  placeBid
);

export default router;