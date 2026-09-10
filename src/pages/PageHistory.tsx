import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { PERIODS, genDailyData, genRodHistory, genSRPHistory } from "../data/mockData";
import {
  PeriodSelector,
  Card,
  CardHeader,
  ChartCard,
  ttStyle,
  axTick,
} from "../components/common/FigmaShared";

export function PageHistory() {
  const [period, setPeriod] = useState("Last 1 Year");
  const [dateFrom, setDateFrom] = useState("2025-09-10");
  const [dateTo, setDateTo] = useState("2026-09-10");
  const [metric, setMetric] = useState("All");
  const days = PERIODS[period] || 365;
  const data = useMemo(() => genDailyData(days), [days]);
  const rod = useMemo(() => genRodHistory(days), [days]);
  const srp = useMemo(() => genSRPHistory(days), [days]);

  const handleExportCSV = () => {
    const headers = "Date,Prod_BOPD,Temp_C,Viscosity_cP,BHP_bar,WC_pct,Energy_kWh_bbl,SOR,Fluid_Level_m\n";
    const rows = data.map(d => `${d.date},${d.prod},${d.temp},${d.visc},${d.bhp},${d.wc},${d.energy},${d.sor},${d.fluidLevel}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BGW-07_telemetry_${period.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Historical Data Archive</h2>
          <p className="text-xs text-slate-400 mt-0.5">BGW-07 · Full production history · All sensors and parameters</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs text-slate-500 font-medium">Period</label>
          <PeriodSelector value={period} onChange={setPeriod} />
          <label className="text-xs text-slate-500 font-medium">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label className="text-xs text-slate-500 font-medium">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {["All", "Production", "Reservoir", "SRP", "Energy", "Rod Health"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <button
            onClick={handleExportCSV}
            className="text-xs px-3.5 py-1.5 text-white rounded-lg font-medium hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
            style={{ background: "#0a1628" }}
          >
            <span>↓</span> Export CSV
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          ["Avg. Production", (data.reduce((a, d) => a + d.prod, 0) / data.length).toFixed(1), "BOPD", "text-slate-800"],
          ["Peak Production", Math.max(...data.map((d) => d.prod)).toFixed(1), "BOPD", "text-emerald-700"],
          ["Total Oil Produced", data.reduce((a, d) => a + d.prod, 0).toFixed(0), "bbl", "text-blue-700"],
          ["Avg. Reservoir Temp", (data.reduce((a, d) => a + d.temp, 0) / data.length).toFixed(1), "°C", "text-orange-600"],
          ["Avg. SOR", (data.reduce((a, d) => a + d.sor, 0) / data.length).toFixed(2), "", "text-purple-700"],
          ["Avg. Energy", (data.reduce((a, d) => a + d.energy, 0) / data.length).toFixed(1), "kWh/bbl", "text-blue-600"],
        ].map(([label, value, unit, color]) => (
          <div key={label as string} className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 truncate">{label as string}</div>
            <div className={`text-lg font-bold font-mono ${color as string}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {value as string} <span className="text-xs font-normal text-slate-400">{unit as string}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Multi-param chart */}
      <ChartCard title="Multi-Parameter History" subtitle="Production · Temperature · Viscosity · SOR — full selected period">
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(days / 9)} />
              <YAxis yAxisId="prod" tick={axTick} axisLine={false} tickLine={false} width={28} domain={[20, 65]} />
              <YAxis yAxisId="temp" orientation="right" tick={axTick} axisLine={false} tickLine={false} width={28} domain={[40, 80]} />
              <Tooltip contentStyle={ttStyle} />
              <Legend wrapperStyle={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }} />
              <Area yAxisId="prod" type="monotone" dataKey="prod" stroke="#0a1628" strokeWidth={2} fill="#0a162818" dot={false} name="Oil BOPD" isAnimationActive={false} />
              <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={1.5} dot={false} name="Temp °C" isAnimationActive={false} />
              <Line yAxisId="prod" type="monotone" dataKey="sor" stroke="#7c3aed" strokeWidth={1.5} dot={false} name="SOR" strokeDasharray="4 2" isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="SRP Performance History" subtitle="SPM · Fillage · VFD over time">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={srp}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(srp.length / 6)} />
                <YAxis yAxisId="l" tick={axTick} axisLine={false} tickLine={false} width={28} domain={[2, 10]} />
                <YAxis yAxisId="r" orientation="right" tick={axTick} axisLine={false} tickLine={false} width={28} domain={[40, 100]} />
                <Tooltip contentStyle={ttStyle} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }} />
                <Line yAxisId="l" type="monotone" dataKey="spm" stroke="#0a1628" strokeWidth={1.5} dot={false} name="SPM" isAnimationActive={false} />
                <Area yAxisId="r" type="monotone" dataKey="fillage" stroke="#0ea5e9" strokeWidth={1.5} fill="#e0f2fe" fillOpacity={0.5} dot={false} name="Fillage %" isAnimationActive={false} />
                <Bar yAxisId="l" dataKey="vfd" fill="#7c3aed" opacity={0.4} radius={[1, 1, 0, 0]} name="VFD Hz" maxBarSize={6} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Rod Risk & Energy History" subtitle="% risk · kWh/bbl over time">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rod}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(rod.length / 6)} />
                <YAxis yAxisId="l" tick={axTick} axisLine={false} tickLine={false} width={28} domain={[0, 30]} />
                <Tooltip contentStyle={ttStyle} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }} />
                <Area yAxisId="l" type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2} fill="#fef9c3" fillOpacity={0.7} dot={false} name="Rod Risk %" isAnimationActive={false} />
                <Line yAxisId="l" type="monotone" dataKey="load" stroke="#0a1628" strokeWidth={1.5} dot={false} name="Rod Load kN" isAnimationActive={false} />
                <ReferenceLine yAxisId="l" y={15} stroke="#f97316" strokeDasharray="3 2" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Raw data table */}
      <Card>
        <CardHeader
          title="Raw Data Table"
          subtitle={`${data.length} records · ${period}`}
          badge={
            <button
              onClick={handleExportCSV}
              className="text-xs px-3 py-1.5 text-white rounded-lg font-medium hover:opacity-90 cursor-pointer"
              style={{ background: "#0a1628" }}
            >
              Export
            </button>
          }
        />
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="border-b border-slate-100">
                {["Date", "Prod BOPD", "Temp °C", "Viscosity cP", "BHP bar", "WC %", "Energy kWh/bbl", "SOR", "Fluid Level m"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono text-slate-700">{d.date}</td>
                  <td className="px-4 py-2 font-mono font-semibold text-emerald-700">{d.prod}</td>
                  <td className="px-4 py-2 font-mono text-orange-600">{d.temp}</td>
                  <td className="px-4 py-2 font-mono text-amber-700">{d.visc.toLocaleString()}</td>
                  <td className="px-4 py-2 font-mono">{d.bhp}</td>
                  <td className="px-4 py-2 font-mono text-blue-600">{d.wc.toFixed(1)}</td>
                  <td className="px-4 py-2 font-mono text-blue-700">{d.energy}</td>
                  <td className="px-4 py-2 font-mono text-purple-700">{d.sor}</td>
                  <td className="px-4 py-2 font-mono">{d.fluidLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
