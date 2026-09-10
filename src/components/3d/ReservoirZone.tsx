import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CyclePhase } from '../../types/simulation';

interface ReservoirZoneProps {
  phase: CyclePhase;
  reservoirTemp: number;     // °C
  heatedZoneRadius: number;  // Meters
  onClickComponent?: (name: string) => void;
}

export const ReservoirZone: React.FC<ReservoirZoneProps> = ({
  phase,
  reservoirTemp,
  heatedZoneRadius,
  onClickComponent
}) => {
  const wellheadX = -5.4;
  const reservoirBottomY = -14.5;
  const particleCount = 150;
  const particlesRef = useRef<THREE.Points>(null);

  // Normalize radius for 3D visual scale (maps 5m-35m to ~2.5m - 7.5m scene units)
  const visualRadius = useMemo(() => {
    return 1.8 + (heatedZoneRadius / 35.0) * 5.2;
  }, [heatedZoneRadius]);

  // Color lerp based on temperature (48°C ambient sandstone -> 280°C steam soak)
  const glowColor = useMemo(() => {
    const t = Math.min(1, Math.max(0, (reservoirTemp - 48) / (280 - 48)));
    const coldColor = new THREE.Color('#0284c7'); // Cyan blue at base temp
    const hotColor = new THREE.Color('#ff3300');  // Glowing orange-red at 280°C
    const result = new THREE.Color();
    result.lerpColors(coldColor, hotColor, t);
    return result;
  }, [reservoirTemp]);

  // Steam Injection Particle Geometry
  const [particlePositions, particleVelocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.4;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      vel[i * 3] = Math.cos(angle) * (0.8 + Math.random() * 1.2);
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      vel[i * 3 + 2] = Math.sin(angle) * (0.8 + Math.random() * 1.2);
    }
    return [pos, vel];
  }, []);

  // Animate steam injection particles outward during INJECTION phase
  useFrame((state, delta) => {
    if (particlesRef.current && phase === 'INJECTION') {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleVelocities[i * 3] * delta * 2.0;
        positions[i * 3 + 1] += particleVelocities[i * 3 + 1] * delta * 2.0;
        positions[i * 3 + 2] += particleVelocities[i * 3 + 2] * delta * 2.0;

        const dist = Math.sqrt(
          positions[i * 3] * positions[i * 3] +
          positions[i * 3 + 2] * positions[i * 3 + 2]
        );

        if (dist > visualRadius * 0.9) {
          // Reset to center wellbore
          const angle = Math.random() * Math.PI * 2;
          positions[i * 3] = Math.cos(angle) * 0.2;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 1.0;
          positions[i * 3 + 2] = Math.sin(angle) * 0.2;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[wellheadX, reservoirBottomY, 0]}>
      {/* GEOLOGICAL RESERVOIR FORMATION BED (JODHPUR SANDSTONE) */}
      <mesh 
        position={[0, -1.0, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('Jodhpur Sandstone Formation (17-19° API Crude)'); }}
      >
        <cylinderGeometry args={[14, 14, 3.5, 32]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} metalness={0.2} emissive="#f59e0b" emissiveIntensity={0.12} />
      </mesh>

      {/* VOLUMETRIC THERMAL HEATED ZONE SPHERE (CSS STEAM SOAK) */}
      <mesh 
        position={[0, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.(`CSS Heated Zone (Radius: ${heatedZoneRadius}m, Temp: ${reservoirTemp}°C)`); }}
      >
        <sphereGeometry args={[visualRadius, 32, 32]} />
        <meshStandardMaterial 
          color={glowColor}
          transparent={true}
          opacity={0.55}
          roughness={0.15}
          emissive={glowColor}
          emissiveIntensity={0.85}
          wireframe={phase === 'SOAK'}
        />
      </mesh>

      {/* THERMAL SOAKING WAVE PULSE RINGS (ACTIVE DURING SOAK PHASE) */}
      {phase === 'SOAK' && (
        <group position={[0, 0, 0]}>
          <mesh rotation={[Math.PI * 0.5, 0, 0]}>
            <ringGeometry args={[visualRadius * 0.4, visualRadius * 0.95, 32]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI * 0.5]}>
            <ringGeometry args={[visualRadius * 0.3, visualRadius * 0.85, 32]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* INNER HIGH-HEAT CORE */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[visualRadius * 0.45, 24, 24]} />
        <meshBasicMaterial 
          color={glowColor} 
          transparent={true} 
          opacity={0.7} 
        />
      </mesh>

      {/* STEAM INJECTION PARTICLE PLUME (ACTIVE DURING INJECTION PHASE) */}
      {phase === 'INJECTION' && (
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
            size={0.25} 
            color="#06b6d4" 
            transparent={true} 
            opacity={0.85} 
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* OIL INFLOW CONVERGING STREAM LINES (ACTIVE DURING PRODUCTION PHASE) */}
      {phase === 'PRODUCTION' && (
        <group position={[0, 0, 0]}>
          {[0, 1.2, 2.4, 3.6, 4.8].map((angle, k) => (
            <mesh key={k} position={[Math.cos(angle) * visualRadius * 0.65, (k % 2 === 0 ? 0.3 : -0.3), Math.sin(angle) * visualRadius * 0.65]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshBasicMaterial color="#fbbf24" transparent opacity={0.9} />
            </mesh>
          ))}
        </group>
      )}

      {/* PERFORATION ZONES / SHOT HOLES AT RESERVOIR INFLOW */}
      {[-0.6, -0.2, 0.2, 0.6].map((offsetY, i) => (
        <group key={i} position={[0, offsetY, 0]}>
          {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((angle, j) => (
            <mesh 
              key={j} 
              position={[Math.cos(angle) * 0.45, 0, Math.sin(angle) * 0.45]}
              rotation={[0, -angle, Math.PI * 0.5]}
            >
              <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
              <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.8} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

