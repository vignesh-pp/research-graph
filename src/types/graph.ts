export type NodeType =
  | "Researcher"
  | "Paper"
  | "Topic"
  | "Institution"
  | "Method"
  | "Dataset"
  | "ResearchProject";

export type RelationshipType =
  | "AUTHORED"
  | "AFFILIATED_WITH"
  | "COLLABORATED_WITH"
  | "CITES"
  | "ABOUT"
  | "USES_METHOD"
  | "USES_DATASET"
  | "INVOLVES"
  | "PRODUCED"
  | "RELATED_TO";

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  properties: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  properties?: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface PathHop {
  node: GraphNode;
  edge?: GraphEdge;
}

export interface GraphPath {
  hops: PathHop[];
  length: number;
}

export interface RelatedPaper {
  paper: GraphNode;
  reasons: string[];
  sharedCount: number;
}

export interface DashboardStats {
  papers: number;
  researchers: number;
  topics: number;
  institutions: number;
  methods: number;
  datasets: number;
  citations: number;
  collaborations: number;
}

export interface PopularTopic {
  id: string;
  name: string;
  paperCount: number;
}

export interface ConnectedResearcher {
  id: string;
  name: string;
  institution: string;
  papers: number;
  collaborators: number;
}

export interface CitedPaper {
  id: string;
  title: string;
  year: number;
  citations: number;
}

export interface ActivityPoint {
  year: number;
  count: number;
}

export interface SearchResult {
  id: string;
  type: NodeType;
  label: string;
  subtitle: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const NODE_COLORS: Record<NodeType, string> = {
  Paper: "#2563eb",
  Researcher: "#7c3aed",
  Topic: "#059669",
  Institution: "#6b7280",
  Method: "#d97706",
  Dataset: "#0891b2",
  ResearchProject: "#db2777",
};

export const NODE_ICONS: Record<NodeType, string> = {
  Paper: "FileText",
  Researcher: "Users",
  Topic: "Hash",
  Institution: "Building2",
  Method: "GitBranch",
  Dataset: "Database",
  ResearchProject: "FolderKanban",
};
