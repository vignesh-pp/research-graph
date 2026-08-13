import { Router } from "express";
import { getDatasets, getDatasetById } from "../controllers/dataset.controller.js";

export const datasetRouter = Router();
datasetRouter.get("/", getDatasets);
datasetRouter.get("/:id", getDatasetById);
