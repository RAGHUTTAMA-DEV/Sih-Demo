import React from 'react';
import * as THREE from 'three';

interface SurfacePumpjackProps {
  crankAngle: number;       // Angle in radians
  strokeLength: number;     // Meters
  polishedRodPos: number;   // 0 to 1
  onClickComponent?: (name: string) => void;
}

export const SurfacePumpjack: React.FC<SurfacePumpjackProps> = ({
  crankAngle,
  strokeLength,
  polishedRodPos,
  onClickComponent
}) => {
  // Kinematic parameters
  const samsonHeight = 4.2;
  const beamLength = 5.4;
  const crankRadius = 0.95 * (strokeLength / 2.8);
  const pitmanLength = 3.7;

  // Kinematic beam angle calculation
  const beamAngle = Math.sin(crankAngle) * 0.22 * (strokeLength / 2.8);

  // Position of horsehead front tip
  const horseheadTipX = -beamLength * 0.5 * Math.cos(beamAngle);
  const horseheadTipY = samsonHeight + 0.3 + beamLength * 0.5 * Math.sin(beamAngle);

  // Crank pin location
  const crankPinX = beamLength * 0.38 + crankRadius * Math.cos(crankAngle);
  const crankPinY = 1.25 + crankRadius * Math.sin(crankAngle);

  return (
    <group position={[0, 0, 0]}>
      {/* CONCRETE GROUND PAD */}
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[8.4, 0.3, 4.0]} />
        <meshStandardMaterial color="#475569" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* HEAVY STEEL MOUNTING SKIDS */}
      {[-1.25, 1.25].map((z, i) => (
        <mesh key={i} position={[0, 0.35, z]} receiveShadow castShadow>
          <boxGeometry args={[8.0, 0.14, 0.28]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
        </mesh>
      ))}

      {/* SAMSON POST A-FRAME TOWER */}
      <group 
        position={[0, samsonHeight * 0.5 + 0.3, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('Samson Post Frame'); }}
      >
        {/* Main 4 Steel Tubular Legs */}
        <mesh position={[-0.65, 0, 0.65]} rotation={[0, 0, -0.15]} castShadow>
          <cylinderGeometry args={[0.095, 0.14, samsonHeight, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.88} roughness={0.2} />
        </mesh>
        <mesh position={[0.65, 0, 0.65]} rotation={[0, 0, 0.15]} castShadow>
          <cylinderGeometry args={[0.095, 0.14, samsonHeight, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.88} roughness={0.2} />
        </mesh>
        <mesh position={[-0.65, 0, -0.65]} rotation={[0, 0, -0.15]} castShadow>
          <cylinderGeometry args={[0.095, 0.14, samsonHeight, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.88} roughness={0.2} />
        </mesh>
        <mesh position={[0.65, 0, -0.65]} rotation={[0, 0, 0.15]} castShadow>
          <cylinderGeometry args={[0.095, 0.14, samsonHeight, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.88} roughness={0.2} />
        </mesh>

        {/* Horizontal & Diagonal Lattice Braces */}
        {[-1.0, 0.2].map((yOff, idx) => (
          <group key={idx} position={[0, yOff, 0]}>
            <mesh position={[0, 0, 0.6]} castShadow>
              <boxGeometry args={[1.35 - yOff * 0.2, 0.08, 0.08]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0, -0.6]} castShadow>
              <boxGeometry args={[1.35 - yOff * 0.2, 0.08, 0.08]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
            </mesh>
          </group>
        ))}

        {/* Samson Post Top Saddle Bearing Housing */}
        <mesh position={[0, samsonHeight * 0.5 + 0.12, 0]} castShadow>
          <boxGeometry args={[0.9, 0.32, 1.45]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, samsonHeight * 0.5 + 0.26, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.17, 0.17, 1.35, 24]} />
          <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* WALKING BEAM (ROCKS BACK AND FORTH) */}
      <group 
        position={[0, samsonHeight + 0.3, 0]} 
        rotation={[0, 0, beamAngle]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('Walking Beam'); }}
      >
        {/* Main Steel I-Beam Body */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[beamLength, 0.52, 0.4]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.75} roughness={0.2} />
        </mesh>
        {/* Beam Flange Reinforcement Plates */}
        <mesh position={[0, 0.53, 0]} castShadow>
          <boxGeometry args={[beamLength * 1.02, 0.07, 0.46]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.15} />
        </mesh>

        {/* HORSEHEAD ASSEMBLY (CURVED FRONT HEAD) */}
        <group position={[-beamLength * 0.5, 0.25, 0]}>
          <mesh position={[-0.35, -0.3, 0]} rotation={[0, 0, -0.3]} castShadow>
            <boxGeometry args={[0.68, 1.35, 0.44]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Curved Front Guide Face */}
          <mesh position={[-0.72, -0.55, 0]} castShadow>
            <cylinderGeometry args={[0.88, 0.88, 0.44, 24, 1, false, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color="#b45309" metalness={0.85} roughness={0.15} />
          </mesh>
        </group>

        {/* EQUALIZER BEARING (REAR CONNECTING END) */}
        <mesh position={[beamLength * 0.5, 0.1, 0]} rotation={[Math.PI * 0.5, 0, 0]} castShadow>
          <cylinderGeometry args={[0.17, 0.17, 0.95, 20]} />
          <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* MOTOR & GEARBOX HOUSING WITH COOLING FINS */}
      <group 
        position={[2.0, 0.75, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('Prime Mover & Gearbox'); }}
      >
        {/* Main Gearbox Housing */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.55, 0.9, 1.35]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Gearbox Oil Level Sight Glass */}
        <mesh position={[0, 0.1, 0.69]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} />
        </mesh>
        {/* Electric Motor Cylinder with Cooling Fins */}
        <mesh position={[-0.9, -0.1, 0]} rotation={[0, 0, Math.PI * 0.5]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.8, 24]} />
          <meshStandardMaterial color="#0284c7" metalness={0.75} roughness={0.2} />
        </mesh>
      </group>

      {/* ROTATING CRANK ARMS & HEAVY CAST-IRON COUNTERWEIGHTS */}
      <group 
        position={[2.0, 1.25, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('Crank & Counterweights'); }}
      >
        {/* Left Crank Arm */}
        <group position={[0, 0, 0.82]} rotation={[0, 0, crankAngle]}>
          <mesh position={[crankRadius * 0.5, 0, 0]} castShadow>
            <boxGeometry args={[crankRadius * 1.25, 0.3, 0.17]} />
            <meshStandardMaterial color="#475569" metalness={0.88} roughness={0.15} />
          </mesh>
          {/* Heavy Red Counterweight Block */}
          <mesh position={[crankRadius * 0.85, 0, 0]} castShadow>
            <boxGeometry args={[0.78, 1.3, 0.34]} />
            <meshStandardMaterial color="#dc2626" metalness={0.55} roughness={0.3} />
          </mesh>
          {/* Metallic Crank Pin */}
          <mesh position={[crankRadius, 0, -0.1]} rotation={[Math.PI * 0.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.095, 0.095, 0.34, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.05} />
          </mesh>
        </group>

        {/* Right Crank Arm */}
        <group position={[0, 0, -0.82]} rotation={[0, 0, crankAngle]}>
          <mesh position={[crankRadius * 0.5, 0, 0]} castShadow>
            <boxGeometry args={[crankRadius * 1.25, 0.3, 0.17]} />
            <meshStandardMaterial color="#475569" metalness={0.88} roughness={0.15} />
          </mesh>
          <mesh position={[crankRadius * 0.85, 0, 0]} castShadow>
            <boxGeometry args={[0.78, 1.3, 0.34]} />
            <meshStandardMaterial color="#dc2626" metalness={0.55} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* PITMAN ARMS */}
      <mesh 
        position={[(2.0 + crankPinX) * 0.5, (1.25 + crankPinY) * 0.5, 0.82]}
        rotation={[0, 0, Math.atan2(samsonHeight + 0.3 - crankPinY, beamLength * 0.5 - crankPinX)]}
        castShadow
      >
        <cylinderGeometry args={[0.058, 0.058, pitmanLength, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.1} />
      </mesh>
      <mesh 
        position={[(2.0 + crankPinX) * 0.5, (1.25 + crankPinY) * 0.5, -0.82]}
        rotation={[0, 0, Math.atan2(samsonHeight + 0.3 - crankPinY, beamLength * 0.5 - crankPinX)]}
        castShadow
      >
        <cylinderGeometry args={[0.058, 0.058, pitmanLength, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.1} />
      </mesh>

      {/* BRIDLE WIRE CABLES */}
      <mesh position={[-beamLength * 0.5 - 0.7, (horseheadTipY + (samsonHeight - 0.7)) * 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.024, 0.024, horseheadTipY - (samsonHeight - 0.7), 12]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.02} />
      </mesh>

      {/* SURFACE WELLHEAD, STUFFING BOX & PRESSURE GAUGES */}
      <group 
        position={[-beamLength * 0.5 - 0.7, 0.65, 0]}
        onClick={(e) => { e.stopPropagation(); onClickComponent?.('Surface Wellhead & Stuffing Box'); }}
      >
        {/* Stuffing Box Housing */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.28, 0.55, 24]} />
          <meshStandardMaterial color="#d97706" metalness={0.88} roughness={0.12} />
        </mesh>
        {/* Polished Rod Clamp with Bolts */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[0.22, 0.12, 0.3]} />
          <meshStandardMaterial color="#ef4444" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Flowline Valves & Cross Tee */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.45, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.15} />
        </mesh>
        <mesh position={[0.38, 0.1, 0]} rotation={[0, 0, Math.PI * 0.5]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.6, 20]} />
          <meshStandardMaterial color="#ef4444" metalness={0.85} roughness={0.15} />
        </mesh>
        {/* Surface Pressure Gauge Dial */}
        <group position={[-0.25, 0.25, 0.25]} rotation={[0, -Math.PI / 4, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} />
        </group>
      </group>

      {/* RECIPROCATING POLISHED ROD */}
      <mesh position={[-beamLength * 0.5 - 0.7, 1.25 + (0.5 - polishedRodPos) * strokeLength * 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.048, 0.048, 2.3, 20]} />
        <meshStandardMaterial color="#ffffff" metalness={0.99} roughness={0.01} />
      </mesh>
    </group>
  );
};
