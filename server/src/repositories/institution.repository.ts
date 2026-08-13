import { executeQuery, neo4jNodeToGraphNode, neo4jRelToGraphEdge } from "../database/neo4j.js";
import { institutionQueries } from "../queries/institution.queries.js";
import { mockStore } from "../database/mockStore.js";
import { config } from "../config/env.js";
import type { GraphNode, GraphData } from "../types/graph.types.js";

export class InstitutionRepository {
  async findAll(): Promise<GraphNode[]> {
    if (config.isMock) {
      return this.mockFindAll();
    }
    try {
      const records = await executeQuery(institutionQueries.getAllInstitutions);
      if (records.length === 0) return this.mockFindAll();
      return records.map((rec) => {
        const node = neo4jNodeToGraphNode(rec.get("i"));
        const researcherCount = rec.get("researcherCount");
        return {
          ...node,
          properties: {
            ...node.properties,
            researcherCount: researcherCount.toNumber?.() ?? Number(researcherCount || 0),
          },
        };
      });
    } catch {
      return this.mockFindAll();
    }
  }

  private mockFindAll(): GraphNode[] {
    const insts = mockStore.getNodesByType("Institution");
    return insts
      .map((i) => {
        const researcherCount = mockStore.getConnectedNodes(i.id, "AFFILIATED_WITH", "incoming").length;
        return {
          ...i,
          properties: {
            ...i.properties,
            researcherCount,
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
      const records = await executeQuery(institutionQueries.getInstitutionById, { institutionId: id });
      if (records.length === 0) return mockStore.getNode(id);
      return neo4jNodeToGraphNode(records[0].get("i"));
    } catch {
      return mockStore.getNode(id);
    }
  }

  async getResearchers(institutionId: string): Promise<GraphNode[]> {
    if (config.isMock) {
      return mockStore.getConnectedNodes(institutionId, "AFFILIATED_WITH", "incoming");
    }
    try {
      const records = await executeQuery(institutionQueries.getAffiliatedResearchers, { institutionId });
      return records.map((rec) => neo4jNodeToGraphNode(rec.get("r")));
    } catch {
      return mockStore.getConnectedNodes(institutionId, "AFFILIATED_WITH", "incoming");
    }
  }

  async getPapers(institutionId: string): Promise<GraphNode[]> {
    const researchers = await this.getResearchers(institutionId);
    const papers = new Map<string, GraphNode>();
    for (const r of researchers) {
      const rPapers = mockStore.getConnectedNodes(r.id, "AUTHORED", "outgoing");
      rPapers.forEach((p) => papers.set(p.id, p));
    }
    return Array.from(papers.values());
  }

  async getCollaborations(institutionId: string): Promise<GraphData> {
    if (config.isMock) {
      return mockStore.getNeighborhood(institutionId, 2);
    }
    try {
      const records = await executeQuery(institutionQueries.getCrossInstitutionCollaborations, { institutionId });
      if (records.length === 0) return mockStore.getNeighborhood(institutionId, 2);

      const nodesMap = new Map<string, GraphNode>();
      const edges: any[] = [];

      records.forEach((rec) => {
        const i1 = neo4jNodeToGraphNode(rec.get("i1"));
        const r1 = neo4jNodeToGraphNode(rec.get("r1"));
        const r2 = neo4jNodeToGraphNode(rec.get("r2"));
        const i2 = neo4jNodeToGraphNode(rec.get("i2"));
        const rel = rec.get("c");

        nodesMap.set(i1.id, i1);
        nodesMap.set(r1.id, r1);
        nodesMap.set(r2.id, r2);
        nodesMap.set(i2.id, i2);

        edges.push({
          id: `rel-${r1.id}-${i1.id}`,
          source: r1.id,
          target: i1.id,
          type: "AFFILIATED_WITH",
        });
        edges.push({
          id: `rel-${r2.id}-${i2.id}`,
          source: r2.id,
          target: i2.id,
          type: "AFFILIATED_WITH",
        });
        edges.push(neo4jRelToGraphEdge(rel, r1.id, r2.id));
      });

      return {
        nodes: Array.from(nodesMap.values()),
        edges,
      };
    } catch {
      return mockStore.getNeighborhood(institutionId, 2);
    }
  }
}
