import express from "express";
import * as gigController from "../controllers/gigController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

console.log("✅ gigRoutes loaded");

router.get("/", gigController.getGigs);
router.get("/:id", gigController.getGigById);

router.post("/", authMiddleware, gigController.createGig);
router.put("/:id", authMiddleware, gigController.updateGig);
router.delete("/:id", authMiddleware, gigController.deleteGig);

export default router;