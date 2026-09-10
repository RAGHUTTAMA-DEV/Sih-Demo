import React, { useState } from "react";
import {
  Badge,
  PeriodSelector,
  Card,
  CardHeader,
} from "../components/common/FigmaShared";

export function PageMaintenance() {
  const [period, setPeriod] = useState("Last 90 Days");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Predictive Maintenance</h2>
          <p className="text-xs text-slate-400 mt-0.5">BGW-07 · AI-powered equipment health monitoring · 98 active sensors</p>
        </div>
        <div className="flex gap-2 items-center">
          <PeriodSelector value={period} onChange={setPeriod} />
          <Badge color="green">All Systems Normal</Badge>
        </div>
      </div>

      {/* Equipment health grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { name: "Sucker Rod String", health: 93, risk: "LOW", color: "#10b981", next: "Dec 2026", icon: "≡" },
          { name: "Downhole Pump", health: 87, risk: "LOW", color: "#10b981", next: "Mar 2027", icon: "⚙" },
          { name: "VFD / Motor", health: 91, risk: "LOW", color: "#10b981", next: "Jun 2027", icon: "⚡" },
          { name: "Wellhead Assembly", health: 96, risk: "LOW", color: "#10b981", next: "Sep 2027", icon: "⬡" },
          { name: "Steam Generator", health: 78, risk: "MEDIUM", color: "#f59e0b", next: "Nov 2026", icon: "♨" },
          { name: "Surface Piping", health: 88, risk: "LOW", color: "#10b981", next: "Jan 2027", icon: "—" },
          { name: "Pressure Sensors", health: 95, risk: "LOW", color: "#10b981", next: "Ongoing", icon: "◎" },
          { name: "Flow Meters", health: 82, risk: "LOW", color: "#10b981", next: "Feb 2027", icon: "▷" },
        ].map(({ name, health, risk, color, next, icon }) => (
          <div key={name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg">{icon}</span>
              <Badge color={risk === "LOW" ? "green" : risk === "MEDIUM" ? "amber" : "red"}>{risk}</Badge>
            </div>
            <div className="text-xs font-semibold text-slate-800 mb-1">{name}</div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold font-mono" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{health}%</span>
              <span className="text-xs text-slate-400">health</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full mb-2">
              <div className="h-full rounded-full transition-all" style={{ width: `${health}%`, background: color }} />
            </div>
            <div className="text-xs text-slate-400">Next service: <span className="font-medium text-slate-600">{next}</span></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming maintenance */}
        <Card className="col-span-1">
          <CardHeader title="Upcoming Maintenance" subtitle="Scheduled events" />
          <div className="p-4 space-y-3">
            {[
              { date: "Nov 15, 2026", task: "Steam Generator Inspection", priority: "HIGH", component: "Boiler #1", badge: "red" },
              { date: "Dec 14, 2026", task: "Rod String Visual Check", priority: "ROUTINE", component: "Sucker Rods", badge: "blue" },
              { date: "Jan 08, 2027", task: "Flow Meter Calibration", priority: "ROUTINE", component: "Prod. Meter", badge: "blue" },
              { date: "Mar 22, 2027", task: "Pump Inspection", priority: "SCHEDULED", component: "Downhole Pump", badge: "gray" },
              { date: "Jun 10, 2027", task: "VFD / Motor Service", priority: "SCHEDULED", component: "VFD Panel", badge: "gray" },
            ].map(({ date, task, priority, component, badge }) => (
              <div key={task} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0">
                <div className="text-xs font-mono text-slate-400 whitespace-nowrap mt-0.5">{date}</div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-700">{task}</div>
                  <div className="text-xs text-slate-400">{component}</div>
                </div>
                <Badge color={badge}>{priority}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Maintenance alerts */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader title="AI Maintenance Alerts" badge={<Badge color="blue">ML Model v2.4</Badge>} />
          <div className="p-4 space-y-3">
            {[
              {
                component: "Steam Generator",
                alert: "Boiler tube fouling detected. Heat transfer efficiency reduced by 8.2% over last 30 days.",
                action: "Schedule descaling before Cycle 15 injection. Estimated 6-hour service window required.",
                risk: "MEDIUM",
                badge: "amber",
                prob: 68,
              },
              {
                component: "Sucker Rod String (Sect. 21–24)",
                alert: "Cumulative fatigue load approaching 80% of design limit. Viscosity increase will accelerate loading.",
                action: "Reduce SPM to 4.7 immediately. Plan rod inspection at Day 75.",
                risk: "LOW",
                badge: "green",
                prob: 7,
              },
              {
                component: "Downhole Pump Valve",
                alert: "Minor valve seat wear pattern detected from dynamometer card analysis.",
                action: "Monitor pump fillage closely. If fillage drops below 65%, schedule pump pull.",
                risk: "LOW",
                badge: "green",
                prob: 12,
              },
            ].map(({ component, alert, action, risk, badge, prob }) => (
              <div key={component} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-slate-800">{component}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">Failure prob: <span className="font-bold text-slate-700">{prob}%</span></span>
                    <Badge color={badge}>{risk}</Badge>
                  </div>
                </div>
                <div className="text-xs text-slate-600 mb-2">{alert}</div>
                <div className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                  <span className="font-semibold">Recommended: </span>{action}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Maintenance history */}
      <Card>
        <CardHeader title="Maintenance History" subtitle="All work orders · BGW-07" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Date", "Component", "Work Order", "Type", "Technician", "Duration", "Cost ₹", "Status"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["14 Sep 2026", "Rod String", "WO-2614", "Inspection", "R. Sharma", "4 hr", "12,400", "Complete"],
                ["02 Jul 2026", "Downhole Pump", "WO-2588", "Inspection", "P. Mehta", "6 hr", "18,200", "Complete"],
                ["18 Apr 2026", "Sucker Rods 1-3", "WO-2562", "Replacement", "R. Sharma", "8 hr", "46,800", "Complete"],
                ["05 Jan 2026", "Rod Section 22", "WO-2501", "Emergency", "A. Singh", "12 hr", "1,24,000", "Complete"],
                ["15 Nov 2025", "Steam Generator", "WO-2478", "Descaling", "S. Kumar", "6 hr", "32,600", "Complete"],
                ["10 Oct 2025", "VFD Panel", "WO-2451", "PM Service", "P. Mehta", "4 hr", "8,400", "Complete"],
              ].map(([date, ...rest], i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono text-slate-700">{date}</td>
                  {rest.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 text-slate-600">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
