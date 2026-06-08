import express from "express";
import * as productController from "../controllers/productController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

console.log("✅ productRoutes loaded");

// ==========================================
// ✅ DEBUG ROUTE
// ==========================================
// GET /api/products/ping
router.get("/ping", (req, res) => {
  res.json({
    success: true,
    message: "Products route is working ✅",
  });
});

// ==========================================
// ✅ PUBLIC ROUTES — Marketplace Discovery
// ==========================================

// GET /api/products
router.get("/", async (req, res, next) => {
  try {
    return await productController.getProducts(req, res, next);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    return await productController.getProductById(req, res, next);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// ✅ PROTECTED ROUTES — JWT Required
// ==========================================

// POST /api/products
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    return await productController.createProduct(req, res, next);
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id
router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    return await productController.updateProduct(req, res, next);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    return await productController.deleteProduct(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;