import { GraphRepository } from "../repositories/graph.repository.js";
import { TopicRepository } from "../repositories/topic.repository.js";

export class DashboardService {
  private graphRepo = new GraphRepository();
  private topicRepo = new TopicRepository();

  async getDashboardData() {
    const [stats, mostConnected, mostCited, activity, topics] = await Promise.all([
      this.graphRepo.getDashboardStats(),
      this.graphRepo.getMostConnectedResearchers(6),
      this.graphRepo.getMostCitedPapers(5),
      this.graphRepo.getActivityByYear(),
      this.topicRepo.findAll(),
    ]);

    const popularTopics = topics.slice(0, 8).map((t) => ({
      id: t.id,
      name: t.label,
      paperCount: Number(t.properties?.paperCount || 0),
      category: String(t.properties?.category || ""),
    }));

    return {
      stats,
      popularTopics,
      mostConnectedResearchers: mostConnected,
      mostCitedPapers: mostCited,
      activity,
    };
  }
}
