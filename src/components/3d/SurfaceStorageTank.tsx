import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SurfaceStorageTankProps {
  wellheadX: number; // e.g. -5.4
  productionRate: number; // BOPD
  fluidViscosityIndex: number;
  onClickComponent?: (name: string) => void;
}

export const SurfaceStorageTank: React.FC<SurfaceStorageTankProps> = ({
  wellheadX,
  productionRate,
  fluidViscosityIndex,
  onClickComponent
}) => {
  const tankX = wellheadX - 5.5; // -10.9
  const tankZ = 0;
  const flowlineLength = Math.abs(tankX - wellheadX); // 5.5m pipe
  const particleCount = 35;
  const particlesRef = useRef<THREE.Points>(null);

  // Flow particles moving horizontally along the surface flowline from wellhead to storage tank
  const [particlePositions, particleSpeeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const speed = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = wellheadX - Math.random() * flowlineLength; // X along pipe
      pos[i * 3 + 1] = 0.65; // Y pipe height
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.12; // Z slight offset
      speed[i] = 1.2 + Math.random() * 1.5;
    }
    return [pos, speed];
  }, [wellheadX, flowlineLength]);

  // Animate oil flow particles along the surface pipeline
  useFrame((_, delta) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const flowSpeed = particleSpeeds[i] * Math.max(0.3, (productionRate / 48.6));
        positions[i * 3] -= delta * flowSpeed; // Move towards storage tank (-X)

        // Reset particle when it reaches tank
        if (positions[i * 3] <= tankX + 1.2) {
          positions[i * 3] = wellheadX - 0.1;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. SURFACE FLOWLINE PIPELINE (WELLHEAD -> STORAGE TANK) */}
      <group position={[(wellheadX + tankX) / 2 + 0.6, 0.65, 0]}>
        {/* Steel Pipe Cylinder */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, flowlineLength - 1.2, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Pipe Flange Joints */}
        {[-1.8, 0, 1.8].map((xOff, idx) => (
          <mesh key={idx} position={[xOff, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.08, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
      </group>

      {/* 2. ANIMATED CRUDE OIL FLOW PARTICLES INSIDE FLOWLINE */}
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
          size={0.14}
          color="#d97706"
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      {/* 3. OIL STORAGE TANK BATTERY UNIT */}
      <group
        position={[tankX, 0, tankZ]}
        onClick={(e) => {
          e.stopPropagation();
          onClickComponent?.('Surface Crude Oil Storage Tank Battery');
        }}
      >
        {/* Tank Concrete Foundation / Containment Berm */}
        <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[2.2, 2.3, 0.2, 32]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.2} />
        </mesh>

        {/* Main Cylindrical Storage Tank */}
        <mesh position={[0, 1.85, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[1.8, 1.8, 3.3, 32]} />
          <meshStandardMaterial color="#0284c7" roughness={0.25} metalness={0.7} />
        </mesh>

        {/* Tank Top Dome Roof */}
        <mesh position={[0, 3.55, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.2, 1.8, 0.4, 32]} />
          <meshStandardMaterial color="#0369a1" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Tank Level Gauge Column */}
        <mesh position={[1.82, 1.85, 0]} castShadow>
          <boxGeometry args={[0.08, 3.0, 0.12]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Active Oil Level Indicator inside Gauge */}
        <mesh position={[1.84, 0.8 + (productionRate / 100) * 1.5, 0]} castShadow>
          <boxGeometry args={[0.06, 0.4, 0.08]} />
          <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.8} />
        </mesh>

        {/* Tank Top Walkway Guardrail */}
        <mesh position={[0, 3.8, 0]} rotation={[0, 0, 0]} castShadow>
          <torusGeometry args={[1.75, 0.03, 8, 32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Tank Discharge Inlet Valve */}
        <mesh position={[1.6, 0.65, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.5, 16]} />
          <meshStandardMaterial color="#ef4444" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};
