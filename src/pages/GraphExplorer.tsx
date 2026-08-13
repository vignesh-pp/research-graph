import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Network,
  RotateCcw,
  Info,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, EmptyState, SkeletonGraph } from "@/components/ui";
import { GraphView } from "@/components/GraphView";
import { NODE_COLORS, type NodeType, type GraphNode, type GraphData } from "@/types/graph";

export function GraphExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialType = (searchParams.get("type") as NodeType) || "Topic";
  const initialId = searchParams.get("id") || "top-1";

  const [selectedType, setSelectedType] = useState<NodeType>(initialType);
  const [selectedId, setSelectedId] = useState<string>(initialId);
  const [depth, setDepth] = useState<number>(1);
  const [activeNode, setActiveNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(false);

  // Entities list for dropdown
  const allEntities = useMemo(() => api.getAllEntities(), []);
  const availableEntities = useMemo(() => {
    const group = allEntities.find((g) => g.type === selectedType);
    return group ? group.items : [];
  }, [allEntities, selectedType]);

  const [graphData, setGraphData] = useState<GraphData>(() =>
    api.getGraphNeighborhood(selectedType, selectedId, depth)
  );

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.fetchNeighborhood(selectedType, selectedId, depth).then((res) => {
      if (isMounted) {
        setGraphData(res);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedType, selectedId, depth]);

  useEffect(() => {
    const curr = api.getPaper(selectedId) || api.getResearcher(selectedId) || api.getTopic(selectedId) || api.getInstitution(selectedId);
    setActiveNode(curr || (graphData.nodes.length > 0 ? graphData.nodes[0] : null));
  }, [selectedId, graphData]);

  // When type changes, ensure valid ID is selected
  const handleTypeChange = (type: NodeType) => {
    setSelectedType(type);
    const group = allEntities.find((g) => g.type === type);
    if (group && group.items.length > 0) {
      setSelectedId(group.items[0].id);
      setSearchParams({ type, id: group.items[0].id });
    }
  };

  const handleEntityChange = (id: string) => {
    setSelectedId(id);
    setSearchParams({ type: selectedType, id });
  };

  const handleNodeClick = (node: GraphNode) => {
    setActiveNode(node);
  };

  const handleExpandNode = (node: GraphNode) => {
    setSelectedType(node.type);
    setSelectedId(node.id);
    setSearchParams({ type: node.type, id: node.id });
  };

  return (
    <>
      <PageHeader
        eyebrow="MULTI-HOP GRAPH VISUALIZATION"
        title="Knowledge Graph Explorer"
        subtitle="Traverse multi-hop relationships between researchers, papers, topics, methods, and institutions."
      />

      {/* Controls Bar */}
      <Card style={{ marginBottom: "16px", padding: "14px 18px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          {/* Entity Type & Node Selector */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Type:</span>
              <select
                className="select-input"
                style={{ padding: "6px 12px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value as NodeType)}
              >
                <option value="Topic">Topic</option>
                <option value="Paper">Paper</option>
                <option value="Researcher">Researcher</option>
                <option value="Institution">Institution</option>
                <option value="Method">Method</option>
                <option value="Dataset">Dataset</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Focus Node:</span>
              <select
                className="select-input"
                style={{ maxWidth: "260px", padding: "6px 12px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                value={selectedId}
                onChange={(e) => handleEntityChange(e.target.value)}
              >
                {availableEntities.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Depth Selector & Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Hop Depth:</span>
              <div style={{ display: "flex", borderRadius: "6px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
                {[1, 2, 3].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDepth(d)}
                    style={{
                      padding: "6px 14px",
                      fontSize: "12px",
                      fontWeight: 700,
                      background: depth === d ? "#2563eb" : "#ffffff",
                      color: depth === d ? "#ffffff" : "#475569",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {d} Hop{d > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="button button-ghost"
              style={{ fontSize: "12px", padding: "6px 12px" }}
              onClick={() => {
                setSelectedType("Topic");
                setSelectedId("top-1");
                setDepth(1);
                setSearchParams({ type: "Topic", id: "top-1" });
              }}
              title="Reset to default seed node"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </Card>

      {/* Main Graph & Inspector Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px", alignItems: "start" }}>
        <Card style={{ padding: "0", overflow: "hidden", position: "relative" }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Network size={16} style={{ color: "#2563eb" }} />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                Graph Neighborhood · {graphData.nodes.length} Entities, {graphData.edges.length} Relationships
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {Object.entries(NODE_COLORS).map(([type, color]) => (
                <span
                  key={type}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11px",
                    color: "#64748b",
                  }}
                >
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
                  {type}
                </span>
              ))}
            </div>
          </div>

          {loading ? (
            <SkeletonGraph height={560} message="Querying graph relationships over CognoDB Bolt..." />
          ) : graphData.nodes.length === 0 ? (
            <div style={{ padding: "60px 20px" }}>
              <EmptyState
                icon={<Network size={32} />}
                title="Empty Subgraph"
                description="No connected neighbors found for this node at the selected depth."
              />
            </div>
          ) : (
            <GraphView
              data={graphData}
              height={560}
              selectedNodeId={activeNode?.id || selectedId}
              onNodeClick={handleNodeClick}
              showLabels={true}
            />
          )}
        </Card>

        {/* Node Details Inspector Sidebar */}
        <Card title="Node Inspector">
          <div style={{ padding: "18px" }}>
            {activeNode ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#fff",
                      background: NODE_COLORS[activeNode.type] || "#64748b",
                    }}
                  >
                    {activeNode.type}
                  </span>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>ID: {activeNode.id}</span>
                </div>

                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 12px", lineHeight: 1.4 }}>
                  {activeNode.label}
                </h3>

                {/* Node Property Grid */}
                <div style={{ display: "grid", gap: "8px", marginBottom: "18px", background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                  {Object.entries(activeNode.properties || {}).map(([key, val]) => {
                    if (key === "id" || key === "title" || key === "name") return null;
                    if (typeof val === "object" || val === null || val === undefined) return null;
                    return (
                      <div key={key} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#8996a7" }}>
                          {key}
                        </span>
                        <span style={{ fontSize: "12px", color: "#334155", wordBreak: "break-word" }}>
                          {String(val)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div style={{ display: "grid", gap: "8px" }}>
                  <button
                    className="button button-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => handleExpandNode(activeNode)}
                  >
                    <Sparkles size={14} /> Center & Expand Subgraph
                  </button>

                  <button
                    className="button button-ghost"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => {
                      if (activeNode.type === "Paper") navigate(`/papers/${activeNode.id}`);
                      if (activeNode.type === "Researcher") navigate(`/researchers/${activeNode.id}`);
                      if (activeNode.type === "Topic") navigate(`/topics/${activeNode.id}`);
                      if (activeNode.type === "Institution") navigate(`/institutions/${activeNode.id}`);
                      if (activeNode.type === "Method") navigate("/methods");
                      if (activeNode.type === "Dataset") navigate("/datasets");
                    }}
                  >
                    <ExternalLink size={14} /> View Full Entity Details
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", padding: "30px 0" }}>
                <Info size={24} style={{ margin: "0 auto 8px", display: "block" }} />
                Click on any node in the graph to inspect its properties and explore connected relationships.
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
