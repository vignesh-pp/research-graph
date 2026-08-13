import { Router } from "express";
import { getNeighborhood, findPath, getAllEntities } from "../controllers/graph.controller.js";
import { validateDepth } from "../middleware/validator.js";

export const graphRouter = Router();

graphRouter.get("/entities", getAllEntities);
graphRouter.get("/path", findPath);
graphRouter.get("/:type/:id", validateDepth, getNeighborhood);
