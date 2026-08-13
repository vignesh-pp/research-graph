import { executeQuery, neo4jNodeToGraphNode } from "../database/neo4j.js";
import { methodQueries } from "../queries/method.queries.js";
import { mockStore } from "../database/mockStore.js";
import { config } from "../config/env.js";
import type { GraphNode } from "../types/graph.types.js";

export class MethodRepository {
  async findAll(): Promise<GraphNode[]> {
    if (config.isMock) {
      return this.mockFindAll();
    }
    try {
      const records = await executeQuery(methodQueries.getAllMethods);
      if (records.length === 0) return this.mockFindAll();
      return records.map((rec) => {
        const node = neo4jNodeToGraphNode(rec.get("m"));
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
    const methods = mockStore.getNodesByType("Method");
    return methods
      .map((m) => {
        const paperCount = mockStore.getConnectedNodes(m.id, "USES_METHOD", "incoming").length;
        return {
          ...m,
          properties: {
            ...m.properties,
            paperCount,
          },
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  async findById(id: string): Promise<GraphNode | null> {
    if (config.isMock) {
      return mockStore.getNode(id);
    }
    try {
      const records = await executeQuery(methodQueries.getMethodById, { methodId: id });
      if (records.length === 0) return mockStore.getNode(id);
      return neo4jNodeToGraphNode(records[0].get("m"));
    } catch {
      return mockStore.getNode(id);
    }
  }

  async getPapers(methodId: string): Promise<GraphNode[]> {
    if (config.isMock) {
      return mockStore.getConnectedNodes(methodId, "USES_METHOD", "incoming");
    }
    try {
      const records = await executeQuery(methodQueries.getPapersUsingMethod, { methodId });
      return records.map((rec) => neo4jNodeToGraphNode(rec.get("p")));
    } catch {
      return mockStore.getConnectedNodes(methodId, "USES_METHOD", "incoming");
    }
  }
}
