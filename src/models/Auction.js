import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    startingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    currentBid: {
      type: Number,
      default: 0,
      min: 0,
    },

    highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reservePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    endTime: {
      type: Date,
      required: true,
      index: true, // ✅ Helps auction auto-close queries
    },

    status: {
      type: String,
      enum: ["active", "ended", "unsold"],
      default: "active",
      index: true, // ✅ Important for active auction queries
    },

    // ✅ MEDIA & CATEGORY
    imageUrl: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "Other",
      index: true,
    },

    // ✅ HYBRID LISTING SUPPORT
    listingType: {
      type: String,
      enum: ["auction", "fixed"],
      default: "auction",
    },

    buyNowPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    minIncrement: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ✅ BID HISTORY
    bids: [
      {
        bidder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Auction", auctionSchema);