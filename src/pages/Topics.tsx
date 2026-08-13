import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Hash } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Chip, SkeletonCardGrid } from "@/components/ui";
import type { GraphNode } from "@/types/graph";

export function TopicsPage() {
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<GraphNode[]>(() => api.getTopics());

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.fetchTopics().then((res) => {
      if (isMounted) {
        setTopics(res);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="DOMAIN TAXONOMY"
        title="Research Topics"
        subtitle="Explore foundational research domains, semantic intersections, and subfields across AI & computer science."
      />
      {loading ? (
        <SkeletonCardGrid count={8} />
      ) : (
        <div className="entity-grid">
          {topics.map((topic) => {
            const paperCount = api.getPaperCountForTopic(topic.id);
            const related = api.getTopicRelatedTopics(topic.id);
            const props = topic.properties as { category: string; description: string };
            return (
              <Link key={topic.id} to={`/topics/${topic.id}`} className="entity-card">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Hash size={17} style={{ color: "#059669" }} />
                  <span className="entity-title">{topic.label}</span>
                </div>
                <span className="entity-sub">{props.description}</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  <Chip label={props.category} color="#059669" />
                  {related.slice(0, 2).map((r) => <Chip key={r.id} label={r.label} />)}
                </div>
                <div className="entity-meta">
                  <span><strong>{paperCount}</strong> papers</span>
                  <span><strong>{related.length}</strong> related domains</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
