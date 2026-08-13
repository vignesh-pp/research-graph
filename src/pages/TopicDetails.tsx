import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Hash, FileText, GitBranch, Database, Network, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, Chip, Avatar, EmptyState, SkeletonDetailView } from "@/components/ui";
import { GraphView } from "@/components/GraphView";

export function TopicDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState(() => {
    if (!id) return null;
    const t = api.getTopic(id);
    if (!t) return null;
    return {
      topic: t,
      papers: api.getTopicPapers(t.id),
      researchers: api.getTopicResearchers(t.id),
      methods: api.getTopicMethods(t.id),
      datasets: api.getTopicDatasets(t.id),
      relatedTopics: api.getTopicRelatedTopics(t.id),
      topicGraph: api.getTopicGraph(t.id, 2) || { nodes: [], edges: [] },
    };
  });

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    api.fetchTopic(id).then((res) => {
      if (isMounted && res && res.topic) {
        setData({
          topic: res.topic,
          papers: res.papers || [],
          researchers: res.researchers || [],
          methods: res.methods || [],
          datasets: res.datasets || [],
          relatedTopics: res.relatedTopics || [],
          topicGraph: res.topicGraph || res.subGraph || api.getTopicGraph(res.topic.id, 2) || { nodes: [], edges: [] },
        });
        setLoading(false);
      } else if (isMounted) {
        const local = api.getTopic(id);
        if (local) {
          setData({
            topic: local,
            papers: api.getTopicPapers(local.id),
            researchers: api.getTopicResearchers(local.id),
            methods: api.getTopicMethods(local.id),
            datasets: api.getTopicDatasets(local.id),
            relatedTopics: api.getTopicRelatedTopics(local.id),
            topicGraph: api.getTopicGraph(local.id, 2) || { nodes: [], edges: [] },
          });
        }
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        const local = api.getTopic(id);
        if (local) {
          setData({
            topic: local,
            papers: api.getTopicPapers(local.id),
            researchers: api.getTopicResearchers(local.id),
            methods: api.getTopicMethods(local.id),
            datasets: api.getTopicDatasets(local.id),
            relatedTopics: api.getTopicRelatedTopics(local.id),
            topicGraph: api.getTopicGraph(local.id, 2) || { nodes: [], edges: [] },
          });
        }
        setLoading(false);
      }
    });

    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [id]);

  if (loading && !data?.topic) {
    return (
      <>
        <PageHeader title="Loading Topic Details..." subtitle="Traversing conceptual ontology graph..." backTo="/topics" backLabel="Back to Topics" />
        <SkeletonDetailView />
      </>
    );
  }

  if (!data?.topic) {
    return (
      <Card>
        <EmptyState
          icon={<Hash size={28} />}
          title="Topic not found"
          description="The requested topic could not be located in the knowledge graph."
          action={<Link to="/topics" className="button button-primary">Back to Topics</Link>}
        />
      </Card>
    );
  }

  const { topic } = data;
  const papers = data.papers || [];
  const researchers = data.researchers || [];
  const methods = data.methods || [];
  const datasets = data.datasets || [];
  const relatedTopics = data.relatedTopics || [];
  const topicGraph = data.topicGraph || { nodes: [], edges: [] };
  const props = topic.properties as { description?: string; category?: string };

  return (
    <>
      <PageHeader
        eyebrow="DOMAIN TAXONOMY"
        title={topic.label}
        subtitle={props.category ? `Category: ${props.category}` : "Research Domain"}
        backTo="/topics"
        backLabel="Back to Topics"
        action={
          <button className="button button-primary" onClick={() => navigate(`/explorer?type=Topic&id=${topic.id}`)}>
            <Network size={15} /> Explore Graph
          </button>
        }
      />

      <div className="detail-grid">
        <div>
          {props.description && (
            <Card title="Domain Overview & Description" className="detail-section">
              <div style={{ padding: "20px" }}>
                <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#334155", margin: 0 }}>
                  {props.description}
                </p>
              </div>
            </Card>
          )}

          <Card title="Topic Relationship Sub-Graph" className="detail-section">
            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 16px" }}>
                Interactive sub-graph of concepts, subdomains, and related research themes.
              </p>
              {topicGraph?.nodes && topicGraph.nodes.length > 1 ? (
                <GraphView
                  data={topicGraph}
                  height={320}
                  selectedNodeId={topic.id}
                  onNodeClick={(node) => {
                    if (node.type === "Topic") navigate(`/topics/${node.id}`);
                  }}
                />
              ) : (
                <div style={{ padding: "16px", color: "#94a3b8", fontSize: "13px" }}>No related sub-topics mapped.</div>
              )}
            </div>
          </Card>

          <Card title={`Connected Publications (${papers.length})`} className="detail-section">
            <div style={{ padding: "8px 0" }}>
              {papers.length === 0 ? (
                <div style={{ padding: "20px", color: "#94a3b8", fontSize: "13px" }}>No papers directly associated with this topic yet.</div>
              ) : (
                papers.map((p) => {
                  const pProps = p.properties as { publicationYear: number; venue: string };
                  return (
                    <Link key={p.id} to={`/papers/${p.id}`} className="section-list-item">
                      <FileText size={16} style={{ color: "#2563eb", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="item-title">{p.label}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{pProps.publicationYear} · {pProps.venue}</div>
                      </div>
                      <ChevronRight size={14} style={{ color: "#cbd5e1" }} />
                    </Link>
                  );
                })
              )}
            </div>
          </Card>

          <Card title="Associated Methods & Datasets" className="detail-section">
            <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <h4 style={{ fontSize: "12px", color: "#0f172a", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <GitBranch size={14} style={{ color: "#d97706" }} /> Methods ({methods.length})
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {methods.map((m) => (
                    <Chip key={m.id} label={m.label} color="#d97706" to="/methods" />
                  ))}
                  {methods.length === 0 && <span style={{ fontSize: "12px", color: "#94a3b8" }}>None linked</span>}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: "12px", color: "#0f172a", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Database size={14} style={{ color: "#0891b2" }} /> Datasets ({datasets.length})
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {datasets.map((d) => (
                    <Chip key={d.id} label={d.label} color="#0891b2" to="/datasets" />
                  ))}
                  {datasets.length === 0 && <span style={{ fontSize: "12px", color: "#94a3b8" }}>None linked</span>}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Active Researchers in Domain" className="detail-section">
            <div style={{ padding: "14px" }}>
              <div style={{ display: "grid", gap: "8px" }}>
                {researchers.map((r) => {
                  const inst = api.getResearcherInstitution(r.id);
                  return (
                    <Link
                      key={r.id}
                      to={`/researchers/${r.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px",
                        borderRadius: "8px",
                        background: "#f8fafc",
                        textDecoration: "none",
                        color: "inherit",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <Avatar name={r.label} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.label}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{inst?.label || "Independent"}</div>
                      </div>
                    </Link>
                  );
                })}
                {researchers.length === 0 && (
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>No active researchers indexed.</div>
                )}
              </div>
            </div>
          </Card>

          <Card title="Related Adjacent Topics" className="detail-section">
            <div style={{ padding: "16px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {relatedTopics.map((rt) => (
                <Chip key={rt.id} label={rt.label} color="#059669" to={`/topics/${rt.id}`} />
              ))}
              {relatedTopics.length === 0 && (
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>No adjacent topics mapped.</span>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
