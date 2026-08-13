import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GitBranch, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, SearchInput, SelectFilter, EmptyState, SkeletonCardGrid } from "@/components/ui";
import type { GraphNode } from "@/types/graph";

export function MethodsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [methods, setMethods] = useState<GraphNode[]>(() => api.getMethods());

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.fetchMethods().then((res) => {
      if (isMounted) {
        setMethods(res);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    methods.forEach((m) => {
      const cat = (m.properties as { category?: string }).category;
      if (cat) set.add(cat);
    });
    return Array.from(set).sort();
  }, [methods]);

  const filtered = useMemo(() => {
    return methods.filter((m) => {
      const props = m.properties as { category?: string; description?: string };
      const matchesSearch =
        !search ||
        m.label.toLowerCase().includes(search.toLowerCase()) ||
        (props.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || props.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [methods, search, category]);

  return (
    <>
      <PageHeader
        eyebrow="METHODOLOGY & ALGORITHMS"
        title="Research Methods & Algorithms"
        subtitle="Explore foundational algorithms, architectures, sampling strategies, and optimization methods."
      />

      <div className="toolbar">
        <SearchInput
          placeholder="Search methods and algorithms..."
          value={search}
          onChange={setSearch}
        />
        <SelectFilter
          label="Category"
          value={category}
          onChange={setCategory}
          options={[
            { value: "", label: "All Categories" },
            ...categories.map((c) => ({ value: c, label: c })),
          ]}
        />
      </div>

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<GitBranch size={28} />}
            title="No methods found"
            description="Try adjusting your search criteria or category filter."
          />
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {filtered.map((method) => {
            const props = method.properties as { category?: string; description?: string };
            const papers = api.getPapers({ method: method.id, pageSize: 5 }).items;

            return (
              <Card key={method.id} style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "10px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#fef3c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#d97706",
                      flexShrink: 0,
                    }}
                  >
                    <GitBranch size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                      {method.label}
                    </h3>
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
                      {props.category || "Method"}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, margin: "0 0 16px", flex: 1 }}>
                  {props.description || "No description provided."}
                </p>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "6px" }}>
                    Papers using this method:
                  </div>
                  <div style={{ display: "grid", gap: "4px" }}>
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
