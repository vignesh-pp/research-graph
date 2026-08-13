import { useState, useMemo, useEffect } from "react";
import {
  ArrowRight,
  Sparkles,
  Network,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, EmptyState, SkeletonGraph } from "@/components/ui";
import { GraphView } from "@/components/GraphView";
import { NODE_COLORS, type NodeType, type GraphPath, type GraphData } from "@/types/graph";

export function PathFinderPage() {
  const allEntities = useMemo(() => api.getAllEntities(), []);

  // Preset example pairings to demonstrate graph traversals
  const presets = [
    {
      title: "Cross-Domain Collaboration Chain",
      description: "Dr. Ashish Vaswani (Attention) → Dr. Yann LeCun (FAIR)",
      startType: "Researcher" as NodeType,
      startId: "res-1",
      targetType: "Researcher" as NodeType,
      targetId: "res-3",
    },
    {
      title: "Influence Path: Attention to Diffusion",
      description: "Attention Is All You Need → Latent Diffusion Models",
      startType: "Paper" as NodeType,
      startId: "pap-1",
      targetType: "Paper" as NodeType,
      targetId: "pap-12",
    },
    {
      title: "Inter-Institutional Bridge",
      description: "MIT CSAIL → DeepMind via Co-authorship & Papers",
      startType: "Institution" as NodeType,
      startId: "inst-1",
      targetType: "Institution" as NodeType,
      targetId: "inst-9",
    },
    {
      title: "Topic-to-Method Connection",
      description: "RLHF Alignment → LoRA Fine-Tuning",
      startType: "Topic" as NodeType,
      startId: "top-4",
      targetType: "Method" as NodeType,
      targetId: "meth-2",
    },
  ];

  const [startType, setStartType] = useState<NodeType>("Researcher");
  const [startId, setStartId] = useState<string>("res-1");
  const [targetType, setTargetType] = useState<NodeType>("Researcher");
  const [targetId, setTargetId] = useState<string>("res-3");
  const [pathResult, setPathResult] = useState<GraphPath | null>(() => api.findPath("res-1", "res-3"));
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(true);

  const startOptions = useMemo(() => {
    return allEntities.find((g) => g.type === startType)?.items || [];
  }, [allEntities, startType]);

  const targetOptions = useMemo(() => {
    return allEntities.find((g) => g.type === targetType)?.items || [];
  }, [allEntities, targetType]);

  const handleFindPath = () => {
    if (!startId || !targetId) return;
    setLoading(true);
    setSearched(true);
    api.fetchPath(startId, targetId).then((res) => {
      setPathResult(res);
      setLoading(false);
    }).catch(() => {
      setPathResult(api.findPath(startId, targetId));
      setLoading(false);
    });
  };

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setStartType(preset.startType);
    setStartId(preset.startId);
    setTargetType(preset.targetType);
    setTargetId(preset.targetId);
    setLoading(true);
    setSearched(true);
    api.fetchPath(preset.startId, preset.targetId).then((res) => {
      setPathResult(res);
      setLoading(false);
    }).catch(() => {
      setPathResult(api.findPath(preset.startId, preset.targetId));
      setLoading(false);
    });
  };

  // Convert hops to GraphData for GraphView visualization
  const graphVisualizationData = useMemo<GraphData>(() => {
    if (!pathResult || pathResult.hops.length === 0) return { nodes: [], edges: [] };
    const nodes = pathResult.hops.map((h) => h.node);
    const edges = pathResult.hops
      .filter((h) => h.edge !== undefined)
      .map((h) => h.edge!);

    return { nodes, edges };
  }, [pathResult]);

  return (
    <>
      <PageHeader
        eyebrow="MULTI-HOP SHORTEST PATH FINDER"
        title="Research Path Finder"
        subtitle="Discover multi-hop connection paths between any two entities in the research knowledge graph."
      />

      {/* Preset Quick Discovery */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Sparkles size={13} style={{ color: "#2563eb" }} /> Example Multi-Hop Demonstrations
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              className="card-button"
              onClick={() => handleApplyPreset(preset)}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: "8px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "3px" }}>
                {preset.title}
              </div>
              <div style={{ fontSize: "11.5px", color: "#64748b" }}>{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Entity Selection Card */}
      <Card style={{ padding: "20px", marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto", gap: "16px", alignItems: "end" }}>
          {/* Start Entity */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "6px" }}>
              Origin Entity (Start)
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                className="select-input"
                style={{ padding: "8px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                value={startType}
                onChange={(e) => {
                  const newType = e.target.value as NodeType;
                  setStartType(newType);
                  const first = allEntities.find((g) => g.type === newType)?.items[0];
                  if (first) setStartId(first.id);
                }}
              >
                <option value="Researcher">Researcher</option>
                <option value="Paper">Paper</option>
                <option value="Topic">Topic</option>
                <option value="Institution">Institution</option>
                <option value="Method">Method</option>
                <option value="Dataset">Dataset</option>
              </select>

              <select
                className="select-input"
                style={{ flex: 1, padding: "8px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                value={startId}
                onChange={(e) => setStartId(e.target.value)}
              >
                {startOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: "10px" }}>
            <ArrowRight size={20} style={{ color: "#94a3b8" }} />
          </div>

          {/* Target Entity */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "6px" }}>
              Destination Entity (Target)
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                className="select-input"
                style={{ padding: "8px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                value={targetType}
                onChange={(e) => {
                  const newType = e.target.value as NodeType;
                  setTargetType(newType);
                  const first = allEntities.find((g) => g.type === newType)?.items[0];
                  if (first) setTargetId(first.id);
                }}
              >
                <option value="Researcher">Researcher</option>
                <option value="Paper">Paper</option>
                <option value="Topic">Topic</option>
                <option value="Institution">Institution</option>
                <option value="Method">Method</option>
                <option value="Dataset">Dataset</option>
              </select>

              <select
                className="select-input"
                style={{ flex: 1, padding: "8px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
              >
                {targetOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Find Path Action */}
          <div>
            <button
              className="button button-primary"
              style={{ padding: "9px 18px", fontSize: "13px" }}
              onClick={handleFindPath}
            >
              <Network size={16} /> Find Shortest Path
            </button>
          </div>
        </div>
      </Card>

      {/* Results Section */}
      {searched && (
        <>
          {loading ? (
            <SkeletonGraph height={380} message="Finding shortest traversal path using openCypher graph algorithms..." />
          ) : pathResult && pathResult.hops.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "16px", alignItems: "start" }}>
              {/* Path Visual Map */}
              <Card title={`Relationship Path (${pathResult.length} hops)`}>
                <div style={{ padding: "18px" }}>
                  <GraphView
                    data={graphVisualizationData}
                    height={380}
                    showLabels={true}
                  />
                </div>
              </Card>

              {/* Step-by-Step Relationship Explanation */}
              <Card title="Step-by-Step Graph Traversal">
                <div style={{ padding: "20px" }}>
                  <div style={{ position: "relative", paddingLeft: "16px", borderLeft: "2px solid #e2e8f0", display: "grid", gap: "20px" }}>
                    {pathResult.hops.map((hop, index) => {
                      const color = NODE_COLORS[hop.node.type] || "#64748b";
                      const isLast = index === pathResult.hops.length - 1;

                      return (
                        <div key={hop.node.id} style={{ position: "relative" }}>
                          {/* Indicator Dot */}
                          <div
                            style={{
                              position: "absolute",
                              left: "-23px",
                              top: "2px",
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              background: color,
                              border: "2px solid #ffffff",
                              boxShadow: "0 0 0 2px " + color,
                            }}
                          />

                          {/* Node Card */}
                          <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background: color,
                                  color: "#ffffff",
                                }}
                              >
                                {hop.node.type}
                              </span>
                              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Step {index + 1}</span>
                            </div>
                            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>
                              {hop.node.label}
                            </div>
                          </div>

                          {/* Edge connecting to next node */}
                          {!isLast && hop.edge && (
                            <div style={{ padding: "8px 0 0 6px", display: "flex", alignItems: "center", gap: "6px" }}>
                              <div
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  color: "#2563eb",
                                  background: "#eff6ff",
                                  padding: "3px 8px",
                                  borderRadius: "10px",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                ↓ {hop.edge.type.replace(/_/g, " ")}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={<Network size={32} />}
                title="No Graph Path Found"
                description="There are no direct or indirect relationships connecting these two records within a 6-hop neighborhood limit."
              />
            </Card>
          )}
        </>
      )}
    </>
  );
}
