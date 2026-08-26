import React from 'react';
import { AnomalyEvent } from '../../types/simulation';
import { Terminal, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface AnomalyLogPanelProps {
  events: AnomalyEvent[];
}

export const AnomalyLogPanel: React.FC<AnomalyLogPanelProps> = ({ events }) => {
  return (
    <div className="p-3 rounded-lg bg-scada-card border border-scada-border">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-scada-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
            SCADA Anomaly & Event Audit Log
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {events.length} events
        </span>
      </div>

      {/* EVENT LIST */}
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 font-mono text-[10px]">
        {events.length === 0 ? (
          <div className="text-slate-500 py-3 text-center italic">No events logged yet.</div>
        ) : (
          events.slice().reverse().map((evt) => (
            <div 
              key={evt.id} 
              className={`p-1.5 rounded border flex items-start gap-2 ${
                evt.severity === 'critical'
                  ? 'bg-red-950/60 border-red-500/50 text-red-200'
                  : evt.severity === 'warning'
                    ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300'
              }`}
            >
              {evt.severity === 'critical' ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
              ) : evt.severity === 'warning' ? (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              ) : (
                <Info className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 text-[9px] text-slate-400 mb-0.5">
                  <span className="font-bold text-slate-300">{evt.timestamp}</span>
                  <span className="px-1 rounded bg-slate-800 text-slate-300 uppercase">{evt.phase}</span>
                </div>
                <div className="truncate">{evt.message}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
