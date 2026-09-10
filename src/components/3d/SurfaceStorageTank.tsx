import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SurfaceStorageTankProps {
  wellheadX: number;
  productionRate: number;
  fluidViscosityIndex: number;
  onClickComponent?: (name: string) => void;
}

export const SurfaceStorageTank: React.FC<SurfaceStorageTankProps> = ({
  wellheadX,
  productionRate,
  fluidViscosityIndex,
  onClickComponent,
}) => {
  const tankX = wellheadX - 5.5;
  const flowlineLength = Math.abs(tankX - wellheadX);
  const particleCount = 40;
  const particlesRef = useRef<THREE.Points>(null);
  const fillFraction = Math.min(0.92, 0.3 + productionRate / 80);

  const [particlePositions, particleSpeeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const speed = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3]     = wellheadX - Math.random() * flowlineLength;
      pos[i * 3 + 1] = 0.7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      speed[i] = 1.0 + Math.random() * 1.8;
    }
    return [pos, speed];
  }, [wellheadX, flowlineLength]);

  useFrame((_, delta) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const spd = particleSpeeds[i] * Math.max(0.25, productionRate / 48.6);
        positions[i * 3] -= delta * spd;
        if (positions[i * 3] <= tankX + 1.0) {
          positions[i * 3] = wellheadX - 0.15;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* ── SURFACE FLOWLINE ── */}
      <group position={[(wellheadX + tankX) / 2 + 0.7, 0.68, 0]}>
        {/* Main pipe */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, flowlineLength - 1.4, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.82} roughness={0.18} />
        </mesh>
        {/* Pipe insulation wrap */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.11, 0.11, flowlineLength - 1.4, 16, 1, true]} />
          <meshStandardMaterial color="#78716c" roughness={0.9} metalness={0.1} transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
        {/* Flange joints */}
        {[-1.8, 0.0, 1.8].map((xf, fi) => (
          <mesh key={fi} position={[xf, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 0.09, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.1} />
          </mesh>
        ))}
        {/* Pipe supports (2 saddles) */}
        {[-1.5, 1.5].map((xs, si) => (
          <mesh key={si} position={[xs, -0.28, 0]} castShadow>
            <boxGeometry args={[0.12, 0.5, 0.18]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Flow particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={particlePositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.12} color="#d97706" transparent opacity={0.88} sizeAttenuation blending={THREE.AdditiveBlending} />
      </points>

      {/* ── STORAGE TANK BATTERY ── */}
      <group
        position={[tankX, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('Surface Crude Oil Storage Tank Battery'); }}
      >
        {/* Containment berm (concrete ring dike) */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <cylinderGeometry args={[2.6, 2.75, 0.22, 36]} />
          <meshStandardMaterial color="#374151" roughness={0.85} metalness={0.12} />
        </mesh>
        {/* Berm top ring */}
        <mesh position={[0, 0.24, 0]} receiveShadow>
          <torusGeometry args={[2.68, 0.07, 6, 36]} />
          <meshStandardMaterial color="#4b5563" roughness={0.8} metalness={0.15} />
        </mesh>

        {/* Tank shell - main cylinder */}
        <mesh position={[0, 1.95, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[1.85, 1.85, 3.5, 36]} />
          <meshStandardMaterial color="#0369a1" roughness={0.22} metalness={0.75} />
        </mesh>

        {/* Shell corrosion / weld seam rings */}
        {[0.5, 1.5, 2.5].map((yf, ti) => (
          <mesh key={ti} position={[0, yf + 0.25, 0]}>
            <torusGeometry args={[1.855, 0.015, 6, 36]} />
            <meshStandardMaterial color="#075985" metalness={0.88} roughness={0.2} />
          </mesh>
        ))}

        {/* Tank stripe / warning band */}
        <mesh position={[0, 2.8, 0]}>
          <cylinderGeometry args={[1.86, 1.86, 0.25, 36, 1, true]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.4} />
        </mesh>

        {/* Cone roof */}
        <mesh position={[0, 3.82, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.22, 1.85, 0.55, 36]} />
          <meshStandardMaterial color="#0c4a6e" roughness={0.25} metalness={0.78} />
        </mesh>

        {/* Vent / breather pipe */}
        <mesh position={[0, 4.42, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.55, 10]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Vent cap */}
        <mesh position={[0, 4.72, 0]}>
          <cylinderGeometry args={[0.1, 0.06, 0.1, 10]} />
          <meshStandardMaterial color="#64748b" metalness={0.88} roughness={0.12} />
        </mesh>

        {/* Roof walkway guardrail torus */}
        <mesh position={[0, 3.96, 0]}>
          <torusGeometry args={[1.8, 0.028, 8, 36]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.88} roughness={0.12} />
        </mesh>

        {/* Tank bottom sump */}
        <mesh position={[0, 0.26, 0]} receiveShadow>
          <cylinderGeometry args={[1.85, 1.85, 0.1, 36]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.2} />
        </mesh>

        {/* FLUID LEVEL INSIDE (glowing oil) */}
        <mesh position={[0, 0.35 + fillFraction * 3.3, 0]}>
          <cylinderGeometry args={[1.83, 1.83, fillFraction * 3.3, 32]} />
          <meshStandardMaterial
            color="#92400e"
            transparent
            opacity={0.55}
            roughness={0.12}
            metalness={0.12}
            emissive="#b45309"
            emissiveIntensity={0.35}
          />
        </mesh>
        {/* Fluid surface meniscus */}
        <mesh position={[0, 0.35 + fillFraction * 3.3 * 2 - fillFraction * 3.3 + 0.03, 0]}>
          <cylinderGeometry args={[1.82, 1.82, 0.04, 32]} />
          <meshStandardMaterial color="#d97706" emissive="#f59e0b" emissiveIntensity={0.55} transparent opacity={0.8} />
        </mesh>

        {/* Level gauge column */}
        <mesh position={[1.87, 2.0, 0]} castShadow>
          <boxGeometry args={[0.07, 3.5, 0.1]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.88} roughness={0.12} />
        </mesh>
        {/* Gauge indicator float */}
        <mesh position={[1.9, 0.5 + fillFraction * 2.85, 0]}>
          <boxGeometry args={[0.05, 0.28, 0.08]} />
          <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.9} />
        </mesh>

        {/* Discharge valve */}
        <mesh position={[1.65, 0.55, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.55, 16]} />
          <meshStandardMaterial color="#dc2626" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Valve wheel */}
        <mesh position={[1.98, 0.55, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
          <torusGeometry args={[0.1, 0.016, 6, 20]} />
          <meshStandardMaterial color="#dc2626" metalness={0.82} roughness={0.2} />
        </mesh>

        {/* Access ladder on tank side */}
        {[0.6, 1.1, 1.6, 2.1, 2.6, 3.1, 3.6].map((yL, li) => (
          <mesh key={li} position={[-1.88, yL, 0.05]}>
            <boxGeometry args={[0.04, 0.04, 0.38]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.15} />
          </mesh>
        ))}
        {/* Ladder uprights */}
        {[-0.18, 0.18].map((zL, li) => (
          <mesh key={li} position={[-1.88, 2.1, zL]}>
            <boxGeometry args={[0.04, 3.1, 0.04]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.15} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
