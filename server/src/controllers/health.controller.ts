import type { Request, Response } from "express";
import { verifyConnection } from "../database/neo4j.js";
import { config } from "../config/env.js";

export async function getHealth(_req: Request, res: Response) {
  const isConnected = !config.isMock ? await verifyConnection() : false;
  res.json({
    status: isConnected || config.isMock ? "ok" : "degraded",
    database: isConnected ? "connected" : config.isMock ? "mock" : "disconnected",
    isMock: config.isMock,
    mode: config.isMock ? "mock" : isConnected ? "live" : "disconnected",
    timestamp: new Date().toISOString(),
  });
}
