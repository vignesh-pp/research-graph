import type { Request, Response, NextFunction } from "express";
import { TopicService } from "../services/topic.service.js";

const topicService = new TopicService();

export async function getTopics(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await topicService.getAllTopics();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getTopicById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = await topicService.getTopicDetails(id);
    if (!data) {
      res.status(404).json({ success: false, error: { message: `Topic with ID '${id}' not found.` } });
      return;
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
