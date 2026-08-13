import { useEffect, useMemo, useRef, useState } from "react";
import * as Lucide from "lucide-react";
import { Link } from "react-router-dom";
import { NODE_COLORS } from "@/types/graph";
import type { GraphData, GraphNode, NodeType } from "@/types/graph";

interface GraphViewProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  selectedNodeId?: string;
  height?: number | string;
  showLabels?: boolean;
  fitOnDataChange?: boolean;
}

interface PositionedNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface SimEdge {
  source: string;
  target: string;
  type: string;
}

const NODE_RADIUS: Record<NodeType, number> = {
  Paper: 22,
  Researcher: 20,
  Topic: 18,
  Institution: 19,
  Method: 18,
  Dataset: 18,
  ResearchProject: 20,
};

export function GraphView({
  data,
  onNodeClick,
  selectedNodeId,
  height = 500,
  showLabels = true,
  fitOnDataChange = true,
}: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes] = useState<PositionedNode[]>([]);
  const [edges, setEdges] = useState<SimEdge[]>([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, tx: 0, ty: 0 });
  const animationRef = useRef<number | undefined>(undefined);
  const nodesMap = useRef<Map<string, PositionedNode>>(new Map());

  const dimensions = useElementSize(containerRef);
  const width = dimensions.width || 800;
  const heightNum = typeof height === "number" ? height : 500;

  // Initialize nodes with positions
  useEffect(() => {
    const centerX = width / 2;
    const centerY = heightNum / 2;

    // Check if the data is a single-node neighborhood (one central node)
    const isSingleCenter = data.nodes.length > 0 && data.edges.length === 0;

    const positioned = data.nodes.map((node, index) => {
      const existing = nodesMap.current.get(node.id);
      if (existing) {
        return { ...node, x: existing.x, y: existing.y, vx: 0, vy: 0 };
      }
      if (isSingleCenter && index === 0) {
        return { ...node, x: centerX, y: centerY, vx: 0, vy: 0 };
      }
      const angle = (index / data.nodes.length) * Math.PI * 2;
      const radius = Math.min(width, heightNum) * 0.32;
      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      };
    });

    const newMap = new Map<string, PositionedNode>();
    positioned.forEach((n) => newMap.set(n.id, n));
    nodesMap.current = newMap;
    setNodes(positioned);
    setEdges(
      data.edges.map((e) => ({
        source: e.source,
        target: e.target,
        type: e.type,
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Force simulation
  useEffect(() => {
    if (nodes.length === 0) return;
    let frame = 0;
    const simulate = () => {
      setNodes((currentNodes) => {
        const next = currentNodes.map((n) => ({ ...n }));
        const map = new Map<string, PositionedNode>();
        next.forEach((n) => map.set(n.id, n));

        // Repulsion
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const a = next[i];
            const b = next[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDist = 80;
            if (dist < minDist * 3) {
              const force = (minDist * minDist) / (dist * dist);
              const fx = (dx / dist) * force * 0.5;
              const fy = (dy / dist) * force * 0.5;
              a.vx -= fx;
              a.vy -= fy;
              b.vx += fx;
              b.vy += fy;
            }
          }
        }

        // Attraction (edges)
        for (const edge of edges) {
          const a = map.get(edge.source);
          const b = map.get(edge.target);
          if (!a || !b) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 140;
          const force = (dist - targetDist) * 0.02;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }

        // Center gravity
        const cx = width / 2;
        const cy = heightNum / 2;
        for (const n of next) {
          n.vx += (cx - n.x) * 0.005;
          n.vy += (cy - n.y) * 0.005;
          n.vx *= 0.85;
          n.vy *= 0.85;
          n.x += n.vx;
          n.y += n.vy;
        }

        nodesMap.current = map;
        return next;
      });
      frame = requestAnimationFrame(simulate);
    };
    frame = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges, width, heightNum]);

  // Fit to view when data changes
  useEffect(() => {
    if (!fitOnDataChange || nodes.length === 0) return;
    const padding = 60;
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs) - padding;
    const maxX = Math.max(...xs) + padding;
    const minY = Math.min(...ys) - padding;
    const maxY = Math.max(...ys) + padding;
    const dataWidth = maxX - minX || 1;
    const dataHeight = maxY - minY || 1;
    const scaleX = width / dataWidth;
    const scaleY = heightNum / dataHeight;
    const scale = Math.min(scaleX, scaleY, 1.5);
    const tx = (width - dataWidth * scale) / 2 - minX * scale;
    const ty = (heightNum - dataHeight * scale) / 2 - minY * scale;
    setTransform({ x: tx, y: ty, scale });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, fitOnDataChange]);

  const handleZoom = (delta: number) => {
    setTransform((t) => ({
      ...t,
      scale: Math.max(0.3, Math.min(3, t.scale + delta)),
    }));
  };

  const handleFit = () => {
    if (nodes.length === 0) return;
    const padding = 60;
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs) - padding;
    const maxX = Math.max(...xs) + padding;
    const minY = Math.min(...ys) - padding;
    const maxY = Math.max(...ys) + padding;
    const dataWidth = maxX - minX || 1;
    const dataHeight = maxY - minY || 1;
    const scale = Math.min(width / dataWidth, heightNum / dataHeight, 1.5);
    const tx = (width - dataWidth * scale) / 2 - minX * scale;
    const ty = (heightNum - dataHeight * scale) / 2 - minY * scale;
    setTransform({ x: tx, y: ty, scale });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element).tagName === "rect") {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    setTransform((t) => ({ ...t, x: panStart.tx + dx, y: panStart.ty + dy }));
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta);
  };

  const nodeMap = useMemo(() => {
    const m = new Map<string, PositionedNode>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  return (
    <div ref={containerRef} className="graph-view" style={{ height }}>
      <svg
        ref={svgRef}
        width={width}
        height={heightNum}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
      >
        <rect width={width} height={heightNum} fill="transparent" />
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
          {edges.map((edge, i) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return null;
            const mx = (source.x + target.x) / 2;
            const my = (source.y + target.y) / 2;
            return (
              <g key={i}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#cbd5e1"
                  strokeWidth={1.5}
                  strokeOpacity={0.6}
                />
                {showLabels && transform.scale > 0.6 && (
                  <text
                    x={mx}
                    y={my}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize={9}
                    fontWeight={600}
                    style={{ pointerEvents: "none", textTransform: "uppercase", letterSpacing: "0.5px" }}
                  >
                    {edge.type.replace(/_/g, " ")}
                  </text>
                )}
              </g>
            );
          })}
          {nodes.map((node) => {
            const color = NODE_COLORS[node.type];
            const radius = NODE_RADIUS[node.type] || 18;
            const isSelected = node.id === selectedNodeId;
            const Icon = (Lucide as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[
              iconForType(node.type)
            ];
            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                style={{ cursor: "pointer" }}
                onClick={() => onNodeClick?.(node)}
              >
                {isSelected && (
                  <circle r={radius + 6} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.3} />
                )}
                <circle r={radius} fill={color} stroke="#fff" strokeWidth={3} />
                {Icon && <g transform={`translate(${-radius / 2.5},${-radius / 2.5})`}><Icon size={radius * 0.8} /></g>}
                {showLabels && (
                  <text
                    y={radius + 14}
                    textAnchor="middle"
                    fill="#475569"
                    fontSize={11}
                    fontWeight={600}
                    style={{ pointerEvents: "none" }}
                  >
                    {truncate(node.label, 28)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="graph-controls">
        <button onClick={() => handleZoom(0.2)} aria-label="Zoom in">
          <Lucide.Plus size={16} />
        </button>
        <button onClick={() => handleZoom(-0.2)} aria-label="Zoom out">
          <Lucide.Minus size={16} />
        </button>
        <button onClick={handleFit} aria-label="Fit graph">
          <Lucide.Maximize2 size={15} />
        </button>
      </div>
    </div>
  );
}

function iconForType(type: NodeType): string {
  const icons: Record<NodeType, string> = {
    Paper: "FileText",
    Researcher: "Users",
    Topic: "Hash",
    Institution: "Building2",
    Method: "GitBranch",
    Dataset: "Database",
    ResearchProject: "FolderKanban",
  };
  return icons[type];
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function useElementSize(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}
