import { GraphRepository } from "../repositories/graph.repository.js";
import type { GraphNode, NodeType } from "../types/graph.types.js";

export class SearchService {
  private graphRepo = new GraphRepository();

  async search(query: string) {
    if (!query || query.trim() === "") return [];

    const nodes = await this.graphRepo.searchEntities(query.trim(), 25);

    // Group by node type
    const grouped = new Map<NodeType, GraphNode[]>();
    nodes.forEach((n) => {
      const arr = grouped.get(n.type) || [];
      arr.push(n);
      grouped.set(n.type, arr);
    });

    return Array.from(grouped.entries()).map(([type, items]) => ({
      type,
      items,
    }));
  }
}
