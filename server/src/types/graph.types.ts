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

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
