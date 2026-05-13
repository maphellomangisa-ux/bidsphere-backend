import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

// ✅ Security Imports
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
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
// ✅ SOCKET.IO & INJECTION SETUP
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

// 2. Rate Limiting (Global API Limit)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  message: "Too many requests from this IP, please try again later."
});
app.use("/api", limiter);

// 3. Prevent NoSQL Injection
app.use(mongoSanitize()); 

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

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "BidSphere API Running 🚀" });
});

// ==========================================
// ✅ SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});