import express from "express";
import {
  createAuction,
  placeBid,
  getAuctions,
  getAuction,
} from "../controllers/auctionController.js";
import authMiddleware from "../middleware/auth.js";
import roleMiddleware from "../middleware/role.js";

const router = express.Router();

// ✅ Public Routes
// Accessible by anyone browsing the marketplace
router.get("/", getAuctions);
router.get("/:id", getAuction);

// ✅ Protected Routes
// Only verified sellers can list new items
router.post(
  "/",
  authMiddleware,
  roleMiddleware("seller"),
  createAuction
);

// High-speed bidding (Limiter removed for smooth demo experience)
router.post(
  "/:id/bid",
  authMiddleware,
  placeBid
);

export default router;