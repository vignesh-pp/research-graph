import type { Request, Response, NextFunction } from "express";
import { DatasetRepository } from "../repositories/dataset.repository.js";

const datasetRepo = new DatasetRepository();

export async function getDatasets(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await datasetRepo.findAll();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getDatasetById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const dataset = await datasetRepo.findById(id);
    if (!dataset) {
      res.status(404).json({ success: false, error: { message: `Dataset with ID '${id}' not found.` } });
      return;
    }
    const papers = await datasetRepo.getPapers(id);
    res.json({ success: true, data: { dataset, papers } });
  } catch (err) {
    next(err);
  }
}
