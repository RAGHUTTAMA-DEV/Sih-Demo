import React from 'react';
import { X, Flame, Droplets, Activity, Bot } from 'lucide-react';

interface LegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegendModal: React.FC<LegendModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-scada-panel border border-scada-border rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 text-slate-100 font-sans relative">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-scada-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-100">
                3D Visual Encoding & SCADA Legend
              </h2>
              <p className="text-xs text-slate-400">Guide for non-technical viewers & operations personnel</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ITEMS */}
        <div className="space-y-3 text-xs font-mono">
          {/* 1. RESERVOIR HEATED ZONE */}
          <div className="p-3 rounded bg-slate-900 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 mt-0.5">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-cyan-300 uppercase">1. Reservoir Heated Zone (CSS)</h3>
              <p className="text-slate-300 text-[11px] mt-0.5">
                The translucent sphere at the bottom represents steam heat penetration into the Jodhpur sandstone formation. <strong>Sphere radius = heated-zone radius (m)</strong>. Color pulses from bright orange-red (280°C steam) down to cyan (48°C ambient).
              </p>
            </div>
          </div>

          {/* 2. FLUID VISCOSITY GRADIENT */}
          <div className="p-3 rounded bg-slate-900 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded bg-amber-950 text-amber-400 border border-amber-500/30 mt-0.5">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-amber-300 uppercase">2. Fluid Viscosity Color Gradient</h3>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Fluid inside the production tubing changes color in real time based on viscosity. <strong>Bright Orange/Red = Hot mobile crude (&lt;60 cP)</strong>. As crude cools during production, it darkens to <strong>Dark Opaque Brown/Black (&gt;380 cP)</strong>.
              </p>
            </div>
          </div>

          {/* 3. DYNAMOMETER CARD GAP */}
          <div className="p-3 rounded bg-slate-900 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded bg-red-950 text-red-400 border border-red-500/30 mt-0.5">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-red-300 uppercase">3. Dynamometer Card Gap = Anomaly Severity</h3>
              <p className="text-slate-300 text-[11px] mt-0.5">
                The 2D and 3D ghost overlays display rod load vs stroke position. The <strong>dashed cyan line</strong> is the AI Twin's predicted baseline. The <strong>solid amber/red line</strong> is the live telemetry. A visible gap between them indicates rod floating & impact loading.
              </p>
            </div>
          </div>

          {/* 4. AI RECOMMENDATION BUTTON */}
          <div className="p-3 rounded bg-slate-900 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-300 uppercase">4. AI Prescriptive Control Button</h3>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Clicking <strong>"APPLY AI RECOMMENDATION"</strong> automatically adjusts SPM and stroke length in the physics model, reducing fluid drag, clearing rod floating, and restoring optimal pump efficiency.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-2 border-t border-scada-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs uppercase transition-colors"
          >
            Got It, Resume Demo
          </button>
        </div>
      </div>
    </div>
  );
};
