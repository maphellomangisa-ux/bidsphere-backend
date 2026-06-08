import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// ✅ Security
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "mongo-sanitize";
import xssClean from "xss-clean";
import hpp from "hpp";

// ✅ Config & Routes
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import auctionRoutes from "./src/routes/auctionRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import gigRoutes from "./src/routes/gigRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import sellerRoutes from "./src/routes/sellerRoutes.js";

// ✅ Background Services
import startAuctionCloser from "./src/services/auctionCloser.js";
import registerAuctionSockets from "./src/sockets/auctionSocket.js";
import startCountdownBroadcast from "./src/services/countdownService.js";

dotenv.config();

console.log("Running from:", process.cwd());
console.log("ENV:", process.env.NODE_ENV);

const app = express();
const server = http.createServer(app);

// ==========================================
// ✅ DATABASE CONNECTION
// ==========================================
connectDB();

// ==========================================
// ✅ MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use("/api", limiter);

app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.query) req.query = mongoSanitize(req.query);
  if (req.params) req.params = mongoSanitize(req.params);
  next();
});

app.use(xssClean());
app.use(hpp());

// ==========================================
// ✅ CORS
// ==========================================
const corsOptions = {
  origin: true,
  credentials: true,
};
app.use(cors(corsOptions));

// ==========================================
// ✅ SOCKET.IO
// ==========================================
const io = new Server(server, {
  cors: corsOptions,
});
app.set("io", io);

// ✅ Start background services
startAuctionCloser(io);
registerAuctionSockets(io);
startCountdownBroadcast(io);

// ==========================================
// ✅ ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/products", productRoutes); // ✅ MUST stay plural
app.use("/api/gigs", gigRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", messageRoutes);

// ==========================================
// ✅ HEALTH CHECK
// ==========================================
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    db:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
    timestamp: new Date(),
  });
});

// ==========================================
// ✅ API ROOT
// ==========================================
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "BidSphere API Running 🚀",
  });
});

// ==========================================
// ✅ TEST ROUTE
// ==========================================
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend API is working",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// ✅ 404 HANDLER (JSON ONLY)
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ==========================================
// ✅ GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ==========================================
// ✅ START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});