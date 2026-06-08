import Product from "../models/Product.js";

/**
 * @desc    Get all active products sorted by newest first
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res) => {
  console.log("🔍 getProducts handler called");
  try {
    const products = await Product.find({ status: "active" })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product || product.status === "archived") {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new product listing
 * @route   POST /api/products
 * @access  Private
 */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      title,
      description,
      price,
      startingPrice,
      imageUrls,
      category,
    } = req.body;

    const basePrice = startingPrice || price || 0;

    const product = await Product.create({
      title: title || name,
      description,
      startingPrice: basePrice,
      currentPrice: basePrice,
      imageUrls: imageUrls || [],
      category: category || "General",
      status: "active",
      seller: req.user?._id || req.user?.id || null,
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing product listing
 * @route   PUT /api/products/:id
 * @access  Private
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // ✅ Ownership protection (recommended)
    if (
      product.seller?.toString() !==
      (req.user?._id || req.user?.id)?.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to update this product",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

/**
 * @desc    Soft delete product (archive)
 * @route   DELETE /api/products/:id
 * @access  Private
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // ✅ Ownership protection
    if (
      product.seller?.toString() !==
      (req.user?._id || req.user?.id)?.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to delete this product",
      });
    }

    product.status = "archived";
    await product.save();

    return res.status(200).json({
      message: "Product archived successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};