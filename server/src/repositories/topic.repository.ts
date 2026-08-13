import { executeQuery, neo4jNodeToGraphNode, neo4jRelToGraphEdge } from "../database/neo4j.js";
import { topicQueries } from "../queries/topic.queries.js";
import { mockStore } from "../database/mockStore.js";
import { config } from "../config/env.js";
import type { GraphNode, GraphData } from "../types/graph.types.js";

export class TopicRepository {
  async findAll(): Promise<GraphNode[]> {
    if (config.isMock) {
      return this.mockFindAll();
    }
    try {
      const records = await executeQuery(topicQueries.getAllTopics);
      if (records.length === 0) return this.mockFindAll();
      return records.map((rec) => {
        const node = neo4jNodeToGraphNode(rec.get("t"));
        const paperCount = rec.get("paperCount");
        return {
          ...node,
          properties: {
            ...node.properties,
            paperCount: paperCount.toNumber?.() ?? Number(paperCount || 0),
          },
        };
      });
    } catch {
      return this.mockFindAll();
    }
  }

  private mockFindAll(): GraphNode[] {
    const topics = mockStore.getNodesByType("Topic");
    return topics
      .map((t) => {
        const paperCount = mockStore.getConnectedNodes(t.id, "ABOUT", "incoming").length;
        return {
          ...t,
          properties: {
            ...t.properties,
            paperCount,
          },
        };
      })
      .sort((a, b) => Number(b.properties.paperCount || 0) - Number(a.properties.paperCount || 0));
  }

  async findById(id: string): Promise<GraphNode | null> {
    if (config.isMock) {
      return mockStore.getNode(id);
    }
    try {
      const records = await executeQuery(topicQueries.getTopicById, { topicId: id });
      if (records.length === 0) return mockStore.getNode(id);
      return neo4jNodeToGraphNode(records[0].get("t"));
    } catch {
      return mockStore.getNode(id);
    }
  }

  async getPapers(topicId: string): Promise<GraphNode[]> {
    if (config.isMock) {
      return mockStore.getConnectedNodes(topicId, "ABOUT", "incoming");
    }
    try {
      const records = await executeQuery(topicQueries.getTopicPapers, { topicId });
      return records.map((rec) => neo4jNodeToGraphNode(rec.get("p")));
    } catch {
      return mockStore.getConnectedNodes(topicId, "ABOUT", "incoming");
    }
  }

  async getResearchers(topicId: string): Promise<GraphNode[]> {
    const papers = await this.getPapers(topicId);
    const researchers = new Map<string, GraphNode>();
    for (const p of papers) {
      const pAuthors = mockStore.getConnectedNodes(p.id, "AUTHORED", "incoming");
      pAuthors.forEach((r) => researchers.set(r.id, r));
    }
    return Array.from(researchers.values());
  }

  async getMethods(topicId: string): Promise<GraphNode[]> {
    const papers = await this.getPapers(topicId);
    const methods = new Map<string, GraphNode>();
    for (const p of papers) {
      const pMethods = mockStore.getConnectedNodes(p.id, "USES_METHOD", "outgoing");
      pMethods.forEach((m) => methods.set(m.id, m));
    }
    return Array.from(methods.values());
  }

  async getDatasets(topicId: string): Promise<GraphNode[]> {
    const papers = await this.getPapers(topicId);
    const datasets = new Map<string, GraphNode>();
    for (const p of papers) {
      const pDatasets = mockStore.getConnectedNodes(p.id, "USES_DATASET", "outgoing");
      pDatasets.forEach((d) => datasets.set(d.id, d));
    }
    return Array.from(datasets.values());
  }

  async getRelatedTopics(topicId: string): Promise<GraphNode[]> {
    if (config.isMock) {
      return mockStore.getConnectedNodes(topicId, "RELATED_TO", "bidirectional");
    }
    try {
      const records = await executeQuery(topicQueries.getRelatedTopics, { topicId });
      return records.map((rec) => neo4jNodeToGraphNode(rec.get("other")));
    } catch {
      return mockStore.getConnectedNodes(topicId, "RELATED_TO", "bidirectional");
    }
  }

  async getTopicGraph(topicId: string): Promise<GraphData> {
    if (config.isMock) {
      return mockStore.getNeighborhood(topicId, 2);
    }
    try {
      const records = await executeQuery(topicQueries.getTopicSubGraph, { topicId });
      if (records.length === 0) return mockStore.getNeighborhood(topicId, 2);

      const nodesRaw = records[0].get("nodes") || [];
      const edgesRaw = records[0].get("edges") || [];

      return {
        nodes: nodesRaw.map((n: any) => neo4jNodeToGraphNode(n)),
        edges: edgesRaw.map((r: any) => neo4jRelToGraphEdge(r)),
      };
    } catch {
      return mockStore.getNeighborhood(topicId, 2);
    }
  }
}
