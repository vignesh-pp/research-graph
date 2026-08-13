import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FileText, Hash, GitBranch, Database, BookOpen, ExternalLink, Network, ArrowRight, ChevronRight, Share2 } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, Chip, Avatar, EmptyState, SkeletonDetailView, SkeletonGraph } from "@/components/ui";
import { GraphView } from "@/components/GraphView";

export function PaperDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState(() => {
    if (!id) return null;
    return {
      paper: api.getPaper(id),
      authors: api.getPaperAuthors(id),
      topics: api.getPaperTopics(id),
      methods: api.getPaperMethods(id),
      datasets: api.getPaperDatasets(id),
      citations: api.getPaperCitations(id),
      related: api.getRelatedPapers(id),
      lineage: api.getPaperLineage(id, 3),
    };
  });

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    api.fetchPaper(id).then((res) => {
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [id]);

  if (loading && !data?.paper) {
    return (
      <>
        <PageHeader title="Loading Paper Details..." subtitle="Fetching graph relationships from CognoDB..." backTo="/papers" backLabel="Back to Papers" />
        <SkeletonDetailView />
      </>
    );
  }

  if (!data?.paper) {
    return (
      <Card>
        <EmptyState
          icon={<FileText size={28} />}
          title="Paper not found"
          description="This paper may have been removed or the ID is invalid."
          action={<Link to="/papers" className="button button-primary">Back to Papers</Link>}
        />
      </Card>
    );
  }

  const { paper, authors, topics, methods, datasets, citations, related, lineage } = data;
  const props = paper.properties as { abstract: string; publicationYear: number; venue: string; doi: string; url: string };

  return (
    <>
      <PageHeader
        eyebrow="PUBLICATION INTELLIGENCE"
        title={paper.label}
        subtitle={`${props.publicationYear} · ${props.venue}`}
        backTo="/papers"
        backLabel="Back to Papers"
        action={
          <div style={{ display: "flex", gap: "8px" }}>
            <a href={props.url} target="_blank" rel="noopener noreferrer" className="button button-ghost">
              <ExternalLink size={15} /> Source Link
            </a>
            <button className="button button-primary" onClick={() => navigate(`/explorer?type=Paper&id=${paper.id}`)}>
              <Network size={15} /> Explore Graph
            </button>
          </div>
        }
      />

      <div className="detail-grid">
        <div>
          <Card title="Overview & Abstract" className="detail-section">
            <div style={{ padding: "20px" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: ".6px", color: "#64748b", fontWeight: 700, marginBottom: "8px" }}>Abstract</div>
              <p style={{ fontSize: "13.5px", lineHeight: 1.7, color: "#334155", margin: "0 0 20px" }}>{props.abstract}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Publication Year</div>
                  <div style={{ fontSize: "13px", color: "#0f172a", fontWeight: 700 }}>{props.publicationYear}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Venue / Journal</div>
                  <div style={{ fontSize: "13px", color: "#0f172a", fontWeight: 700 }}>{props.venue}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Digital Object Identifier (DOI)</div>
                  <div style={{ fontSize: "13px", color: "#2563eb", fontWeight: 600 }}>{props.doi}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>External Reference</div>
                  <a href={props.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12.5px", color: "#2563eb", textDecoration: "none" }}>{props.url}</a>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Authors & Affiliations" className="detail-section">
            <div style={{ padding: "20px" }}>
              <div className="author-cards">
                {authors.map((author) => {
                  const inst = api.getResearcherInstitution(author.id);
                  const paperCount = api.getResearcherPaperCount(author.id);
                  return (
                    <Link key={author.id} to={`/researchers/${author.id}`} className="author-card">
                      <Avatar name={author.label} />
                      <div className="name">{author.label}</div>
                      <div className="inst">{inst?.label || "Independent"}</div>
                      <div className="stats" style={{ color: "#2563eb", fontWeight: 600 }}>{paperCount} papers</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card title="Research Context" className="detail-section">
            <div style={{ padding: "20px" }}>
              <div className="context-grid">
                <div className="context-card">
                  <h4><Hash size={13} style={{ display: "inline", color: "#059669" }} /> Topics</h4>
                  <div className="chips">
                    {topics.map((t) => <Chip key={t.id} label={t.label} color="#059669" to={`/topics/${t.id}`} />)}
                  </div>
                </div>
                <div className="context-card">
                  <h4><GitBranch size={13} style={{ display: "inline", color: "#d97706" }} /> Methods</h4>
                  <div className="chips">
                    {methods.map((m) => <Chip key={m.id} label={m.label} color="#d97706" to="/methods" />)}
                  </div>
                </div>
                <div className="context-card">
                  <h4><Database size={13} style={{ display: "inline", color: "#0891b2" }} /> Datasets</h4>
                  <div className="chips">
                    {datasets.map((d) => <Chip key={d.id} label={d.label} color="#0891b2" to="/datasets" />)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Citation Network" className="detail-section">
            <div style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "8px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>References Cited ({citations.cites.length})</div>
                  {citations.cites.length === 0 ? <span style={{ fontSize: "12px", color: "#94a3b8" }}>No citations</span> : citations.cites.map((c) => (
                    <Link key={c.id} to={`/papers/${c.id}`} className="section-list-item" style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span className="item-title" style={{ fontSize: "12px" }}>{c.label}</span>
                      <ChevronRight size={14} style={{ color: "#cbd5e1" }} />
                    </Link>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>Cited By ({citations.citedBy.length})</div>
                  {citations.citedBy.length === 0 ? <span style={{ fontSize: "12px", color: "#94a3b8" }}>Not cited yet</span> : citations.citedBy.map((c) => (
                    <Link key={c.id} to={`/papers/${c.id}`} className="section-list-item" style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span className="item-title" style={{ fontSize: "12px" }}>{c.label}</span>
                      <ChevronRight size={14} style={{ color: "#cbd5e1" }} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Citation Lineage (Multi-hop Graph)" className="detail-section">
            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 16px" }}>Traverse upstream and downstream citation ancestry across multiple graph hops.</p>
              {lineage.nodes.length > 1 ? (
                <GraphView data={lineage} height={320} onNodeClick={(node) => navigate(`/papers/${node.id}`)} />
              ) : (
                <EmptyState icon={<BookOpen size={24} />} title="No citation lineage" description="This paper has no cited references in the graph." />
              )}
            </div>
          </Card>

          <Card title="Explainable Related Research" className="detail-section">
            <div style={{ padding: "20px" }}>
              {related.length === 0 ? (
                <EmptyState icon={<FileText size={24} />} title="No related research found" description="No papers share enough graph relationships with this one." />
              ) : (
                related.map((rp) => {
                  const rpProps = rp.paper.properties as { publicationYear: number; venue: string };
                  return (
                    <div key={rp.paper.id} className="related-paper-card">
                      <Link to={`/papers/${rp.paper.id}`} style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", textDecoration: "none" }}>
                        {rp.paper.label}
                      </Link>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Why related?</div>
                      <div className="reasons">
                        {rp.reasons.map((reason, i) => (
                          <div key={i} className="reason">
                            <span style={{ color: "#059669" }}>✓</span> {reason}
                          </div>
                        ))}
                      </div>
                      <div className="footer">
                        <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>{rpProps.publicationYear} · {rpProps.venue}</span>
                        <Link to={`/papers/${rp.paper.id}`} className="button button-ghost" style={{ height: "30px", fontSize: "11.5px" }}>
                          View Paper <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card title="Graph Connectivity" className="detail-section">
            <div style={{ padding: "18px", display: "grid", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Authors</span>
                <strong style={{ color: "#0f172a" }}>{authors.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Topics</span>
                <strong style={{ color: "#0f172a" }}>{topics.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Methods Used</span>
                <strong style={{ color: "#0f172a" }}>{methods.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Datasets Evaluated</span>
                <strong style={{ color: "#0f172a" }}>{datasets.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Cited By</span>
                <strong style={{ color: "#2563eb", fontSize: "15px" }}>{citations.citedBy.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>References</span>
                <strong style={{ color: "#0f172a" }}>{citations.cites.length}</strong>
              </div>
            </div>
          </Card>

          <Card title="Cited References" className="detail-section">
            <div style={{ padding: "8px 0" }}>
              {citations.cites.slice(0, 5).map((c) => (
                <Link key={c.id} to={`/papers/${c.id}`} className="section-list-item">
                  <FileText size={15} style={{ color: "#94a3b8" }} />
                  <span className="item-title">{c.label}</span>
                  <ChevronRight size={14} style={{ color: "#cbd5e1" }} />
                </Link>
              ))}
              {citations.cites.length === 0 && <div style={{ padding: "16px", fontSize: "12px", color: "#94a3b8" }}>No cited papers</div>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
