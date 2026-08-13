import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Users, Hash, Building2, GitBranch, Database, BookOpen, Network, TrendingUp, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, Avatar, StatCard, SkeletonMetricGrid, Skeleton, SkeletonTable } from "@/components/ui";

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(() => ({
    stats: api.getDashboardStats(),
    popularTopics: api.getPopularTopics(8),
    connectedResearchers: api.getMostConnectedResearchers(6),
    citedPapers: api.getMostCitedPapers(5),
    activity: api.getActivityByYear(),
  }));

  useEffect(() => {
    let isMounted = true;
    api.getDashboardDataAsync().then((res) => {
      if (isMounted) {
        setData({
          stats: res.stats,
          popularTopics: res.popularTopics,
          connectedResearchers: res.mostConnectedResearchers,
          citedPapers: res.mostCitedPapers,
          activity: res.activity,
        });
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    // Timeout safety fallback
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const maxActivity = Math.max(...data.activity.map((a) => a.count), 1);

  return (
    <>
      <PageHeader
        eyebrow="GRAPH INTELLIGENCE PLATFORM"
        title="Research Overview"
        subtitle="Explore multi-hop relationships across papers, researchers, topics, methods, and institutions."
        action={
          <Link to="/explorer" className="button button-primary">
            <Sparkles size={15} /> Launch Graph Explorer
          </Link>
        }
      />

      {loading ? (
        <>
          <SkeletonMetricGrid count={4} />
          <div style={{ marginTop: "14px" }}><SkeletonMetricGrid count={4} /></div>
        </>
      ) : (
        <>
          <div className="metric-grid">
            <StatCard label="Papers" value={data.stats.papers} icon={<FileText size={18} />} color="#2563eb" />
            <StatCard label="Researchers" value={data.stats.researchers} icon={<Users size={18} />} color="#7c3aed" />
            <StatCard label="Topics" value={data.stats.topics} icon={<Hash size={18} />} color="#059669" />
            <StatCard label="Institutions" value={data.stats.institutions} icon={<Building2 size={18} />} color="#64748b" />
          </div>
          <div className="metric-grid" style={{ marginTop: "-4px" }}>
            <StatCard label="Methods" value={data.stats.methods} icon={<GitBranch size={18} />} color="#d97706" />
            <StatCard label="Datasets" value={data.stats.datasets} icon={<Database size={18} />} color="#0891b2" />
            <StatCard label="Citations" value={data.stats.citations} icon={<BookOpen size={18} />} color="#2563eb" />
            <StatCard label="Collaborations" value={data.stats.collaborations} icon={<Network size={18} />} color="#7c3aed" />
          </div>
        </>
      )}

      <div className="dashboard-grid top-grid" style={{ marginTop: "16px" }}>
        <Card title="Research Publication Activity">
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <TrendingUp size={16} style={{ color: "#2563eb" }} />
              <span style={{ fontSize: "13px", color: "#64748b" }}>Indexed papers published per year</span>
            </div>
            {loading ? (
              <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Skeleton width="100%" height="160px" />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", height: "180px", paddingTop: "10px" }}>
                {data.activity.map((point) => (
                  <div key={point.year} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>{point.count}</div>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "44px",
                        height: `${(point.count / maxActivity) * 130}px`,
                        background: "linear-gradient(180deg, #3b82f6, #1d4ed8)",
                        borderRadius: "6px 6px 0 0",
                        minHeight: "12px",
                        boxShadow: "0 2px 6px rgba(37,99,235,0.2)",
                      }}
                    />
                    <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>{point.year}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card title="Popular Research Topics">
          <div style={{ padding: "6px 0" }}>
            {data.popularTopics.map((topic, i) => (
              <Link key={topic.id} to={`/topics/${topic.id}`} className="topic-list-item">
                <span className="topic-rank">{i + 1}</span>
                <span className="topic-name">{topic.name}</span>
                <span className="topic-count" style={{ color: "#2563eb", fontWeight: 600 }}>{topic.paperCount} papers</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="dashboard-grid lower-grid" style={{ marginTop: "16px" }}>
        <Card title="Most Connected Researchers">
          <div className="table-wrapper">
            <div className="table-head" style={{ gridTemplateColumns: "2fr 1.5fr .8fr .8fr" }}>
              <div>Researcher</div>
              <div>Institution</div>
              <div>Papers</div>
              <div>Collaborators</div>
            </div>
            {data.connectedResearchers.map((r) => (
              <Link key={r.id} to={`/researchers/${r.id}`} className="table-row clickable" style={{ gridTemplateColumns: "2fr 1.5fr .8fr .8fr", textDecoration: "none", color: "inherit" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Avatar name={r.name} />
                  <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>{r.name}</span>
                </div>
                <div style={{ fontSize: "12.5px", color: "#64748b" }}>{r.institution}</div>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>{r.papers}</div>
                <div style={{ fontWeight: 700, color: "#2563eb" }}>{r.collaborators}</div>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Most Cited Publications">
          <div style={{ padding: "6px 0" }}>
            {data.citedPapers.map((paper, i) => (
              <Link key={paper.id} to={`/papers/${paper.id}`} className="topic-list-item">
                <span className="topic-rank">{i + 1}</span>
                <div style={{ flex: 1, display: "grid", gap: "2px" }}>
                  <span className="topic-name" style={{ fontSize: "12.5px" }}>{paper.title}</span>
                  <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>{paper.year}</span>
                </div>
                <span className="topic-count" style={{ color: "#2563eb", fontWeight: 700 }}>{paper.citations} citations</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
