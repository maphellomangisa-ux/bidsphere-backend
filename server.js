import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// ✅ Security Imports
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

// ✅ Background Services
import startAuctionCloser from "./src/services/auctionCloser.js";
import registerAuctionSockets from "./src/sockets/auctionSocket.js";
import startCountdownBroadcast from "./src/services/countdownService.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ==========================================
// ✅ SOCKET.IO SETUP
// ==========================================
const io = new Server(server, {
  cors: { origin: "*" },
});

// Inject io into the app instance for use in controllers
app.set("io", io); 

// ==========================================
// ✅ SECURITY MIDDLEWARE (Top of Stack)
// ==========================================

// 1. Security Headers
app.use(helmet());

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  message: "Too many requests from this IP, please try again later."
});
app.use("/api", limiter);

// 3. Prevent NoSQL Injection
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.query) req.query = mongoSanitize(req.query);
  if (req.params) req.params = mongoSanitize(req.params);
  next();
});

// 4. Prevent XSS
app.use(xssClean());

// 5. Prevent HTTP Parameter Pollution
app.use(hpp());

// ==========================================
// ✅ STANDARD MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// ✅ DATABASE & BACKGROUND SERVICES
// ==========================================
connectDB();
startAuctionCloser(io);
registerAuctionSockets(io);
startCountdownBroadcast(io);

// ==========================================
// ✅ ROUTES
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/admin", adminRoutes);

/**
 * ✅ NEW HEALTH CHECK ENDPOINT
 * Used by Railway for service monitoring
 */
app.get("/health", async (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date()
  });
});

// Main Landing Check
app.get("/", (req, res) => {
  res.json({ 
    success: true, 
    message: "BidSphere API Running 🚀",
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// ✅ SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});