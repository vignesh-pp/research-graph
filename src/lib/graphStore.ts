import type {
  GraphNode,
  GraphEdge,
  GraphData,
  GraphPath,
  RelatedPaper,
  NodeType,
  RelationshipType,
} from "@/types/graph";

let _nodes = new Map<string, GraphNode>();
let _edges: GraphEdge[] = [];
let _adjacency = new Map<string, { from: GraphEdge[]; to: GraphEdge[] }>();
let _aliasMap = new Map<string, string>(); // aliasId -> canonicalId

const NODE_IDS: Record<NodeType, string[]> = {
  Researcher: [],
  Paper: [],
  Topic: [],
  Institution: [],
  Method: [],
  Dataset: [],
  ResearchProject: [],
};

export function clearGraph(): void {
  _nodes.clear();
  _edges = [];
  _adjacency.clear();
  _aliasMap.clear();
  Object.keys(NODE_IDS).forEach((k) => {
    NODE_IDS[k as NodeType] = [];
  });
}

function registerAliases(id: string, label: string) {
  // Normalize variations like top-1, top-001, t-1, t-001
  _aliasMap.set(id.toLowerCase(), id);
  _aliasMap.set(label.toLowerCase(), id);

  const numMatch = id.match(/\d+/);
  if (numMatch) {
    const num = parseInt(numMatch[0], 10);
    const padded = String(num).padStart(3, "0");

    if (id.startsWith("top-") || id.startsWith("t-")) {
      _aliasMap.set(`top-${num}`, id);
      _aliasMap.set(`top-${padded}`, id);
      _aliasMap.set(`t-${num}`, id);
      _aliasMap.set(`t-${padded}`, id);
    } else if (id.startsWith("inst-") || id.startsWith("i-")) {
      _aliasMap.set(`inst-${num}`, id);
      _aliasMap.set(`inst-${padded}`, id);
      _aliasMap.set(`i-${num}`, id);
      _aliasMap.set(`i-${padded}`, id);
    } else if (id.startsWith("res-") || id.startsWith("r-")) {
      _aliasMap.set(`res-${num}`, id);
      _aliasMap.set(`res-${padded}`, id);
      _aliasMap.set(`r-${num}`, id);
      _aliasMap.set(`r-${padded}`, id);
    } else if (id.startsWith("pap-") || id.startsWith("p-")) {
      _aliasMap.set(`pap-${num}`, id);
      _aliasMap.set(`pap-${padded}`, id);
      _aliasMap.set(`p-${num}`, id);
      _aliasMap.set(`p-${padded}`, id);
    } else if (id.startsWith("meth-") || id.startsWith("m-")) {
      _aliasMap.set(`meth-${num}`, id);
      _aliasMap.set(`meth-${padded}`, id);
      _aliasMap.set(`m-${num}`, id);
      _aliasMap.set(`m-${padded}`, id);
    } else if (id.startsWith("data-") || id.startsWith("d-")) {
      _aliasMap.set(`data-${num}`, id);
      _aliasMap.set(`data-${padded}`, id);
      _aliasMap.set(`d-${num}`, id);
      _aliasMap.set(`d-${padded}`, id);
    }
  }
}

export function addNode(node: GraphNode): void {
  _nodes.set(node.id, node);
  if (NODE_IDS[node.type]) NODE_IDS[node.type].push(node.id);
  if (!_adjacency.has(node.id)) {
    _adjacency.set(node.id, { from: [], to: [] });
  }
  registerAliases(node.id, node.label);
}

export function addEdge(edge: GraphEdge): void {
  _edges.push(edge);
  if (!_adjacency.has(edge.source)) _adjacency.set(edge.source, { from: [], to: [] });
  if (!_adjacency.has(edge.target)) _adjacency.set(edge.target, { from: [], to: [] });
  _adjacency.get(edge.source)!.from.push(edge);
  _adjacency.get(edge.target)!.to.push(edge);
}

export function getNode(id: string): GraphNode | undefined {
  if (!id) return undefined;
  if (_nodes.has(id)) return _nodes.get(id);

  // Check alias map
  const canonical = _aliasMap.get(id.toLowerCase());
  if (canonical && _nodes.has(canonical)) {
    return _nodes.get(canonical);
  }

  // Check fuzzy label/id matching
  const q = id.toLowerCase();
  for (const node of _nodes.values()) {
    if (node.id.toLowerCase() === q || node.label.toLowerCase() === q) {
      return node;
    }
  }

  return undefined;
}

export function getNodesByType(type: NodeType): GraphNode[] {
  return (NODE_IDS[type] || []).map((id) => _nodes.get(id)!).filter(Boolean);
}

export function getAllNodes(): GraphNode[] {
  return Array.from(_nodes.values());
}

export function getAllEdges(): GraphEdge[] {
  return _edges;
}

export function getNeighbors(
  id: string,
  options: { depth?: number; nodeTypes?: NodeType[]; relTypes?: RelationshipType[] } = {}
): GraphData {
  const depth = options.depth || 1;
  const target = getNode(id);
  const actualId = target ? target.id : id;

  const visited = new Set<string>([actualId]);
  const nodeMap = new Map<string, GraphNode>();
  const edgeList: GraphEdge[] = [];

  const startNode = _nodes.get(actualId);
  if (startNode) nodeMap.set(actualId, startNode);

  let currentLevel = [actualId];

  for (let d = 0; d < depth; d++) {
    const nextLevel: string[] = [];

    for (const currentId of currentLevel) {
      const adj = _adjacency.get(currentId);
      if (!adj) continue;

      for (const edge of adj.from) {
        if (options.relTypes && !options.relTypes.includes(edge.type)) continue;
        const neighbor = _nodes.get(edge.target);
        if (!neighbor) continue;
        if (options.nodeTypes && !options.nodeTypes.includes(neighbor.type)) continue;

        edgeList.push(edge);
        nodeMap.set(edge.target, neighbor);

        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          nextLevel.push(edge.target);
        }
      }

      for (const edge of adj.to) {
        if (options.relTypes && !options.relTypes.includes(edge.type)) continue;
        const neighbor = _nodes.get(edge.source);
        if (!neighbor) continue;
        if (options.nodeTypes && !options.nodeTypes.includes(neighbor.type)) continue;

        edgeList.push(edge);
        nodeMap.set(edge.source, neighbor);

        if (!visited.has(edge.source)) {
          visited.add(edge.source);
          nextLevel.push(edge.source);
        }
      }
    }

    currentLevel = nextLevel;
  }

  const seenEdges = new Set<string>();
  const uniqueEdges = edgeList.filter((e) => {
    if (seenEdges.has(e.id)) return false;
    seenEdges.add(e.id);
    return true;
  });

  return {
    nodes: Array.from(nodeMap.values()),
    edges: uniqueEdges,
  };
}

export function getNeighborhood(
  id: string,
  depth: number = 1,
  nodeTypes?: NodeType[],
  relTypes?: RelationshipType[]
): GraphData {
  return getNeighbors(id, { depth, nodeTypes, relTypes });
}

export function getConnectedNodes(
  id: string,
  relType: RelationshipType,
  direction: "outgoing" | "incoming" | "bidirectional" = "outgoing"
): GraphNode[] {
  const node = getNode(id);
  const actualId = node ? node.id : id;
  const adj = _adjacency.get(actualId);
  if (!adj) return [];

  const result: GraphNode[] = [];
  const seen = new Set<string>();

  if (direction === "outgoing" || direction === "bidirectional") {
    for (const edge of adj.from) {
      if (edge.type === relType && !seen.has(edge.target)) {
        seen.add(edge.target);
        const targetNode = _nodes.get(edge.target);
        if (targetNode) result.push(targetNode);
      }
    }
  }

  if (direction === "incoming" || direction === "bidirectional") {
    for (const edge of adj.to) {
      if (edge.type === relType && !seen.has(edge.source)) {
        seen.add(edge.source);
        const sourceNode = _nodes.get(edge.source);
        if (sourceNode) result.push(sourceNode);
      }
    }
  }

  return result;
}

export function findShortestPath(startId: string, endId: string): GraphPath | null {
  const start = getNode(startId);
  const end = getNode(endId);
  if (!start || !end) return null;

  const actualStartId = start.id;
  const actualEndId = end.id;

  if (actualStartId === actualEndId) {
    return { hops: [{ node: start }], length: 0 };
  }

  const queue: { nodeId: string; path: { node: GraphNode; edge?: GraphEdge }[] }[] = [
    { nodeId: actualStartId, path: [{ node: start }] },
  ];
  const visited = new Set<string>([actualStartId]);

  while (queue.length > 0) {
    const { nodeId, path } = queue.shift()!;
    if (path.length > 6) continue;

    const adj = _adjacency.get(nodeId);
    if (!adj) continue;

    const neighbors: { neighborId: string; edge: GraphEdge }[] = [];
    for (const edge of adj.from) {
      neighbors.push({ neighborId: edge.target, edge });
    }
    for (const edge of adj.to) {
      neighbors.push({ neighborId: edge.source, edge });
    }

    for (const { neighborId, edge } of neighbors) {
      if (visited.has(neighborId)) continue;
      visited.add(neighborId);

      const neighborNode = _nodes.get(neighborId);
      if (!neighborNode) continue;

      const newPath = [
        ...path.slice(0, -1),
        { ...path[path.length - 1], edge },
        { node: neighborNode },
      ];

      if (neighborId === actualEndId) {
        return {
          hops: newPath,
          length: newPath.length - 1,
        };
      }

      queue.push({ nodeId: neighborId, path: newPath });
    }
  }

  return null;
}

export function getCitationLineage(paperId: string, maxDepth: number = 3): GraphData {
  const target = getNode(paperId);
  const actualId = target ? target.id : paperId;
  return getNeighbors(actualId, { depth: maxDepth, relTypes: ["CITES"] });
}

export function getRelatedPapers(paperId: string): RelatedPaper[] {
  const target = getNode(paperId);
  const actualId = target ? target.id : paperId;
  const paper = _nodes.get(actualId);
  if (!paper) return [];

  const myTopics = getConnectedNodes(actualId, "ABOUT", "outgoing");
  const myMethods = getConnectedNodes(actualId, "USES_METHOD", "outgoing");
  const myDatasets = getConnectedNodes(actualId, "USES_DATASET", "outgoing");

  const topicIds = new Set(myTopics.map((t) => t.id));
  const methodIds = new Set(myMethods.map((m) => m.id));
  const datasetIds = new Set(myDatasets.map((d) => d.id));

  const allPapers = getNodesByType("Paper").filter((p) => p.id !== actualId);
  const scored: RelatedPaper[] = [];

  for (const other of allPapers) {
    const otherTopics = getConnectedNodes(other.id, "ABOUT", "outgoing");
    const otherMethods = getConnectedNodes(other.id, "USES_METHOD", "outgoing");
    const otherDatasets = getConnectedNodes(other.id, "USES_DATASET", "outgoing");

    const sharedTopics = otherTopics.filter((t) => topicIds.has(t.id));
    const sharedMethods = otherMethods.filter((m) => methodIds.has(m.id));
    const sharedDatasets = otherDatasets.filter((d) => datasetIds.has(d.id));

    const reasons: string[] = [];
    if (sharedTopics.length > 0) {
      reasons.push(
        `Shares ${sharedTopics.length} topic${sharedTopics.length > 1 ? "s" : ""} (${sharedTopics.map((t) => t.label).join(", ")})`
      );
    }
    if (sharedMethods.length > 0) {
      reasons.push(
        `Uses method${sharedMethods.length > 1 ? "s" : ""}: ${sharedMethods.map((m) => m.label).join(", ")}`
      );
    }
    if (sharedDatasets.length > 0) {
      reasons.push(
        `Evaluated on dataset${sharedDatasets.length > 1 ? "s" : ""}: ${sharedDatasets.map((d) => d.label).join(", ")}`
      );
    }

    const sharedCount = sharedTopics.length * 3 + sharedMethods.length * 2 + sharedDatasets.length * 2;
    if (sharedCount > 0) {
      scored.push({
        paper: other,
        reasons: reasons.length > 0 ? reasons : ["Connected in research domain network"],
        sharedCount,
      });
    }
  }

  scored.sort((a, b) => b.sharedCount - a.sharedCount);
  return scored;
}

export function getCollaborators(researcherId: string): GraphNode[] {
  const target = getNode(researcherId);
  const actualId = target ? target.id : researcherId;
  return getConnectedNodes(actualId, "COLLABORATED_WITH", "bidirectional");
}

export function getCollaborationGraph(researcherId: string, depth: number = 2): GraphData {
  const target = getNode(researcherId);
  const actualId = target ? target.id : researcherId;
  return getNeighbors(actualId, {
    depth,
    nodeTypes: ["Researcher", "Institution"],
    relTypes: ["COLLABORATED_WITH", "AFFILIATED_WITH"],
  });
}

export function getCrossInstitutionCollaborations(institutionId: string): GraphData {
  const target = getNode(institutionId);
  const actualId = target ? target.id : institutionId;
  return getNeighbors(actualId, {
    depth: 2,
    nodeTypes: ["Institution", "Researcher"],
    relTypes: ["AFFILIATED_WITH", "COLLABORATED_WITH"],
  });
}

export function getTopicGraph(topicId: string, depth: number = 2): GraphData {
  const target = getNode(topicId);
  const actualId = target ? target.id : topicId;
  return getNeighbors(actualId, {
    depth,
    nodeTypes: ["Topic", "Paper", "Method"],
    relTypes: ["RELATED_TO", "ABOUT", "USES_METHOD"],
  });
}

export function getPaperCountForTopic(topicId: string): number {
  const target = getNode(topicId);
  const actualId = target ? target.id : topicId;
  return getConnectedNodes(actualId, "ABOUT", "incoming").length;
}

export function getResearcherPaperCount(researcherId: string): number {
  const target = getNode(researcherId);
  const actualId = target ? target.id : researcherId;
  return getConnectedNodes(actualId, "AUTHORED", "outgoing").length;
}

export function getResearcherCollaboratorCount(researcherId: string): number {
  const target = getNode(researcherId);
  const actualId = target ? target.id : researcherId;
  return getConnectedNodes(actualId, "COLLABORATED_WITH", "bidirectional").length;
}

export function getCitationCount(paperId: string): number {
  const target = getNode(paperId);
  const actualId = target ? target.id : paperId;
  return getConnectedNodes(actualId, "CITES", "incoming").length;
}

export function getTotalCitations(): number {
  return _edges.filter((e) => e.type === "CITES").length;
}

export function getTotalCollaborations(): number {
  const collabs = _edges.filter((e) => e.type === "COLLABORATED_WITH");
  return Math.floor(collabs.length / 2);
}

export function search(query: string): { type: NodeType; items: GraphNode[] }[] {
  const q = query.toLowerCase();
  const byType = new Map<NodeType, GraphNode[]>();

  for (const node of _nodes.values()) {
    const match =
      node.label.toLowerCase().includes(q) ||
      Object.values(node.properties || {}).some(
        (v) => typeof v === "string" && v.toLowerCase().includes(q)
      );

    if (match) {
      if (!byType.has(node.type)) byType.set(node.type, []);
      byType.get(node.type)!.push(node);
    }
  }

  return Array.from(byType.entries()).map(([type, items]) => ({
    type,
    items: items.slice(0, 20),
  }));
}
