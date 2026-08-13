import React from "react";
import { ArrowRight, ArrowLeft, Loader2, Network } from "lucide-react";
import { Link } from "react-router-dom";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  backTo,
  backLabel,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {backTo && (
          <Link to={backTo} className="back-link">
            <ArrowLeft size={15} /> {backLabel || "Back"}
          </Link>
        )}
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className,
  style,
  onClick,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <section className={`card ${className || ""}`} style={style} onClick={onClick}>
      {(title || action) && (
        <div className="card-heading">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Chip({
  label,
  color,
  to,
}: {
  label: string;
  color?: string;
  to?: string;
}) {
  const style = color ? { color, backgroundColor: color + "14", borderColor: color + "30" } : undefined;
  if (to) {
    return (
      <Link to={to} className="chip" style={style}>
        {label}
      </Link>
    );
  }
  return (
    <span className="chip" style={style}>
      {label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="metric-card">
      <div className="metric-label">
        <span>{label}</span>
        <span className="metric-icon" style={{ color: color || "#2563eb" }}>
          {icon}
        </span>
      </div>
      <div className="metric-value">{typeof value === "number" ? value.toLocaleString() : value}</div>
    </div>
  );
}

export function Avatar({ name, color }: { name: string; color?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#0891b2", "#db2777"];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bg = color || colors[colorIndex];
  return (
    <div
      className="avatar-circle"
      style={{ backgroundColor: bg + "18", color: bg, borderColor: bg + "30" }}
    >
      {initials}
    </div>
  );
}

export function Table<T>({
  columns,
  rows,
  renderRow,
  onRowClick,
}: {
  columns: { label: string; width?: string }[];
  rows: T[];
  renderRow: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
}) {
  const gridTemplate = columns.map((col) => col.width || "1fr").join(" ");

  return (
    <div className="table-wrapper">
      <div className="table-head" style={{ gridTemplateColumns: gridTemplate }}>
        {columns.map((col) => (
          <div key={col.label}>
            {col.label}
          </div>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="table-empty">No results found</div>
      ) : (
        rows.map((row, i) => (
          <div
            key={i}
            className={`table-row ${onRowClick ? "clickable" : ""}`}
            onClick={() => onRowClick?.(row)}
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {renderRow(row)}
          </div>
        ))
      )}
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="pagination">
      <span>
        Showing {start}–{end} of {total.toLocaleString()}
      </span>
      <div className="page-buttons">
        {page > 1 && (
          <button className="page-button" onClick={() => onPageChange(page - 1)}>
            Previous
          </button>
        )}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum = i + 1;
          if (totalPages > 5 && page > 3) {
            pageNum = page - 2 + i;
            if (pageNum > totalPages) pageNum = totalPages - (4 - i);
          }
          return (
            <button
              key={pageNum}
              className={`page-button ${pageNum === page ? "active" : ""}`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}
        {page < totalPages && (
          <button className="page-button" onClick={() => onPageChange(page + 1)}>
            Next <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

export function Skeleton({ width, height, rounded, style }: { width?: string; height?: string; rounded?: boolean; style?: React.CSSProperties }) {
  return (
    <div
      className="skeleton"
      style={{
        width: width || "100%",
        height: height || "16px",
        borderRadius: rounded ? "50%" : "6px",
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card skeleton-card">
      <Skeleton width="50%" height="14px" />
      <Skeleton width="80%" height="24px" />
      <Skeleton width="40%" height="12px" />
    </div>
  );
}

export function SkeletonMetricGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="metric-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="metric-card" style={{ display: "grid", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton width="45%" height="12px" />
            <Skeleton width="20px" height="20px" rounded />
          </div>
          <Skeleton width="60%" height="28px" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="card" style={{ padding: "0", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: "14px" }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={`${100 / cols}%`} height="14px" />
        ))}
      </div>
      <div style={{ display: "grid", gap: "1px", background: "#f8fafc" }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ padding: "16px 18px", background: "#fff", display: "flex", gap: "14px", alignItems: "center" }}>
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} width={`${c === 0 ? "35%" : `${65 / (cols - 1)}%`}`} height="14px" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: "20px", display: "grid", gap: "12px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Skeleton width="40px" height="40px" style={{ borderRadius: "10px" }} />
            <div style={{ flex: 1, display: "grid", gap: "6px" }}>
              <Skeleton width="70%" height="16px" />
              <Skeleton width="40%" height="12px" />
            </div>
          </div>
          <Skeleton width="100%" height="32px" />
          <div style={{ display: "flex", gap: "6px" }}>
            <Skeleton width="60px" height="20px" />
            <Skeleton width="75px" height="20px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGraph({ height = 400, message = "Loading research connections..." }: { height?: number | string; message?: string }) {
  return (
    <div
      style={{
        height,
        background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        border: "1px dashed #cbd5e1",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Network size={36} style={{ color: "#3b82f6", opacity: 0.8 }} />
        <Loader2 size={56} className="spin-slow" style={{ position: "absolute", color: "#2563eb", opacity: 0.4 }} />
      </div>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>{message}</div>
      <Skeleton width="140px" height="6px" />
    </div>
  );
}

export function SkeletonDetailView() {
  return (
    <div className="detail-grid">
      <div style={{ display: "grid", gap: "16px" }}>
        <div className="card" style={{ padding: "20px", display: "grid", gap: "14px" }}>
          <Skeleton width="30%" height="18px" />
          <Skeleton width="100%" height="60px" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Skeleton width="70%" height="20px" />
            <Skeleton width="70%" height="20px" />
          </div>
        </div>
        <div className="card" style={{ padding: "20px", display: "grid", gap: "12px" }}>
          <Skeleton width="40%" height="18px" />
          <Skeleton width="100%" height="240px" />
        </div>
      </div>
      <div style={{ display: "grid", gap: "16px" }}>
        <div className="card" style={{ padding: "20px", display: "grid", gap: "12px" }}>
          <Skeleton width="50%" height="16px" />
          <Skeleton width="100%" height="100px" />
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this data. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-state">
      <div className="error-icon">!</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {onRetry && (
        <button className="button button-primary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="toolbar">{children}</div>;
}

export function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="select-filter">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SearchInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field search-field">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
