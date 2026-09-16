import { useEffect, useState } from "react";
import "./Dashboard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const authHeaders = () => {
  const token = localStorage.getItem("govaly_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "Last 30 days" },
];

const STAT_CARD_CONFIG = [
  { key: "orders", label: "Orders" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "delivered", label: "Delivered" },
  { key: "canceled", label: "Canceled" },
];

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */

const formatCompact = (value) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(abs % 1_000_000 === 0 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(abs % 1_000 === 0 ? 0 : 1)}K`;
  return String(value);
};

const formatCurrency = (value) => `৳${Math.round(value).toLocaleString("en-US")}`;

const niceCeiling = (value) => {
  if (value <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  let niceNormalized;
  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 5) niceNormalized = 5;
  else niceNormalized = 10;
  return niceNormalized * magnitude;
};

/* ------------------------------------------------------------------ */
/*  Stat card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({ label, count, amount }) {
  return (
    <div className="db-stat-card">
      <p className="db-stat-label">{label}</p>
      <div className="db-stat-row">
        <span className="db-stat-key">Total Number:</span>
        <span className="db-stat-value">{count}</span>
      </div>
      <div className="db-stat-row">
        <span className="db-stat-key">Amount:</span>
        <span className="db-stat-value">{amount.toLocaleString("en-US")}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trend chart — small self-contained SVG line + area chart with a    */
/*  hover tooltip, no external charting library required.              */
/* ------------------------------------------------------------------ */

function TrendChart({ title, chips, data }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const width = 640;
  const height = 230;
  const padding = { top: 16, right: 16, bottom: 28, left: 48 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const maxValue = niceCeiling(Math.max(...values, 1));
  const tickCount = 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => (maxValue / tickCount) * i).reverse();

  const points = data.map((d, i) => {
    const x = data.length > 1 ? padding.left + (i / (data.length - 1)) * innerWidth : padding.left;
    const y = padding.top + innerHeight - (d.value / maxValue) * innerHeight;
    return { x, y, ...d };
  });

  const linePath = points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const midX = (prev.x + point.x) / 2;
    return `${path} C ${midX} ${prev.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, "");

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${
          padding.top + innerHeight
        } Z`
      : "";

  const handleMouseMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * width;
    let closest = 0;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setHoverIndex(closest);
  };

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="db-chart-card">
      <div className="db-chart-header">
        <h3 className="db-chart-title">{title}</h3>
        {chips && (
          <div className="db-chart-chips">
            {chips.map((chip) => (
              <span className="db-chip" key={chip.label}>
                {chip.label}: {chip.value}
              </span>
            ))}
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="db-chart-svg"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {ticks.map((tickValue, i) => {
          const y = padding.top + (innerHeight / tickCount) * i;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} className="db-grid-line" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="db-axis-label">
                {formatCompact(tickValue)}
              </text>
            </g>
          );
        })}

        {points.map(
          (p, i) =>
            i % Math.ceil(points.length / 12) === 0 && (
              <text key={p.label} x={p.x} y={height - 6} textAnchor="middle" className="db-axis-label">
                {p.label}
              </text>
            )
        )}

        {areaPath && <path d={areaPath} className="db-area" />}
        {linePath && <path d={linePath} className="db-line" />}

        {hovered && (
          <>
            <line
              x1={hovered.x}
              y1={padding.top}
              x2={hovered.x}
              y2={padding.top + innerHeight}
              className="db-hover-line"
            />
            <circle cx={hovered.x} cy={hovered.y} r="4" className="db-hover-dot" />
          </>
        )}
      </svg>

      {hovered && (
        <div
          className="db-tooltip"
          style={{ left: `${(hovered.x / width) * 100}%`, top: `${(hovered.y / height) * 100}%` }}
        >
          <p className="db-tooltip-label">{hovered.label}</p>
          <p className="db-tooltip-value">{formatCurrency(hovered.value)}</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const [period, setPeriod] = useState("month");
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      setIsLoadingStats(true);
      try {
        const res = await fetch(`${API_BASE_URL}/admin/dashboard/stats?period=${period}`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load stats.");
        setStats(data.data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, [period]);

  useEffect(() => {
    const loadCharts = async () => {
      setIsLoadingCharts(true);
      try {
        const res = await fetch(`${API_BASE_URL}/admin/dashboard/charts`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load charts.");
        setCharts(data.data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setIsLoadingCharts(false);
      }
    };

    loadCharts();
  }, []);

  const gmvChips = charts?.gmvMonthly
    ? [
        {
          label: "Amount",
          value: `BDT ${charts.gmvMonthly.reduce((sum, d) => sum + d.value, 0).toLocaleString("en-US")}`,
        },
        { label: "Order", value: charts.gmvMonthly.reduce((sum, d) => sum + (d.orders || 0), 0) },
      ]
    : null;

  return (
    <div className="db-page">
      <h1 className="db-title">Overview</h1>

      <div className="db-period-row">
        <select className="db-period-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="db-error">{error}</p>}

      <div className="db-stat-grid">
        {isLoadingStats || !stats
          ? STAT_CARD_CONFIG.map((cfg) => (
              <div className="db-stat-card db-stat-card-loading" key={cfg.key}>
                Loading...
              </div>
            ))
          : STAT_CARD_CONFIG.map((cfg) => (
              <StatCard
                key={cfg.key}
                label={cfg.label}
                count={stats[cfg.key].count}
                amount={stats[cfg.key].amount}
              />
            ))}
      </div>

      {isLoadingCharts || !charts ? (
        <p className="db-loading">Loading charts...</p>
      ) : (
        <div className="db-chart-stack">
          <TrendChart title="GMV" chips={gmvChips} data={charts.gmvMonthly} />
          <TrendChart title="Net GMV" data={charts.gmvYearly} />
          <TrendChart title="Govaly Revenue" data={charts.revenueMonthly} />
          <TrendChart title="Net Govaly Revenue" data={charts.revenueYearly} />
          <TrendChart title="Vendor Earning" data={charts.vendorEarningMonthly} />
        </div>
      )}
    </div>
  );
}
