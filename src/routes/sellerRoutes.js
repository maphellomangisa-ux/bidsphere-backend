import express from "express";
import * as sellerController from "../controllers/sellerController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/analytics", authMiddleware, sellerController.getAnalytics);
router.get("/products", authMiddleware, sellerController.getSellerProducts);
router.get("/gigs", authMiddleware, sellerController.getSellerGigs);
router.get("/auctions", authMiddleware, sellerController.getSellerAuctions);

export default router;