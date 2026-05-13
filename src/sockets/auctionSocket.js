import { registerRoomActivity } from "../services/countdownService.js";

const registerAuctionSockets = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    socket.on("joinAuction", (auctionId) => {
      socket.join(auctionId);
      
      // ✅ Start the scalable ticker for this room
      registerRoomActivity(auctionId);

      // ✅ Update watcher count for everyone in the room
      const room = io.sockets.adapter.rooms.get(auctionId);
      const watcherCount = room ? room.size : 0;

      io.to(auctionId).emit("watcherUpdate", {
        watchers: watcherCount,
      });

      console.log(`📥 Joined auction: ${auctionId} | Watchers: ${watcherCount}`);
    });

    socket.on("leaveAuction", (auctionId) => {
      socket.leave(auctionId);

      const room = io.sockets.adapter.rooms.get(auctionId);
      const watcherCount = room ? room.size : 0;

      io.to(auctionId).emit("watcherUpdate", {
        watchers: watcherCount,
      });

      console.log(`📤 Left auction: ${auctionId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
      // Room counts automatically decrease on disconnect, 
      // the countdownService loop will clean up the Set on its next tick.
    });
  });
};

export default registerAuctionSockets;