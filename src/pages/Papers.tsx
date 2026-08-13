import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, Chip, Table, Pagination, SearchInput, SelectFilter, EmptyState, SkeletonTable } from "@/components/ui";
import type { GraphNode } from "@/types/graph";

export function PapersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [topic, setTopic] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  const topics = useMemo(() => api.getTopics(), []);
  const years = useMemo(() => api.getActivityByYear().map((a) => a.year), []);

  const [result, setResult] = useState(() =>
    api.getPapers({
      search: search || undefined,
      year: year ? Number(year) : undefined,
      topic: topic || undefined,
      page,
      pageSize,
    })
  );

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.fetchPapers({
      search: search || undefined,
      year: year ? Number(year) : undefined,
      topic: topic || undefined,
      page,
      pageSize,
    }).then((res) => {
      if (isMounted) {
        setResult(res);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [search, year, topic, page]);

  return (
    <>
      <PageHeader
        eyebrow="PUBLICATIONS DIRECTORY"
        title="Research Papers"
        subtitle="Explore indexed scientific literature, explore citations, and analyze method/dataset lineages."
      />

      <div className="toolbar">
        <SearchInput
          placeholder="Search papers by title or abstract..."
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <SelectFilter
          label="Year"
          value={year}
          onChange={(v) => {
            setYear(v);
            setPage(1);
          }}
          options={[{ value: "", label: "All years" }, ...years.map((y) => ({ value: String(y), label: String(y) }))]}
        />
        <SelectFilter
          label="Topic"
          value={topic}
          onChange={(v) => {
            setTopic(v);
            setPage(1);
          }}
          options={[{ value: "", label: "All topics" }, ...topics.map((t) => ({ value: t.id, label: t.label }))]}
        />
      </div>

      <Card>
        {loading ? (
          <SkeletonTable rows={pageSize} cols={6} />
        ) : result.items.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} />}
            title="No papers found"
            description="Try adjusting your search or filters to find what you're looking for."
          />
        ) : (
          <>
            <Table
              columns={[
                { label: "Title", width: "2fr" },
                { label: "Authors", width: "1.5fr" },
                { label: "Topics", width: "1.5fr" },
                { label: "Year", width: ".8fr" },
                { label: "Venue", width: ".8fr" },
                { label: "Citations", width: ".8fr" },
              ]}
              rows={result.items}
              onRowClick={(paper) => navigate(`/papers/${paper.id}`)}
              renderRow={(paper: GraphNode) => {
                const authors = api.getPaperAuthors(paper.id);
                const paperTopics = api.getPaperTopics(paper.id);
                const citations = api.getPaperCitations(paper.id).citedBy.length;
                const props = paper.properties as { publicationYear: number; venue: string };
                return (
                  <>
                    <div>
                      <strong style={{ color: "#0f172a", fontSize: "13px", display: "block", lineHeight: 1.35 }}>{paper.label}</strong>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {authors.slice(0, 3).map((a) => a.label).join(", ")}
                      {authors.length > 3 && ` +${authors.length - 3}`}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {paperTopics.slice(0, 2).map((t) => (
                        <Chip key={t.id} label={t.label} color="#059669" to={`/topics/${t.id}`} />
                      ))}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{props.publicationYear}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{props.venue}</div>
                    <div style={{ fontWeight: 800, color: "#2563eb", fontSize: "14px" }}>{citations}</div>
                  </>
                );
              }}
            />
            <Pagination
              page={page}
              pageSize={pageSize}
              total={result.total}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </>
  );
}
