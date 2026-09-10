import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CyclePhase } from '../../types/simulation';

interface ReservoirZoneProps {
  phase: CyclePhase;
  reservoirTemp: number;
  heatedZoneRadius: number;
  onClickComponent?: (name: string) => void;
}

export const ReservoirZone: React.FC<ReservoirZoneProps> = ({
  phase,
  reservoirTemp,
  heatedZoneRadius,
  onClickComponent,
}) => {
  const wellheadX = -5.4;
  const reservoirBottomY = -14.5;
  const injParticleCount = 200;
  const oilParticleCount = 100;
  const injParticlesRef = useRef<THREE.Points>(null);
  const oilParticlesRef = useRef<THREE.Points>(null);
  const thermalPulseRef = useRef<THREE.Mesh>(null);
  const thermalPulseRef2 = useRef<THREE.Mesh>(null);

  const visualRadius = useMemo(() => 2.0 + (heatedZoneRadius / 35.0) * 5.5, [heatedZoneRadius]);

  const glowColor = useMemo(() => {
    const t = Math.min(1, Math.max(0, (reservoirTemp - 48) / (280 - 48)));
    const cold = new THREE.Color('#0369a1');
    const warm = new THREE.Color('#ea580c');
    const hot  = new THREE.Color('#ff2200');
    const result = new THREE.Color();
    if (t < 0.5) result.lerpColors(cold, warm, t * 2);
    else          result.lerpColors(warm, hot, (t - 0.5) * 2);
    return result;
  }, [reservoirTemp]);

  const innerGlowColor = useMemo(() => {
    return glowColor.clone().lerp(new THREE.Color('#ffffff'), 0.35);
  }, [glowColor]);

  // Injection steam particles
  const [injPos, injVel] = useMemo(() => {
    const pos = new Float32Array(injParticleCount * 3);
    const vel = new Float32Array(injParticleCount * 3);
    for (let i = 0; i < injParticleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.35;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      vel[i * 3] = Math.cos(angle) * (0.6 + Math.random() * 1.5);
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      vel[i * 3 + 2] = Math.sin(angle) * (0.6 + Math.random() * 1.5);
    }
    return [pos, vel];
  }, []);

  // Oil inflow particles (converging toward wellbore during PRODUCTION)
  const [oilPos] = useMemo(() => {
    const pos = new Float32Array(oilParticleCount * 3);
    for (let i = 0; i < oilParticleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.5 + Math.random() * (visualRadius * 0.9);
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return [pos];
  }, [visualRadius]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Animate thermal pulse rings
    if (thermalPulseRef.current && thermalPulseRef2.current) {
      const pulse1 = (Math.sin(t * 1.2) * 0.5 + 0.5);
      const pulse2 = (Math.sin(t * 1.2 + Math.PI) * 0.5 + 0.5);
      if (thermalPulseRef.current.material instanceof THREE.MeshBasicMaterial) {
        thermalPulseRef.current.material.opacity = 0.15 + pulse1 * 0.55;
      }
      if (thermalPulseRef2.current.material instanceof THREE.MeshBasicMaterial) {
        thermalPulseRef2.current.material.opacity = 0.1 + pulse2 * 0.45;
      }
      thermalPulseRef.current.scale.setScalar(0.85 + pulse1 * 0.22);
      thermalPulseRef2.current.scale.setScalar(0.92 + pulse2 * 0.18);
    }

    // Steam injection particles spread outward
    if (injParticlesRef.current && phase === 'INJECTION') {
      const positions = injParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < injParticleCount; i++) {
        positions[i * 3]     += injVel[i * 3]     * delta * 2.2;
        positions[i * 3 + 1] += injVel[i * 3 + 1] * delta * 2.2;
        positions[i * 3 + 2] += injVel[i * 3 + 2] * delta * 2.2;
        const dist = Math.sqrt(positions[i * 3] ** 2 + positions[i * 3 + 2] ** 2);
        if (dist > visualRadius * 0.92) {
          const angle = Math.random() * Math.PI * 2;
          positions[i * 3]     = Math.cos(angle) * 0.18;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 0.9;
          positions[i * 3 + 2] = Math.sin(angle) * 0.18;
        }
      }
      injParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Oil inflow particles converge toward center
    if (oilParticlesRef.current && phase === 'PRODUCTION') {
      const positions = oilParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < oilParticleCount; i++) {
        const px = positions[i * 3];
        const pz = positions[i * 3 + 2];
        const r  = Math.sqrt(px * px + pz * pz) + 0.001;
        const speed = 0.8 + (r / visualRadius) * 1.5;
        positions[i * 3]     -= (px / r) * delta * speed;
        positions[i * 3 + 2] -= (pz / r) * delta * speed;
        if (r < 0.2) {
          const angle = Math.random() * Math.PI * 2;
          const rad = 0.5 + Math.random() * visualRadius * 0.92;
          positions[i * 3]     = Math.cos(angle) * rad;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
          positions[i * 3 + 2] = Math.sin(angle) * rad;
        }
      }
      oilParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[wellheadX, reservoirBottomY, 0]}>

      {/* ── MAIN SANDSTONE RESERVOIR BED (Jodhpur) ── */}
      <mesh
        position={[0, -1.2, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('Jodhpur Sandstone Formation (17-19° API Crude)'); }}
      >
        <cylinderGeometry args={[15, 15, 3.8, 40]} />
        <meshStandardMaterial color="#4a2c10" roughness={0.72} metalness={0.18} emissive="#f59e0b" emissiveIntensity={0.08} />
      </mesh>

      {/* Sandstone grain texture rings */}
      {[5, 8, 11, 14].map((r, ri) => (
        <mesh key={ri} position={[0, -1.2, 0]} rotation={[Math.PI * 0.5, 0, ri * 0.3]}>
          <ringGeometry args={[r - 0.1, r, 48]} />
          <meshBasicMaterial color="#6b3a1f" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* ── SHALE CAP ROCK SEAL ── */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[14.5, 14.5, 0.4, 36]} />
        <meshStandardMaterial color="#1c2833" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* ── THERMAL HEATED ZONE (outer envelope) ── */}
      <mesh
        position={[0, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.(`CSS Heated Zone (R=${heatedZoneRadius}m, T=${reservoirTemp}°C)`); }}
      >
        <sphereGeometry args={[visualRadius, 36, 36]} />
        <meshStandardMaterial
          color={glowColor}
          transparent
          opacity={0.42}
          roughness={0.12}
          emissive={glowColor}
          emissiveIntensity={0.75}
          wireframe={phase === 'SOAK'}
        />
      </mesh>

      {/* INNER THERMAL CORE */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[visualRadius * 0.48, 28, 28]} />
        <meshBasicMaterial color={innerGlowColor} transparent opacity={0.65} />
      </mesh>

      {/* THERMAL PULSE RINGS (always animate) */}
      <mesh ref={thermalPulseRef} position={[0, 0, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
        <ringGeometry args={[visualRadius * 0.35, visualRadius * 0.92, 48]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={thermalPulseRef2} position={[0, 0, 0]} rotation={[0, 0.5, Math.PI * 0.5]}>
        <ringGeometry args={[visualRadius * 0.28, visualRadius * 0.78, 48]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* SOAK PHASE: static wave rings */}
      {phase === 'SOAK' && (
        <group>
          {[0.45, 0.65, 0.85].map((frac, si) => (
            <mesh key={si} position={[0, 0, 0]} rotation={[Math.PI * 0.5, si * 0.4, 0]}>
              <ringGeometry args={[visualRadius * frac - 0.1, visualRadius * frac, 40]} />
              <meshBasicMaterial color={si % 2 === 0 ? '#f59e0b' : '#ef4444'} transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}

      {/* INJECTION PHASE: steam particles */}
      {phase === 'INJECTION' && (
        <points ref={injParticlesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={injParticleCount} array={injPos} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial size={0.2} color="#a5f3fc" transparent opacity={0.9} blending={THREE.AdditiveBlending} sizeAttenuation />
        </points>
      )}

      {/* PRODUCTION PHASE: oil convergence particles */}
      {phase === 'PRODUCTION' && (
        <points ref={oilParticlesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={oilParticleCount} array={oilPos} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial size={0.18} color="#fbbf24" transparent opacity={0.85} blending={THREE.AdditiveBlending} sizeAttenuation />
        </points>
      )}

      {/* ── PERFORATION ENTRY POINTS (radial spokes toward wellbore) ── */}
      {[0, 60, 120, 180, 240, 300].map((deg, pi) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <mesh
            key={pi}
            position={[Math.cos(rad) * 0.65, -0.3, Math.sin(rad) * 0.65]}
            rotation={[0, -rad, Math.PI * 0.5]}
          >
            <cylinderGeometry args={[0.04, 0.012, 0.6, 8]} />
            <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={1.0} />
          </mesh>
        );
      })}

      {/* ── WELLBORE COMPLETION INTERVAL ── */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 2.8, 20]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.88} roughness={0.12} emissive="#f59e0b" emissiveIntensity={0.3} />
      </mesh>

      {/* ── OIL SATURATED ZONE gradient ── */}
      {[2, 4, 6, 8, 10].map((r, ri) => (
        <mesh key={ri} position={[0, -1.2, 0]}>
          <cylinderGeometry args={[r, r, 3.6 - ri * 0.08, 32, 1, true]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.04 + ri * 0.008} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};
