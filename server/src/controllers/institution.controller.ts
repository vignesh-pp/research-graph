import type { Request, Response, NextFunction } from "express";
import { InstitutionService } from "../services/institution.service.js";

const institutionService = new InstitutionService();

export async function getInstitutions(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await institutionService.getAllInstitutions();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getInstitutionById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await institutionService.getInstitutionDetails(id);
    if (!data) {
      res.status(404).json({ success: false, error: { message: `Institution with ID '${id}' not found.` } });
      return;
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
