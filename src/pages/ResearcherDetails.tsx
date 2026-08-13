import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Users, FileText, Hash, FolderKanban, Network, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, Chip, Avatar, StatCard, EmptyState, SkeletonDetailView } from "@/components/ui";
import { GraphView } from "@/components/GraphView";

export function ResearcherDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState(() => {
    if (!id) return null;
    const r = api.getResearcher(id);
    if (!r) return null;
    return {
      researcher: r,
      institution: api.getResearcherInstitution(r.id),
      papers: api.getResearcherPapers(r.id),
      collaborators: api.getResearcherCollaborators(r.id),
      topics: api.getResearcherTopics(r.id),
      methods: api.getResearcherMethods(r.id),
      datasets: api.getResearcherDatasets(r.id),
      projects: api.getResearcherProjects(r.id),
      collabGraph: api.getResearcherCollaborationGraph(r.id) || { nodes: [], edges: [] },
    };
  });

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    api.fetchResearcher(id).then((res) => {
      if (isMounted && res && res.researcher) {
        setData({
          researcher: res.researcher,
          institution: res.institution || null,
          papers: res.papers || [],
          collaborators: res.collaborators || [],
          topics: res.topics || [],
          methods: res.methods || [],
          datasets: res.datasets || [],
          projects: res.projects || [],
          collabGraph: res.collabGraph || res.collaborationGraph || api.getResearcherCollaborationGraph(res.researcher.id) || { nodes: [], edges: [] },
        });
        setLoading(false);
      } else if (isMounted) {
        const local = api.getResearcher(id);
        if (local) {
          setData({
            researcher: local,
            institution: api.getResearcherInstitution(local.id),
            papers: api.getResearcherPapers(local.id),
            collaborators: api.getResearcherCollaborators(local.id),
            topics: api.getResearcherTopics(local.id),
            methods: api.getResearcherMethods(local.id),
            datasets: api.getResearcherDatasets(local.id),
            projects: api.getResearcherProjects(local.id),
            collabGraph: api.getResearcherCollaborationGraph(local.id) || { nodes: [], edges: [] },
          });
        }
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        const local = api.getResearcher(id);
        if (local) {
          setData({
            researcher: local,
            institution: api.getResearcherInstitution(local.id),
            papers: api.getResearcherPapers(local.id),
            collaborators: api.getResearcherCollaborators(local.id),
            topics: api.getResearcherTopics(local.id),
            methods: api.getResearcherMethods(local.id),
            datasets: api.getResearcherDatasets(local.id),
            projects: api.getResearcherProjects(local.id),
            collabGraph: api.getResearcherCollaborationGraph(local.id) || { nodes: [], edges: [] },
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

  if (loading && !data?.researcher) {
    return (
      <>
        <PageHeader title="Loading Researcher Profile..." subtitle="Traversing collaboration graph..." backTo="/researchers" backLabel="Back to Researchers" />
        <SkeletonDetailView />
      </>
    );
  }

  if (!data?.researcher) {
    return (
      <Card>
        <EmptyState
          icon={<Users size={28} />}
          title="Researcher not found"
          description="The requested researcher does not exist in the database."
          action={<Link to="/researchers" className="button button-primary">Back to Researchers</Link>}
        />
      </Card>
    );
  }

  const { researcher, institution } = data;
  const papers = data.papers || [];
  const collaborators = data.collaborators || [];
  const topics = data.topics || [];
  const methods = data.methods || [];
  const datasets = data.datasets || [];
  const projects = data.projects || [];
  const collabGraph = data.collabGraph || { nodes: [], edges: [] };
  const props = researcher.properties as { bio: string; email: string; researchInterest?: string };

  return (
    <>
      <PageHeader
        eyebrow="FACULTY & SCIENTIST"
        title={researcher.label}
        subtitle={props.researchInterest ? `Focus: ${props.researchInterest}` : "Principal Investigator"}
        backTo="/researchers"
        backLabel="Back to Researchers"
        action={
          <button className="button button-primary" onClick={() => navigate(`/explorer?type=Researcher&id=${researcher.id}`)}>
            <Network size={15} /> Explore Graph
          </button>
        }
      />

      <div className="metric-grid">
        <StatCard label="Authored Papers" value={papers.length} icon={<FileText size={20} />} />
        <StatCard label="Direct Collaborators" value={collaborators.length} icon={<Users size={20} />} />
        <StatCard label="Research Topics" value={topics.length} icon={<Hash size={20} />} />
        <StatCard label="Active Projects" value={projects.length} icon={<FolderKanban size={20} />} />
      </div>

      <div className="detail-grid">
        <div>
          <Card title="Researcher Profile" className="detail-section">
            <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
              <Avatar name={researcher.label} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Biography</div>
                <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "#334155", margin: "6px 0 16px" }}>{props.bio}</p>
                <div style={{ display: "flex", gap: "20px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Official Email</div>
                    <div style={{ fontSize: "12.5px", color: "#0f172a", fontWeight: 600 }}>{props.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Primary Affiliation</div>
                    <div style={{ fontSize: "12.5px", color: "#2563eb", fontWeight: 600 }}>{institution?.label || "Independent"}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Publications" className="detail-section">
            <div style={{ padding: "8px 0" }}>
              {papers.length === 0 ? (
                <div style={{ padding: "20px", fontSize: "12px", color: "#94a3b8" }}>No publications indexed</div>
              ) : (
                papers.map((p) => {
                  const pProps = p.properties as { publicationYear: number; venue: string };
                  return (
                    <Link key={p.id} to={`/papers/${p.id}`} className="section-list-item">
                      <FileText size={15} style={{ color: "#2563eb" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "13px", color: "#0f172a" }}>{p.label}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{pProps.publicationYear} · {pProps.venue}</div>
                      </div>
                      <ChevronRight size={14} style={{ color: "#cbd5e1" }} />
                    </Link>
                  );
                })
              )}
            </div>
          </Card>

          <Card title="Co-Authorship Network (2-Hop Graph)" className="detail-section">
            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 16px" }}>Direct co-authors and secondary research collaborators.</p>
              {collabGraph?.nodes && collabGraph.nodes.length > 1 ? (
                <GraphView data={collabGraph} height={320} onNodeClick={(node) => navigate(`/researchers/${node.id}`)} />
              ) : (
                <EmptyState icon={<Users size={24} />} title="No collaborators" description="No co-authorship relationships found in the graph." />
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card title="Research Focus" className="detail-section">
            <div style={{ padding: "18px", display: "grid", gap: "14px" }}>
              <div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: ".5px", color: "#64748b", fontWeight: 700, marginBottom: "8px" }}>Topics</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {topics.map((t) => <Chip key={t.id} label={t.label} color="#059669" to={`/topics/${t.id}`} />)}
                  {topics.length === 0 && <span style={{ fontSize: "12px", color: "#94a3b8" }}>No topics linked</span>}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: ".5px", color: "#64748b", fontWeight: 700, marginBottom: "8px" }}>Methods</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {methods.map((m) => <Chip key={m.id} label={m.label} color="#d97706" to="/methods" />)}
                  {methods.length === 0 && <span style={{ fontSize: "12px", color: "#94a3b8" }}>No methods linked</span>}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: ".5px", color: "#64748b", fontWeight: 700, marginBottom: "8px" }}>Datasets</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {datasets.map((d) => <Chip key={d.id} label={d.label} color="#0891b2" to="/datasets" />)}
                  {datasets.length === 0 && <span style={{ fontSize: "12px", color: "#94a3b8" }}>No datasets linked</span>}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Frequent Collaborators" className="detail-section">
            <div style={{ padding: "8px 0" }}>
              {collaborators.map((c) => {
                const cInst = api.getResearcherInstitution(c.id);
                return (
                  <Link key={c.id} to={`/researchers/${c.id}`} className="section-list-item">
                    <Avatar name={c.label} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "13px", color: "#0f172a" }}>{c.label}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{cInst?.label || "Independent"}</div>
                    </div>
                    <ChevronRight size={14} style={{ color: "#cbd5e1" }} />
                  </Link>
                );
              })}
              {collaborators.length === 0 && (
                <div style={{ padding: "16px", color: "#94a3b8", fontSize: "12px" }}>No direct collaborators mapped.</div>
              )}
            </div>
          </Card>

          <Card title="Funded Research Projects" className="detail-section">
            <div style={{ padding: "8px 0" }}>
              {projects.map((proj) => {
                const pProps = proj.properties as { description?: string; status?: string };
                return (
                  <div key={proj.id} className="section-list-item" style={{ cursor: "default" }}>
                    <FolderKanban size={15} style={{ color: "#7c3aed" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "13px", color: "#0f172a" }}>{proj.label}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{pProps.status || "Active"}</div>
                    </div>
                  </div>
                );
              })}
              {projects.length === 0 && (
                <div style={{ padding: "16px", color: "#94a3b8", fontSize: "12px" }}>No projects mapped.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
