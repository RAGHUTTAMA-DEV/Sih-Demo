import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface WellboreCrossSectionProps {
  polishedRodPos: number;
  strokeLength: number;
  fluidViscosityIndex: number;
  onClickComponent?: (name: string) => void;
}

export const WellboreCrossSection: React.FC<WellboreCrossSectionProps> = ({
  polishedRodPos,
  strokeLength,
  fluidViscosityIndex,
  onClickComponent,
}) => {
  const wellboreDepth = 14.5;
  const wellheadX = -5.4;
  const wellTopY = 0.3;
  const wellBottomY = -wellboreDepth;
  const particleCount = 60;
  const particlesRef = useRef<THREE.Points>(null);

  // Dynamic fluid color
  const fluidColor = useMemo(() => {
    const colorHot = new THREE.Color('#ff4500');
    const colorWarm = new THREE.Color('#f59e0b');
    const colorCold = new THREE.Color('#1a0e07');
    const result = new THREE.Color();
    if (fluidViscosityIndex < 0.4) {
      result.lerpColors(colorHot, colorWarm, fluidViscosityIndex / 0.4);
    } else {
      result.lerpColors(colorWarm, colorCold, (fluidViscosityIndex - 0.4) / 0.6);
    }
    return result;
  }, [fluidViscosityIndex]);

  // Annulus color (lighter / separated from fluid)
  const annulusColor = useMemo(() => {
    return fluidColor.clone().lerp(new THREE.Color('#94a3b8'), 0.4);
  }, [fluidColor]);

  const plungerOffsetY = (0.5 - polishedRodPos) * strokeLength * 0.45;

  // Particle geometry
  const [particlePositions, particleSpeeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const speed = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.06 + Math.random() * 0.18;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = wellBottomY + Math.random() * wellboreDepth;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      speed[i] = 1.2 + Math.random() * 2.4;
    }
    return [pos, speed];
  }, [wellBottomY, wellboreDepth]);

  useFrame((_, delta) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const spd = particleSpeeds[i] * (1.2 - fluidViscosityIndex * 0.7);
        positions[i * 3 + 1] += delta * spd;
        if (positions[i * 3 + 1] > wellTopY) {
          positions[i * 3 + 1] = wellBottomY + 0.3;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Geological formation bands with realistic colors
  const formations = [
    { yStart: 0.3,    yEnd: -2.0,  color: '#374151', label: 'Surface Soil',         roughness: 0.95 },
    { yStart: -2.0,   yEnd: -4.5,  color: '#1c2833', label: 'Limestone Caprock',     roughness: 0.85 },
    { yStart: -4.5,   yEnd: -7.5,  color: '#0d1b2a', label: 'Shale Formation',       roughness: 0.9  },
    { yStart: -7.5,   yEnd: -11.0, color: '#2d1b0e', label: 'Tight Sandstone',       roughness: 0.82 },
    { yStart: -11.0,  yEnd: -14.5, color: '#4a2c10', label: 'Jodhpur Oil Sandstone', roughness: 0.75 },
  ];

  const casing_OD = 0.60;   // 7" casing outer radius
  const tubing_OD = 0.36;   // 2-7/8" production tubing outer radius
  const rod_OD    = 0.050;  // 7/8" sucker rod

  return (
    <group position={[wellheadX, 0, 0]}>

      {/* ── GEOLOGICAL STRATA BANDS visible around wellbore ── */}
      {formations.map((f, i) => {
        const midY = (f.yStart + f.yEnd) / 2;
        const height = Math.abs(f.yEnd - f.yStart);
        return (
          <group key={i}>
            {/* Left formation slab */}
            <mesh position={[-3.8, midY, 0]}>
              <boxGeometry args={[6.5, height - 0.04, 1.2]} />
              <meshStandardMaterial color={f.color} roughness={f.roughness} metalness={0.05} />
            </mesh>
            {/* Right formation slab */}
            <mesh position={[3.8, midY, 0]}>
              <boxGeometry args={[6.5, height - 0.04, 1.2]} />
              <meshStandardMaterial color={f.color} roughness={f.roughness} metalness={0.05} />
            </mesh>
            {/* Formation seam line glow */}
            <mesh position={[0, f.yStart, 0]}>
              <boxGeometry args={[0.5, 0.015, 1.2]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
            </mesh>
          </group>
        );
      })}

      {/* ── CEMENT SHEATH behind casing ── */}
      <mesh
        position={[0, (wellTopY + wellBottomY) * 0.5, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('Cement Sheath'); }}
      >
        <cylinderGeometry args={[0.78, 0.78, wellboreDepth, 32, 1, true]} />
        <meshStandardMaterial
          color="#78716c"
          roughness={0.9}
          metalness={0.05}
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── OUTER PRODUCTION CASING (7") ── */}
      <mesh
        position={[0, (wellTopY + wellBottomY) * 0.5, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('7" Production Casing String'); }}
      >
        <cylinderGeometry args={[casing_OD, casing_OD, wellboreDepth, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transparent
          opacity={0.45}
          roughness={0.05}
          metalness={0.82}
          transmission={0.4}
          emissive="#0284c7"
          emissiveIntensity={0.25}
          clearcoat={1.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── CASING COLLARS (every ~3m) ── */}
      {[
        { depthY: -2.0,  label: '─ 200 m' },
        { depthY: -4.5,  label: '─ 450 m' },
        { depthY: -7.5,  label: '─ 750 m' },
        { depthY: -11.0, label: '─ 1000 m' },
        { depthY: -14.0, label: '─ 1050 m (TD)' },
      ].map((item) => (
        <group key={item.depthY} position={[0, item.depthY, 0]}>
          <mesh>
            <cylinderGeometry args={[casing_OD + 0.04, casing_OD + 0.04, 0.24, 24]} />
            <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.1} emissive="#38bdf8" emissiveIntensity={0.3} />
          </mesh>
          <Html position={[-1.0, 0, 0]} distanceFactor={14} center>
            <span className="px-2 py-0.5 rounded bg-slate-950/95 border border-cyan-400 text-cyan-300 font-mono text-[9px] font-extrabold shadow-lg backdrop-blur-md whitespace-nowrap">
              {item.label}
            </span>
          </Html>
        </group>
      ))}

      {/* ── CASING/TUBING ANNULUS FLUID ── */}
      <mesh position={[0, (wellTopY + wellBottomY) * 0.5, 0]}>
        <cylinderGeometry args={[casing_OD - 0.02, casing_OD - 0.02, wellboreDepth - 0.05, 32, 1, true]} />
        <meshStandardMaterial
          color={annulusColor}
          transparent
          opacity={0.18}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── INNER PRODUCTION TUBING (2-7/8") ── */}
      <mesh
        position={[0, (wellTopY + wellBottomY) * 0.5, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('2-7/8" Production Tubing String'); }}
      >
        <cylinderGeometry args={[tubing_OD, tubing_OD, wellboreDepth, 28, 1, true]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          transparent
          opacity={0.48}
          roughness={0.06}
          metalness={0.9}
          clearcoat={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── TUBING COLLARS ── */}
      {[-1.5, -4.5, -7.5, -10.5, -13.5].map((yc, ci) => (
        <mesh key={ci} position={[0, yc, 0]}>
          <cylinderGeometry args={[tubing_OD + 0.025, tubing_OD + 0.025, 0.16, 20]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.1} />
        </mesh>
      ))}

      {/* ── FLUID COLUMN INSIDE TUBING ── */}
      <mesh position={[0, (wellTopY + wellBottomY) * 0.5, 0]}>
        <cylinderGeometry args={[tubing_OD - 0.04, tubing_OD - 0.04, wellboreDepth - 0.08, 24]} />
        <meshStandardMaterial
          color={fluidColor}
          transparent
          opacity={0.72}
          roughness={0.08}
          metalness={0.12}
          emissive={fluidColor}
          emissiveIntensity={0.55 * (1 - fluidViscosityIndex * 0.35)}
        />
      </mesh>

      {/* ── RISING FLUID PARTICLES ── */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.22}
          color={fluidColor}
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* ── SUCKER ROD STRING ── */}
      <mesh
        position={[0, (wellTopY + wellBottomY) * 0.5 + plungerOffsetY, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('7/8" Sucker Rod String'); }}
      >
        <cylinderGeometry args={[rod_OD, rod_OD, wellboreDepth, 16]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.985} roughness={0.015} />
      </mesh>

      {/* ── ROD COUPLINGS every 3m ── */}
      {[-1.5, -4.5, -7.5, -10.5, -13.0].map((oy, ri) => (
        <mesh key={ri} position={[0, oy + plungerOffsetY, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.2, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.96} roughness={0.06} />
        </mesh>
      ))}

      {/* ── DOWNHOLE PUMP ASSEMBLY ── */}
      <group
        position={[0, wellBottomY + 1.25 + plungerOffsetY, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('Downhole Plunger & Traveling Valve'); }}
      >
        {/* Pump barrel housing */}
        <mesh>
          <cylinderGeometry args={[0.29, 0.29, 1.5, 24]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.88} roughness={0.12} />
        </mesh>
        {/* Barrel end caps */}
        {[-0.76, 0.76].map((yc, ci) => (
          <mesh key={ci} position={[0, yc, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 24]} />
            <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        {/* Traveling valve ball */}
        <mesh position={[0, 0.62, 0]}>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.6} metalness={0.96} roughness={0.04} />
        </mesh>
        {/* Traveling valve seat */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.08, 20]} />
          <meshStandardMaterial color="#0369a1" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Standing valve */}
        <mesh position={[0, -0.72, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.35, 24]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.55} metalness={0.88} roughness={0.12} />
        </mesh>
        {/* Standing valve ball */}
        <mesh position={[0, -0.52, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.5} metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Perforations collar */}
        <mesh position={[0, -1.1, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.4, 24]} />
          <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* ── PERFORATION SHOTS at casing (4 zones × 4 shots) ── */}
      {[-0.7, -0.3, 0.1, 0.5].map((oy, pi) => (
        <group key={pi} position={[0, wellBottomY + oy, 0]}>
          {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((angle, j) => (
            <group key={j} position={[Math.cos(angle) * casing_OD, 0, Math.sin(angle) * casing_OD]} rotation={[0, -angle, Math.PI * 0.5]}>
              <mesh>
                <cylinderGeometry args={[0.038, 0.012, 0.55, 8]} />
                <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
};
