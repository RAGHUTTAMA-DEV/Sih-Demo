import React, { useState } from "react";
import {
  Badge,
  Card,
  CardHeader,
} from "../components/common/FigmaShared";

interface PageAIProps {
  onApplyAIAction?: (actionName: string) => void;
  onOpenWhatIf?: () => void;
}

export function PageAI({ onApplyAIAction, onOpenWhatIf }: PageAIProps) {
  const [activeRec, setActiveRec] = useState(0);
  const [appliedRecs, setAppliedRecs] = useState<number[]>([]);

  const recs = [
    {
      id: 1,
      priority: "HIGH",
      status: "Action Required",
      badge: "red",
      title: "Advance CSS Cycle 15 by 3 Days",
      rationale:
        "Reservoir temperature has declined 3.2°C over the last 8 days. Viscosity is rising, and production is projected to fall below economic cut-off in 9 days if no action is taken.",
      impact: [
        ["Production gain", "+4.4 BOPD", "text-emerald-700"],
        ["SOR improvement", "4.8 → 4.4", "text-emerald-700"],
        ["Energy saving", "−1.8 kWh/bbl", "text-emerald-700"],
        ["Revenue uplift", "₹6,200/cycle", "text-emerald-700"],
      ],
      parameters: [
        ["Steam Volume", "120 → 115 m³"],
        ["Soak Time", "36 → 33 hr"],
        ["Timing", "3 days earlier"],
      ],
      confidence: 91,
    },
    {
      id: 2,
      priority: "MEDIUM",
      status: "Recommended",
      badge: "amber",
      title: "Reduce SRP Speed: 5.2 → 4.7 SPM",
      rationale:
        "Pump fillage at 78% indicates partial pump loading. Reducing SPM will improve fillage to ~86%, reduce rod loading by 8%, and extend rod fatigue life. VFD frequency should be reduced from 42 Hz to 38 Hz.",
      impact: [
        ["Pump fillage", "78% → 86%", "text-emerald-700"],
        ["Rod load reduction", "−8%", "text-emerald-700"],
        ["Rod risk reduction", "7% → 4%", "text-emerald-700"],
        ["Energy saving", "−0.9 kWh/bbl", "text-emerald-700"],
      ],
      parameters: [
        ["SPM", "5.2 → 4.7"],
        ["VFD Frequency", "42 → 38 Hz"],
        ["Expected fillage", "~86%"],
      ],
      confidence: 88,
    },
    {
      id: 3,
      priority: "LOW",
      status: "Monitoring",
      badge: "blue",
      title: "Optimize Steam Injection Pressure",
      rationale:
        "Historical analysis of 13 CSS cycles shows injection pressure of 8.1 bar achieves better reservoir penetration than current 8.4 bar, with lower steam fingering. This could reduce SOR by up to 5%.",
      impact: [
        ["SOR improvement", "4.8 → 4.6", "text-emerald-700"],
        ["Steam saving", "~8 m³/cycle", "text-emerald-700"],
        ["Coverage improvement", "+6% area", "text-emerald-700"],
        ["Risk", "LOW — tested in 4 cycles", "text-slate-500"],
      ],
      parameters: [
        ["Injection Pressure", "8.4 → 8.1 bar"],
        ["Steam Volume", "120 → 118 m³"],
        ["Rate", "48 → 50 m³/day"],
      ],
      confidence: 76,
    },
    {
      id: 4,
      priority: "LOW",
      status: "Informational",
      badge: "gray",
      title: "Schedule Steam Generator Descaling",
      rationale:
        "Boiler heat transfer efficiency has dropped 8.2% over 30 days, indicating tube fouling. Descaling in next maintenance window before Cycle 15 injection will restore steam quality from 0.80 to 0.84.",
      impact: [
        ["Steam quality", "0.80 → 0.84", "text-emerald-700"],
        ["Boiler efficiency", "+8.2%", "text-emerald-700"],
        ["Fuel saving", "~₹4,400/month", "text-emerald-700"],
        ["Downtime", "6 hr planned", "text-slate-500"],
      ],
      parameters: [
        ["Service date", "Before Cycle 15"],
        ["Duration", "6 hours"],
        ["Type", "Chemical descaling"],
      ],
      confidence: 94,
    },
  ];

  const rec = recs[activeRec];
  const isApplied = appliedRecs.includes(rec.id);

  const handleApply = (id: number, title: string) => {
    if (!appliedRecs.includes(id)) {
      setAppliedRecs([...appliedRecs, id]);
    }
    if (onApplyAIAction) {
      onApplyAIAction(title);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">AI Prescriptive Recommendations</h2>
          <p className="text-xs text-slate-400 mt-0.5">BGW-07 · Digital Twin model v3.2 · Updated 14s ago</p>
        </div>
        <Badge color="green">4 Active Recommendations</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        {/* Rec list */}
        <div className="flex flex-col gap-2">
          {recs.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setActiveRec(i)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                activeRec === i
                  ? "border-blue-300 bg-blue-50/70 shadow-xs"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Badge color={r.badge}>{r.priority}</Badge>
                <span className="text-xs font-mono text-slate-400">{r.confidence}%</span>
              </div>
              <div className="text-xs font-semibold text-slate-800 leading-snug">{r.title}</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{r.status}</span>
                {appliedRecs.includes(r.id) && (
                  <span className="text-emerald-700 font-semibold font-mono">✓ Executed</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Rec detail */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge color={rec.badge}>{rec.priority}</Badge>
                <span className="text-xs text-slate-400">{rec.status}</span>
                {isApplied && <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Action Applied</span>}
              </div>
              <div className="text-base font-bold text-slate-900">{rec.title}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Model Confidence</div>
              <div className="text-xl font-bold font-mono text-emerald-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {rec.confidence}%
              </div>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Technical Rationale</div>
                <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  {rec.rationale}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Prescribed Parameters</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {rec.parameters.map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
                      <div className="text-[11px] text-slate-400">{k}</div>
                      <div className="text-sm font-mono font-bold text-blue-700 mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  onClick={() => handleApply(rec.id, rec.title)}
                  disabled={isApplied}
                  className={`px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-xs transition-all ${
                    isApplied ? "bg-emerald-600 opacity-90 cursor-default" : "hover:opacity-90 cursor-pointer"
                  }`}
                  style={isApplied ? {} : { background: "#0a1628" }}
                >
                  {isApplied ? "✓ Recommendation Applied" : "Execute Recommendation"}
                </button>
                <button
                  onClick={onOpenWhatIf}
                  className="px-4 py-2.5 text-xs font-semibold border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  Simulate in What-If
                </button>
                <button className="px-4 py-2.5 text-xs font-semibold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
                  Schedule Window
                </button>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Expected Net Impact</div>
              <div className="space-y-2 bg-white rounded-xl border border-slate-200 p-3.5">
                {rec.impact.map(([k, v, c]) => (
                  <div key={k} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-xs text-slate-500">{k}</span>
                    <span className={`text-xs font-mono font-bold ${c}`}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                <div className="text-xs font-semibold text-slate-500 mb-2">Model Accuracy Score</div>
                {[
                  ["Telemetry Data Quality", "96%"],
                  ["Kinematic Model Fit", "89%"],
                  ["Historical Validation", "88%"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">{k}</span>
                    <span className="font-mono font-semibold text-slate-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendation history */}
      <Card>
        <CardHeader title="Recommendation Audit Log" subtitle="Applied, scheduled, and dismissed actions" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Date", "Recommendation", "Action", "Result", "Production Impact", "Status"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["28 Aug 2026", "Reduce SPM from 5.6 to 5.2", "Applied", "Pump fillage: 72% → 78%", "+2.1 BOPD", "Success"],
                ["12 Aug 2026", "Advance Cycle 13 by 2 days", "Applied", "Temp recovered +4.2°C", "+3.8 BOPD", "Success"],
                ["01 Jul 2026", "Increase steam volume to 125 m³", "Applied", "SOR increased 0.3", "−0.5 BOPD", "Partial"],
                ["15 Jun 2026", "Reduce injection pressure 8.6 → 8.2", "Applied", "Better reservoir sweep", "+1.2 BOPD", "Success"],
                ["20 May 2026", "Change stroke length to 108 in", "Dismissed", "N/A", "N/A", "Dismissed"],
              ].map(([date, ...rest], i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono text-slate-700">{date}</td>
                  {rest.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-4 py-2.5 ${
                        j === 3
                          ? (cell as string).startsWith("+")
                            ? "text-emerald-700 font-semibold"
                            : (cell as string).startsWith("−")
                            ? "text-red-500 font-semibold"
                            : "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      {cell}
                    </td>
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
