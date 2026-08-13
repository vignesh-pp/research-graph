import { Router } from "express";
import {
  getResearchers,
  getResearcherById,
  getResearcherCollaborators,
  getResearcherCollaborationGraph,
} from "../controllers/researcher.controller.js";
import { validatePagination } from "../middleware/validator.js";

export const researcherRouter = Router();

researcherRouter.get("/", validatePagination, getResearchers);
researcherRouter.get("/:id", getResearcherById);
researcherRouter.get("/:id/collaborators", getResearcherCollaborators);
researcherRouter.get("/:id/collaboration-graph", getResearcherCollaborationGraph);
