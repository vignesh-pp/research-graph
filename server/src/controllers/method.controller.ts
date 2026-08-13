import type { Request, Response, NextFunction } from "express";
import { MethodRepository } from "../repositories/method.repository.js";

const methodRepo = new MethodRepository();

export async function getMethods(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await methodRepo.findAll();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getMethodById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const method = await methodRepo.findById(id);
    if (!method) {
      res.status(404).json({ success: false, error: { message: `Method with ID '${id}' not found.` } });
      return;
    }
    const papers = await methodRepo.getPapers(id);
    res.json({ success: true, data: { method, papers } });
  } catch (err) {
    next(err);
  }
}
