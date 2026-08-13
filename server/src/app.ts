import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

// Middleware
app.use(
  cors({
    origin: [config.clientUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json());

// Request logging (sanitized)
app.use((req, _res, next) => {
  const start = Date.now();
  const { method, url } = req;
  _res.on("finish", () => {
    const duration = Date.now() - start;
    if (!url.startsWith("/api/health")) {
      console.log(`[HTTP] ${method} ${url} ${_res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// API Routes
app.use("/api", apiRouter);

// Root greeting
app.get("/", (_req, res) => {
  res.json({
    name: "ResearchGraph API",
    tagline: "Explore research through people, papers, ideas, methods, and connections.",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.method} ${req.originalUrl} not found.` },
  });
});

// Centralized error handler
app.use(errorHandler);
