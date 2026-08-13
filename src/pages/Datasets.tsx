import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Database, ExternalLink, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, SearchInput, SelectFilter, EmptyState, SkeletonCardGrid } from "@/components/ui";
import type { GraphNode } from "@/types/graph";

export function DatasetsPage() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [datasets, setDatasets] = useState<GraphNode[]>(() => api.getDatasets());

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.fetchDatasets().then((res) => {
      if (isMounted) {
        setDatasets(res);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const domains = useMemo(() => {
    const set = new Set<string>();
    datasets.forEach((d) => {
      const dom = (d.properties as { domain?: string }).domain;
      if (dom) set.add(dom);
    });
    return Array.from(set).sort();
  }, [datasets]);

  const filtered = useMemo(() => {
    return datasets.filter((d) => {
      const props = d.properties as { domain?: string; description?: string };
      const matchesSearch =
        !search ||
        d.label.toLowerCase().includes(search.toLowerCase()) ||
        (props.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesDomain = !domain || props.domain === domain;
      return matchesSearch && matchesDomain;
    });
  }, [datasets, search, domain]);

  return (
    <>
      <PageHeader
        eyebrow="BENCHMARKS & EVALUATION"
        title="Research Datasets & Benchmarks"
        subtitle="Explore benchmark corpora, multimodal datasets, and knowledge graphs that drive AI evaluation."
      />

      <div className="toolbar">
        <SearchInput
          placeholder="Search datasets and benchmarks..."
          value={search}
          onChange={setSearch}
        />
        <SelectFilter
          label="Domain"
          value={domain}
          onChange={setDomain}
          options={[
            { value: "", label: "All Domains" },
            ...domains.map((dom) => ({ value: dom, label: dom })),
          ]}
        />
      </div>

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Database size={28} />}
            title="No datasets found"
            description="Try adjusting your search query or domain filter."
          />
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {filtered.map((dataset) => {
            const props = dataset.properties as { domain?: string; description?: string; url?: string };
            const papers = api.getPapers({ dataset: dataset.id, pageSize: 5 }).items;

            return (
              <Card key={dataset.id} style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "10px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#cffafe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0891b2",
                      flexShrink: 0,
                    }}
                  >
                    <Database size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                        {dataset.label}
                      </h3>
                      {props.url && (
                        <a
                          href={props.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#0891b2", display: "flex", alignItems: "center" }}
                          title="Open Dataset URL"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: "#f1f5f9",
                        color: "#475569",
                        fontWeight: 600,
                      }}
                    >
                      {props.domain || "Dataset"}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, margin: "0 0 16px", flex: 1 }}>
                  {props.description || "No description provided."}
                </p>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "6px" }}>
                    Papers evaluated on this dataset:
                  </div>
                  <div style={{ display: "grid", gap: "4px", minWidth: 0 }}>
                    {papers.slice(0, 3).map((p) => (
                      <Link
                        key={p.id}
                        to={`/papers/${p.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          color: "#2563eb",
                          textDecoration: "none",
                          padding: "3px 0",
                          minWidth: 0,
                        }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "8px" }}>
                          {p.label}
                        </span>
                        <ChevronRight size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      </Link>
                    ))}
                    {papers.length === 0 && (
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>No papers directly associated.</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
