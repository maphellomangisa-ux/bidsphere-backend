import express from "express";
import authMiddleware from "../middleware/auth.js";
import roleMiddleware from "../middleware/role.js";
import { verifySeller, banUser } from "../controllers/adminController.js";

const router = express.Router();

router.patch(
  "/verify-seller/:id",
  authMiddleware,
  roleMiddleware("admin"),
  verifySeller
);

router.patch(
  "/ban-user/:id",
  authMiddleware,
  roleMiddleware("admin"),
  banUser
);

export default router;