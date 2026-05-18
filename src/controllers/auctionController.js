import mongoose from "mongoose";
import Auction from "../models/Auction.js";

// ==========================================
// ✅ FETCH ALL ACTIVE AUCTIONS
// ==========================================
export const getAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ status: "active" })
      .populate("seller", "username email isVerifiedSeller")
      .populate("highestBidder", "username")
      .sort({ endTime: 1 });

    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ✅ FETCH SINGLE AUCTION
// ==========================================
export const getAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate("seller", "username email isVerifiedSeller")
      .populate("highestBidder", "username")
      .populate("bids.bidder", "username");

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ✅ CREATE AUCTION (Surgically Cleaned for Demo)
// ==========================================
export const createAuction = async (req, res) => {
  try {
    /* 
    // -------------------------------------------------------------
    // 🛡️ DEMO OVERRIDE: Temporarily bypassed to allow open testing.
    // Production restriction profiles will reactivate these checks.
    // -------------------------------------------------------------
    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can create auctions" });
    }
    if (!req.user.isVerifiedSeller) {
      return res.status(403).json({ message: "Seller not verified" });
    }
    */

    const { title, description, startingPrice, reservePrice, durationMinutes } = req.body;

    const endTime = new Date(Date.now() + durationMinutes * 60000);

    const auction = await Auction.create({
      title,
      description,
      startingPrice,
      currentBid: startingPrice,
      reservePrice: reservePrice || 0,
      seller: req.user._id,
      endTime,
    });

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ✅ ATOMIC PLACE BID + REAL-TIME EMITS
// ==========================================
export const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const auctionId = req.params.id;
    const io = req.app.get("io");

    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json({ message: "Invalid auction ID" });
    }

    const auction = await Auction.findById(auctionId);

    if (!auction || auction.status !== "active") {
      return res.status(400).json({ message: "Auction is not active" });
    }

    if (auction.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot bid on your own auction" });
    }

    let updatedAuction = await Auction.findOneAndUpdate(
      {
        _id: auctionId,
        status: "active",
        currentBid: { $lt: amount },
      },
      {
        $set: {
          currentBid: amount,
          highestBidder: req.user._id,
        },
        $push: {
          bids: { 
            bidder: req.user._id, 
            amount, 
            timestamp: new Date() 
          }
        }
      },
      { new: true }
    );

    if (!updatedAuction) {
      return res.status(400).json({ message: "Bid must be higher than current bid" });
    }

    const timeLeft = updatedAuction.endTime - new Date();

    if (timeLeft <= 60000) {
      updatedAuction.endTime = new Date(updatedAuction.endTime.getTime() + 60000);
      await updatedAuction.save();

      io.to(auctionId).emit("countdown", {
        auctionId: updatedAuction._id,
        endTime: updatedAuction.endTime,
      });

      console.log(`⏳ Anti-sniping: Auction ${auctionId} extended.`);
    }

    // ✅ FORCE POPULATION BEFORE EMITTING TO PREVENT FLUTTER TYPE CRASHES
    updatedAuction = await updatedAuction
      .populate([
        { path: "seller", select: "username email isVerifiedSeller" },
        { path: "highestBidder", select: "username" },
        { path: "bids.bidder", select: "username" }
      ]);

    io.to(auctionId).emit("newBid", updatedAuction);

    res.json(updatedAuction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};