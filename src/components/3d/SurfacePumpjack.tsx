import React from 'react';
import * as THREE from 'three';

interface SurfacePumpjackProps {
  crankAngle: number;
  strokeLength: number;
  polishedRodPos: number;
  onClickComponent?: (name: string) => void;
}

// Reusable bolt mesh
const Bolt: React.FC<{ position: [number, number, number]; axis?: 'x' | 'y' | 'z' }> = ({
  position,
  axis = 'z',
}) => {
  const rotation: [number, number, number] =
    axis === 'x'
      ? [0, Math.PI / 2, 0]
      : axis === 'y'
      ? [Math.PI / 2, 0, 0]
      : [0, 0, 0];
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[0.025, 0.025, 0.08, 8]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
    </mesh>
  );
};

// Warning stripe helper
const WarningStripe: React.FC<{ position: [number, number, number]; width: number }> = ({
  position,
  width,
}) => (
  <mesh position={position}>
    <boxGeometry args={[width, 0.12, 0.46]} />
    <meshStandardMaterial color="#fbbf24" roughness={0.4} metalness={0.3} />
  </mesh>
);

export const SurfacePumpjack: React.FC<SurfacePumpjackProps> = ({
  crankAngle,
  strokeLength,
  polishedRodPos,
  onClickComponent,
}) => {
  const samsonHeight = 4.2;
  const beamLength = 5.4;
  const crankRadius = 0.95 * (strokeLength / 2.8);
  const pitmanLength = 3.7;

  const beamAngle = Math.sin(crankAngle) * 0.22 * (strokeLength / 2.8);

  const horseheadTipX = -beamLength * 0.5 * Math.cos(beamAngle);
  const horseheadTipY = samsonHeight + 0.3 + beamLength * 0.5 * Math.sin(beamAngle);

  const crankPinX = beamLength * 0.38 + crankRadius * Math.cos(crankAngle);
  const crankPinY = 1.25 + crankRadius * Math.sin(crankAngle);

  // Colors
  const STEEL_DARK = '#1e293b';
  const STEEL_MID = '#334155';
  const STEEL_LIGHT = '#cbd5e1';
  const PAINT_YELLOW = '#f59e0b';
  const PAINT_YELLOW_DARK = '#b45309';
  const PAINT_RED = '#dc2626';
  const PAINT_ORANGE = '#ea580c';
  const RUST_BROWN = '#92400e';

  return (
    <group position={[0, 0, 0]}>
      {/* ── CONCRETE GROUND PAD with textured surface ── */}
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[9.5, 0.12, 5.0]} />
        <meshStandardMaterial color="#374151" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Concrete edge chamfers */}
      {[4.7, -4.7].map((xOff, i) => (
        <mesh key={i} position={[xOff, 0.12, 0]} receiveShadow>
          <boxGeometry args={[0.18, 0.15, 5.0]} />
          <meshStandardMaterial color="#4b5563" roughness={0.9} />
        </mesh>
      ))}

      {/* ── HEAVY MOUNTING SKID BEAMS ── */}
      {[-1.3, 1.3].map((z, i) => (
        <group key={i} position={[0, 0.28, z]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[9.0, 0.18, 0.32]} />
            <meshStandardMaterial color={STEEL_DARK} roughness={0.25} metalness={0.92} />
          </mesh>
          {/* Skid anchor bolt holes */}
          {[-3.5, -1, 1.5, 3.5].map((xb, j) => (
            <Bolt key={j} position={[xb, -0.1, 0]} axis="y" />
          ))}
        </group>
      ))}

      {/* ── SAMSON POST A-FRAME TOWER ── */}
      <group
        position={[0, samsonHeight * 0.5 + 0.3, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClickComponent?.('Samson Post A-Frame');
        }}
      >
        {/* 4 main tubular legs (slightly tapered) */}
        {[
          [-0.62, 0.65, -0.12],
          [0.62, 0.65, -0.12],
          [-0.62, -0.65, -0.12],
          [0.62, -0.65, -0.12],
        ].map(([xr, zr, rot], i) => (
          <mesh key={i} position={[xr * 0.5, 0, zr * 0.5 * 1.3]} rotation={[0, 0, rot * 0.25]} castShadow>
            <cylinderGeometry args={[0.085, 0.145, samsonHeight, 18]} />
            <meshStandardMaterial color={STEEL_LIGHT} metalness={0.9} roughness={0.12} />
          </mesh>
        ))}

        {/* Horizontal cross-braces at 3 levels */}
        {[-1.0, 0.2, 1.4].map((yOff, idx) => (
          <group key={idx} position={[0, yOff, 0]}>
            {/* Front brace */}
            <mesh position={[0, 0, 0.6]} castShadow>
              <boxGeometry args={[1.3 - idx * 0.15, 0.06, 0.06]} />
              <meshStandardMaterial color={STEEL_MID} metalness={0.88} roughness={0.18} />
            </mesh>
            {/* Rear brace */}
            <mesh position={[0, 0, -0.6]} castShadow>
              <boxGeometry args={[1.3 - idx * 0.15, 0.06, 0.06]} />
              <meshStandardMaterial color={STEEL_MID} metalness={0.88} roughness={0.18} />
            </mesh>
            {/* X-diagonal bracing */}
            <mesh position={[0, 0, 0.6]} rotation={[0, 0, Math.PI * 0.15]} castShadow>
              <boxGeometry args={[1.1, 0.04, 0.04]} />
              <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, -0.6]} rotation={[0, 0, -Math.PI * 0.15]} castShadow>
              <boxGeometry args={[1.1, 0.04, 0.04]} />
              <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* TOP SADDLE BEARING HOUSING */}
        <mesh position={[0, samsonHeight * 0.5 + 0.14, 0]} castShadow>
          <boxGeometry args={[0.95, 0.35, 1.55]} />
          <meshStandardMaterial color={PAINT_YELLOW} metalness={0.85} roughness={0.12} emissive={PAINT_YELLOW} emissiveIntensity={0.1} />
        </mesh>
        {/* Saddle top cap */}
        <mesh position={[0, samsonHeight * 0.5 + 0.35, 0]} castShadow>
          <boxGeometry args={[1.0, 0.08, 1.6]} />
          <meshStandardMaterial color={PAINT_YELLOW_DARK} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Pivot pin / trunnion */}
        <mesh position={[0, samsonHeight * 0.5 + 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.19, 0.19, 1.45, 24]} />
          <meshStandardMaterial color={STEEL_DARK} metalness={0.97} roughness={0.04} />
        </mesh>
        {/* Grease fittings on pin ends */}
        <mesh position={[0, samsonHeight * 0.5 + 0.28, 0.75]}>
          <cylinderGeometry args={[0.035, 0.035, 0.06, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
        </mesh>
        <mesh position={[0, samsonHeight * 0.5 + 0.28, -0.75]}>
          <cylinderGeometry args={[0.035, 0.035, 0.06, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>

      {/* ── WALKING BEAM with I-beam profile ── */}
      <group
        position={[0, samsonHeight + 0.3, 0]}
        rotation={[0, 0, beamAngle]}
        onClick={(e) => {
          e.stopPropagation();
          onClickComponent?.('Walking Beam');
        }}
      >
        {/* Main I-beam web */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[beamLength, 0.45, 0.28]} />
          <meshStandardMaterial color={PAINT_YELLOW} metalness={0.78} roughness={0.18} />
        </mesh>
        {/* Top flange */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[beamLength * 1.02, 0.075, 0.5]} />
          <meshStandardMaterial color={PAINT_YELLOW_DARK} metalness={0.85} roughness={0.12} />
        </mesh>
        {/* Bottom flange */}
        <mesh position={[0, 0.0, 0]} castShadow>
          <boxGeometry args={[beamLength * 1.02, 0.075, 0.5]} />
          <meshStandardMaterial color={PAINT_YELLOW_DARK} metalness={0.85} roughness={0.12} />
        </mesh>
        {/* Stiffening gusset plates every ~1.2m */}
        {[-1.8, -0.6, 0.6, 1.8].map((xg, ig) => (
          <mesh key={ig} position={[xg, 0.25, 0]}>
            <boxGeometry args={[0.06, 0.44, 0.48]} />
            <meshStandardMaterial color={RUST_BROWN} metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
        {/* Warning stripes on beam sides */}
        <WarningStripe position={[-1.2, 0.25, 0.28]} width={0.22} />
        <WarningStripe position={[1.0, 0.25, 0.28]} width={0.22} />

        {/* HORSEHEAD ASSEMBLY */}
        <group position={[-beamLength * 0.5, 0.25, 0]}>
          {/* Curved guide saddle */}
          <mesh position={[-0.38, -0.28, 0]} rotation={[0, 0, -0.28]} castShadow>
            <boxGeometry args={[0.72, 1.45, 0.52]} />
            <meshStandardMaterial color={PAINT_ORANGE} metalness={0.82} roughness={0.16} />
          </mesh>
          {/* Front guide arc */}
          <mesh position={[-0.72, -0.55, 0]} castShadow>
            <cylinderGeometry args={[0.9, 0.9, 0.5, 28, 1, false, 0, Math.PI * 0.58]} />
            <meshStandardMaterial color={PAINT_YELLOW_DARK} metalness={0.88} roughness={0.12} />
          </mesh>
          {/* Arc reinforcement ribs */}
          {[0, 0.5, -0.5].map((zr, ri) => (
            <mesh key={ri} position={[-0.72, -0.55, zr]}>
              <cylinderGeometry args={[0.93, 0.93, 0.04, 28, 1, false, 0, Math.PI * 0.58]} />
              <meshStandardMaterial color={PAINT_YELLOW} metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
          {/* Tail on horsehead body */}
          <mesh position={[0.28, 0.32, 0]} castShadow>
            <boxGeometry args={[0.34, 0.45, 0.5]} />
            <meshStandardMaterial color={PAINT_ORANGE} metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* EQUALIZER BEARING (rear pin) */}
        <mesh position={[beamLength * 0.5, 0.1, 0]} rotation={[Math.PI * 0.5, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 1.05, 20]} />
          <meshStandardMaterial color={STEEL_DARK} metalness={0.97} roughness={0.04} />
        </mesh>
        {/* Equalizer yoke plates */}
        {[-0.45, 0.45].map((zp, ip) => (
          <mesh key={ip} position={[beamLength * 0.5, 0.1, zp]} castShadow>
            <boxGeometry args={[0.18, 0.6, 0.05]} />
            <meshStandardMaterial color={STEEL_MID} metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
      </group>

      {/* ── MOTOR & GEARBOX ── */}
      <group
        position={[2.0, 0.75, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClickComponent?.('Prime Mover & Gearbox');
        }}
      >
        {/* Main gearbox housing */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.95, 1.4]} />
          <meshStandardMaterial color={STEEL_MID} metalness={0.88} roughness={0.16} />
        </mesh>
        {/* Gearbox front inspection plate */}
        <mesh position={[0, 0, 0.71]}>
          <boxGeometry args={[1.4, 0.8, 0.04]} />
          <meshStandardMaterial color={STEEL_DARK} metalness={0.92} roughness={0.1} />
        </mesh>
        {/* Breather cap */}
        <mesh position={[0.5, 0.5, 0.55]}>
          <cylinderGeometry args={[0.055, 0.055, 0.12, 8]} />
          <meshStandardMaterial color="#78716c" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Oil fill port */}
        <mesh position={[-0.4, 0.5, 0.55]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Sight glass (glowing oil level indicator) */}
        <mesh position={[0, 0.1, 0.715]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.03, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.0} transparent opacity={0.9} />
        </mesh>
        {/* Output shaft */}
        <mesh position={[-0.85, 0, 0]} rotation={[0, 0, Math.PI * 0.5]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 12]} />
          <meshStandardMaterial color={STEEL_LIGHT} metalness={0.98} roughness={0.04} />
        </mesh>

        {/* ELECTRIC MOTOR with cooling fins */}
        <group position={[-1.22, -0.06, 0]}>
          {/* Motor cylinder */}
          <mesh rotation={[0, 0, Math.PI * 0.5]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.82, 24]} />
            <meshStandardMaterial color="#0c4a6e" metalness={0.8} roughness={0.15} emissive="#0369a1" emissiveIntensity={0.25} />
          </mesh>
          {/* Cooling fins (multiple thin rings) */}
          {[-0.3, -0.15, 0, 0.15, 0.3].map((xFin, fi) => (
            <mesh key={fi} position={[xFin, 0, 0]} rotation={[0, 0, Math.PI * 0.5]}>
              <torusGeometry args={[0.37, 0.018, 8, 24]} />
              <meshStandardMaterial color="#075985" metalness={0.85} roughness={0.12} />
            </mesh>
          ))}
          {/* Fan cowling */}
          <mesh position={[0.48, 0, 0]} rotation={[0, 0, Math.PI * 0.5]}>
            <cylinderGeometry args={[0.38, 0.36, 0.08, 24]} />
            <meshStandardMaterial color={STEEL_DARK} metalness={0.88} roughness={0.15} />
          </mesh>
          {/* Motor terminal box */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.35, 0.16, 0.22]} />
            <meshStandardMaterial color={STEEL_MID} metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Nameplate */}
          <mesh position={[0.18, 0, 0.37]} rotation={[0, -0.15, 0]}>
            <boxGeometry args={[0.18, 0.1, 0.01]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} emissive="#f59e0b" emissiveIntensity={0.3} />
          </mesh>
        </group>

        {/* V-BELT DRIVE PULLEY */}
        <mesh position={[-0.82, 0, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
          <torusGeometry args={[0.28, 0.06, 12, 24]} />
          <meshStandardMaterial color={STEEL_DARK} metalness={0.92} roughness={0.08} />
        </mesh>
        {/* Belt guard */}
        <mesh position={[-0.3, 0, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.08, 24, 1, true]} />
          <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.4} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ── CRANK ARMS + COUNTERWEIGHTS ── */}
      <group
        position={[2.0, 1.25, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClickComponent?.('Crank & Counterweights');
        }}
      >
        {/* Left crank */}
        <group position={[0, 0, 0.88]} rotation={[0, 0, crankAngle]}>
          {/* Crank arm plate */}
          <mesh position={[crankRadius * 0.5, 0, 0]} castShadow>
            <boxGeometry args={[crankRadius * 1.3, 0.32, 0.19]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Counterweight - D-shaped cast iron block */}
          <mesh position={[crankRadius * 0.82, 0, 0]} castShadow>
            <boxGeometry args={[0.82, 1.35, 0.36]} />
            <meshStandardMaterial color={PAINT_RED} metalness={0.55} roughness={0.25} emissive="#991b1b" emissiveIntensity={0.1} />
          </mesh>
          {/* CW lightening holes */}
          {[-0.25, 0.25].map((hx, hi) => (
            <mesh key={hi} position={[crankRadius * 0.82 + hx, 0, 0.19]} rotation={[Math.PI * 0.5, 0, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.4, 12]} />
              <meshStandardMaterial color={STEEL_DARK} metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
          {/* Crank pin journal */}
          <mesh position={[crankRadius, 0, -0.1]} rotation={[Math.PI * 0.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.36, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.04} />
          </mesh>
        </group>

        {/* Right crank (same + 180° offset for balance) */}
        <group position={[0, 0, -0.88]} rotation={[0, 0, crankAngle + Math.PI]}>
          <mesh position={[crankRadius * 0.5, 0, 0]} castShadow>
            <boxGeometry args={[crankRadius * 1.3, 0.32, 0.19]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[crankRadius * 0.82, 0, 0]} castShadow>
            <boxGeometry args={[0.82, 1.35, 0.36]} />
            <meshStandardMaterial color={PAINT_RED} metalness={0.55} roughness={0.25} emissive="#991b1b" emissiveIntensity={0.1} />
          </mesh>
          <mesh position={[crankRadius, 0, 0.1]} rotation={[Math.PI * 0.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.36, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.04} />
          </mesh>
        </group>

        {/* Crankshaft main journal */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI * 0.5, 0, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 1.9, 20]} />
          <meshStandardMaterial color={STEEL_DARK} metalness={0.97} roughness={0.04} />
        </mesh>
      </group>

      {/* ── PITMAN ARMS (Left & Right) ── */}
      {[0.88, -0.88].map((z, i) => {
        const midX = (2.0 + crankPinX) * 0.5;
        const midY = (1.25 + crankPinY) * 0.5;
        const angle = Math.atan2(samsonHeight + 0.3 - crankPinY, beamLength * 0.5 - crankPinX);
        return (
          <mesh key={i} position={[midX, midY, z]} rotation={[0, 0, angle]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, pitmanLength, 16]} />
            <meshStandardMaterial color={STEEL_LIGHT} metalness={0.94} roughness={0.06} />
          </mesh>
        );
      })}

      {/* ── BRIDLE WIRE CABLES (steel strand) ── */}
      <mesh
        position={[
          -beamLength * 0.5 - 0.7,
          (horseheadTipY + (samsonHeight - 0.65)) * 0.5,
          0.2,
        ]}
        castShadow
      >
        <cylinderGeometry args={[0.022, 0.022, horseheadTipY - (samsonHeight - 0.65), 10]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.02} />
      </mesh>
      <mesh
        position={[
          -beamLength * 0.5 - 0.7,
          (horseheadTipY + (samsonHeight - 0.65)) * 0.5,
          -0.2,
        ]}
        castShadow
      >
        <cylinderGeometry args={[0.022, 0.022, horseheadTipY - (samsonHeight - 0.65), 10]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.02} />
      </mesh>

      {/* ── SURFACE WELLHEAD & STUFFING BOX ── */}
      <group
        position={[-beamLength * 0.5 - 0.7, 0.65, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClickComponent?.('Surface Wellhead & Stuffing Box');
        }}
      >
        {/* Master valve spool */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.5, 24]} />
          <meshStandardMaterial color={STEEL_DARK} metalness={0.88} roughness={0.14} />
        </mesh>
        {/* Flanges */}
        {[-0.28, 0.28].map((yf, fi) => (
          <mesh key={fi} position={[0, yf - 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.46, 0.46, 0.07, 24]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        {/* Wellhead studs & nuts (8 bolts) */}
        {Array.from({ length: 8 }).map((_, bi) => {
          const a = (bi / 8) * Math.PI * 2;
          return (
            <mesh key={bi} position={[Math.cos(a) * 0.45, -0.15, Math.sin(a) * 0.45]}>
              <cylinderGeometry args={[0.018, 0.018, 0.5, 6]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
            </mesh>
          );
        })}
        {/* Casing head */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.5, 24]} />
          <meshStandardMaterial color={STEEL_MID} metalness={0.85} roughness={0.15} />
        </mesh>
        {/* Stuffing box housing */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.3, 0.58, 24]} />
          <meshStandardMaterial color="#d97706" metalness={0.88} roughness={0.12} />
        </mesh>
        {/* Packing nut (hex profile) */}
        <mesh position={[0, 0.82, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.14, 6]} />
          <meshStandardMaterial color={PAINT_RED} metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Production flowline tee */}
        <mesh position={[0, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.46, 24]} />
          <meshStandardMaterial color={STEEL_MID} metalness={0.85} roughness={0.15} />
        </mesh>
        <mesh position={[0.42, 0.14, 0]} rotation={[0, 0, Math.PI * 0.5]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.62, 20]} />
          <meshStandardMaterial color={PAINT_RED} metalness={0.85} roughness={0.15} />
        </mesh>
        {/* Gate valve wheel */}
        <mesh position={[0.72, 0.14, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
          <torusGeometry args={[0.1, 0.018, 8, 20]} />
          <meshStandardMaterial color={PAINT_RED} metalness={0.85} roughness={0.15} />
        </mesh>
        {/* Pressure gauges */}
        <mesh position={[-0.28, 0.3, 0.28]} rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.04, 16]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.9} transparent opacity={0.95} />
        </mesh>
        {/* Thermocouple probe */}
        <mesh position={[0.15, 0.55, 0.25]} rotation={[Math.PI * 0.35, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>

      {/* ── POLISHED ROD (reciprocating) ── */}
      <mesh
        position={[
          -beamLength * 0.5 - 0.7,
          1.35 + (0.5 - polishedRodPos) * strokeLength * 0.5,
          0,
        ]}
        castShadow
      >
        <cylinderGeometry args={[0.046, 0.046, 2.4, 20]} />
        <meshStandardMaterial color="#ffffff" metalness={0.999} roughness={0.008} />
      </mesh>

      {/* ── ELECTRICAL CONTROL PANEL ── */}
      <group position={[3.8, 0.9, 1.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 1.0, 0.22]} />
          <meshStandardMaterial color="#1c3a5c" metalness={0.75} roughness={0.3} />
        </mesh>
        {/* Panel door handle */}
        <mesh position={[0.12, 0, 0.12]}>
          <boxGeometry args={[0.04, 0.18, 0.04]} />
          <meshStandardMaterial color={STEEL_LIGHT} metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Status LED (green = running) */}
        <mesh position={[0, 0.32, 0.115]}>
          <cylinderGeometry args={[0.025, 0.025, 0.015, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.5} />
        </mesh>
        {/* Conduit cable entry */}
        <mesh position={[0, -0.55, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.25, 10]} />
          <meshStandardMaterial color={STEEL_DARK} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* ── SAFETY SIGNS on A-frame ── */}
      <mesh position={[0, 1.8, 0.7]}>
        <boxGeometry args={[0.35, 0.22, 0.01]} />
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.3} roughness={0.6} />
      </mesh>
    </group>
  );
};
