import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, Avatar, Table, Pagination, SearchInput, SelectFilter, EmptyState, SkeletonTable } from "@/components/ui";
import type { GraphNode } from "@/types/graph";

export function ResearchersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [institution, setInstitution] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  const institutions = useMemo(() => api.getInstitutions(), []);

  const [result, setResult] = useState(() =>
    api.getResearchers({
      search: search || undefined,
      institution: institution || undefined,
      page,
      pageSize,
    })
  );

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.fetchResearchers({
      search: search || undefined,
      institution: institution || undefined,
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
  }, [search, institution, page]);

  return (
    <>
      <PageHeader
        eyebrow="FACULTY & SCIENTISTS"
        title="Researchers"
        subtitle="Discover scientists, analyze co-authorship networks, and track cross-institution collaborations."
      />

      <div className="toolbar">
        <SearchInput
          placeholder="Search researchers by name or interests..."
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <SelectFilter
          label="Institution"
          value={institution}
          onChange={(v) => {
            setInstitution(v);
            setPage(1);
          }}
          options={[{ value: "", label: "All institutions" }, ...institutions.map((i) => ({ value: i.id, label: i.label }))]}
        />
      </div>

      <Card>
        {loading ? (
          <SkeletonTable rows={pageSize} cols={5} />
        ) : result.items.length === 0 ? (
          <EmptyState icon={<Users size={28} />} title="No researchers found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <Table
              columns={[
                { label: "Researcher", width: "2fr" },
                { label: "Institution", width: "1.5fr" },
                { label: "Research Interests", width: "2fr" },
                { label: "Papers", width: ".8fr" },
                { label: "Collaborators", width: ".8fr" },
              ]}
              rows={result.items}
              onRowClick={(r) => navigate(`/researchers/${r.id}`)}
              renderRow={(r: GraphNode) => {
                const inst = api.getResearcherInstitution(r.id);
                const papers = api.getResearcherPaperCount(r.id);
                const collabs = api.getResearcherCollaboratorCount(r.id);
                const interests = (r.properties as { researchInterest: string }).researchInterest;
                return (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Avatar name={r.label} />
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "13.5px" }}>{r.label}</span>
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#64748b" }}>{inst?.label || "Independent"}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.4 }}>{interests}</div>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{papers}</div>
                    <div style={{ fontWeight: 700, color: "#2563eb" }}>{collabs}</div>
                  </>
                );
              }}
            />
            <Pagination page={page} pageSize={pageSize} total={result.total} onPageChange={setPage} />
          </>
        )}
      </Card>
    </>
  );
}
