import { Router } from "express";
import { getInstitutions, getInstitutionById } from "../controllers/institution.controller.js";

export const institutionRouter = Router();
institutionRouter.get("/", getInstitutions);
institutionRouter.get("/:id", getInstitutionById);
