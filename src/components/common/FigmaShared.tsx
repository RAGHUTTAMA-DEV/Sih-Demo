import React from "react";
import { PERIODS } from "../../data/mockData";

export function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  const styles: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    gray: "bg-slate-100 text-slate-600 border-slate-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[color] || styles.gray}`}>
      {children}
    </span>
  );
}

export function StatRow({
  label,
  value,
  unit,
  color = "slate"
}: {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}) {
  const colors: Record<string, string> = {
    slate: "text-slate-800",
    green: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-600",
    blue: "text-blue-700",
    orange: "text-orange-600",
    purple: "text-purple-700",
  };
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-mono font-bold ${colors[color] || "text-slate-800"}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {value}{unit && <span className="font-normal text-slate-400 ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  badge
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
      <div>
        <div className="text-sm font-bold text-slate-900">{title}</div>
        {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
      </div>
      {badge}
    </div>
  );
}

export function PeriodSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
    >
      {Object.keys(PERIODS).map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
  action
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div>
          <div className="text-xs font-semibold text-slate-700">{title}</div>
          {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

export const ttStyle = {
  fontSize: 10,
  fontFamily: "'JetBrains Mono', monospace",
  border: "none",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  borderRadius: 8,
};

export const axTick = {
  fontSize: 8,
  fill: "#94a3b8",
  fontFamily: "'JetBrains Mono', monospace",
};
