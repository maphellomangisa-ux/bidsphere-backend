import Auction from "../models/Auction.js";

const activeRooms = new Set();

// ✅ Register when at least one person starts watching
export const registerRoomActivity = (auctionId) => {
  activeRooms.add(auctionId.toString());
};

// ✅ Optional: Manually unregister if needed
export const unregisterRoomActivity = (auctionId) => {
  activeRooms.delete(auctionId.toString());
};

const startCountdownBroadcast = (io) => {
  setInterval(async () => {
    if (activeRooms.size === 0) return;

    const now = new Date();

    for (const auctionId of activeRooms) {
      const room = io.sockets.adapter.rooms.get(auctionId);

      // ✅ Only tick if there are active sockets in the room
      if (room && room.size > 0) {
        const auction = await Auction.findById(auctionId).select("endTime status");

        if (auction && auction.status === "active") {
          const timeLeft = auction.endTime - now;

          if (timeLeft > 0) {
            io.to(auctionId).emit("countdown", {
              auctionId,
              timeLeft,
            });
          }
        } else {
          // Cleanup: Auction ended or doesn't exist
          activeRooms.delete(auctionId);
        }
      } else {
        // Cleanup: No one is watching anymore
        activeRooms.delete(auctionId);
      }
    }
  }, 1000);
};

export default startCountdownBroadcast;