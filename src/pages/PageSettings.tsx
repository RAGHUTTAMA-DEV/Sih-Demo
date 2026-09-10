import React, { useState } from "react";
import {
  Badge,
  Card,
  CardHeader,
} from "../components/common/FigmaShared";

export function PageSettings() {
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true });
  const [thresholds, setThresholds] = useState({ tempLow: 55, tempHigh: 70, sorMax: 5.5, rodRisk: 20 });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Settings & System Configuration</h2>
        <p className="text-xs text-slate-400 mt-0.5">SCADA parameters · Alert limits · AI threshold boundaries · Telemetry calibration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Well Configuration" subtitle="BGW-07 static engineering specs" />
          <div className="p-4 space-y-3">
            {[
              ["Well Name", "BGW-07"],
              ["Field", "Baghewala, Rajasthan"],
              ["Formation", "Bikaner–Nagaur"],
              ["Total Depth", "310 m TVD"],
              ["Casing Size", "7 inch"],
              ["Tubing Size", "2.875 inch"],
              ["Rod Grade", "API Grade D"],
              ["Rod String Length", "310 m"],
              ["SRP Unit", "228-213-86"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500">{k}</span>
                <input
                  className="text-xs font-mono font-semibold text-slate-800 border border-slate-200 rounded-lg px-2 py-1 bg-white w-40 text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
                  defaultValue={v as string}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Alert Thresholds" subtitle="Trigger AI recommendations and alarms" />
          <div className="p-4 space-y-4">
            {[
              { label: "Min. Reservoir Temp (°C)", key: "tempLow", min: 40, max: 65, unit: "°C" },
              { label: "Max. Reservoir Temp (°C)", key: "tempHigh", min: 65, max: 85, unit: "°C" },
              { label: "Max SOR Threshold", key: "sorMax", min: 4, max: 8, unit: "" },
              { label: "Rod Risk Alert Level (%)", key: "rodRisk", min: 10, max: 40, unit: "%" },
            ].map(({ label, key, min, max, unit }) => (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">{label}</span>
                  <span className="font-mono font-bold text-blue-700">
                    {thresholds[key as keyof typeof thresholds]}{unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={thresholds[key as keyof typeof thresholds]}
                  onChange={(e) => setThresholds({ ...thresholds, [key]: parseFloat(e.target.value) })}
                  className="w-full h-1.5 rounded-full accent-blue-600 bg-slate-200 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>{min}{unit}</span>
                  <span>{max}{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Notification Settings" />
          <div className="p-4 space-y-4">
            {[
              { label: "Email Notifications", key: "email", desc: "r.sharma@cairnindia.com" },
              { label: "SMS Alerts", key: "sms", desc: "+91 98765 43210" },
              { label: "Push Notifications", key: "push", desc: "Mobile app · WellTwin AI" },
            ].map(({ label, key, desc }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <div className="text-xs font-semibold text-slate-700">{label}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notifications[key as keyof typeof notifications] ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                >
                  <div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
                    style={{ left: notifications[key as keyof typeof notifications] ? 24 : 4 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="AI Model Settings" badge={<Badge color="blue">v3.2.1</Badge>} />
          <div className="p-4 space-y-3">
            {[
              ["Model Version", "DT-Heavy-Oil v3.2.1"],
              ["Training Data", "2,847 well-days"],
              ["Last Retrained", "01 Sep 2026"],
              ["Prediction Horizon", "72 hours"],
              ["Update Frequency", "Real-time (14s)"],
              ["Confidence Threshold", "75%"],
              ["Formation Model", "Bikaner–Nagaur HO"],
              ["Auto-Apply Threshold", "90%"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500">{k}</span>
                <span className="text-xs font-mono font-semibold text-slate-700">{v as string}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={save}
          className={`px-6 py-2.5 text-xs font-semibold rounded-xl text-white transition-all cursor-pointer ${
            saved ? "bg-emerald-600" : "hover:opacity-90"
          }`}
          style={saved ? {} : { background: "#0a1628" }}
        >
          {saved ? "✓ Saved Changes" : "Save Settings"}
        </button>
        <button className="px-6 py-2.5 text-xs font-semibold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          Reset Defaults
        </button>
        <button className="px-6 py-2.5 text-xs font-semibold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          Export Config (JSON)
        </button>
      </div>
    </div>
  );
}
