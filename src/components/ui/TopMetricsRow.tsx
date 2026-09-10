import React from 'react';
import { WellState } from '../../types/simulation';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';

interface TopMetricsRowProps {
  wellState: WellState;
}

export const TopMetricsRow: React.FC<TopMetricsRowProps> = ({ wellState }) => {
  const cards = [
    {
      title: 'OIL PRODUCTION',
      value: `${wellState.productionRate.toFixed(1)}`,
      unit: 'BOPD',
      subtext: '↑ 2.1 vs yesterday',
      bgColor: 'bg-[#E6F7ED]',
      borderColor: 'border-[#B8EBD0]',
      textColor: 'text-[#0E623B]',
      trendColor: 'text-[#0E623B]'
    },
    {
      title: 'RESERVOIR TEMP',
      value: `${wellState.reservoirTemp.toFixed(1)}`,
      unit: '°C',
      subtext: '↓ 1.2°C vs peak',
      bgColor: 'bg-[#FFF8E6]',
      borderColor: 'border-[#FEE3A2]',
      textColor: 'text-[#B45309]',
      trendColor: 'text-[#B45309]'
    },
    {
      title: 'OIL VISCOSITY',
      value: `${wellState.viscositycP.toLocaleString()}`,
      unit: 'cP',
      subtext: '↑ Cooling trend',
      bgColor: 'bg-[#FFF8E6]',
      borderColor: 'border-[#FEE3A2]',
      textColor: 'text-[#B45309]',
      trendColor: 'text-[#B45309]'
    },
    {
      title: 'PUMP FILLAGE',
      value: `${wellState.pumpFillagePercent}%`,
      unit: '',
      subtext: 'Target: 85%',
      bgColor: 'bg-[#EBF4FF]',
      borderColor: 'border-[#BFDBFE]',
      textColor: 'text-[#1D4ED8]',
      trendColor: 'text-[#1D4ED8]'
    },
    {
      title: 'SOR',
      value: `${wellState.sor.toFixed(1)}`,
      unit: '',
      subtext: '↓ 0.3 vs cycle avg',
      bgColor: 'bg-[#EBF4FF]',
      borderColor: 'border-[#BFDBFE]',
      textColor: 'text-[#1D4ED8]',
      trendColor: 'text-[#1D4ED8]'
    },
    {
      title: 'ENERGY',
      value: `${wellState.energyKwhPerBbl.toFixed(1)}`,
      unit: 'kWh/bbl',
      subtext: '↓ from 24.1',
      bgColor: 'bg-[#E6F7ED]',
      borderColor: 'border-[#B8EBD0]',
      textColor: 'text-[#0E623B]',
      trendColor: 'text-[#0E623B]'
    },
    {
      title: 'ROD FAILURE RISK',
      value: wellState.anomalyDetected ? 'MED' : 'LOW',
      unit: '',
      subtext: `${wellState.rodFailureRiskPercent}% probability`,
      bgColor: wellState.anomalyDetected ? 'bg-[#FEF2F2]' : 'bg-[#E6F7ED]',
      borderColor: wellState.anomalyDetected ? 'border-[#FCA5A5]' : 'border-[#B8EBD0]',
      textColor: wellState.anomalyDetected ? 'text-[#B91C1C]' : 'text-[#0E623B]',
      trendColor: wellState.anomalyDetected ? 'text-[#B91C1C]' : 'text-[#0E623B]'
    },
    {
      title: 'TWIN HEALTH',
      value: `${wellState.twinHealthPercent}%`,
      unit: '',
      subtext: '98 sensors active',
      bgColor: 'bg-[#E6F7ED]',
      borderColor: 'border-[#B8EBD0]',
      textColor: 'text-[#0E623B]',
      trendColor: 'text-[#0E623B]'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 p-3 bg-white border-b border-slate-200">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-2.5 rounded-xl border ${card.bgColor} ${card.borderColor} transition-all duration-200 hover:shadow-sm`}
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate mb-1">
            {card.title}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-black tracking-tight ${card.textColor}`}>
              {card.value}
            </span>
            {card.unit && <span className="text-[10px] font-bold text-slate-500">{card.unit}</span>}
          </div>
          <div className={`text-[10px] font-medium mt-0.5 truncate ${card.trendColor}`}>
            {card.subtext}
          </div>
        </div>
      ))}
    </div>
  );
};
