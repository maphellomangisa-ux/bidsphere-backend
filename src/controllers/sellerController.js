import Auction from "../models/Auction.js";
import Product from "../models/Product.js";
import Gig from "../models/Gig.js";

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const [
      totalProducts,
      activeProducts,
      totalGigs,
      openGigs,
      totalAuctions,
      activeAuctions,
    ] = await Promise.all([
      Product.countDocuments({ seller: userId }),
      Product.countDocuments({ seller: userId, status: "active" }),
      Gig.countDocuments({ postedBy: userId }),
      Gig.countDocuments({ postedBy: userId, status: "open" }),
      Auction.countDocuments({ seller: userId }),
      Auction.countDocuments({ seller: userId, isLive: true }),
    ]);

    return res.status(200).json({
      totalProducts,
      activeProducts,
      totalGigs,
      openGigs,
      totalAuctions,
      activeAuctions,
      totalListings: totalProducts + totalGigs + totalAuctions,
      revenue: 0,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};

export const getSellerProducts = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const products = await Product.find({ seller: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch seller products",
      error: error.message,
    });
  }
};

export const getSellerGigs = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const gigs = await Gig.find({ postedBy: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(gigs);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch seller gigs",
      error: error.message,
    });
  }
};

export const getSellerAuctions = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const auctions = await Auction.find({ seller: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(auctions);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch seller auctions",
      error: error.message,
    });
  }
};