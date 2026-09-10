import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { genDailyData } from "../data/mockData";
import {
  Badge,
  StatRow,
  Card,
  CardHeader,
  ChartCard,
  ttStyle,
  axTick,
} from "../components/common/FigmaShared";

export function PageOverview() {
  const data14 = genDailyData(14);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Field Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">Baghewala Field · 4 active wells · CSS Programme active</p>
        </div>
        <Badge color="green">All Wells Operational</Badge>
      </div>

      {/* All wells grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { well: "BGW-07", phase: "PROD", prod: 48.6, temp: 62.4, sor: 4.8, fillage: 78, color: "border-emerald-300 bg-emerald-50" },
          { well: "BGW-09", phase: "SOAK", prod: 41.2, temp: 58.8, sor: 5.1, fillage: 72, color: "border-amber-300 bg-amber-50" },
          { well: "BGW-12", phase: "STEAM", prod: 36.8, temp: 54.2, sor: 5.4, fillage: 68, color: "border-orange-300 bg-orange-50" },
          { well: "BGW-15", phase: "IDLE", prod: 0, temp: 49.2, sor: 0, fillage: 0, color: "border-slate-200 bg-slate-50" },
        ].map(({ well, phase, prod, temp, sor, fillage, color }) => (
          <div key={well} className={`rounded-xl border p-4 shadow-2xs ${color}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-slate-900">{well}</div>
              <Badge color={phase === "PROD" ? "green" : phase === "SOAK" ? "amber" : phase === "STEAM" ? "orange" : "gray"}>
                {phase}
              </Badge>
            </div>
            <StatRow label="Production" value={prod > 0 ? prod : "—"} unit={prod > 0 ? "BOPD" : ""} color="green" />
            <StatRow label="Res. Temp" value={temp} unit="°C" color="orange" />
            <StatRow label="SOR" value={sor > 0 ? sor : "—"} color="purple" />
            <StatRow label="Pump Fillage" value={fillage > 0 ? fillage + "%" : "—"} color="blue" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Field Production (Last 14 days)" subtitle="All wells combined BOPD">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data14.map((d) => ({ ...d, total: +(d.prod * 1.28).toFixed(1) }))}>
                <defs>
                  <linearGradient id="gfield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a1628" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0a1628" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="total" stroke="#0a1628" strokeWidth={2} fill="url(#gfield)" name="Field BOPD" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Field SOR Comparison" subtitle="Per well · Latest CSS cycle">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ well: "BGW-07", sor: 4.8 }, { well: "BGW-09", sor: 5.1 }, { well: "BGW-12", sor: 5.4 }, { well: "BGW-15", sor: 0 }]}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis dataKey="well" tick={axTick} axisLine={false} tickLine={false} />
                <YAxis tick={axTick} axisLine={false} tickLine={false} width={30} domain={[0, 7]} />
                <Tooltip contentStyle={ttStyle} />
                <Bar dataKey="sor" fill="#7c3aed" radius={[4, 4, 0, 0]} name="SOR" />
                <ReferenceLine y={4.8} stroke="#10b981" strokeDasharray="3 2" label={{ value: "Target", fontSize: 8, fill: "#10b981" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Today's Field Summary" />
          <div className="p-4">
            <StatRow label="Total Field Production" value="126.6" unit="BOPD" color="green" />
            <StatRow label="Active Wells" value="3" unit="/ 4" color="blue" />
            <StatRow label="Wells in Steam" value="1" unit="(BGW-12)" color="orange" />
            <StatRow label="Wells in Soak" value="1" unit="(BGW-09)" color="amber" />
            <StatRow label="Field Energy" value="21.8" unit="kWh/bbl avg" color="blue" />
            <StatRow label="Field SOR" value="5.1" unit="avg" color="purple" />
            <StatRow label="Sensor Coverage" value="98.2" unit="%" color="green" />
            <StatRow label="Twin Health" value="96" unit="%" color="green" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Active Alerts" badge={<Badge color="amber">2 Alerts</Badge>} />
          <div className="p-4 space-y-3">
            {[
              { msg: "BGW-07: Reservoir cooling trend — viscosity increase predicted", level: "amber" },
              { msg: "BGW-12: Steam injection pressure 0.3 bar above optimal", level: "amber" },
              { msg: "BGW-09: Soak phase optimal. Production start in ~18 hr", level: "blue" },
              { msg: "All rod strings: Normal fatigue status", level: "green" },
            ].map(({ msg, level }) => (
              <div
                key={msg}
                className={`rounded-lg p-2.5 text-xs ${
                  level === "amber"
                    ? "bg-amber-50 border border-amber-200 text-amber-800"
                    : level === "green"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-blue-50 border border-blue-200 text-blue-800"
                }`}
              >
                {msg}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="CSS Programme Status" />
          <div className="p-4 space-y-2">
            {[
              { well: "BGW-07", cycle: "C14", phase: "Production", day: "Day 12/21", color: "bg-emerald-100 text-emerald-700" },
              { well: "BGW-09", cycle: "C13", phase: "Soak", day: "Day 2/3", color: "bg-amber-100 text-amber-700" },
              { well: "BGW-12", cycle: "C12", phase: "Steam Inj.", day: "Day 1/3", color: "bg-orange-100 text-orange-700" },
              { well: "BGW-15", cycle: "—", phase: "Idle", day: "Next: Oct 5", color: "bg-slate-100 text-slate-500" },
            ].map(({ well, cycle, phase, day, color }) => (
              <div key={well} className={`rounded-lg px-3 py-2.5 ${color}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{well}</span>
                  <span className="text-xs font-mono">{cycle}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs font-medium">{phase}</span>
                  <span className="text-xs">{day}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
