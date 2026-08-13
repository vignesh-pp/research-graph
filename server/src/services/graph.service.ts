import { GraphRepository } from "../repositories/graph.repository.js";
import { PaperRepository } from "../repositories/paper.repository.js";
import { ResearcherRepository } from "../repositories/researcher.repository.js";
import { TopicRepository } from "../repositories/topic.repository.js";
import { InstitutionRepository } from "../repositories/institution.repository.js";
import { MethodRepository } from "../repositories/method.repository.js";
import { DatasetRepository } from "../repositories/dataset.repository.js";
import type { GraphData, GraphNode, NodeType } from "../types/graph.types.js";

export class GraphService {
  private graphRepo = new GraphRepository();
  private paperRepo = new PaperRepository();
  private researcherRepo = new ResearcherRepository();
  private topicRepo = new TopicRepository();
  private instRepo = new InstitutionRepository();
  private methodRepo = new MethodRepository();
  private datasetRepo = new DatasetRepository();

  async getNeighborhood(type: NodeType, id: string, depth: number = 1): Promise<GraphData> {
    return this.graphRepo.getNeighborhood(id, depth);
  }

  async findPath(startId: string, targetId: string) {
    const path = await this.graphRepo.findShortestPath(startId, targetId);
    return path;
  }

  async getAllEntities() {
    const [papersRes, researchersRes, topics, insts, methods, datasets] = await Promise.all([
      this.paperRepo.findFiltered({ page: 1, pageSize: 150 }),
      this.researcherRepo.findFiltered({ page: 1, pageSize: 100 }),
      this.topicRepo.findAll(),
      this.instRepo.findAll(),
      this.methodRepo.findAll(),
      this.datasetRepo.findAll(),
    ]);

    return [
      { type: "Paper", items: papersRes.items.map((p) => ({ id: p.id, label: p.label })) },
      { type: "Researcher", items: researchersRes.items.map((r) => ({ id: r.id, label: r.label })) },
      { type: "Topic", items: topics.map((t) => ({ id: t.id, label: t.label })) },
      { type: "Institution", items: insts.map((i) => ({ id: i.id, label: i.label })) },
      { type: "Method", items: methods.map((m) => ({ id: m.id, label: m.label })) },
      { type: "Dataset", items: datasets.map((d) => ({ id: d.id, label: d.label })) },
    ];
  }
}
