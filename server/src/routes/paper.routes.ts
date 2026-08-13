import { Router } from "express";
import {
  getPapers,
  getPaperById,
  getPaperRelated,
  getPaperLineage,
  getPaperCitations,
} from "../controllers/paper.controller.js";
import { validatePagination, validateDepth } from "../middleware/validator.js";

export const paperRouter = Router();

paperRouter.get("/", validatePagination, getPapers);
paperRouter.get("/:id", getPaperById);
paperRouter.get("/:id/related", getPaperRelated);
paperRouter.get("/:id/lineage", validateDepth, getPaperLineage);
paperRouter.get("/:id/citations", getPaperCitations);
