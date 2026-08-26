# Copy-paste this into Claude / Cursor / v0 / ChatGPT to build the 3D simulation

Use this as a single prompt to an AI coding tool (Claude Code, Cursor, v0.dev, or plain Claude/ChatGPT with code execution). It's written to produce a working, browser-based, single-file web app — no external backend needed to start, so it runs immediately and can be wired to real data later.

---

## PROMPT (copy everything below the line)

---

Build a single-page, browser-based **3D interactive digital twin simulation** for a heavy-oil well using **React Three Fiber (Three.js)**, styled as a professional oilfield operations dashboard, not a toy demo. This represents an AI-enabled "Well-to-Surface Digital Twin" for a CSS (Cyclic Steam Stimulation) + Sucker Rod Pump (SRP) heavy oil well in Rajasthan, India (Baghewala field, Jodhpur Sandstone, 17–19° API crude, reservoir temp ~46–48°C).

### Overall layout
Split-screen dashboard:
- **Left ~65% of screen**: the 3D scene (interactive, orbit-controllable camera).
- **Right ~35% of screen**: a live control/telemetry panel with real-time-style readouts and a mini dynamometer card chart.
- Dark industrial theme (charcoal background, amber/cyan accent colors, monospace font for numeric readouts — think SCADA/HMI aesthetic, not consumer app aesthetic).

### 3D Scene — build these elements, top to bottom, as one continuous vertical well cross-section:

1. **Surface pumpjack (SRP)**: A simplified but recognizable beam pumping unit — walking beam, horsehead, counterweight, Samson post, crank — animated to rock up and down continuously. Its speed (strokes per minute) and stroke length should be driven by state variables `spm` and `strokeLength` so they can be changed live via the control panel.
2. **Wellbore cross-section**: A tall, semi-transparent vertical cylinder representing the wellbore from surface down to reservoir depth (compress the real depth scale for visual clarity — label it "depth not to scale"). Inside it, render:
   - The **sucker rod string** as a thin cylinder that moves up/down in sync with the pumpjack's horsehead motion.
   - The **tubing/casing** as an outer semi-transparent tube.
   - **Fluid inside the tubing** as a colored, semi-transparent volume whose color shifts along a gradient (e.g., bright orange/red = hot & mobile, to dark brown/near-black and more opaque = cold & viscous) based on a `fluidViscosityIndex` state variable (0 = hot/mobile, 1 = cold/thick).
3. **Reservoir zone** at the bottom of the wellbore: a wider, roughly spherical/ellipsoidal translucent volume representing the near-wellbore heated zone from CSS steam injection. This should:
   - Pulse/glow (orange-to-blue gradient shader or vertex color) representing temperature.
   - Animate its **radius shrinking over time** to represent heat dissipation after a steam soak (driven by a `heatedZoneRadius` state variable, 0 to 1 normalized).
   - Show a subtle particle or wave effect radiating outward during an "injection" phase, and a static glow that fades during "soak → production" phase.
4. **Dynamometer card ghost overlay**: floating just above the pumpjack, a small billboard/plane showing a live 2D line chart (load vs. position) — this is the actual physics output, not decoration. Include two overlapping traces: "live card" (solid) and "twin-predicted normal card" (dashed) so a visible gap between them represents an anomaly.
5. Ambient desert-ground plane and simple sky/lighting so the scene doesn't feel like it's floating in a void — but keep this minimal, no distracting scenery.

### State machine (drives the whole scene)
Implement a simple cycle state machine with 3 phases, auto-advancing on a timer (with manual override buttons in the control panel): `INJECTION → SOAK → PRODUCTION`, looping. Each phase should visibly change:
- `INJECTION`: reservoir zone glowing hot, expanding, particle effect, SPM near 0 (well shut in).
- `SOAK`: reservoir zone glow steady, no injection particles, SPM 0.
- `PRODUCTION`: reservoir zone slowly shrinking/cooling over the phase duration, SPM ramps up then the fluid color gradually darkens/thickens (viscosity rises) as the phase progresses — and correspondingly the dynamometer "live card" trace should visibly distort (representing rod floating / incomplete fillage) as viscosity crosses a threshold, triggering a red "ANOMALY: possible rod floating detected" badge in the control panel.

### Control / telemetry panel (right side)
Include, with live-updating numeric values tied to the same state:
- Current cycle phase indicator (badge: INJECTION / SOAK / PRODUCTION, color-coded)
- Reservoir heated-zone temperature (°C) and radius (m) — decaying over the production phase
- Pump-intake fluid viscosity (relative index or cP) — rising over the production phase
- SPM, stroke length, and a slider/input to let the user manually override them
- Rod load (min/max, psi or klb) — computed/animated to spike when the anomaly triggers
- SOR (steam-oil ratio) running estimate
- Anomaly log list: timestamped entries like "14:32 — Rod float risk rising, recommend SPM reduction"
- A prominent **"AI Recommendation" card**: e.g., "Reduce SPM from 8 to 5.5 and shorten stroke to prevent impact loading" — this should visibly appear once the anomaly threshold is crossed, and a button "Apply recommendation" that, when clicked, actually changes `spm`/`strokeLength` state and visibly slows/adjusts the pumpjack animation and clears the anomaly over the next few seconds.

### Interactivity
- OrbitControls enabled (rotate/pan/zoom) on the 3D scene.
- Play/Pause button for the whole simulation clock.
- Speed multiplier (1x/5x/20x) so a full CSS cycle can be watched in under a minute for demo purposes.
- Optional: click on the pumpjack or reservoir zone to open a small tooltip/panel with that component's current parameters.

### Technical requirements
- React + React Three Fiber + drei (for OrbitControls, Text, Html overlays) + Tailwind for UI styling.
- All "live data" should come from a self-contained simulated data generator (a simple JS function advancing state each animation frame based on elapsed time and current phase) — structure it so the data source is a single clearly-isolated module/function that could later be swapped for a real WebSocket/API feed without touching the 3D or UI code.
- Keep the whole thing performant (no more than a few thousand triangles, use simple geometries — cylinders, spheres, boxes — not imported CAD models).
- Single self-contained file/app, runnable immediately, no external data dependencies.
- Add a short in-app caption/legend explaining that the reservoir zone size = heated-zone radius, fluid color = viscosity, and dynamometer gap = anomaly severity, so a non-technical viewer (e.g., a manager watching a demo) understands what they're looking at within 5 seconds.

Build this now as complete, working code.

---

## Notes for you (not part of the prompt)

- This is intentionally a **simulated/demo build** (self-generated data, not live SCADA) — it's meant to prove out the visualization concept and be demo-able immediately. When you're ready to connect it to real data, the only thing that needs to change is the data-generator module described above — swap it for a WebSocket feed from your reservoir/wellbore/SRP twin models.
- If you want the **high-fidelity NVIDIA Omniverse/OpenUSD version** for a control-room build later, that's a separate, much heavier pipeline (CAD-accurate geometry, USD scene composition, RTX rendering) — worth doing only after this web version has validated which visual elements operators actually find useful.
- Paste the prompt as-is into Claude (with Artifacts/code execution on), Cursor, v0.dev, or ChatGPT. If the tool supports iterative refinement, a good first follow-up is: "make the anomaly detection more dramatic and add a sound/flash cue" or "swap the desert background for a full skybox."
