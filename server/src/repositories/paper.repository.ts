import { executeQuery, neo4jNodeToGraphNode, neo4jRelToGraphEdge } from "../database/neo4j.js";
import { paperQueries } from "../queries/paper.queries.js";
import { mockStore } from "../database/mockStore.js";
import { config } from "../config/env.js";
import type { GraphNode, GraphData, RelatedPaper, PaginatedResult } from "../types/graph.types.js";

export class PaperRepository {
  async findById(id: string): Promise<GraphNode | null> {
    if (config.isMock) {
      return mockStore.getNode(id);
    }
    try {
      const records = await executeQuery(paperQueries.getPaperById, { paperId: id });
      if (records.length === 0) return null;
      return neo4jNodeToGraphNode(records[0].get("p"));
    } catch {
      return mockStore.getNode(id);
    }
  }

  async findFiltered(params: {
    search?: string;
    year?: number;
    topicId?: string;
    methodId?: string;
    datasetId?: string;
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
        year: params.year || null,
        topicId: params.topicId || null,
        methodId: params.methodId || null,
        datasetId: params.datasetId || null,
        skip,
        limit: pageSize,
      };

      const [itemsRecords, countRecords] = await Promise.all([
        executeQuery(paperQueries.getPapersFiltered, queryParams),
        executeQuery(paperQueries.countPapersFiltered, queryParams),
      ]);

      const items = itemsRecords.map((rec) => neo4jNodeToGraphNode(rec.get("p")));
      const total = countRecords[0] ? countRecords[0].get("total").toNumber?.() ?? Number(countRecords[0].get("total")) : items.length;

      return { items, total, page, pageSize };
    } catch {
      return this.mockFindFiltered(params, page, pageSize);
    }
  }

  private mockFindFiltered(params: any, page: number, pageSize: number): PaginatedResult<GraphNode> {
    let items = mockStore.getNodesByType("Paper");
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter((p) => p.label.toLowerCase().includes(q));
    }
    if (params.year) {
      items = items.filter(
        (p) => (p.properties as { publicationYear: number }).publicationYear === params.year
      );
    }
    if (params.topicId) {
      items = items.filter((p) =>
        mockStore.getConnectedNodes(p.id, "ABOUT", "outgoing").some((t) => t.id === params.topicId)
      );
    }
    if (params.methodId) {
      items = items.filter((p) =>
        mockStore.getConnectedNodes(p.id, "USES_METHOD", "outgoing").some((m) => m.id === params.methodId)
      );
    }
    if (params.datasetId) {
      items = items.filter((p) =>
        mockStore.getConnectedNodes(p.id, "USES_DATASET", "outgoing").some((d) => d.id === params.datasetId)
      );
    }
    items.sort((a, b) => ((b.properties as { publicationYear: number }).publicationYear || 0) - ((a.properties as { publicationYear: number }).publicationYear || 0));
    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    };
  }

  async getAuthors(paperId: string): Promise<GraphNode[]> {
    if (config.isMock) {
      return mockStore.getConnectedNodes(paperId, "AUTHORED", "incoming");
    }
    try {
      const records = await executeQuery(paperQueries.getAuthors, { paperId });
      return records.map((rec) => neo4jNodeToGraphNode(rec.get("r")));
    } catch {
      return mockStore.getConnectedNodes(paperId, "AUTHORED", "incoming");
    }
  }

  async getTopics(paperId: string): Promise<GraphNode[]> {
    if (config.isMock) {
      return mockStore.getConnectedNodes(paperId, "ABOUT", "outgoing");
    }
    try {
      const records = await executeQuery(paperQueries.getTopics, { paperId });
      return records.map((rec) => neo4jNodeToGraphNode(rec.get("t")));
    } catch {
      return mockStore.getConnectedNodes(paperId, "ABOUT", "outgoing");
    }
  }

  async getMethods(paperId: string): Promise<GraphNode[]> {
    if (config.isMock) {
      return mockStore.getConnectedNodes(paperId, "USES_METHOD", "outgoing");
    }
    try {
      const records = await executeQuery(paperQueries.getMethods, { paperId });
      return records.map((rec) => neo4jNodeToGraphNode(rec.get("m")));
    } catch {
      return mockStore.getConnectedNodes(paperId, "USES_METHOD", "outgoing");
    }
  }

  async getDatasets(paperId: string): Promise<GraphNode[]> {
    if (config.isMock) {
      return mockStore.getConnectedNodes(paperId, "USES_DATASET", "outgoing");
    }
    try {
      const records = await executeQuery(paperQueries.getDatasets, { paperId });
      return records.map((rec) => neo4jNodeToGraphNode(rec.get("d")));
    } catch {
      return mockStore.getConnectedNodes(paperId, "USES_DATASET", "outgoing");
    }
  }

  async getCitations(paperId: string): Promise<{ cites: GraphNode[]; citedBy: GraphNode[] }> {
    if (config.isMock) {
      return {
        cites: mockStore.getConnectedNodes(paperId, "CITES", "outgoing"),
        citedBy: mockStore.getConnectedNodes(paperId, "CITES", "incoming"),
      };
    }
    try {
      const records = await executeQuery(paperQueries.getCitations, { paperId });
      if (records.length === 0) return { cites: [], citedBy: [] };

      const citesRaw = records[0].get("cites") || [];
      const citedByRaw = records[0].get("citedBy") || [];

      return {
        cites: citesRaw.map((n: any) => neo4jNodeToGraphNode(n)),
        citedBy: citedByRaw.map((n: any) => neo4jNodeToGraphNode(n)),
      };
    } catch {
      return {
        cites: mockStore.getConnectedNodes(paperId, "CITES", "outgoing"),
        citedBy: mockStore.getConnectedNodes(paperId, "CITES", "incoming"),
      };
    }
  }

  async getLineage(paperId: string, maxDepth: number = 3): Promise<GraphData> {
    if (config.isMock) {
      return mockStore.getNeighborhood(paperId, maxDepth);
    }
    try {
      const records = await executeQuery(paperQueries.getCitationLineage, { paperId });
      if (records.length === 0) return mockStore.getNeighborhood(paperId, maxDepth);

      const nodesRaw = records[0].get("nodes") || [];
      const edgesRaw = records[0].get("edges") || [];

      const nodes = nodesRaw.map((n: any) => neo4jNodeToGraphNode(n));
      const edges = edgesRaw.map((r: any) => neo4jRelToGraphEdge(r));

      return { nodes, edges };
    } catch {
      return mockStore.getNeighborhood(paperId, maxDepth);
    }
  }

  async getRelatedPapers(paperId: string, limit: number = 6): Promise<RelatedPaper[]> {
    if (config.isMock) {
      return this.mockGetRelatedPapers(paperId, limit);
    }
    try {
      const records = await executeQuery(paperQueries.getRelatedPapers, { paperId, limit });
      return records.map((rec) => {
        const paper = neo4jNodeToGraphNode(rec.get("other"));
        const sharedTopics: string[] = rec.get("sharedTopics") || [];
        const sharedMethods: string[] = rec.get("sharedMethods") || [];
        const sharedDatasets: string[] = rec.get("sharedDatasets") || [];

        const reasons: string[] = [];
        if (sharedTopics.length > 0) {
          reasons.push(`Shares ${sharedTopics.length} topic${sharedTopics.length > 1 ? "s" : ""} (${sharedTopics.slice(0, 2).join(", ")})`);
        }
        if (sharedMethods.length > 0) {
          reasons.push(`Uses method${sharedMethods.length > 1 ? "s" : ""}: ${sharedMethods.join(", ")}`);
        }
        if (sharedDatasets.length > 0) {
          reasons.push(`Evaluated on dataset${sharedDatasets.length > 1 ? "s" : ""}: ${sharedDatasets.join(", ")}`);
        }

        return {
          paper,
          reasons: reasons.length > 0 ? reasons : ["Connected in research domain network"],
          sharedCount: sharedTopics.length + sharedMethods.length + sharedDatasets.length,
        };
      });
    } catch {
      return this.mockGetRelatedPapers(paperId, limit);
    }
  }

  private mockGetRelatedPapers(paperId: string, limit: number): RelatedPaper[] {
    const allPapers = mockStore.getNodesByType("Paper").filter((p) => p.id !== paperId);
    const myTopics = new Set(mockStore.getConnectedNodes(paperId, "ABOUT", "outgoing").map((t) => t.id));
    const myMethods = new Set(mockStore.getConnectedNodes(paperId, "USES_METHOD", "outgoing").map((m) => m.id));
    const myDatasets = new Set(mockStore.getConnectedNodes(paperId, "USES_DATASET", "outgoing").map((d) => d.id));

    const scored: RelatedPaper[] = [];
    for (const other of allPapers) {
      const oTopics = mockStore.getConnectedNodes(other.id, "ABOUT", "outgoing");
      const oMethods = mockStore.getConnectedNodes(other.id, "USES_METHOD", "outgoing");
      const oDatasets = mockStore.getConnectedNodes(other.id, "USES_DATASET", "outgoing");

      const sharedT = oTopics.filter((t) => myTopics.has(t.id));
      const sharedM = oMethods.filter((m) => myMethods.has(m.id));
      const sharedD = oDatasets.filter((d) => myDatasets.has(d.id));

      const reasons: string[] = [];
      if (sharedT.length > 0) reasons.push(`Shares ${sharedT.length} topic${sharedT.length > 1 ? "s" : ""} (${sharedT.map((t) => t.label).join(", ")})`);
      if (sharedM.length > 0) reasons.push(`Uses method: ${sharedM.map((m) => m.label).join(", ")}`);
      if (sharedD.length > 0) reasons.push(`Evaluated on: ${sharedD.map((d) => d.label).join(", ")}`);

      const count = sharedT.length * 3 + sharedM.length * 2 + sharedD.length * 2;
      if (count > 0) {
        scored.push({
          paper: other,
          reasons: reasons.length > 0 ? reasons : ["Shares connected research domain"],
          sharedCount: count,
        });
      }
    }
    scored.sort((a, b) => b.sharedCount - a.sharedCount);
    return scored.slice(0, limit);
  }
}
