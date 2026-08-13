import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Users, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, SearchInput, EmptyState, SkeletonCardGrid } from "@/components/ui";
import type { GraphNode } from "@/types/graph";

export function InstitutionsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState<GraphNode[]>(() => api.getInstitutions());

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.fetchInstitutions().then((res) => {
      if (isMounted) {
        setInstitutions(res);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!search) return institutions;
    const q = search.toLowerCase();
    return institutions.filter(
      (inst) =>
        inst.label.toLowerCase().includes(q) ||
        ((inst.properties as { location?: string }).location || "").toLowerCase().includes(q)
    );
  }, [institutions, search]);

  return (
    <>
      <PageHeader
        eyebrow="GLOBAL ECOSYSTEM"
        title="Research Institutions"
        subtitle="Explore global research universities, industrial laboratories, and institutes."
      />

      <div className="toolbar">
        <SearchInput
          placeholder="Search institutions by name or location..."
          value={search}
          onChange={setSearch}
        />
      </div>

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Building2 size={28} />}
            title="No institutions found"
            description="Try searching with a different name or location."
          />
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {filtered.map((inst) => {
            const props = inst.properties as { location?: string; type?: string };
            const researchers = api.getInstitutionResearchers(inst.id);
            const papers = api.getInstitutionPapers(inst.id);

            return (
              <Card
                key={inst.id}
                className="hover-card"
                onClick={() => navigate(`/institutions/${inst.id}`)}
                style={{ cursor: "pointer", padding: "20px" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#475569",
                      flexShrink: 0,
                    }}
                  >
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                      {inst.label}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#64748b", fontSize: "12px" }}>
                      <MapPin size={13} /> {props.location || "Global"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px", borderTop: "1px solid #f1f5f9", paddingTop: "14px", marginTop: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}>
                    <Users size={14} style={{ color: "#7c3aed" }} />
                    <strong>{researchers.length}</strong> Researchers
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}>
                    <FileText size={14} style={{ color: "#2563eb" }} />
                    <strong>{papers.length}</strong> Papers
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
