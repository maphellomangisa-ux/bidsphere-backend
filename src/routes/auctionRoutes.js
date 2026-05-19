import express from "express";
import {
  createAuction,
  placeBid,
  getAuctions,
  getAuction,
} from "../controllers/auctionController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// ✅ PUBLIC ROUTES
// ==========================================
// Accessible by anyone browsing the marketplace
router.get("/", getAuctions);
router.get("/:id", getAuction);

// ==========================================
// ✅ PROTECTED ROUTES
// ==========================================
// DEMO OVERRIDE: Dropped roleMiddleware("seller") so any authenticated client can test listing items
router.post(
  "/",
  authMiddleware,
  createAuction
);

// High-speed bidding endpoint
router.post(
  "/:id/bid",
  authMiddleware,
  placeBid
);

export default router;