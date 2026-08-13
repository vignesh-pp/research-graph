import { executeQuery, neo4jNodeToGraphNode, neo4jRelToGraphEdge } from "../database/neo4j.js";
import { graphQueries } from "../queries/graph.queries.js";
import { mockStore } from "../database/mockStore.js";
import { config } from "../config/env.js";
import type { GraphNode, GraphData, GraphPath, DashboardStats } from "../types/graph.types.js";

export class GraphRepository {
  async getDashboardStats(): Promise<DashboardStats> {
    if (config.isMock) {
      return mockStore.getDashboardStats();
    }
    try {
      const records = await executeQuery(graphQueries.getDashboardStats);
      if (records.length === 0) return mockStore.getDashboardStats();
      const r = records[0];
      const parse = (val: any) => (val?.toNumber ? val.toNumber() : Number(val || 0));

      return {
        papers: parse(r.get("papers")),
        researchers: parse(r.get("researchers")),
        topics: parse(r.get("topics")),
        institutions: parse(r.get("institutions")),
        methods: parse(r.get("methods")),
        datasets: parse(r.get("datasets")),
        citations: parse(r.get("citations")),
        collaborations: parse(r.get("collaborations")),
      };
    } catch {
      return mockStore.getDashboardStats();
    }
  }

  async getMostConnectedResearchers(limit: number = 6): Promise<any[]> {
    if (config.isMock) {
      return this.mockMostConnected(limit);
    }
    try {
      const records = await executeQuery(graphQueries.getMostConnectedResearchers, { limit });
      return records.map((rec) => {
        const parse = (val: any) => (val?.toNumber ? val.toNumber() : Number(val || 0));
        return {
          id: rec.get("id"),
          name: rec.get("name"),
          institution: rec.get("institution"),
          papers: parse(rec.get("papers")),
          collaborators: parse(rec.get("collaborators")),
        };
      });
    } catch {
      return this.mockMostConnected(limit);
    }
  }

  private mockMostConnected(limit: number): any[] {
    const researchers = mockStore.getNodesByType("Researcher");
    return researchers
      .map((r) => {
        const inst = mockStore.getConnectedNodes(r.id, "AFFILIATED_WITH", "outgoing")[0];
        const papers = mockStore.getConnectedNodes(r.id, "AUTHORED", "outgoing").length;
        const collaborators = mockStore.getConnectedNodes(r.id, "COLLABORATED_WITH", "bidirectional").length;
        return {
          id: r.id,
          name: r.label,
          institution: inst?.label || "Independent",
          papers,
          collaborators,
        };
      })
      .sort((a, b) => b.papers + b.collaborators - (a.papers + a.collaborators))
      .slice(0, limit);
  }

  async getMostCitedPapers(limit: number = 6): Promise<any[]> {
    if (config.isMock) {
      return this.mockMostCited(limit);
    }
    try {
      const records = await executeQuery(graphQueries.getMostCitedPapers, { limit });
      return records.map((rec) => {
        const parse = (val: any) => (val?.toNumber ? val.toNumber() : Number(val || 0));
        return {
          id: rec.get("id"),
          title: rec.get("title"),
          year: parse(rec.get("year")),
          citations: parse(rec.get("citations")),
        };
      });
    } catch {
      return this.mockMostCited(limit);
    }
  }

  private mockMostCited(limit: number): any[] {
    const papers = mockStore.getNodesByType("Paper");
    return papers
      .map((p) => {
        const citations = mockStore.getConnectedNodes(p.id, "CITES", "incoming").length;
        const year = (p.properties as { publicationYear: number }).publicationYear || 2023;
        return {
          id: p.id,
          title: p.label,
          year,
          citations,
        };
      })
      .sort((a, b) => b.citations - a.citations)
      .slice(0, limit);
  }

  async getActivityByYear(): Promise<{ year: number; count: number }[]> {
    const papers = mockStore.getNodesByType("Paper");
    const counts = new Map<number, number>();
    papers.forEach((p) => {
      const year = (p.properties as { publicationYear: number }).publicationYear || 2023;
      counts.set(year, (counts.get(year) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, count]) => ({ year, count }));
  }

  async getNeighborhood(nodeId: string, depth: number = 1): Promise<GraphData> {
    if (config.isMock) {
      return mockStore.getNeighborhood(nodeId, depth);
    }
    try {
      const safeDepth = Math.min(Math.max(depth, 1), 3);
      const records = await executeQuery(graphQueries.getNeighborhood, { nodeId, depth: safeDepth });
      if (records.length === 0) return mockStore.getNeighborhood(nodeId, depth);

      const nodesRaw = records[0].get("nodes") || [];
      const edgesRaw = records[0].get("edges") || [];

      return {
        nodes: nodesRaw.map((n: any) => neo4jNodeToGraphNode(n)),
        edges: edgesRaw.map((r: any) => neo4jRelToGraphEdge(r)),
      };
    } catch {
      return mockStore.getNeighborhood(nodeId, depth);
    }
  }

  async findShortestPath(startId: string, targetId: string): Promise<GraphPath | null> {
    if (config.isMock) {
      return mockStore.findShortestPath(startId, targetId);
    }
    try {
      const records = await executeQuery(graphQueries.findShortestPath, { startId, targetId });
      if (records.length === 0) return mockStore.findShortestPath(startId, targetId);

      const path = records[0].get("path");
      if (!path) return mockStore.findShortestPath(startId, targetId);

      const nodes = path.segments ? [path.start, ...path.segments.map((s: any) => s.end)] : [];
      const relationships = path.segments ? path.segments.map((s: any) => s.relationship) : [];

      const hops = nodes.map((n: any, idx: number) => {
        const node = neo4jNodeToGraphNode(n);
        const edge = relationships[idx] ? neo4jRelToGraphEdge(relationships[idx]) : undefined;
        return { node, edge };
      });

      return {
        hops,
        length: relationships.length,
      };
    } catch {
      return mockStore.findShortestPath(startId, targetId);
    }
  }

  async searchEntities(query: string, limit: number = 20): Promise<GraphNode[]> {
    if (config.isMock) {
      return mockStore.searchEntities(query, limit);
    }
    try {
      const records = await executeQuery(graphQueries.searchEntities, { query, limit });
      return records.map((rec) => neo4jNodeToGraphNode(rec.get("n")));
    } catch {
      return mockStore.searchEntities(query, limit);
    }
  }
}
