import { executeQuery, neo4jNodeToGraphNode } from "../database/neo4j.js";
import { datasetQueries } from "../queries/dataset.queries.js";
import { mockStore } from "../database/mockStore.js";
import { config } from "../config/env.js";
import type { GraphNode } from "../types/graph.types.js";

export class DatasetRepository {
  async findAll(): Promise<GraphNode[]> {
    if (config.isMock) {
      return this.mockFindAll();
    }
    try {
      const records = await executeQuery(datasetQueries.getAllDatasets);
      if (records.length === 0) return this.mockFindAll();
      return records.map((rec) => {
        const node = neo4jNodeToGraphNode(rec.get("d"));
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
    const datasets = mockStore.getNodesByType("Dataset");
    return datasets
      .map((d) => {
        const paperCount = mockStore.getConnectedNodes(d.id, "USES_DATASET", "incoming").length;
        return {
          ...d,
          properties: {
            ...d.properties,
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
      const records = await executeQuery(datasetQueries.getDatasetById, { datasetId: id });
      if (records.length === 0) return mockStore.getNode(id);
      return neo4jNodeToGraphNode(records[0].get("d"));
    } catch {
      return mockStore.getNode(id);
    }
  }

  async getPapers(datasetId: string): Promise<GraphNode[]> {
    if (config.isMock) {
      return mockStore.getConnectedNodes(datasetId, "USES_DATASET", "incoming");
    }
    try {
      const records = await executeQuery(datasetQueries.getPapersUsingDataset, { datasetId });
      return records.map((rec) => neo4jNodeToGraphNode(rec.get("p")));
    } catch {
      return mockStore.getConnectedNodes(datasetId, "USES_DATASET", "incoming");
    }
  }
}
