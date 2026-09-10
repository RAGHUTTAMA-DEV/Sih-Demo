// Historical datasets and mock generators for SCADA Digital Twin

export const PERIODS: Record<string, number> = {
  "Last 7 Days": 7,
  "Last 30 Days": 30,
  "Last 90 Days": 90,
  "Last 6 Months": 180,
  "Last 1 Year": 365,
  "All Time": 730,
};

export interface DailyDataPoint {
  date: string;
  day: number;
  temp: number;
  prod: number;
  visc: number;
  sor: number;
  energy: number;
  rod: number;
  bhp: number;
  wc: number;
  fluidLevel: number;
}

export function genDailyData(days: number): DailyDataPoint[] {
  const arr: DailyDataPoint[] = [];
  let temp = 58, prod = 38, visc = 22000, sor = 5.5, energy = 24.5, rod = 4, bhp = 13.2, wc = 18;
  for (let i = days; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    // simulate CSS cycles every ~20 days
    const cyclePhase = (days - i) % 22;
    if (cyclePhase < 3) { temp += 2.1; visc -= 1200; }
    else if (cyclePhase < 5) { temp += 0.5; }
    else if (cyclePhase < 12) { prod += 0.4; temp -= 0.3; sor -= 0.03; }
    else { temp -= 0.25; prod -= 0.2; visc += 180; sor += 0.04; }
    temp = Math.max(52, Math.min(70, temp + (Math.random() - 0.5) * 0.6));
    prod = Math.max(28, Math.min(56, prod + (Math.random() - 0.5) * 0.8));
    visc = Math.max(14000, Math.min(28000, visc + (Math.random() - 0.5) * 300));
    sor = Math.max(3.8, Math.min(6.5, sor + (Math.random() - 0.5) * 0.07));
    energy = Math.max(18, Math.min(28, 0.45 * (visc / 1000) + 10.5 + (Math.random() - 0.5) * 0.4));
    rod = Math.max(2, Math.min(22, rod + (Math.random() - 0.5) * 0.5 + (visc > 21000 ? 0.15 : -0.1)));
    bhp = Math.max(11, Math.min(17, 13.5 - (temp - 58) * 0.05 + (Math.random() - 0.5) * 0.2));
    wc = Math.max(10, Math.min(35, 18 + (days - i) * 0.02 + (Math.random() - 0.5) * 1.2));
    arr.push({
      date: label, day: days - i + 1,
      temp: +temp.toFixed(1), prod: +prod.toFixed(1),
      visc: Math.round(visc), sor: +sor.toFixed(2),
      energy: +energy.toFixed(1), rod: +rod.toFixed(1),
      bhp: +bhp.toFixed(1), wc: +wc.toFixed(1),
      fluidLevel: Math.round(130 + (visc - 18000) / 400 + Math.random() * 8),
    });
  }
  return arr;
}

export interface CSSCycle {
  cycle: string;
  steamVol: number;
  injPress: number;
  soakTime: number;
  peakProd: number;
  sor: number;
  duration: number;
}

export function genCSSCycles(): CSSCycle[] {
  return Array.from({ length: 14 }, (_, i) => ({
    cycle: `C${i + 1}`,
    steamVol: Math.round(110 + (Math.random() - 0.5) * 30),
    injPress: +(8.0 + (Math.random() - 0.5) * 1.2).toFixed(1),
    soakTime: Math.round(32 + (Math.random() - 0.5) * 10),
    peakProd: +(42 + i * 0.5 + (Math.random() - 0.5) * 4).toFixed(1),
    sor: +(5.2 - i * 0.03 + (Math.random() - 0.5) * 0.3).toFixed(2),
    duration: Math.round(18 + (Math.random() - 0.5) * 8),
  }));
}

export interface RodHistoryPoint {
  date: string;
  risk: number;
  load: number;
  tension: number;
  compression: number;
}

export function genRodHistory(days: number): RodHistoryPoint[] {
  const arr: RodHistoryPoint[] = [];
  let risk = 4, load = 18.4, tension = 32, compression = 12;
  for (let i = days; i >= 0; i -= Math.max(1, Math.ceil(days / 60))) {
    const d = new Date(); d.setDate(d.getDate() - i);
    risk = Math.max(2, Math.min(25, risk + (Math.random() - 0.45) * 0.8));
    load = Math.max(15, Math.min(24, load + (Math.random() - 0.5) * 0.4));
    tension = Math.max(28, Math.min(40, tension + (Math.random() - 0.5) * 0.8));
    compression = Math.max(8, Math.min(18, compression + (Math.random() - 0.5) * 0.5));
    arr.push({
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      risk: +risk.toFixed(1), load: +load.toFixed(1),
      tension: +tension.toFixed(1), compression: +compression.toFixed(1),
    });
  }
  return arr;
}

export interface SRPHistoryPoint {
  date: string;
  spm: number;
  fillage: number;
  vfd: number;
  amps: number;
}

export function genSRPHistory(days: number): SRPHistoryPoint[] {
  const arr: SRPHistoryPoint[] = [];
  let spm = 5.2, fillage = 78, vfd = 42, amps = 38;
  for (let i = days; i >= 0; i -= Math.max(1, Math.ceil(days / 60))) {
    const d = new Date(); d.setDate(d.getDate() - i);
    spm = Math.max(3.5, Math.min(7, spm + (Math.random() - 0.5) * 0.15));
    fillage = Math.max(60, Math.min(95, fillage + (Math.random() - 0.5) * 1.5));
    vfd = Math.max(35, Math.min(55, vfd + (Math.random() - 0.5) * 1));
    amps = Math.max(30, Math.min(48, amps + (Math.random() - 0.5) * 1));
    arr.push({
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      spm: +spm.toFixed(2), fillage: Math.round(fillage),
      vfd: Math.round(vfd), amps: +amps.toFixed(1),
    });
  }
  return arr;
}

export const CSS_CYCLES = genCSSCycles();

export const DYN_DATA = [
  { pos: 0, load: 18 }, { pos: 10, load: 21 }, { pos: 20, load: 27 },
  { pos: 30, load: 31 }, { pos: 40, load: 33.5 }, { pos: 50, load: 33.8 },
  { pos: 60, load: 30 }, { pos: 70, load: 24 }, { pos: 80, load: 20 },
  { pos: 90, load: 16.5 }, { pos: 100, load: 18 },
];
