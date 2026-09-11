# 🛢️ AI-Powered Digital Twin — CSS Heavy Oil Well (BGW-07)
### Smart India Hackathon 2024 — Prototype Documentation

> **Project:** Real-time AI Digital Twin for Cyclic Steam Stimulation (CSS) Heavy Oil Wells
> **Well:** BGW-07 · Baghewala Field, Rajasthan, India
> **Operator Context:** ONGC Heavy Oil Production — Jodhpur Sandstone Reservoir (17–19° API Crude)
> **Stack:** React + TypeScript + Vite · Three.js / React Three Fiber · Recharts · Tailwind CSS

---

## Table of Contents

1. [Project Concept & Problem Statement](#1-project-concept--problem-statement)
2. [Technology Stack](#2-technology-stack)
3. [Application Architecture](#3-application-architecture)
4. [Core Data Model — WellState](#4-core-data-model--wellstate)
5. [Simulation Engine](#5-simulation-engine)
6. [What-If Physics Engine](#6-what-if-physics-engine)
7. [3D Digital Twin Scene](#7-3d-digital-twin-scene)
8. [All 12 SCADA Pages](#8-all-12-scada-pages)
9. [Mock Data & Historical Generators](#9-mock-data--historical-generators)
10. [UI Shell — Header, Sidebar & Navigation](#10-ui-shell)
11. [How Everything Works Together](#11-data-flow)
12. [File Structure Reference](#12-file-structure)
13. [Quick Start](#quick-start)
14. [Glossary](#glossary)

---

## 1. Project Concept & Problem Statement

### What is a Digital Twin?
A **Digital Twin** is a real-time virtual replica of a physical asset. This one mirrors a heavy oil CSS well — its sensor data, thermodynamics, and mechanical state — so engineers can monitor, simulate, and optimize without touching the actual field equipment.

### The Real Problem
ONGC operates hundreds of **heavy oil wells** in the Baghewala field, Rajasthan. These wells produce **17–19 API crude oil** — extremely thick (18,000–28,000 cP at reservoir temperature). To make the oil flow, engineers use:

**CSS — Cyclic Steam Stimulation**
1. **INJECTION** — Pump high-pressure steam (~280°C) down the wellbore into the reservoir
2. **SOAK** — Wait 12–72 hours for reservoir to absorb heat and viscosity to drop
3. **PRODUCTION** — Pump the now-mobile hot oil to surface using a Sucker Rod Pump (SRP)

### Current Challenges

| Problem | Impact |
|---|---|
| No real-time reservoir thermal visibility | Blind steam injection, wasted energy |
| High SOR (Steam-Oil Ratio) — 4.8+ m3/m3 | Huge operational cost per barrel |
| Rod failures from viscous heavy oil | Costly workovers, production loss |
| No what-if scenario planning tool | Engineers rely only on manual experience |
| Suboptimal CSS cycle timing | Missed peak production windows |

### Our Solution
A browser-based AI Digital Twin Dashboard providing:
- Live **3D visualization** of the entire well system (surface to 1050m reservoir depth)
- SCADA-grade telemetry for all well parameters
- Physics-based **What-If Simulation** to test CSS and SRP parameter changes
- **AI prescriptive recommendations** with confidence scores
- **Predictive maintenance** alerts with ML failure probability
- **Historical trend analysis** across all parameters with CSV export

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 18 + TypeScript | Component architecture, type safety |
| Build Tool | Vite | Fast HMR dev server, optimized production builds |
| 3D Rendering | Three.js + @react-three/fiber | WebGL 3D scene |
| 3D Helpers | @react-three/drei | Sky, Stars, Environment, OrbitControls, Html |
| Charts | Recharts | Area, Bar, Line, Scatter charts across all pages |
| Styling | Tailwind CSS + Vanilla CSS | Dark SCADA theme, glassmorphism |
| Fonts | Inter + JetBrains Mono | UI + monospace sensor readouts |
| State | React useState / useRef | Global WellState shared across pages |

---

## 3. Application Architecture

```
App.tsx  <- Root: owns WellState, 4s telemetry timer, page routing
|
+-- Header Bar        <- Field/Well selector, LIVE badge, ticker, clock
+-- Sidebar Nav       <- 12 page links, active state highlighting
|
+-- Page Router
    +-- PageOverview       -- Multi-well field view
    +-- PageDigitalTwin    -- 3D model hero + telemetry + charts  (MAIN PAGE)
    +-- PageReservoir      -- Thermal & formation analytics
    +-- PageCSS            -- CSS cycle optimization
    +-- PageSRP            -- Sucker rod pump performance
    +-- PageRodHealth      -- 24-section rod string diagram + risk
    +-- PageProduction     -- BOPD trends, fluid breakdown
    +-- PageEnergy         -- SOR, kWh/bbl, carbon metrics
    +-- PageMaintenance    -- Equipment health matrix + ML alerts
    +-- PageAI             -- Prescriptive AI recommendations
    +-- PageHistory        -- Time-series explorer + CSV export
    +-- PageSettings       -- Well config, alert thresholds, AI settings
```

### State Flow
```
getInitialState()
      |
WellState  (App.tsx useState)
      |  (every 4 seconds — slow-mode drift)
stepSimulation() / direct setState
      |  (passed as props)
All 12 Pages + 3D Scene read wellState
      ^  (user action)
WhatIfModal --> calculateWhatIfPrediction() --> handleApplyWhatIfParams()
      --> updates wellState with new simulation params
```

---

## 4. Core Data Model — WellState

Defined in `src/types/simulation.ts`. This single object drives the entire application.

```typescript
interface WellState {
  // CSS Cycle Phase
  phase: 'INJECTION' | 'SOAK' | 'PRODUCTION'

  // Pump Kinematics
  spm: number               // Strokes Per Minute (e.g. 5.2)
  strokeLength: number      // Meters (e.g. 2.5m = ~100 inches)
  vfdFrequencyHz: number    // Motor VFD frequency (42 Hz nominal)
  crankAngle: number        // Radians — drives 3D crank rotation
  polishedRodPos: number    // 0.0 to 1.0 — drives rod reciprocation

  // Reservoir Telemetry
  reservoirTemp: number     // Celsius (52–76 range during CSS)
  heatedZoneRadius: number  // Meters (steam plume radius, 14–30m)
  viscositycP: number       // Heavy oil viscosity (9,500–32,000 cP)
  fluidViscosityIndex: number // Normalized 0.0–1.0 for 3D color mapping

  // Production KPIs
  productionRate: number    // BOPD (Barrels of Oil Per Day)
  sor: number               // Steam-Oil Ratio (m3 steam / bbl oil)
  energyKwhPerBbl: number   // Specific energy (kWh per barrel)
  pumpFillagePercent: number // Pump cylinder fill efficiency (%)

  // Pressures
  whpBar: number            // Wellhead pressure (bar)
  bhpBar: number            // Bottomhole pressure (bar)
  injPressureBar: number    // Steam injection pressure (bar)

  // Safety & Health
  rodFailureRiskPercent: number  // ML-predicted rod failure probability
  anomalyDetected: boolean       // Active anomaly flag
  anomalyMessage: string | null  // Human-readable anomaly description
  twinHealthPercent: number      // Overall digital twin data quality (%)

  // Dynamometer
  liveDynoCard: DynamometerPoint[]   // Live surface dynamometer card
  normalDynoCard: DynamometerPoint[] // Reference card for comparison
}
```

**Nominal baseline — BGW-07 during production phase:**

| Parameter | Value | Unit |
|---|---|---|
| Production Rate | 48.6 | BOPD |
| Reservoir Temperature | 62.4 | C |
| Viscosity | 18,700 | cP |
| SOR | 4.8 | m3/bbl |
| Energy | 21.4 | kWh/bbl |
| SPM | 5.2 | strokes/min |
| Pump Fillage | 78 | % |
| Rod Failure Risk | 7 | % |
| Wellhead Pressure | 8.4 | bar |
| Bottomhole Pressure | 14.2 | bar |

---

## 5. Simulation Engine

**File:** `src/services/simulationEngine.ts`

### Slow-Mode Telemetry (4-second interval in App.tsx)
To keep the prototype stable, sensor values drift gently every 4 seconds:

```typescript
setInterval(() => {
  setWellState(prev => ({
    ...prev,
    productionRate: clamp(prev.productionRate + drift(+-0.15), 38, 54),
    reservoirTemp:  clamp(prev.reservoirTemp  + drift(+-0.05), 58, 66),
    whpBar:  8.4  + drift(+-0.04),
    bhpBar:  14.2 + drift(+-0.06),
  }));
}, 4000);
```

This prevents Recharts from continuously aborting and restarting SVG path interpolation (which caused blank charts at 60 FPS).

### 3D Kinematics (60 FPS inside WebGL Canvas)
The pumpjack animation runs at native 60 FPS using useFrame — completely decoupled from React:

```typescript
useFrame((_, delta) => {
  const omega = (2 * PI * spm) / 60;
  crankAngle = (crankAngle + omega * delta) % (2 * PI);
  polishedRodPos = (1 - cos(crankAngle)) * 0.5;  // Simple Harmonic Motion
});
```

The 3D model moves smoothly at 60 FPS while React only re-renders every 4 seconds — two completely separate update loops.

### CSS Phase Durations (prototype timescale)
| Phase | Prototype | Real-world |
|---|---|---|
| INJECTION | 30 seconds | 3–7 days |
| SOAK | 20 seconds | 12–72 hours |
| PRODUCTION | 90 seconds | 15–30 days |

---

## 6. What-If Physics Engine

**File:** `src/services/whatIfEngine.ts`

All 8 equations are grounded in petroleum engineering physics, calibrated for Baghewala heavy crude.

### Input Sliders

| Parameter | Range | Nominal |
|---|---|---|
| Steam Volume | 60–200 m3 | 120 m3 |
| Injection Pressure | 6.0–14.0 bar | 8.4 bar |
| Soak Time | 12–72 hours | 36 hours |
| Stroke Length | 64–144 inches | 100 inches |
| SPM | 2.0–8.5 | 5.2 |
| VFD Frequency | 30–60 Hz | 42 Hz |

### Physics Equations

**1. Reservoir Temperature (C)**
```
T = 58.5
  + (steamVol - 120) * 0.085       <- latent heat injected
  + (injPressure - 8.4) * 0.95     <- pressure-enthalpy
  - max(0, soakTime - 40) * 0.07   <- conductive cooling on long soak
Clamped: 52 <= T <= 76 C
```

**2. Heated Plume Radius (m)**
```
R = 14.2 + (steamVol - 100) * 0.065 + (soakTime / 36) * 1.1
```

**3. Fluid Viscosity — Arrhenius/Andrade Equation**
```
mu = 85,000 * exp(-0.0245 * T)    [cP]
Calibrated: ~28,000 cP at 52C  ->  ~12,000 cP at 72C
```

**4. Pump Fillage (%)**
```
viscPenalty  = (mu - 12000) / 10000 * 4.2    <- suction restriction
speedPenalty = max(0, SPM - 5.5) * 5.0       <- incomplete cylinder fill
fillage = 86 - viscPenalty - speedPenalty
Clamped: 50% <= fillage <= 95%
```

**5. Oil Production (BOPD)**
```
Q = 44.0
  * (strokeLen / 100) * (SPM / 5.2)   <- theoretical displacement
  * (fillage / 78.0)                   <- fillage correction
  * (1 + (T - 58.0) * 0.018)          <- reservoir mobility factor
Clamped: 18 <= Q <= 68 BOPD
```

**6. Steam-Oil Ratio**
```
SOR = steamVol / (Q * 0.21)    [m3/bbl]
```

**7. Energy Consumption (kWh/bbl)**
```
E = 16.5
  + (SPM / 5.2) * 2.8       <- pump speed load
  + (mu / 18000) * 1.8      <- fluid drag factor
  + (VFD - 42) * 0.12       <- motor operating point
```

**8. Rod Failure Risk (%)**
```
risk = (SPM/5.2)^1.8 * 3.5                  <- fatigue cycles (non-linear)
     + (mu - 14000) / 10000 * 4.0            <- viscous drag on downstroke
     + max(0, 75 - fillage) * 0.35           <- fluid pound shock load
Clamped: 2% <= risk <= 48%
```

### How the Modal Works
- 6 sliders update inputs in real-time
- Predictions update live as sliders move (no submit button needed)
- All 8 outputs shown with **delta from baseline** (green = improvement, red = degradation)
- "Apply to Live Digital Twin" button propagates params to wellState — updates 3D scene + all charts

---

## 7. 3D Digital Twin Scene

**Files:** `src/components/3d/`

### Scene Hierarchy
```
DigitalTwinScene.tsx       <- Canvas, lighting, sky, environment, camera
|
+-- DesertGround           <- Terrain, rocks, concrete pad, access road, road markings
+-- PumpStationBuilding    <- Corrugated metal pump station (right side)
+-- KinematicSRP           <- 60 FPS animation controller (useFrame)
|   +-- SurfacePumpjack    <- Mark II beam pump (50+ geometry parts)
|   +-- SurfaceStorageTank <- Tank battery + insulated flowline + oil particles
|   +-- WellboreCrossSection <- Bore with 5 strata layers + all completion hardware
+-- ReservoirZone          <- Deep reservoir, thermal glow, phase-aware particles
+-- WellheadSteam          <- Steam plume (INJECTION phase only)
+-- DynamometerGhostOverlay <- Spatial 3D dyno card (when tags toggled on)
+-- SpatialAnnotations     <- Floating 3D HTML labels on components
```

### Lighting
| Light | Color | Purpose |
|---|---|---|
| Ambient | #e8d5b0 | Warm desert base fill |
| Hemisphere sky | #fde68a | Golden-hour sky tone |
| Hemisphere ground | #5c2d0a | Sandy desert ground reflection |
| Directional Sun | #fff7ed @ [22,18,14] | 4096x4096 shadow casting |
| Directional Sky fill | #bfdbfe @ [-20,16,22] | Cool blue backlight |
| Directional Ground bounce | #f59e0b @ [0,-5,8] | Sand warmth |
| Point Wellbore | #38bdf8 @ [-5.4,-4,4] | Cyan wellbore glow |
| Point Reservoir | #fbbf24 @ [-5.4,-13.5,4.5] | Amber reservoir glow |
| Point Tank | #0ea5e9 | Blue-steel tank highlight |
| Directional Deep | #a855f7 @ [0,-12,-6] | Purple earth tone |

**Rendering quality:** ACES Filmic tone mapping, 4096x4096 shadow maps, sunset Environment preset (PBR reflections), Three.js Sky (Rayleigh/Mie scattering), Stars field, MSAA anti-aliasing.

### SurfacePumpjack — Parts List
Geometrically accurate Mark II Beam Pump Unit with 50+ mesh parts:

| Part | Detail |
|---|---|
| A-Frame | 4 tapered tubular legs, 3-level cross-bracing, X-diagonal braces |
| Walking Beam | I-beam: web + top flange + bottom flange + 4 gusset plates |
| Warning stripes | Yellow safety stripes on beam sides |
| Horsehead | Curved guide arc + 3 radius reinforcement ribs |
| Motor | Cylinder + 5 cooling fins + fan cowling + terminal box + nameplate |
| Gearbox | Housing + oil sight glass + breather + fill port + V-belt + belt guard |
| Counterweights | Cast iron blocks with lightening holes |
| Crankshaft | Main journal + dual crank arms 180 apart |
| Pitman Arms | Round-bar steel links (left & right) |
| Wellhead | Studded flanges (8 bolts) + gate valve + pressure gauge + thermocouple |
| Polished Rod | Mirror-finish chrome (metalness=0.999) |
| Control Panel | Electrical box + green status LED + conduit entry |

### WellboreCrossSection — Geological Layers
| Layer | Depth | Color |
|---|---|---|
| Surface Soil | 0–200m | #374151 |
| Limestone Caprock | 200–450m | #1c2833 |
| Shale Formation | 450–750m | #0d1b2a |
| Tight Sandstone | 750–1000m | #2d1b0e |
| Jodhpur Oil Sandstone | 1000–1050m TD | #4a2c10 (emissive glow) |

**Completion hardware:** Cement sheath -> 7" casing -> annulus fluid -> 2-7/8" tubing -> fluid column (color = f(viscosity, temp)) -> 7/8" sucker rod -> rod couplings -> downhole pump (traveling valve + standing valve) -> perforation shots

### ReservoirZone — Phase-Aware Animation
| Phase | Visual Behavior |
|---|---|
| INJECTION | 200 steam particles expand radially outward from wellbore |
| SOAK | Wireframe thermal sphere + static wave rings |
| PRODUCTION | 100 oil particles converge inward toward wellbore |
| Always | Pulsing thermal rings with sinusoidal opacity breathing |

Temperature color: Cold blue (52C) -> orange (165C) -> hot red-white (280C)

### Camera Presets
| Preset | Camera Position | Look At |
|---|---|---|
| Overview | [3.5, 4.0, 11.5] | Full scene |
| Pumpjack | [1.8, 2.5, 6.5] | Surface equipment |
| Wellbore | [-1.2, -4.5, 9.0] | Mid-bore |
| Reservoir | [-1.2, -12.5, 10.0] | Deep reservoir |

All transitions use smoothstep cubic easing at 2.5x speed.

---

## 8. All 12 SCADA Pages

### Page 1 — Overview
Field-level dashboard showing all active wells simultaneously.
- Field KPI row: Total BOPD, Active Wells, Average SOR, Average Reservoir Temp
- 6 well status cards (BGW-01 to BGW-09): Phase badge, BOPD, temp, status dot
- 30-day field production area chart
- SOR comparison bar chart across all wells
- CSS program Gantt-style timeline

### Page 2 — Digital Twin (MAIN PAGE)
The hero page with the live 3D model.

**Left panel (60% width):**
- Full interactive 3D scene (OrbitControls, pan, zoom, rotate)
- 3D/2D toggle (switches to SVG schematic)
- Camera preset buttons: Overview / Pumpjack / Wellbore / Reservoir
- Spatial tags toggle (floating 3D labels)
- CSS phase indicator with countdown timer bar
- Timeline scrubber (-30 to +72 days)

**Right panel (40% width):**
- Live telemetry grid: BOPD, Temp, Viscosity, Fillage, WHP, BHP, SPM, Rod Load, Amps, SOR, Energy, Rod Risk
- 3 mini area charts (memoized): Reservoir Temp / Oil Production / Viscosity (30-day each)
- What-If Simulation button
- Anomaly alert banner (red, blinking)
- Twin Health badge (96% HEALTHY)

### Page 3 — Reservoir
Formation and thermal analytics.
- Formation spec card: Depth, porosity (28%), permeability (850 mD), API gravity, pay zone thickness
- 90-day reservoir temperature area chart
- Viscosity decay line chart with CSS cycle markers
- 30-day bottomhole pressure trend
- Temperature-Viscosity scatter plot (shows Arrhenius curve visually)
- Thermal zone status: current plume radius, temp, phase

### Page 4 — CSS Optimization
Cyclic Steam Stimulation parameter tuning.
- Current vs AI-Optimized table:
  - Steam Vol: 120 m3 -> 105 m3 (-12.5%)
  - Inj Pressure: 8.4 -> 9.2 bar (+9.5%)
  - Soak Time: 36h -> 42h (+16.7%)
  - SOR improvement: 4.8 -> 4.1 (-14.6%)
- SOR bar chart across last 8 CSS cycles
- Complete CSS cycle record table (all historical cycles)
- Optimization savings card: steam savings, cost reduction, CO2 reduction

### Page 5 — SRP Optimization
Sucker Rod Pump performance and tuning.
- Surface dynamometer card (Recharts area chart — load vs position parallelogram)
- Current vs Optimal: SPM 5.2 -> 4.7, VFD 42 Hz -> 38 Hz
- 30-day pump fillage history with 75% target line
- SPM trend chart
- VFD Hz vs Motor Amps dual-axis chart
- Pump efficiency KPIs: liquid rate, fluid level, fall rate, displacement

### Page 6 — Rod Health
24-section sucker rod string monitoring.
- 24-section visual rod string diagram (full 1050m depth)
  - Color coded: Green (healthy) -> Yellow -> Orange -> Red (critical)
  - Each section: depth range, material grade (D/K/H), diameter, tension/compression
- Failure risk pie chart: by cause (fluid pound, corrosion, fatigue, overload)
- Peak tension + compression 30-day trend chart
- Inspection audit log table
- Overall risk score with ML confidence %

### Page 7 — Production
Comprehensive production analytics.
- 90-day daily BOPD area chart with 7-day moving average
- Fluid rate vs oil rate stacked area (oil + water)
- Cumulative production area chart
- Rolling 6-month monthly stacked bars
- KPI cards: cumulative, water cut %, peak, average BOPD
- CSS cycle impact vertical markers on all charts

### Page 8 — Energy & SOR
Efficiency and environmental metrics.
- 90-day specific energy (kWh/bbl) with target line
- SOR per CSS cycle bar chart
- Carbon metrics: CO2/bbl, total monthly CO2, vs industry benchmark
- OPEX cost table: energy, steam, maintenance, per-barrel breakdown
- AI-projected savings from SPM/VFD recommendations

### Page 9 — Predictive Maintenance
ML-powered equipment health system.
- Equipment health matrix: Gearbox, Motor, Walking Beam, Stuffing Box, Rod String, Tubing, Casing, Valves
  - Each shows: health %, trend arrow, last inspection date
- Upcoming maintenance calendar (next 30 days, color-coded by priority)
- ML failure probability alerts: component, probability %, time-to-failure, recommended action
- Cost avoidance card: reactive vs predictive cost comparison

### Page 10 — AI Recommendations
Prescriptive AI intelligence layer.
- Active recommendations (priority ranked):
  1. Reduce SPM 5.2 -> 4.7 (viscosity exceeds rod fall rate) — Impact: +8.2% fillage
  2. Extend soak to 42h (reservoir cooling faster than expected) — Impact: -0.7 SOR
  3. Reduce steam vol -15 m3 next cycle (heated zone saturated) — Impact: -12.5% steam cost
- Each recommendation: confidence %, expected impact, technical rationale, savings/day
- Model confidence gauge cards (reservoir / pump / rod sub-models)
- Execution log: all past recommendations applied + measured outcomes
- Apply Recommendation buttons (update wellState)

### Page 11 — Historical Data
Full time-series data explorer.
- Multi-parameter chart (up to 4 parameters overlaid): Temp, BOPD, Viscosity, SOR, Energy, Rod Risk, BHP, Water Cut, Fluid Level
- Date range picker: 7 / 30 / 90 days / 6 months / 1 year / All Time
- Statistics cards: Min, Max, Mean, Std Dev
- Raw data table (paginated)
- CSV Export button

### Page 12 — Settings
Well configuration and system settings.
- Well configuration: Well ID, field, formation, depth, casing sizes, tubing OD, rod grade
- Alert threshold sliders: SOR (5.5), Temp (52-76C), Rod risk (15%), Fillage low (65%)
- Notification toggles: Email / SMS / Dashboard per severity
- AI model settings: update frequency, confidence threshold (85%), training window
- Data connection: SCADA source, sampling rate (4s in prototype)

---

## 9. Mock Data & Historical Generators

**File:** `src/data/mockData.ts`

All historical data is **procedurally generated** with physics-aware random walks — not hardcoded arrays.

### genDailyData(days) — Main Generator
Simulates a 22-day CSS cycle period:
```typescript
cyclePhase = dayIndex % 22
if (cyclePhase < 3)       // INJECTION: temp +2.1C/day, viscosity drops fast
else if (cyclePhase < 5)  // SOAK: temp continues rising slowly
else if (cyclePhase < 12) // PRODUCTION peak: BOPD rises, SOR improves
else                       // Decline: temp falls, viscosity creeps back up
```

Correlations built in:
- Energy = f(viscosity) — higher viscosity means more pump energy
- Rod risk = f(viscosity, prod rate)
- BHP = f(reservoir temp)
- Water cut: gradual increasing trend (natural reservoir behaviour)

### genCSSCycles() — 12 historical CSS cycle records
Each cycle: steam vol, inj pressure, soak duration, peak BOPD, SOR, total oil, status.

### genRodHistory() — 30-day rod load data
Peak tension + peak compression with fluid pound spike events and SPM-change effects.

### genSRPHistory() — 30-day pump data
Fillage, SPM, VFD Hz, motor amps — fillage inversely correlated with SPM.

---

## 10. UI Shell

**File:** `src/App.tsx`

### Header Bar
```
[Sih-Demo AI Twin]  [Baghewala Field v]  [BGW-07 v]  [* LIVE]  [ticker scrolling...]  [21:30:45]  [H]
```
- Blinking green LIVE indicator
- Scrolling marquee ticker showing live telemetry values
- Real-time clock (1s interval)
- Field and Well dropdowns (UI, prototype)
- User avatar circle

### Sidebar
12 navigation items with unicode icons, active cyan-border highlight, and hover glow.

### Global Modals
- **ComponentDetailModal** — click any 3D component to see specs + telemetry
- **WhatIfModal** — 6 physics sliders + live prediction table + apply button

---

## 11. Data Flow

```
App.tsx (Root)
|
wellState <-- getInitialState()   [BGW-07 nominal values]
      |
      | setInterval(4000ms)       [slow-mode sensor drift]
      | WhatIfModal apply         [user-driven param changes]
      v
wellState updated
      |
      +-- PageDigitalTwin
      |       |
      |       v
      |   DigitalTwinScene (Three.js Canvas)
      |       |
      |       +-- useFrame (60fps)
      |       |     +-- crank angle advances
      |       |     +-- polishedRodPos updates
      |       |     +-- particle positions update
      |       |
      |       +-- KinematicSRP -> SurfacePumpjack, WellboreCrossSection, SurfaceStorageTank
      |       +-- ReservoirZone -> phase-aware particle system
      |       +-- WellheadSteam -> steam plume (INJECTION only)
      |
      +-- PageReservoir, PageCSS, PageSRP, PageRodHealth,
          PageProduction, PageEnergy, PageMaintenance,
          PageAI, PageHistory, PageSettings
          (all read wellState as props, render Recharts charts)
```

**Key insight — two separate update loops:**
1. **React loop (4s):** updates wellState -> React re-renders -> charts refresh cleanly
2. **WebGL loop (60fps):** updates refs inside canvas -> no React re-renders -> smooth 3D animation

This is why the pumpjack moves smoothly at 60fps while charts never flicker.

---

## 12. File Structure

```
Sih-Demo/
+-- src/
|   +-- App.tsx                           # Root: state, routing, shell UI
|   +-- main.tsx                          # Vite entry point
|   +-- index.css                         # Global styles, SCADA utilities, animations
|   |
|   +-- types/
|   |   +-- simulation.ts                 # WellState, CyclePhase, CameraPreset types
|   |
|   +-- services/
|   |   +-- simulationEngine.ts           # getInitialState, dyno card generator
|   |   +-- whatIfEngine.ts               # 8 physics equations for What-If simulation
|   |
|   +-- data/
|   |   +-- mockData.ts                   # CSS-aware historical data generators
|   |
|   +-- components/
|   |   +-- 3d/
|   |   |   +-- DigitalTwinScene.tsx      # Canvas: lighting, sky, terrain, camera
|   |   |   +-- SurfacePumpjack.tsx       # Mark II beam pump (50+ geometry parts)
|   |   |   +-- WellboreCrossSection.tsx  # 5 strata layers + full completion string
|   |   |   +-- ReservoirZone.tsx         # Thermal reservoir + particle systems
|   |   |   +-- SurfaceStorageTank.tsx    # Tank battery + flowline + oil level
|   |   |   +-- DynamometerGhostOverlay.tsx # 3D spatial dyno card
|   |   |   +-- SpatialAnnotations.tsx    # Floating 3D HTML labels
|   |   |
|   |   +-- common/
|   |   |   +-- FigmaShared.tsx           # Badge, Card, StatRow, ChartCard, PeriodSelector
|   |   |   +-- WhatIfModal.tsx           # Physics simulation modal (6 sliders)
|   |   |
|   |   +-- schematic/
|   |   |   +-- DigitalTwinViz.tsx        # 2D SVG schematic (toggle view)
|   |   |
|   |   +-- ui/
|   |       +-- ComponentDetailModal.tsx  # 3D component click-through panel
|   |
|   +-- pages/
|       +-- PageOverview.tsx
|       +-- PageDigitalTwin.tsx
|       +-- PageReservoir.tsx
|       +-- PageCSS.tsx
|       +-- PageSRP.tsx
|       +-- PageRodHealth.tsx
|       +-- PageProduction.tsx
|       +-- PageEnergy.tsx
|       +-- PageMaintenance.tsx
|       +-- PageAI.tsx
|       +-- PageHistory.tsx
|       +-- PageSettings.tsx
|
+-- package.json
+-- tsconfig.json
+-- vite.config.ts
+-- tailwind.config.js
+-- index.html
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Open: http://localhost:5173

# Type check (0 errors expected)
npx tsc --noEmit

# Production build
npm run build
```

---

## Glossary

| Term | Definition |
|---|---|
| CSS | Cyclic Steam Stimulation — inject steam, soak, produce |
| SRP | Sucker Rod Pump — surface pump lifting oil to surface |
| SOR | Steam-Oil Ratio — m3 of steam per barrel of oil produced |
| SPM | Strokes Per Minute — pumpjack operating speed |
| VFD | Variable Frequency Drive — motor speed controller |
| BOPD | Barrels of Oil Per Day |
| API | American Petroleum Institute gravity (crude oil density) |
| cP | Centipoise — unit of dynamic viscosity |
| BHP | Bottomhole Pressure — reservoir pressure at pump depth |
| WHP | Wellhead Pressure — surface pressure at christmas tree |
| Dyno Card | Dynamometer card — load vs position plot revealing pump condition |
| TD | Total Depth — deepest point drilled (1050m for BGW-07) |
| mD | Millidarcy — reservoir permeability unit |
| SCADA | Supervisory Control and Data Acquisition |

---

*SIH 2024 — AI Digital Twin for CSS Heavy Oil Wells — BGW-07, Baghewala Field, Rajasthan*
