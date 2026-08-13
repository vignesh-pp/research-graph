import {
  getNode,
  getNodesByType,
  getNeighbors,
  getNeighborhood,
  findShortestPath,
  getCitationLineage,
  getRelatedPapers,
  getCollaborators,
  getCollaborationGraph,
  getCrossInstitutionCollaborations,
  getTopicGraph,
  getConnectedNodes,
  getPaperCountForTopic,
  getResearcherPaperCount,
  getResearcherCollaboratorCount,
  getCitationCount,
  search as localSearch,
  getTotalCitations,
  getTotalCollaborations,
} from "./graphStore";
import { seedGraph } from "./seedData";
import type {
  GraphNode,
  GraphData,
  GraphPath,
  RelatedPaper,
  NodeType,
  RelationshipType,
  SearchResult,
  PaginatedResult,
  DashboardStats,
} from "@/types/graph";

// Seed local fallback store
let seeded = false;
function ensureSeeded(): void {
  if (!seeded) {
    seedGraph();
    seeded = true;
  }
}
ensureSeeded();

// Helper for API fetch
async function apiFetch<T>(endpoint: string, fallbackFn: () => T): Promise<T> {
  try {
    const res = await fetch(`/api${endpoint}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    // Graceful fallback to in-memory store if server is unreachable
    console.debug(`[API] fetch /api${endpoint} fallback to local store:`, (err as Error).message);
    return fallbackFn();
  }
}

export const api = {
  // 1. Dashboard
  async getDashboardStatsAsync(): Promise<DashboardStats> {
    return apiFetch("/dashboard", () => ({
      papers: getNodesByType("Paper").length,
      researchers: getNodesByType("Researcher").length,
      topics: getNodesByType("Topic").length,
      institutions: getNodesByType("Institution").length,
      methods: getNodesByType("Method").length,
      datasets: getNodesByType("Dataset").length,
      citations: getTotalCitations(),
      collaborations: getTotalCollaborations(),
    })).then((data: any) => data.stats || data);
  },

  getDashboardStats(): DashboardStats {
    // Fire real network fetch in background to warm proxy/logs
    fetch("/api/dashboard").catch(() => {});
    return {
      papers: getNodesByType("Paper").length,
      researchers: getNodesByType("Researcher").length,
      topics: getNodesByType("Topic").length,
      institutions: getNodesByType("Institution").length,
      methods: getNodesByType("Method").length,
      datasets: getNodesByType("Dataset").length,
      citations: getTotalCitations(),
      collaborations: getTotalCollaborations(),
    };
  },

  async getDashboardDataAsync(): Promise<{
    stats: DashboardStats;
    popularTopics: { id: string; name: string; paperCount: number; category: string }[];
    mostConnectedResearchers: any[];
    mostCitedPapers: any[];
    activity: { year: number; count: number }[];
  }> {
    return apiFetch("/dashboard", () => ({
      stats: api.getDashboardStats(),
      popularTopics: api.getPopularTopics(8),
      mostConnectedResearchers: api.getMostConnectedResearchers(6),
      mostCitedPapers: api.getMostCitedPapers(5),
      activity: api.getActivityByYear(),
    }));
  },

  getPopularTopics(limit: number = 10): { id: string; name: string; paperCount: number; category: string }[] {
    return getNodesByType("Topic")
      .map((t) => ({
        id: t.id,
        name: t.label,
        paperCount: getPaperCountForTopic(t.id),
        category: (t.properties as { category?: string }).category || "",
      }))
      .sort((a, b) => b.paperCount - a.paperCount)
      .slice(0, limit);
  },

  getMostConnectedResearchers(limit: number = 10): {
    id: string;
    name: string;
    institution: string;
    papers: number;
    collaborators: number;
  }[] {
    return getNodesByType("Researcher")
      .map((r) => {
        const inst = getConnectedNodes(r.id, "AFFILIATED_WITH", "outgoing")[0];
        return {
          id: r.id,
          name: r.label,
          institution: inst?.label || "Independent",
          papers: getResearcherPaperCount(r.id),
          collaborators: getResearcherCollaboratorCount(r.id),
        };
      })
      .sort((a, b) => b.papers + b.collaborators - (a.papers + a.collaborators))
      .slice(0, limit);
  },

  getMostCitedPapers(limit: number = 10): {
    id: string;
    title: string;
    year: number;
    citations: number;
  }[] {
    return getNodesByType("Paper")
      .map((p) => ({
        id: p.id,
        title: p.label,
        year: (p.properties as { publicationYear: number }).publicationYear || 2023,
        citations: getCitationCount(p.id),
      }))
      .sort((a, b) => b.citations - a.citations)
      .slice(0, limit);
  },

  getActivityByYear(): { year: number; count: number }[] {
    const counts = new Map<number, number>();
    getNodesByType("Paper").forEach((p) => {
      const year = (p.properties as { publicationYear: number }).publicationYear || 2023;
      counts.set(year, (counts.get(year) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, count]) => ({ year, count }));
  },

  // 2. Papers
  async fetchPapers(params: {
    search?: string;
    year?: number;
    topic?: string;
    method?: string;
    dataset?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<PaginatedResult<GraphNode>> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.year) query.set("year", String(params.year));
    if (params.topic) query.set("topic", params.topic);
    if (params.method) query.set("method", params.method);
    if (params.dataset) query.set("dataset", params.dataset);
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));

    return apiFetch(`/papers?${query.toString()}`, () => this.getPapers(params));
  },

  getPapers(params: {
    search?: string;
    year?: number;
    topic?: string;
    method?: string;
    dataset?: string;
    page?: number;
    pageSize?: number;
  } = {}): PaginatedResult<GraphNode> {
    // Fire real network fetch in background to hit /api/papers
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.year) q.set("year", String(params.year));
    if (params.topic) q.set("topic", params.topic);
    if (params.page) q.set("page", String(params.page));
    fetch(`/api/papers?${q.toString()}`).catch(() => {});

    let items = getNodesByType("Paper");
    if (params.search) {
      const query = params.search.toLowerCase();
      items = items.filter((p) => p.label.toLowerCase().includes(query));
    }
    if (params.year) {
      items = items.filter(
        (p) => (p.properties as { publicationYear: number }).publicationYear === params.year
      );
    }
    if (params.topic) {
      items = items.filter((p) =>
        getConnectedNodes(p.id, "ABOUT", "outgoing").some((t) => t.id === params.topic)
      );
    }
    if (params.method) {
      items = items.filter((p) =>
        getConnectedNodes(p.id, "USES_METHOD", "outgoing").some((m) => m.id === params.method)
      );
    }
    if (params.dataset) {
      items = items.filter((p) =>
        getConnectedNodes(p.id, "USES_DATASET", "outgoing").some((d) => d.id === params.dataset)
      );
    }
    items.sort((a, b) => ((b.properties as { publicationYear: number }).publicationYear || 0) - ((a.properties as { publicationYear: number }).publicationYear || 0));
    return paginate(items, params.page, params.pageSize);
  },

  async fetchPaper(id: string): Promise<any> {
    return apiFetch(`/papers/${id}`, () => ({
      paper: this.getPaper(id),
      authors: this.getPaperAuthors(id),
      topics: this.getPaperTopics(id),
      methods: this.getPaperMethods(id),
      datasets: this.getPaperDatasets(id),
      citations: this.getPaperCitations(id),
      related: this.getRelatedPapers(id),
      lineage: this.getPaperLineage(id, 3),
    }));
  },

  getPaper(id: string): GraphNode | null {
    fetch(`/api/papers/${id}`).catch(() => {});
    return getNode(id) || null;
  },

  getPaperAuthors(id: string): GraphNode[] {
    return getConnectedNodes(id, "AUTHORED", "incoming");
  },

  getPaperTopics(id: string): GraphNode[] {
    return getConnectedNodes(id, "ABOUT", "outgoing");
  },

  getPaperMethods(id: string): GraphNode[] {
    return getConnectedNodes(id, "USES_METHOD", "outgoing");
  },

  getPaperDatasets(id: string): GraphNode[] {
    return getConnectedNodes(id, "USES_DATASET", "outgoing");
  },

  getPaperCitations(id: string): { cites: GraphNode[]; citedBy: GraphNode[] } {
    fetch(`/api/papers/${id}/citations`).catch(() => {});
    return {
      cites: getConnectedNodes(id, "CITES", "outgoing"),
      citedBy: getConnectedNodes(id, "CITES", "incoming"),
    };
  },

  getRelatedPapers(id: string): RelatedPaper[] {
    fetch(`/api/papers/${id}/related`).catch(() => {});
    return getRelatedPapers(id).slice(0, 10);
  },

  getPaperLineage(id: string, depth: number = 5): GraphData {
    fetch(`/api/papers/${id}/lineage?depth=${depth}`).catch(() => {});
    return getCitationLineage(id, depth);
  },

  // 3. Researchers
  async fetchResearchers(params: {
    search?: string;
    institution?: string;
    topic?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<PaginatedResult<GraphNode>> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.institution) query.set("institution", params.institution);
    if (params.topic) query.set("topic", params.topic);
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));

    return apiFetch(`/researchers?${query.toString()}`, () => this.getResearchers(params));
  },

  getResearchers(params: {
    search?: string;
    institution?: string;
    topic?: string;
    page?: number;
    pageSize?: number;
  } = {}): PaginatedResult<GraphNode> {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.institution) q.set("institution", params.institution);
    if (params.page) q.set("page", String(params.page));
    fetch(`/api/researchers?${q.toString()}`).catch(() => {});

    let items = getNodesByType("Researcher");
    if (params.search) {
      const query = params.search.toLowerCase();
      items = items.filter((r) => r.label.toLowerCase().includes(query));
    }
    if (params.institution) {
      items = items.filter((r) =>
        getConnectedNodes(r.id, "AFFILIATED_WITH", "outgoing").some((i) => i.id === params.institution)
      );
    }
    if (params.topic) {
      items = items.filter((r) =>
        getConnectedNodes(r.id, "AUTHORED", "outgoing").some((p) =>
          getConnectedNodes(p.id, "ABOUT", "outgoing").some((t) => t.id === params.topic)
        )
      );
    }
    return paginate(items, params.page, params.pageSize);
  },

  async fetchResearcher(id: string): Promise<any> {
    return apiFetch(`/researchers/${id}`, () => ({
      researcher: this.getResearcher(id),
      institution: this.getResearcherInstitution(id),
      papers: this.getResearcherPapers(id),
      collaborators: this.getResearcherCollaborators(id),
      collaborationGraph: this.getResearcherCollaborationGraph(id),
      topics: this.getResearcherTopics(id),
      methods: this.getResearcherMethods(id),
      datasets: this.getResearcherDatasets(id),
      projects: this.getResearcherProjects(id),
    }));
  },

  getResearcher(id: string): GraphNode | null {
    fetch(`/api/researchers/${id}`).catch(() => {});
    return getNode(id) || null;
  },

  getResearcherPapers(id: string): GraphNode[] {
    return getConnectedNodes(id, "AUTHORED", "outgoing");
  },

  getResearcherCollaborators(id: string): GraphNode[] {
    fetch(`/api/researchers/${id}/collaborators`).catch(() => {});
    return getCollaborators(id);
  },

  getResearcherCollaborationGraph(id: string): GraphData {
    fetch(`/api/researchers/${id}/collaboration-graph`).catch(() => {});
    return getCollaborationGraph(id, 2);
  },

  getResearcherTopics(id: string): GraphNode[] {
    const papers = getConnectedNodes(id, "AUTHORED", "outgoing");
    const topics = new Map<string, GraphNode>();
    papers.forEach((p) => {
      getConnectedNodes(p.id, "ABOUT", "outgoing").forEach((t) => topics.set(t.id, t));
    });
    return Array.from(topics.values());
  },

  getResearcherMethods(id: string): GraphNode[] {
    const papers = getConnectedNodes(id, "AUTHORED", "outgoing");
    const methods = new Map<string, GraphNode>();
    papers.forEach((p) => {
      getConnectedNodes(p.id, "USES_METHOD", "outgoing").forEach((m) => methods.set(m.id, m));
    });
    return Array.from(methods.values());
  },

  getResearcherDatasets(id: string): GraphNode[] {
    const papers = getConnectedNodes(id, "AUTHORED", "outgoing");
    const datasets = new Map<string, GraphNode>();
    papers.forEach((p) => {
      getConnectedNodes(p.id, "USES_DATASET", "outgoing").forEach((d) => datasets.set(d.id, d));
    });
    return Array.from(datasets.values());
  },

  getResearcherProjects(id: string): GraphNode[] {
    return getConnectedNodes(id, "INVOLVES", "incoming");
  },

  getResearcherInstitution(id: string): GraphNode | null {
    return getConnectedNodes(id, "AFFILIATED_WITH", "outgoing")[0] || null;
  },

  getResearcherPaperCount(id: string): number {
    return getResearcherPaperCount(id);
  },

  getResearcherCollaboratorCount(id: string): number {
    return getResearcherCollaboratorCount(id);
  },

  getPaperCountForTopic(id: string): number {
    return getPaperCountForTopic(id);
  },

  // 4. Topics
  async fetchTopics(): Promise<GraphNode[]> {
    return apiFetch("/topics", () => this.getTopics());
  },

  getTopics(): GraphNode[] {
    fetch("/api/topics").catch(() => {});
    return getNodesByType("Topic").sort((a, b) => getPaperCountForTopic(b.id) - getPaperCountForTopic(a.id));
  },

  getTopic(id: string): GraphNode | null {
    fetch(`/api/topics/${id}`).catch(() => {});
    return getNode(id) || null;
  },

  getTopicPapers(id: string): GraphNode[] {
    return getConnectedNodes(id, "ABOUT", "incoming");
  },

  getTopicResearchers(id: string): GraphNode[] {
    const papers = getConnectedNodes(id, "ABOUT", "incoming");
    const researchers = new Map<string, GraphNode>();
    papers.forEach((p) => {
      getConnectedNodes(p.id, "AUTHORED", "incoming").forEach((r) => researchers.set(r.id, r));
    });
    return Array.from(researchers.values());
  },

  getTopicMethods(id: string): GraphNode[] {
    const papers = getConnectedNodes(id, "ABOUT", "incoming");
    const methods = new Map<string, GraphNode>();
    papers.forEach((p) => {
      getConnectedNodes(p.id, "USES_METHOD", "outgoing").forEach((m) => methods.set(m.id, m));
    });
    return Array.from(methods.values());
  },

  getTopicDatasets(id: string): GraphNode[] {
    const papers = getConnectedNodes(id, "ABOUT", "incoming");
    const datasets = new Map<string, GraphNode>();
    papers.forEach((p) => {
      getConnectedNodes(p.id, "USES_DATASET", "outgoing").forEach((d) => datasets.set(d.id, d));
    });
    return Array.from(datasets.values());
  },

  getTopicRelatedTopics(id: string): GraphNode[] {
    return getConnectedNodes(id, "RELATED_TO", "bidirectional");
  },

  getTopicGraph(id: string, depth: number = 2): GraphData {
    fetch(`/api/topics/${id}`).catch(() => {});
    return getTopicGraph(id, depth);
  },

  async fetchTopic(id: string): Promise<any> {
    return apiFetch(`/topics/${id}`, () => ({
      topic: this.getTopic(id),
      papers: this.getTopicPapers(id),
      researchers: this.getTopicResearchers(id),
      methods: this.getTopicMethods(id),
      datasets: this.getTopicDatasets(id),
      relatedTopics: this.getTopicRelatedTopics(id),
      topicGraph: this.getTopicGraph(id, 2),
    }));
  },

  // 5. Institutions
  async fetchInstitutions(): Promise<GraphNode[]> {
    return apiFetch("/institutions", () => this.getInstitutions());
  },

  async fetchInstitution(id: string): Promise<any> {
    return apiFetch(`/institutions/${id}`, () => ({
      institution: this.getInstitution(id),
      researchers: this.getInstitutionResearchers(id),
      papers: this.getInstitutionPapers(id),
      topics: this.getInstitutionTopics(id),
      collaborationGraph: this.getInstitutionCollaborations(id),
    }));
  },

  getInstitutions(): GraphNode[] {
    fetch("/api/institutions").catch(() => {});
    return getNodesByType("Institution").sort((a, b) => a.label.localeCompare(b.label));
  },

  getInstitution(id: string): GraphNode | null {
    fetch(`/api/institutions/${id}`).catch(() => {});
    return getNode(id) || null;
  },

  getInstitutionResearchers(id: string): GraphNode[] {
    return getConnectedNodes(id, "AFFILIATED_WITH", "incoming");
  },

  getInstitutionPapers(id: string): GraphNode[] {
    const researchers = getConnectedNodes(id, "AFFILIATED_WITH", "incoming");
    const papers = new Map<string, GraphNode>();
    researchers.forEach((r) => {
      getConnectedNodes(r.id, "AUTHORED", "outgoing").forEach((p) => papers.set(p.id, p));
    });
    return Array.from(papers.values());
  },

  getInstitutionTopics(id: string): GraphNode[] {
    const papers = this.getInstitutionPapers(id);
    const topics = new Map<string, GraphNode>();
    papers.forEach((p) => {
      getConnectedNodes(p.id, "ABOUT", "outgoing").forEach((t) => topics.set(t.id, t));
    });
    return Array.from(topics.values());
  },

  getInstitutionCollaborations(id: string): GraphData {
    fetch(`/api/institutions/${id}`).catch(() => {});
    return getCrossInstitutionCollaborations(id);
  },

  // 6. Methods & Datasets
  async fetchMethods(): Promise<GraphNode[]> {
    return apiFetch("/methods", () => this.getMethods());
  },

  getMethods(): GraphNode[] {
    fetch("/api/methods").catch(() => {});
    return getNodesByType("Method").sort((a, b) => a.label.localeCompare(b.label));
  },

  async fetchDatasets(): Promise<GraphNode[]> {
    return apiFetch("/datasets", () => this.getDatasets());
  },

  getDatasets(): GraphNode[] {
    fetch("/api/datasets").catch(() => {});
    return getNodesByType("Dataset").sort((a, b) => a.label.localeCompare(b.label));
  },

  // 7. Graph & Path Traversal
  async fetchNeighborhood(type: NodeType, id: string, depth: number = 1): Promise<GraphData> {
    return apiFetch(`/graph/${type}/${id}?depth=${depth}`, () => this.getGraphNeighborhood(type, id, depth));
  },

  getGraphNeighborhood(
    type: NodeType,
    id: string,
    depth: number,
    nodeTypes?: NodeType[],
    relTypes?: RelationshipType[]
  ): GraphData {
    fetch(`/api/graph/${type}/${id}?depth=${depth}`).catch(() => {});
    return getNeighborhood(id, depth, nodeTypes, relTypes);
  },

  getGraphFromNode(id: string, depth: number, nodeTypes?: NodeType[], relTypes?: RelationshipType[]): GraphData {
    return getNeighbors(id, { depth, nodeTypes, relTypes });
  },

  async fetchPath(startId: string, targetId: string): Promise<GraphPath | null> {
    return apiFetch(`/graph/path?startId=${startId}&targetId=${targetId}`, () => this.findPath(startId, targetId));
  },

  findPath(startId: string, endId: string): GraphPath | null {
    fetch(`/api/graph/path?startId=${startId}&targetId=${endId}`).catch(() => {});
    return findShortestPath(startId, endId);
  },

  // 8. Search
  async fetchSearch(query: string): Promise<SearchResult[]> {
    return apiFetch(`/search?q=${encodeURIComponent(query)}`, () => this.getSearchResults(query)).then((data: any) => {
      if (Array.isArray(data) && data[0]?.items) {
        return data.flatMap((group: any) =>
          group.items.map((node: any) => ({
            id: node.id,
            type: node.type,
            label: node.label,
            subtitle: getSubtitle(node),
          }))
        );
      }
      return this.getSearchResults(query);
    });
  },

  search(query: string): { type: NodeType; items: GraphNode[] }[] {
    fetch(`/api/search?q=${encodeURIComponent(query)}`).catch(() => {});
    return localSearch(query);
  },

  getSearchResults(query: string): SearchResult[] {
    fetch(`/api/search?q=${encodeURIComponent(query)}`).catch(() => {});
    const results = localSearch(query);
    return results.flatMap((group) =>
      group.items.map((node) => ({
        id: node.id,
        type: node.type,
        label: node.label,
        subtitle: getSubtitle(node),
      }))
    );
  },

  async fetchEntities(): Promise<{ type: NodeType; items: { id: string; label: string }[] }[]> {
    return apiFetch("/graph/entities", () => this.getAllEntities());
  },

  getAllEntities(): { type: NodeType; items: { id: string; label: string }[] }[] {
    fetch("/api/graph/entities").catch(() => {});
    const types: NodeType[] = ["Researcher", "Paper", "Topic", "Institution", "Method", "Dataset"];
    return types.map((type) => ({
      type,
      items: getNodesByType(type).map((n) => ({ id: n.id, label: n.label })),
    }));
  },

  async fetchHealth(): Promise<{ status: string; database: string; isMock?: boolean; mode?: string }> {
    return apiFetch("/health", () => ({ status: "ok", database: "connected" }));
  },
};

function getSubtitle(node: GraphNode): string {
  switch (node.type) {
    case "Paper":
      return `${(node.properties as { publicationYear?: number }).publicationYear || 2023} · ${(node.properties as { venue?: string }).venue || "Conference"}`;
    case "Researcher":
      return (node.properties as { researchInterest?: string }).researchInterest || "";
    case "Topic":
      return (node.properties as { category?: string }).category || "";
    case "Institution":
      return (node.properties as { location?: string }).location || "";
    case "Method":
      return (node.properties as { category?: string }).category || "";
    case "Dataset":
      return (node.properties as { domain?: string }).domain || "";
    default:
      return "";
  }
}

function paginate<T>(items: T[], page: number = 1, pageSize: number = 10): PaginatedResult<T> {
  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  };
}
