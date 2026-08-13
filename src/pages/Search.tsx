import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search as SearchIcon,
  FileText,
  Users,
  Hash,
  Building2,
  GitBranch,
  Database,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, EmptyState, SkeletonTable } from "@/components/ui";
import { NODE_COLORS, type SearchResult } from "@/types/graph";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>(() =>
    searchTerm.trim() ? api.getSearchResults(searchTerm) : []
  );

  useEffect(() => {
    setSearchTerm(queryParam);
    if (queryParam.trim()) {
      let isMounted = true;
      setLoading(true);
      api.fetchSearch(queryParam).then((res) => {
        if (isMounted) {
          setResults(res);
          setLoading(false);
        }
      }).catch(() => {
        if (isMounted) setLoading(false);
      });
      return () => {
        isMounted = false;
      };
    } else {
      setResults([]);
    }
  }, [queryParam]);

  const relationshipQueries = [
    { label: "Researchers working on Large Language Models", query: "Large Language Models" },
    { label: "Papers using FlashAttention or LoRA", query: "FlashAttention" },
    { label: "Stanford AI Lab & affiliated researchers", query: "Stanford" },
    { label: "Diffusion Models & Vision Transformers", query: "Diffusion" },
    { label: "Geometric Deep Learning & Graph Networks", query: "Graph" },
  ];

  const filteredResults = useMemo(() => {
    if (activeTab === "all") return results;
    return results.filter((r) => r.type.toLowerCase() === activeTab.toLowerCase());
  }, [results, activeTab]);

  const countsByType = useMemo(() => {
    const counts: Record<string, number> = { all: results.length };
    results.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return counts;
  }, [results]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchTerm });
  };

  const getEntityUrl = (result: SearchResult) => {
    switch (result.type) {
      case "Paper":
        return `/papers/${result.id}`;
      case "Researcher":
        return `/researchers/${result.id}`;
      case "Topic":
        return `/topics/${result.id}`;
      case "Institution":
        return `/institutions/${result.id}`;
      case "Method":
        return `/methods`;
      case "Dataset":
        return `/datasets`;
      default:
        return `/explorer?type=${result.type}&id=${result.id}`;
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="GLOBAL ENTITY SEARCH"
        title="Knowledge Graph Search"
        subtitle="Search across papers, researchers, topics, methods, and institutions."
      />

      {/* Search Input Box */}
      <Card style={{ padding: "20px", marginBottom: "20px" }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <SearchIcon
                size={18}
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
              />
              <input
                type="text"
                placeholder="Search across all entities, topics, methods, or papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  outline: "none",
                }}
              />
            </div>
            <button type="submit" className="button button-primary" style={{ padding: "12px 24px" }}>
              Search
            </button>
          </div>
        </form>

        {/* Suggested Queries */}
        <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
            <Sparkles size={13} style={{ color: "#2563eb" }} /> Suggested Queries:
          </span>
          {relationshipQueries.map((rq, i) => (
            <button
              key={i}
              onClick={() => {
                setSearchTerm(rq.query);
                setSearchParams({ q: rq.query });
              }}
              style={{
                fontSize: "12px",
                padding: "3px 10px",
                borderRadius: "14px",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                color: "#334155",
                cursor: "pointer",
              }}
            >
              {rq.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      {results.length > 0 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto" }}>
          {["all", "Paper", "Researcher", "Topic", "Institution", "Method", "Dataset"].map((tab) => {
            const count = tab === "all" ? countsByType.all : countsByType[tab] || 0;
            if (tab !== "all" && count === 0) return null;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "1px solid",
                  borderColor: activeTab === tab ? "#2563eb" : "#e2e8f0",
                  background: activeTab === tab ? "#2563eb" : "#ffffff",
                  color: activeTab === tab ? "#ffffff" : "#475569",
                  cursor: "pointer",
                }}
              >
                {tab === "all" ? "All Results" : tab} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Search Results List */}
      {loading ? (
        <SkeletonTable rows={5} cols={3} />
      ) : searchTerm.trim() ? (
        filteredResults.length === 0 ? (
          <Card>
            <EmptyState
              icon={<SearchIcon size={28} />}
              title="No matching records found"
              description={`No entities matched your query "${searchTerm}". Try a broader keyword.`}
            />
          </Card>
        ) : (
          <Card style={{ padding: "0" }}>
            <div style={{ display: "grid" }}>
              {filteredResults.map((result) => {
                const color = NODE_COLORS[result.type] || "#64748b";
                return (
                  <Link
                    key={result.id}
                    to={getEntityUrl(result)}
                    className="section-list-item hover-item"
                    style={{
                      padding: "14px 20px",
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: color + "1a",
                        color: color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {result.type === "Paper" && <FileText size={18} />}
                      {result.type === "Researcher" && <Users size={18} />}
                      {result.type === "Topic" && <Hash size={18} />}
                      {result.type === "Institution" && <Building2 size={18} />}
                      {result.type === "Method" && <GitBranch size={18} />}
                      {result.type === "Dataset" && <Database size={18} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
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
                          {result.type}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                          {result.label}
                        </span>
                      </div>
                      {result.subtitle && (
                        <div style={{ fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {result.subtitle}
                        </div>
                      )}
                    </div>

                    <ChevronRight size={16} style={{ color: "#94a3b8", flexShrink: 0 }} />
                  </Link>
                );
              })}
            </div>
          </Card>
        )
      ) : (
        <Card style={{ padding: "40px 20px", textAlign: "center" }}>
          <SearchIcon size={36} style={{ color: "#cbd5e1", margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
            Search ResearchGraph
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Enter a title, researcher name, topic, or method above to search the knowledge graph.
          </p>
        </Card>
      )}
    </>
  );
}
