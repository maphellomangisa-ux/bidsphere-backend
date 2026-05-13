import mongoose from "mongoose";
import Auction from "../models/Auction.js";

// ==========================================
// ✅ CREATE AUCTION
// ==========================================
export const createAuction = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can create auctions" });
    }
    if (!req.user.isVerifiedSeller) {
      return res.status(403).json({ message: "Seller not verified" });
    }

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

    // ✅ Atomic update: Only updates if currentBid is still less than amount
    // ✅ Simultaneously pushes the new bid into the history array
    const updatedAuction = await Auction.findOneAndUpdate(
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

    // 📢 Emit real-time bid update
    io.to(auctionId).emit("newBid", updatedAuction);

    // ⏱️ Anti-sniping logic
    const timeLeft = updatedAuction.endTime - new Date();

    if (timeLeft <= 60000) {
      updatedAuction.endTime = new Date(updatedAuction.endTime.getTime() + 60000);
      await updatedAuction.save();

      // 📢 Emit extension event
      io.to(auctionId).emit("auctionExtended", {
        auctionId: updatedAuction._id,
        newEndTime: updatedAuction.endTime,
      });

      console.log(`⏳ Anti-sniping: Auction ${auctionId} extended.`);
    }

    res.json(updatedAuction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};