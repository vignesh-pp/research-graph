import { Router } from "express";
import { getMethods, getMethodById } from "../controllers/method.controller.js";

export const methodRouter = Router();
methodRouter.get("/", getMethods);
methodRouter.get("/:id", getMethodById);
