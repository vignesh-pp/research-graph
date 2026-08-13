import type { Request, Response, NextFunction } from "express";
import { SearchService } from "../services/search.service.js";

const searchService = new SearchService();

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const q = (req.query.q as string) || "";
    const results = await searchService.search(q);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}
