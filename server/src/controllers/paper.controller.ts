import type { Request, Response, NextFunction } from "express";
import { PaperService } from "../services/paper.service.js";

const paperService = new PaperService();

export async function getPapers(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, year, topic, method, dataset, page, pageSize } = req.query;
    const result = await paperService.getPapers({
      search: search as string,
      year: year ? parseInt(year as string, 10) : undefined,
      topicId: topic as string,
      methodId: method as string,
      datasetId: dataset as string,
      page: page ? parseInt(page as string, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize as string, 10) : 10,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getPaperById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await paperService.getPaperDetails(id);
    if (!data) {
      res.status(404).json({ success: false, error: { message: `Paper with ID '${id}' not found.` } });
      return;
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getPaperRelated(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const related = await paperService.getRelatedPapers(id, limit);
    res.json({ success: true, data: related });
  } catch (err) {
    next(err);
  }
}

export async function getPaperLineage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const depth = req.query.depth ? parseInt(req.query.depth as string, 10) : 3;
    const lineage = await paperService.getPaperLineage(id, depth);
    res.json({ success: true, data: lineage });
  } catch (err) {
    next(err);
  }
}

export async function getPaperCitations(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const citations = await paperService.getPaperCitations(id);
    res.json({ success: true, data: citations });
  } catch (err) {
    next(err);
  }
}
