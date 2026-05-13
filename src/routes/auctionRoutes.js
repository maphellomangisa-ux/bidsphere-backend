import express from "express";
import { createAuction, placeBid } from "../controllers/auctionController.js";
import authMiddleware from "../middleware/auth.js";
import roleMiddleware from "../middleware/role.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("seller"),
  createAuction
);

router.post(
  "/:id/bid",
  authMiddleware,
  placeBid
);

export default router;