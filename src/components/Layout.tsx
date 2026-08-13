import { useState } from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Hash,
  Building2,
  GitBranch,
  Database,
  Network,
  Route,
  Search as SearchIcon,
  Bell,
  CircleHelp,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Network as NetworkIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import type { NodeType } from "@/types/graph";

const navGroups = [
  {
    label: "Explore",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { label: "Papers", icon: FileText, path: "/papers" },
      { label: "Researchers", icon: Users, path: "/researchers" },
      { label: "Topics", icon: Hash, path: "/topics" },
      { label: "Institutions", icon: Building2, path: "/institutions" },
      { label: "Methods", icon: GitBranch, path: "/methods" },
      { label: "Datasets", icon: Database, path: "/datasets" },
    ],
  },
  {
    label: "Discover",
    items: [
      { label: "Knowledge Graph", icon: Network, path: "/graph" },
      { label: "Research Path", icon: Route, path: "/path" },
    ],
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const searchResults = searchQuery.trim() ? api.getSearchResults(searchQuery).slice(0, 8) : [];

  const handleSearchSelect = (id: string, type: NodeType) => {
    setSearchOpen(false);
    setSearchQuery("");
    if (type === "Paper") navigate(`/papers/${id}`);
    else if (type === "Researcher") navigate(`/researchers/${id}`);
    else if (type === "Topic") navigate(`/topics/${id}`);
    else if (type === "Institution") navigate(`/institutions/${id}`);
    else if (type === "Method") navigate("/methods");
    else if (type === "Dataset") navigate("/datasets");
    else navigate(`/graph?type=${type}&id=${id}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark">
            <NetworkIcon size={20} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div className="brand-name">
                Research<span>Graph</span>
              </div>
              <div className="brand-subtitle">RESEARCH INTELLIGENCE</div>
            </div>
          )}
        </div>

        <nav className="side-nav">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              {!collapsed && <div className="nav-label">{group.label}</div>}
              {group.items.map(({ label, icon: Icon, path }) => (
                <NavLink
                  key={label}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => {
                    const isDashboardRoot = path === "/dashboard" && location.pathname === "/";
                    return `nav-item ${isActive || isDashboardRoot ? "active" : ""}`;
                  }}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={18} strokeWidth={2} />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="side-footer">
          <Link to="/search" className="nav-item" title={collapsed ? "Search" : undefined} style={{ textDecoration: "none" }}>
            <SearchIcon size={17} />
            {!collapsed && <span>Global Search</span>}
          </Link>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button menu-toggle"
              onClick={() => {
                if (window.innerWidth <= 760) {
                  setMobileOpen(true);
                } else {
                  setCollapsed((c) => !c);
                }
              }}
              aria-label="Toggle menu"
              title="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="topbar-title">
              <h2>{pageTitle}</h2>
            </div>
          </div>

          <div className="topbar-search">
            <SearchIcon size={16} />
            <input
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search papers, researchers, topics, methods..."
            />
            <kbd>⌘ K</kbd>
            {searchOpen && searchQuery && (
              <div className="search-dropdown">
                <div className="search-dropdown-head">
                  <span>Search results</span>
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      className="search-result-item"
                      onClick={() => handleSearchSelect(result.id, result.type)}
                    >
                      <span className="result-type-badge">{result.type}</span>
                      <span className="result-label">{result.label}</span>
                      <span className="result-meta">{result.subtitle}</span>
                    </button>
                  ))
                ) : (
                  <div className="search-empty-state">
                    <SearchIcon size={18} />
                    <span>No results for "{searchQuery}"</span>
                  </div>
                )}
                <Link
                  to="/search"
                  className="search-all-link"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  Advanced search <SearchIcon size={14} />
                </Link>
              </div>
            )}
          </div>

          <div className="topbar-actions">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "14px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                fontSize: "11px",
                fontWeight: 600,
                color: "#15803d",
              }}
              title="Database Mode: CognoDB / Neo4j Bolt with intelligent local graph fallback"
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "inline-block",
                }}
              />
              CognoDB Graph
            </div>

            <Link to="/search" className="icon-button" aria-label="Search" title="Search">
              <SearchIcon size={17} />
            </Link>
            <div className="avatar avatar-image" title="Researcher Profile">RG</div>
          </div>
        </header>

        <div className="content-wrap">{children}</div>
      </main>

      {searchOpen && <div className="search-backdrop" onClick={() => setSearchOpen(false)} />}
    </div>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname === "/" || pathname === "/dashboard") return "Dashboard";
  if (pathname.startsWith("/papers")) return "Research Papers";
  if (pathname.startsWith("/researchers")) return "Researchers";
  if (pathname.startsWith("/topics")) return "Research Topics";
  if (pathname.startsWith("/institutions")) return "Institutions";
  if (pathname.startsWith("/methods")) return "Methods & Algorithms";
  if (pathname.startsWith("/datasets")) return "Datasets & Benchmarks";
  if (pathname.startsWith("/graph") || pathname.startsWith("/explorer")) return "Knowledge Graph Explorer";
  if (pathname.startsWith("/path")) return "Research Path Finder";
  if (pathname.startsWith("/search")) return "Graph Search";
  return "ResearchGraph";
}
