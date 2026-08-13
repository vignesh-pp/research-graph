import type { Request, Response, NextFunction } from "express";
import { GraphService } from "../services/graph.service.js";
import type { NodeType } from "../types/graph.types.js";

const graphService = new GraphService();

export async function getNeighborhood(req: Request, res: Response, next: NextFunction) {
  try {
    const { type } = req.params;
    const id = req.params.id as string;
    const depth = req.query.depth ? parseInt(req.query.depth as string, 10) : 1;
    const data = await graphService.getNeighborhood(type as NodeType, id, depth);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function findPath(req: Request, res: Response, next: NextFunction) {
  try {
    const { startId, targetId } = req.query;
    if (!startId || !targetId) {
      res.status(400).json({
        success: false,
        error: { message: "Query parameters 'startId' and 'targetId' are required." },
      });
      return;
    }
    const path = await graphService.findPath(startId as string, targetId as string);
    if (!path) {
      res.json({ success: true, data: null, message: "No relationship path found between the selected entities." });
      return;
    }
    res.json({ success: true, data: path });
  } catch (err) {
    next(err);
  }
}

export async function getAllEntities(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await graphService.getAllEntities();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
