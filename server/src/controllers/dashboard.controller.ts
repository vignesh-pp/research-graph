import type { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service.js";

const dashboardService = new DashboardService();

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getDashboardData();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
