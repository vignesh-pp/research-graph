import { executeQuery, neo4jNodeToGraphNode, neo4jRelToGraphEdge } from "../database/neo4j.js";
import { researcherQueries } from "../queries/researcher.queries.js";
import { mockStore } from "../database/mockStore.js";
import { config } from "../config/env.js";
import type { GraphNode, GraphData, PaginatedResult } from "../types/graph.types.js";

export class ResearcherRepository {
  async findById(id: string): Promise<GraphNode | null> {
    if (config.isMock) {
      return mockStore.getNode(id);
    }
    try {
      const records = await executeQuery(researcherQueries.getResearcherById, { researcherId: id });
      if (records.length === 0) return null;
      return neo4jNodeToGraphNode(records[0].get("r"));
    } catch {
      return mockStore.getNode(id);
    }
  }

  async findFiltered(params: {
    search?: string;
    institutionId?: string;
    topicId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResult<GraphNode>> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    if (config.isMock) {
      return this.mockFindFiltered(params, page, pageSize);
    }

    try {
      const queryParams = {
        search: params.search || null,
        institutionId: params.institutionId || null,
        topicId: params.topicId || null,
        skip,
        limit: pageSize,
      };

      const [itemsRecords, countRecords] = await Promise.all([
        executeQuery(researcherQueries.getResearchersFiltered, queryParams),
        executeQuery(researcherQueries.countResearchersFiltered, queryParams),
      ]);

      const items = itemsRecords.map((rec) => neo4jNodeToGraphNode(rec.get("r")));
      const total = countRecords[0] ? countRecords[0].get("total").toNumber?.() ?? Number(countRecords[0].get("total")) : items.length;

      return { items, total, page, pageSize };
    } catch {
      return this.mockFindFiltered(params, page, pageSize);
    }
  }

  private mockFindFiltered(params: any, page: number, pageSize: number): PaginatedResult<GraphNode> {
    let items = mockStore.getNodesByType("Researcher");
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter((r) => r.label.toLowerCase().includes(q) || ((r.properties as { researchInterest?: string }).researchInterest || "").toLowerCase().includes(q));
    }
    if (params.institutionId) {
      items = items.filter((r) =>
        mockStore.getConnectedNodes(r.id, "AFFILIATED_WITH", "outgoing").some((i) => i.id === params.institutionId)
      );
    }
    if (params.topicId) {
      items = items.filter((r) =>
        mockStore.getConnectedNodes(r.id, "AUTHORED", "outgoing").some((p) =>
          mockStore.getConnectedNodes(p.id, "ABOUT", "outgoing").some((t) => t.id === params.topicId)
        )
      );
    }
    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    };
  }

  async getAffiliatedInstitution(researcherId: string): Promise<GraphNode | null> {
    if (config.isMock) {
      return mockStore.getConnectedNodes(researcherId, "AFFILIATED_WITH", "outgoing")[0] || null;
    }
    try {
      const records = await executeQuery(researcherQueries.getAffiliatedInstitution, { researcherId });
      if (records.length === 0) return null;
      return neo4jNodeToGraphNode(records[0].get("i"));
    } catch {
      return mockStore.getConnectedNodes(researcherId, "AFFILIATED_WITH", "outgoing")[0] || null;
    }
  }

  async getAuthoredPapers(researcherId: string): Promise<GraphNode[]> {
    if (config.isMock) {
      return mockStore.getConnectedNodes(researcherId, "AUTHORED", "outgoing");
    }
    try {
      const records = await executeQuery(researcherQueries.getAuthoredPapers, { researcherId });
      return records.map((rec) => neo4jNodeToGraphNode(rec.get("p")));
    } catch {
      return mockStore.getConnectedNodes(researcherId, "AUTHORED", "outgoing");
    }
  }

  async getCollaborators(researcherId: string): Promise<GraphNode[]> {
    if (config.isMock) {
      return mockStore.getConnectedNodes(researcherId, "COLLABORATED_WITH", "bidirectional");
    }
    try {
      const records = await executeQuery(researcherQueries.getCollaborators, { researcherId });
      return records.map((rec) => neo4jNodeToGraphNode(rec.get("c")));
    } catch {
      return mockStore.getConnectedNodes(researcherId, "COLLABORATED_WITH", "bidirectional");
    }
  }

  async getCollaborationNetwork(researcherId: string): Promise<GraphData> {
    if (config.isMock) {
      return mockStore.getNeighborhood(researcherId, 2);
    }
    try {
      const records = await executeQuery(researcherQueries.getCollaborationNetwork, { researcherId });
      if (records.length === 0) return mockStore.getNeighborhood(researcherId, 2);

      const nodesRaw = records[0].get("nodes") || [];
      const edgesRaw = records[0].get("edges") || [];

      return {
        nodes: nodesRaw.map((n: any) => neo4jNodeToGraphNode(n)),
        edges: edgesRaw.map((r: any) => neo4jRelToGraphEdge(r)),
      };
    } catch {
      return mockStore.getNeighborhood(researcherId, 2);
    }
  }

  async getTopics(researcherId: string): Promise<GraphNode[]> {
    const papers = await this.getAuthoredPapers(researcherId);
    const topics = new Map<string, GraphNode>();
    for (const p of papers) {
      const pTopics = mockStore.getConnectedNodes(p.id, "ABOUT", "outgoing");
      pTopics.forEach((t) => topics.set(t.id, t));
    }
    return Array.from(topics.values());
  }

  async getMethods(researcherId: string): Promise<GraphNode[]> {
    const papers = await this.getAuthoredPapers(researcherId);
    const methods = new Map<string, GraphNode>();
    for (const p of papers) {
      const pMethods = mockStore.getConnectedNodes(p.id, "USES_METHOD", "outgoing");
      pMethods.forEach((m) => methods.set(m.id, m));
    }
    return Array.from(methods.values());
  }

  async getDatasets(researcherId: string): Promise<GraphNode[]> {
    const papers = await this.getAuthoredPapers(researcherId);
    const datasets = new Map<string, GraphNode>();
    for (const p of papers) {
      const pDatasets = mockStore.getConnectedNodes(p.id, "USES_DATASET", "outgoing");
      pDatasets.forEach((d) => datasets.set(d.id, d));
    }
    return Array.from(datasets.values());
  }

  async getProjects(researcherId: string): Promise<GraphNode[]> {
    return mockStore.getConnectedNodes(researcherId, "INVOLVES", "incoming");
  }
}
