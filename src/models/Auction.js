import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startingPrice: { type: Number, required: true },
    currentBid: { type: Number, default: 0 },
    highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reservePrice: { type: Number, default: 0 },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "ended", "unsold"],
      default: "active",
    },
    // ✅ NEW MEDIA & CATEGORY FIELDS
    imageUrl: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Other",
    },
    // ✅ PHASE 2: HYBRID FIELDS
    listingType: {
      type: String,
      enum: ["auction", "fixed"],
      default: "auction",
    },
    buyNowPrice: {
      type: Number,
      default: null,
    },
    minIncrement: {
      type: Number,
      default: 1,
    },
    // ✅ BID HISTORY
    bids: [
      {
        bidder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        amount: {
          type: Number,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Auction", auctionSchema);