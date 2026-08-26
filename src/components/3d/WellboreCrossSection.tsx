import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface WellboreCrossSectionProps {
  polishedRodPos: number;        // 0 to 1
  strokeLength: number;          // Meters
  fluidViscosityIndex: number;   // 0.0 (hot mobile) to 1.0 (cold viscous)
  onClickComponent?: (name: string) => void;
}

export const WellboreCrossSection: React.FC<WellboreCrossSectionProps> = ({
  polishedRodPos,
  strokeLength,
  fluidViscosityIndex,
  onClickComponent
}) => {
  const wellboreDepth = 14.5;
  const wellheadX = -5.4;
  const wellTopY = 0.3;
  const wellBottomY = -wellboreDepth;
  const particleCount = 50;
  const particlesRef = useRef<THREE.Points>(null);

  // Dynamic fluid color based on viscosity gradient
  const fluidColor = useMemo(() => {
    const colorHot = new THREE.Color('#ff4500');
    const colorWarm = new THREE.Color('#f59e0b');
    const colorCold = new THREE.Color('#1a0e07');

    const result = new THREE.Color();
    if (fluidViscosityIndex < 0.4) {
      const t = fluidViscosityIndex / 0.4;
      result.lerpColors(colorHot, colorWarm, t);
    } else {
      const t = (fluidViscosityIndex - 0.4) / 0.6;
      result.lerpColors(colorWarm, colorCold, t);
    }
    return result;
  }, [fluidViscosityIndex]);

  // Reciprocating plunger vertical displacement
  const plungerOffsetY = (0.5 - polishedRodPos) * strokeLength * 0.45;

  // Fluid upward flow particles geometry
  const [particlePositions, particleSpeeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const speed = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.08 + Math.random() * 0.16;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = wellBottomY + Math.random() * wellboreDepth;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      speed[i] = 1.4 + Math.random() * 2.2;
    }
    return [pos, speed];
  }, [wellBottomY, wellboreDepth]);

  // Animate fluid particles flowing upwards inside tubing
  useFrame((_, delta) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const currentSpeed = particleSpeeds[i] * (1.2 - fluidViscosityIndex * 0.7);
        positions[i * 3 + 1] += delta * currentSpeed;

        if (positions[i * 3 + 1] > wellTopY) {
          positions[i * 3 + 1] = wellBottomY + 0.5;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[wellheadX, 0, 0]}>
      {/* OUTER WELL CASING (TRANSPARENT WITH HIGH VISIBILITY SHINE) */}
      <mesh 
        position={[0, (wellTopY + wellBottomY) * 0.5, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('7" Production Casing String'); }}
      >
        <cylinderGeometry args={[0.58, 0.58, wellboreDepth, 32, 1, true]} />
        <meshPhysicalMaterial 
          color="#38bdf8" 
          transparent={true} 
          opacity={0.35} 
          roughness={0.05} 
          metalness={0.7}
          transmission={0.65}
          clearcoat={1.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* CASING COLLARS & DEPTH BADGE MARKERS */}
      {[
        { depthY: -2, label: '-200m' },
        { depthY: -5, label: '-500m' },
        { depthY: -8, label: '-800m' },
        { depthY: -11, label: '-1000m' },
        { depthY: -14, label: '-1050m (TD)' }
      ].map((item) => (
        <group key={item.depthY} position={[0, item.depthY, 0]}>
          {/* Collar Ring */}
          <mesh>
            <cylinderGeometry args={[0.61, 0.61, 0.28, 24]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Depth Label Badge via Html */}
          <Html position={[-0.85, 0, 0]} distanceFactor={14} center>
            <span className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-cyan-500/40 text-cyan-400 font-mono text-[9px] font-bold shadow-md">
              {item.label}
            </span>
          </Html>
        </group>
      ))}

      {/* INNER PRODUCTION TUBING */}
      <mesh 
        position={[0, (wellTopY + wellBottomY) * 0.5, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('2-7/8" Production Tubing String'); }}
      >
        <cylinderGeometry args={[0.34, 0.34, wellboreDepth, 24, 1, true]} />
        <meshPhysicalMaterial 
          color="#94a3b8" 
          transparent={true} 
          opacity={0.4} 
          roughness={0.1} 
          metalness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* FLUID COLUMN INSIDE TUBING (DYNAMIC COLOR & VISCOSITY OPACITY) */}
      <mesh position={[0, (wellTopY + wellBottomY) * 0.5, 0]}>
        <cylinderGeometry args={[0.32, 0.32, wellboreDepth - 0.1, 24]} />
        <meshStandardMaterial 
          color={fluidColor} 
          transparent={true} 
          opacity={0.45 + fluidViscosityIndex * 0.5}
          roughness={0.2}
          metalness={0.1}
          emissive={fluidColor}
          emissiveIntensity={0.35 * (1 - fluidViscosityIndex)}
        />
      </mesh>

      {/* RISING FLUID PARTICLES */}
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
          size={0.16} 
          color={fluidColor} 
          transparent={true} 
          opacity={0.9}
          blending={THREE.AdditiveBlending} 
        />
      </points>

      {/* RECIPROCATING SUCKER ROD STRING */}
      <mesh 
        position={[0, (wellTopY + wellBottomY) * 0.5 + plungerOffsetY, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('7/8" Sucker Rod String'); }}
      >
        <cylinderGeometry args={[0.048, 0.048, wellboreDepth, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.02} />
      </mesh>

      {/* SUCKER ROD COUPLINGS */}
      {[-2, -5, -8, -11, -13.5].map((offY, idx) => (
        <mesh key={idx} position={[0, offY + plungerOffsetY, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.18, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
        </mesh>
      ))}

      {/* DOWNHOLE SUCKER ROD PUMP (SRP) PLUNGER ASSEMBLY */}
      <group 
        position={[0, wellBottomY + 1.2 + plungerOffsetY, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('Downhole Plunger & Traveling Valve'); }}
      >
        {/* Plunger Barrel */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 1.3, 24]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Traveling Valve Ball */}
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Standing Valve Seat */}
        <mesh position={[0, -0.65, 0]}>
          <cylinderGeometry args={[0.29, 0.29, 0.32, 24]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
};
