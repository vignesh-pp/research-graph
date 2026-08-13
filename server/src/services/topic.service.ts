import { TopicRepository } from "../repositories/topic.repository.js";

export class TopicService {
  private topicRepo = new TopicRepository();

  async getAllTopics() {
    return this.topicRepo.findAll();
  }

  async getTopicDetails(id: string) {
    const topic = await this.topicRepo.findById(id);
    if (!topic) return null;

    const [papers, researchers, methods, datasets, relatedTopics, topicGraph] = await Promise.all([
      this.topicRepo.getPapers(id),
      this.topicRepo.getResearchers(id),
      this.topicRepo.getMethods(id),
      this.topicRepo.getDatasets(id),
      this.topicRepo.getRelatedTopics(id),
      this.topicRepo.getTopicGraph(id),
    ]);

    return {
      topic,
      papers,
      researchers,
      methods,
      datasets,
      relatedTopics,
      topicGraph,
    };
  }

  async getTopicById(id: string) {
    return this.topicRepo.findById(id);
  }
}
