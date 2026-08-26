import React from 'react';
import { Bot, CheckCircle2, Zap, ArrowRight, ShieldCheck, AlertOctagon } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AIRecommendationCardProps {
  isAnomaly: boolean;
  anomalyMessage: string | null;
  currentSpm: number;
  currentStroke: number;
  viscositycP: number;
  aiApplied: boolean;
  onApplyRecommendation: () => void;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  isAnomaly,
  anomalyMessage,
  currentSpm,
  currentStroke,
  viscositycP,
  aiApplied,
  onApplyRecommendation
}) => {
  const handleApply = () => {
    // Trigger celebratory confetti blast
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#06b6d4', '#10b981']
    });
    onApplyRecommendation();
  };

  return (
    <div className={`p-3.5 rounded-lg border transition-all duration-300 ${
      isAnomaly 
        ? 'bg-gradient-to-br from-red-950/70 via-slate-900 to-amber-950/50 border-red-500/80 shadow-xl shadow-red-950/60 anomaly-alert-card' 
        : aiApplied 
          ? 'bg-gradient-to-br from-emerald-950/50 via-slate-900 to-cyan-950/30 border-emerald-500/60'
          : 'bg-scada-card border-scada-border'
    }`}>
      {/* CARD HEADER */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${isAnomaly ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-100 uppercase flex items-center gap-1.5">
              <span>AI PRESCRIPTIVE OPTIMIZATION</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                TWIN ENGINE v2.4
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">Real-time Sucker Rod Pump load & viscosity optimizer</p>
          </div>
        </div>

        {aiApplied && (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> OPTIMIZED
          </span>
        )}
      </div>

      {/* ANOMALY ALERT BANNER */}
      {isAnomaly ? (
        <div className="space-y-2.5">
          <div className="p-2.5 rounded bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-mono">
            <div className="flex items-center gap-1.5 font-bold text-red-400 mb-1">
              <AlertOctagon className="w-4 h-4 animate-bounce" />
              <span>ROD FLOATING ANOMALY DETECTED</span>
            </div>
            <p className="text-[11px] leading-relaxed text-red-200">
              Cooling crude elevated pump-intake viscosity to <strong className="text-white">{viscositycP} cP</strong>. Downhole plunger speed exceeds fluid fall rate at <strong className="text-white">{currentSpm.toFixed(1)} SPM</strong>, causing severe rod float & load spikes.
            </p>
          </div>

          {/* PROMINENT RECOMMENDATION BOX */}
          <div className="p-2.5 rounded bg-amber-950/50 border border-amber-500/50 text-amber-100 text-xs font-mono">
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Recommended Control Action:
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-red-400 line-through">{currentSpm.toFixed(1)} SPM</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/40">5.5 SPM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-red-400 line-through">{currentStroke.toFixed(1)}m</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/40">2.4m</span>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={handleApply}
              className="w-full py-2 px-3 rounded-md bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transform active:scale-98 transition-all"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>APPLY AI RECOMMENDATION NOW</span>
            </button>
          </div>
        </div>
      ) : aiApplied ? (
        <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs font-mono flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-bold text-emerald-300">AI Control Applied & Verified</div>
            <div className="text-[10px] text-slate-300">
              Pump speed reduced to 5.5 SPM. Downhole fluid drag normalized; rod floating completely eliminated.
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="text-[11px]">System operating within normal AI twin physics bounds. Monitoring fluid viscosity trends...</span>
        </div>
      )}
    </div>
  );
};
