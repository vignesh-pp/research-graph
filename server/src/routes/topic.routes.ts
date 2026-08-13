import { Router } from "express";
import { getTopics, getTopicById } from "../controllers/topic.controller.js";

export const topicRouter = Router();
topicRouter.get("/", getTopics);
topicRouter.get("/:id", getTopicById);
