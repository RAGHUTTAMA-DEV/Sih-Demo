import React from 'react';
import { X, Info, Layers, CheckCircle } from 'lucide-react';
import { WellState } from '../../types/simulation';

interface ComponentDetailModalProps {
  componentName: string | null;
  wellState: WellState;
  onClose: () => void;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  componentName,
  wellState,
  onClose
}) => {
  if (!componentName) return null;

  const getComponentDetails = (name: string) => {
    switch (name) {
      case 'Samson Post Frame':
      case 'Walking Beam':
      case 'Sucker Rod Pumpjack (SRP)':
      case 'Prime Mover & Gearbox':
      case 'Crank & Counterweights':
        return {
          title: 'Surface Beam Pumping Unit (SRP)',
          specs: [
            { label: 'Current Speed', value: `${wellState.spm.toFixed(1)} SPM` },
            { label: 'Stroke Length', value: `${wellState.strokeLength.toFixed(1)} m (${(wellState.strokeLength * 3.28).toFixed(1)} ft)` },
            { label: 'Peak Rod Load', value: `${wellState.maxRodLoad} klb` },
            { label: 'Min Rod Load', value: `${wellState.minRodLoad} klb` },
            { label: 'Gearbox Rating', value: 'API Size 320 Double Reduction' }
          ],
          description: 'Surface beam pumping unit reciprocating the sucker rod string to lift heavy crude from 1050m depth in the Baghewala field.'
        };
      case 'Surface Wellhead & Stuffing Box':
        return {
          title: 'Surface Wellhead & Stuffing Box',
          specs: [
            { label: 'Polished Rod Diameter', value: '1.5 inches' },
            { label: 'Stuffing Box Pressure', value: '450 psi rated' },
            { label: 'Flowline Pressure', value: '180 psi' },
            { label: 'Temperature', value: `${wellState.reservoirTemp > 100 ? 115 : 65}°C` }
          ],
          description: 'Seals polished rod reciprocation at surface and directs fluid flow into steam manifold and production line.'
        };
      case '2-7/8" Production Tubing String':
      case '7" Production Casing String':
      case 'Downhole Tubing & Heavy Crude':
      case '7/8" Sucker Rod String':
        return {
          title: 'Downhole Wellbore Cross-Section',
          specs: [
            { label: 'Fluid Viscosity', value: `${wellState.viscositycP} cP` },
            { label: 'Viscosity Index', value: wellState.fluidViscosityIndex.toFixed(3) },
            { label: 'Tubing Size', value: '2-7/8" EUE J-55' },
            { label: 'Casing Size', value: '7" 23# N-80' },
            { label: 'Wellbore Depth', value: '1,050 m (Compressed in 3D)' }
          ],
          description: 'Annular cross-section containing production tubing, sucker rod string, and flowing heavy crude with temperature-dependent viscosity.'
        };
      case 'CSS Steam Heated Zone':
      case 'Jodhpur Sandstone Formation (17-19° API Crude)':
        return {
          title: 'CSS Steam Heated Reservoir Zone',
          specs: [
            { label: 'Heated Radius', value: `${wellState.heatedZoneRadius} meters` },
            { label: 'Reservoir Temperature', value: `${wellState.reservoirTemp}°C` },
            { label: 'Formation', value: 'Jodhpur Sandstone (Heavy Oil)' },
            { label: 'Crude Gravity', value: '17–19° API' },
            { label: 'Current Phase', value: wellState.phase }
          ],
          description: 'Near-wellbore formation heated via Cyclic Steam Stimulation (CSS). Heat lowers viscosity of heavy crude to enable sucker rod pumping.'
        };
      default:
        return {
          title: name,
          specs: [
            { label: 'Component Status', value: 'OPERATIONAL' },
            { label: 'Telemetry Stream', value: 'ONLINE' }
          ],
          description: 'Digital Twin sub-system component linked to real-time physics engine.'
        };
    }
  };

  const details = getComponentDetails(componentName);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-scada-panel border border-cyan-500/40 rounded-xl shadow-2xl max-w-md w-full p-4 space-y-3 text-slate-100 font-mono">
        <div className="flex items-center justify-between border-b border-scada-border pb-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase text-cyan-300">{details.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{details.description}</p>

        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5 text-[10px]">
          {details.specs.map((spec, i) => (
            <div key={i} className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">{spec.label}:</span>
              <span className="font-bold text-amber-400">{spec.value}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
