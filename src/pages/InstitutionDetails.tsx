import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Building2, FileText, Network, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, Avatar, EmptyState, SkeletonDetailView } from "@/components/ui";
import { GraphView } from "@/components/GraphView";

export function InstitutionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState(() => {
    if (!id) return null;
    const inst = api.getInstitution(id);
    if (!inst) return null;
    return {
      institution: inst,
      researchers: api.getInstitutionResearchers(inst.id),
      papers: api.getInstitutionPapers(inst.id),
      topics: api.getInstitutionTopics(inst.id),
      collaborationGraph: api.getInstitutionCollaborations(inst.id) || { nodes: [], edges: [] },
    };
  });

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    api.fetchInstitution(id).then((res) => {
      if (isMounted && res && res.institution) {
        setData({
          institution: res.institution,
          researchers: res.researchers || [],
          papers: res.papers || [],
          topics: res.topics || api.getInstitutionTopics(res.institution.id) || [],
          collaborationGraph: res.collaborationGraph || res.collaborations || api.getInstitutionCollaborations(res.institution.id) || { nodes: [], edges: [] },
        });
        setLoading(false);
      } else if (isMounted) {
        const local = api.getInstitution(id);
        if (local) {
          setData({
            institution: local,
            researchers: api.getInstitutionResearchers(local.id),
            papers: api.getInstitutionPapers(local.id),
            topics: api.getInstitutionTopics(local.id),
            collaborationGraph: api.getInstitutionCollaborations(local.id) || { nodes: [], edges: [] },
          });
        }
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        const local = api.getInstitution(id);
        if (local) {
          setData({
            institution: local,
            researchers: api.getInstitutionResearchers(local.id),
            papers: api.getInstitutionPapers(local.id),
            topics: api.getInstitutionTopics(local.id),
            collaborationGraph: api.getInstitutionCollaborations(local.id) || { nodes: [], edges: [] },
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

  if (loading && !data?.institution) {
    return (
      <>
        <PageHeader title="Loading Institution Details..." subtitle="Analyzing cross-institutional collaboration ties..." backTo="/institutions" backLabel="Back to Institutions" />
        <SkeletonDetailView />
      </>
    );
  }

  if (!data?.institution) {
    return (
      <Card>
        <EmptyState
          icon={<Building2 size={28} />}
          title="Institution not found"
          description="The requested institution record does not exist in the graph database."
          action={<Link to="/institutions" className="button button-primary">Back to Institutions</Link>}
        />
      </Card>
    );
  }

  const { institution } = data;
  const researchers = data.researchers || [];
  const papers = data.papers || [];
  const topics = data.topics || [];
  const collaborationGraph = data.collaborationGraph || { nodes: [], edges: [] };
  const props = institution.properties as { location?: string; type?: string };

  return (
    <>
      <PageHeader
        eyebrow="ACADEMIC & INDUSTRIAL HUB"
        title={institution.label}
        subtitle={`${props.location || "Location Unknown"} · ${props.type || "Institution"}`}
        backTo="/institutions"
        backLabel="Back to Institutions"
        action={
          <button className="button button-primary" onClick={() => navigate(`/explorer?type=Institution&id=${institution.id}`)}>
            <Network size={15} /> Explore Graph
          </button>
        }
      />

      <div className="detail-grid">
        <div>
          <Card title="Cross-Institution Collaboration Network" className="detail-section">
            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 16px" }}>
                Multi-hop graph identifying institutions connected through co-authored papers and collaborative researcher ties.
              </p>
              {collaborationGraph?.nodes && collaborationGraph.nodes.length > 1 ? (
                <GraphView
                  data={collaborationGraph}
                  height={340}
                  selectedNodeId={institution.id}
                  onNodeClick={(node) => {
                    if (node.type === "Institution") navigate(`/institutions/${node.id}`);
                    if (node.type === "Researcher") navigate(`/researchers/${node.id}`);
                  }}
                />
              ) : (
                <div style={{ padding: "20px", color: "#94a3b8", fontSize: "13px" }}>
                  No cross-institutional collaborations mapped in the current cluster.
                </div>
              )}
            </div>
          </Card>

          <Card title={`Affiliated Researchers (${researchers.length})`} className="detail-section">
            <div style={{ padding: "20px" }}>
              <div className="author-cards">
                {researchers.map((r) => {
                  const paperCount = api.getResearcherPaperCount(r.id);
                  const collabCount = api.getResearcherCollaboratorCount(r.id);
                  const rProps = r.properties as { researchInterest?: string };
                  return (
                    <Link key={r.id} to={`/researchers/${r.id}`} className="author-card">
                      <Avatar name={r.label} />
                      <div className="name">{r.label}</div>
                      <div className="inst" style={{ fontSize: "11px" }}>{rProps.researchInterest || "Research"}</div>
                      <div className="stats" style={{ color: "#2563eb", fontWeight: 600 }}>{paperCount} papers · {collabCount} collaborators</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card title={`Research Publications (${papers.length})`} className="detail-section">
            <div style={{ padding: "8px 0" }}>
              {papers.slice(0, 10).map((p) => {
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
              })}
            </div>
          </Card>
        </div>

        <div>
          <Card title="Quick Metrics" className="detail-section">
            <div style={{ padding: "18px", display: "grid", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Researchers</span>
                <strong style={{ color: "#7c3aed", fontSize: "14px" }}>{researchers.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Published Papers</span>
                <strong style={{ color: "#2563eb", fontSize: "14px" }}>{papers.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Primary Topics</span>
                <strong style={{ color: "#059669", fontSize: "14px" }}>{topics.length}</strong>
              </div>
            </div>
          </Card>

          <Card title="Key Research Topics" className="detail-section">
            <div style={{ padding: "16px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {topics.slice(0, 12).map((t) => (
                <Link
                  key={t.id}
                  to={`/topics/${t.id}`}
                  style={{
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    background: "#ecfdf5",
                    color: "#047857",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
