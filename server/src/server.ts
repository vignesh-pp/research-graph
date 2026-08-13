import { app } from "./app.js";
import { config } from "./config/env.js";
import { verifyConnection, closeDriver } from "./database/neo4j.js";

async function startServer() {
  console.log("==========================================");
  console.log("   Starting ResearchGraph API Server");
  console.log("==========================================");
  console.log(`Port: ${config.port}`);
  console.log(`Mode: ${config.isMock ? "Mock In-Memory Graph (IS_MOCK=true)" : "CognoDB Bolt Driver (IS_MOCK=false)"}`);

  if (config.isMock) {
    console.log("⚡ Server running in Mock Data Mode (preloaded with 55+ researchers & 108+ papers).");
  } else {
    console.log(`Bolt Target URI: ${config.cognodb.uri}`);
    const isConnected = await verifyConnection();
    if (isConnected) {
      console.log("✅ Successfully connected to CognoDB database over Bolt!");
    } else {
      console.warn("⚠️ Warning: Could not connect to CognoDB cloud instance.");
      console.warn("   Falling back to high-fidelity in-memory graph fallback store.");
      console.warn("   Verify COGNODB_URI, COGNODB_USERNAME, and COGNODB_PASSWORD in .env.");
    }
  }

  const server = app.listen(config.port, () => {
    console.log(`🚀 ResearchGraph Server running at http://localhost:${config.port}`);
    console.log(`📊 Health endpoint: http://localhost:${config.port}/api/health`);
    console.log("==========================================");
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await closeDriver();
      console.log("Server stopped.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
