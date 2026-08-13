import type { Request, Response, NextFunction } from "express";
import { ResearcherService } from "../services/researcher.service.js";

const researcherService = new ResearcherService();

export async function getResearchers(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, institution, topic, page, pageSize } = req.query;
    const result = await researcherService.getResearchers({
      search: search as string,
      institutionId: institution as string,
      topicId: topic as string,
      page: page ? parseInt(page as string, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize as string, 10) : 10,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getResearcherById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await researcherService.getResearcherDetails(id);
    if (!data) {
      res.status(404).json({ success: false, error: { message: `Researcher with ID '${id}' not found.` } });
      return;
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getResearcherCollaborators(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const collaborators = await researcherService.getCollaborators(id);
    res.json({ success: true, data: collaborators });
  } catch (err) {
    next(err);
  }
}

export async function getResearcherCollaborationGraph(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const graph = await researcherService.getCollaborationGraph(id);
    res.json({ success: true, data: graph });
  } catch (err) {
    next(err);
  }
}
