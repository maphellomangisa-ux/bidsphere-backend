import cron from "node-cron";
import Auction from "../models/Auction.js";

const startAuctionCloser = (io) => {
  // Runs every 10 seconds
  cron.schedule("*/10 * * * * *", async () => {
    try {
      const now = new Date();

      const expiredAuctions = await Auction.find({
        status: "active",
        endTime: { $lte: now },
      });

      for (const auction of expiredAuctions) {
        // ✅ Reserve logic
        if (
          auction.reservePrice &&
          auction.currentBid < auction.reservePrice
        ) {
          auction.status = "unsold";
        } else {
          auction.status = "ended";
        }

        await auction.save();

        console.log(`✅ Auction closed: ${auction._id}`);

        // ✅ Emit real-time event (for future Flutter socket)
        if (io) {
          io.to(auction._id.toString()).emit("auctionEnded", auction);
        }
      }
    } catch (error) {
      console.error("❌ Auction closer error:", error.message);
    }
  });

  console.log("⏳ Auction closer started...");
};

export default startAuctionCloser;