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
// ✅ DYNAMIC CORS CONFIGURATION
// ==========================================
// This allows any origin to connect, which is essential for 
// Flutter mobile debugging and diverse local web ports.
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

app.use(cors(corsOptions));

// ==========================================
// ✅ SOCKET.IO SETUP
// ==========================================
const io = new Server(server, {
  cors: corsOptions, // Use the same dynamic logic for Sockets
});

app.set("io", io); 

// ==========================================
// ✅ SECURITY MIDDLEWARE
// ==========================================
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  message: "Too many requests from this IP, please try again later."
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
// ✅ STANDARD MIDDLEWARE
// ==========================================
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

app.get("/health", async (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date()
  });
});

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