import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment, Stars, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { SurfacePumpjack } from './SurfacePumpjack';
import { WellboreCrossSection } from './WellboreCrossSection';
import { ReservoirZone } from './ReservoirZone';
import { SurfaceStorageTank } from './SurfaceStorageTank';
import { DynamometerGhostOverlay } from './DynamometerGhostOverlay';
import { SpatialAnnotations } from './SpatialAnnotations';
import { WellState, CameraPreset } from '../../types/simulation';

interface DigitalTwinSceneProps {
  wellState: WellState;
  activeCameraPreset: CameraPreset;
  showSpatialTags?: boolean;
  onSelectComponent: (name: string) => void;
}

// ── Camera Preset Controller ──
const CameraPresetController: React.FC<{
  activePreset: CameraPreset;
  controlsRef: React.RefObject<any>;
}> = ({ activePreset, controlsRef }) => {
  const { camera } = useThree();
  const isTransitioningRef   = useRef<boolean>(false);
  const transitionProgressRef = useRef<number>(1.0);
  const startPosRef    = useRef(new THREE.Vector3());
  const startTargetRef = useRef(new THREE.Vector3());
  const endPosRef      = useRef(new THREE.Vector3());
  const endTargetRef   = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!controlsRef.current) return;
    startPosRef.current.copy(camera.position);
    startTargetRef.current.copy(controlsRef.current.target);

    switch (activePreset) {
      case 'overview':
        endPosRef.current.set(3.5, 4.0, 11.5);
        endTargetRef.current.set(-2.5, 1.2, 0);
        break;
      case 'pumpjack':
        endPosRef.current.set(1.8, 2.5, 6.5);
        endTargetRef.current.set(0, 1.8, 0);
        break;
      case 'wellbore':
        endPosRef.current.set(-1.2, -4.5, 9.0);
        endTargetRef.current.set(-5.4, -6.0, 0);
        break;
      case 'reservoir':
        endPosRef.current.set(-1.2, -12.5, 10.0);
        endTargetRef.current.set(-5.4, -14.0, 0);
        break;
    }
    transitionProgressRef.current = 0;
    isTransitioningRef.current = true;
  }, [activePreset, camera, controlsRef]);

  useFrame((_, delta) => {
    if (isTransitioningRef.current && transitionProgressRef.current < 1.0) {
      transitionProgressRef.current += delta * 2.5;
      const t = Math.min(1.0, transitionProgressRef.current);
      const easeT = t * t * (3 - 2 * t);
      camera.position.lerpVectors(startPosRef.current, endPosRef.current, easeT);
      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(startTargetRef.current, endTargetRef.current, easeT);
        controlsRef.current.update();
      }
      if (t >= 1.0) isTransitioningRef.current = false;
    }
  });

  return null;
};

// ── Desert Terrain Ground ──
const DesertGround: React.FC = () => {
  const groundColor = '#b45309';
  const sandColor   = '#d97706';
  const dirtColor   = '#92400e';

  return (
    <group>
      {/* Main desert floor */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120, 1, 1]} />
        <meshStandardMaterial color={groundColor} roughness={0.95} metalness={0.02} />
      </mesh>

      {/* Foreground sand patches */}
      {[
        [4, 0, 5], [-8, 0, 4], [6, 0, -3], [-3, 0, -5], [9, 0, 2],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x as number, y as number + 0.005, z as number]} rotation={[-Math.PI / 2, 0, Math.random()]}>
          <planeGeometry args={[2 + Math.random() * 3, 1.5 + Math.random() * 2]} />
          <meshStandardMaterial color={sandColor} roughness={0.98} metalness={0.01} />
        </mesh>
      ))}

      {/* Small rocks & boulders scattered around */}
      {[
        [6, 0.08, 3, 0.18],  [8, 0.12, -2, 0.25], [-7, 0.09, 3, 0.2],
        [5, 0.06, -4, 0.14], [-9, 0.15, -3, 0.3],  [11, 0.1, 1, 0.22],
        [-4, 0.07, 6, 0.15], [3, 0.11, 6, 0.2],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x as number, y as number, z as number]} rotation={[Math.random(), Math.random(), Math.random()]} castShadow>
          <dodecahedronGeometry args={[r as number, 0]} />
          <meshStandardMaterial color={dirtColor} roughness={0.88} metalness={0.05} />
        </mesh>
      ))}

      {/* Concrete wellsite pad (central) */}
      <mesh position={[0.5, 0.04, 0]} receiveShadow>
        <boxGeometry args={[16, 0.08, 9]} />
        <meshStandardMaterial color="#374151" roughness={0.82} metalness={0.08} />
      </mesh>
      {/* Pad grid texture overlay */}
      <gridHelper args={[16, 16, '#4b5563', '#1f2937']} position={[0.5, 0.09, 0]} />

      {/* Anchor / lifting lugs recessed into concrete */}
      {[-5, -2, 1, 4].map((xb, bi) => (
        <mesh key={bi} position={[xb, 0.09, 3.8]} receiveShadow>
          <boxGeometry args={[0.22, 0.08, 0.22]} />
          <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.1} />
        </mesh>
      ))}

      {/* Road / access track leading in */}
      <mesh position={[14, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 4]} />
        <meshStandardMaterial color="#4b5563" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Road center line dashes */}
      {[12, 14, 16, 18, 20].map((xd, di) => (
        <mesh key={di} position={[xd, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.9, 0.12]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
};

// ── Pump Station Building ──
const PumpStationBuilding: React.FC = () => (
  <group position={[8.5, 0, -3.5]}>
    {/* Main building box */}
    <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
      <boxGeometry args={[3.5, 2.4, 2.8]} />
      <meshStandardMaterial color="#1e293b" roughness={0.55} metalness={0.35} />
    </mesh>
    {/* Roof overhang */}
    <mesh position={[0, 2.5, 0]} castShadow>
      <boxGeometry args={[3.8, 0.1, 3.1]} />
      <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.3} />
    </mesh>
    {/* Metal siding corrugations */}
    {[-1.4, -0.7, 0, 0.7, 1.4].map((xs, si) => (
      <mesh key={si} position={[xs, 1.2, 1.42]}>
        <boxGeometry args={[0.04, 2.3, 0.01]} />
        <meshStandardMaterial color="#374151" metalness={0.88} roughness={0.15} />
      </mesh>
    ))}
    {/* Door */}
    <mesh position={[0, 0.95, 1.42]}>
      <boxGeometry args={[0.7, 1.75, 0.02]} />
      <meshStandardMaterial color="#334155" metalness={0.82} roughness={0.2} />
    </mesh>
    {/* Door handle */}
    <mesh position={[0.28, 0.95, 1.44]}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
    </mesh>
    {/* Window */}
    <mesh position={[1.0, 1.4, 1.42]}>
      <boxGeometry args={[0.6, 0.5, 0.02]} />
      <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.3} transparent opacity={0.7} />
    </mesh>
  </group>
);

// ── Animated Exhaust Steam from Wellhead ──
const WellheadSteam: React.FC<{ wellState: WellState }> = ({ wellState }) => {
  const steamRef = useRef<THREE.Points>(null);
  const count = 30;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 0.18;
      pos[i * 3 + 1] = Math.random() * 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.18;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!steamRef.current) return;
    const pos = steamRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += delta * (0.8 + Math.random() * 0.4);
      pos[i * 3]     += delta * (Math.random() - 0.5) * 0.08;
      if (pos[i * 3 + 1] > 3.0) {
        pos[i * 3]     = (Math.random() - 0.5) * 0.18;
        pos[i * 3 + 1] = 0.1;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.18;
      }
    }
    steamRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (wellState.phase !== 'INJECTION') return null;

  return (
    <group position={[-8.1, 1.2, 0]}>
      <points ref={steamRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.22} color="#e0f2fe" transparent opacity={0.55} sizeAttenuation blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
};

// ── Local 60fps kinematics ──
const KinematicSRP: React.FC<{
  wellState: WellState;
  onSelectComponent: (name: string) => void;
  wellheadX: number;
}> = ({ wellState, onSelectComponent, wellheadX }) => {
  const [motion, setMotion] = React.useState({
    crankAngle: wellState.crankAngle || 0,
    polishedRodPos: wellState.polishedRodPos || 0.5,
  });

  useFrame((_, delta) => {
    if (!wellState.isPaused) {
      const omega = (2 * Math.PI * (wellState.spm || 5.2)) / 60;
      setMotion((prev) => {
        const nextAngle = (prev.crankAngle + omega * delta) % (2 * Math.PI);
        const rodPos = (1 - Math.cos(nextAngle)) * 0.5;
        return { crankAngle: nextAngle, polishedRodPos: rodPos };
      });
    }
  });

  return (
    <>
      <SurfacePumpjack
        crankAngle={motion.crankAngle}
        strokeLength={wellState.strokeLength}
        polishedRodPos={motion.polishedRodPos}
        onClickComponent={onSelectComponent}
      />
      <SurfaceStorageTank
        wellheadX={wellheadX}
        productionRate={wellState.productionRate}
        fluidViscosityIndex={wellState.fluidViscosityIndex}
        onClickComponent={onSelectComponent}
      />
      <WellboreCrossSection
        polishedRodPos={motion.polishedRodPos}
        strokeLength={wellState.strokeLength}
        fluidViscosityIndex={wellState.fluidViscosityIndex}
        onClickComponent={onSelectComponent}
      />
    </>
  );
};

// ── Main Scene ──
export const DigitalTwinScene: React.FC<DigitalTwinSceneProps> = ({
  wellState,
  activeCameraPreset,
  showSpatialTags = false,
  onSelectComponent,
}) => {
  const controlsRef = useRef<any>(null);
  const wellheadX = -5.4;

  return (
    <div className="w-full h-full relative bg-[#0a0f1e]">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#0a0f1e']} />

        {/* ── Sky & Stars ── */}
        <Sky
          distance={450000}
          sunPosition={[100, 8, -50]}
          inclination={0.05}
          azimuth={0.25}
          mieCoefficient={0.008}
          mieDirectionalG={0.85}
          rayleigh={1.2}
          turbidity={12}
        />
        <Stars radius={180} depth={60} count={3000} factor={3} saturation={0.2} fade speed={0.5} />

        {/* ── Atmospheric Fog (near-ground haze over desert) ── */}
        <fog attach="fog" args={['#1c1008', 30, 160]} />

        {/* ── Camera ── */}
        <PerspectiveCamera makeDefault position={[3.5, 4.0, 11.5]} fov={42} near={0.1} far={200} />
        <CameraPresetController activePreset={activeCameraPreset} controlsRef={controlsRef} />

        {/* ── Orbit Controls ── */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.75}
          zoomSpeed={0.9}
          panSpeed={0.75}
          maxPolarAngle={Math.PI * 0.94}
          minDistance={2}
          maxDistance={75}
        />

        {/* ── LIGHTING ── */}
        {/* Warm dusk ambient */}
        <ambientLight intensity={0.85} color="#e8d5b0" />
        <hemisphereLight color="#fde68a" groundColor="#5c2d0a" intensity={1.1} />

        {/* Main sun — golden hour angle */}
        <directionalLight
          position={[22, 18, 14]}
          intensity={2.8}
          color="#fff7ed"
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-near={0.5}
          shadow-camera-far={80}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0002}
        />

        {/* Cool sky fill (blue backlight) */}
        <directionalLight position={[-20, 16, 22]} intensity={1.4} color="#bfdbfe" />

        {/* Warm bounce from sandy desert ground */}
        <directionalLight position={[0, -5, 8]} intensity={0.6} color="#f59e0b" />

        {/* DEDICATED SUBSURFACE LIGHTS */}
        <pointLight position={[-5.4, -4.0, 4.0]} intensity={5.0} color="#38bdf8" distance={30} decay={1.2} />
        <pointLight position={[-5.4, -13.5, 4.5]} intensity={7.0} color="#fbbf24" distance={32} decay={1.0} />
        <pointLight position={[2.0, 3.5, 5.0]} intensity={2.5} color="#fde68a" distance={18} />

        {/* Tank blue-ish fill */}
        <pointLight position={[-10.9, 2.0, 0]} intensity={2.2} color="#0ea5e9" distance={14} />

        {/* Reservoir glow */}
        <directionalLight position={[0, -12, -6]} intensity={1.4} color="#a855f7" />

        {/* ── ENVIRONMENT MAP ── */}
        <Environment preset="sunset" background={false} blur={0.6} />

        {/* ── GEOLOGICAL STRATA BACK WALL ── */}
        <group position={[-3.5, -7.5, -1.5]}>
          {/* Overburden */}
          <mesh position={[0, 5.5, 0]}>
            <planeGeometry args={[40, 4.5]} />
            <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.15} />
          </mesh>
          {/* Shale */}
          <mesh position={[0, 0.8, 0]}>
            <planeGeometry args={[40, 6.0]} />
            <meshStandardMaterial color="#0f172a" roughness={0.92} metalness={0.08} />
          </mesh>
          {/* Tight sandstone */}
          <mesh position={[0, -4.8, 0]}>
            <planeGeometry args={[40, 5.5]} />
            <meshStandardMaterial color="#1c1008" roughness={0.88} metalness={0.12} />
          </mesh>
          {/* Oil sandstone reservoir */}
          <mesh position={[0, -10.5, 0]}>
            <planeGeometry args={[40, 6.0]} />
            <meshStandardMaterial color="#33241b" roughness={0.82} metalness={0.18} emissive="#b45309" emissiveIntensity={0.06} />
          </mesh>
          {/* Stratigraphy glow seams */}
          {[-1.5, -4.5, -7.5, -11.0, -14.0].map((y) => (
            <mesh key={y} position={[0, y + 7.5, 0.02]}>
              <planeGeometry args={[40, 0.05]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.45} />
            </mesh>
          ))}
        </group>

        {/* ── DESERT GROUND & WELLSITE ── */}
        <DesertGround />

        {/* ── PUMP STATION BUILDING ── */}
        <PumpStationBuilding />

        {/* ── CONTACT SHADOWS ── */}
        <ContactShadows
          position={[-3.5, 0.06, 0]}
          opacity={0.75}
          scale={28}
          blur={2.2}
          far={10}
          color="#000000"
        />

        {/* ── KINEMATIC PUMPJACK + WELLBORE + TANK ── */}
        <KinematicSRP
          wellState={wellState}
          onSelectComponent={onSelectComponent}
          wellheadX={wellheadX}
        />

        {/* ── WELLHEAD STEAM PLUME ── */}
        <WellheadSteam wellState={wellState} />

        {/* ── RESERVOIR ── */}
        <ReservoirZone
          phase={wellState.phase}
          reservoirTemp={wellState.reservoirTemp}
          heatedZoneRadius={wellState.heatedZoneRadius}
          onClickComponent={onSelectComponent}
        />

        {/* ── SPATIAL OVERLAYS ── */}
        {showSpatialTags && (
          <>
            <DynamometerGhostOverlay
              liveCard={wellState.liveDynoCard}
              normalCard={wellState.normalDynoCard}
              isAnomaly={wellState.anomalyDetected}
            />
            <SpatialAnnotations
              phase={wellState.phase}
              spm={wellState.spm}
              strokeLength={wellState.strokeLength}
              viscositycP={wellState.viscositycP}
              reservoirTemp={wellState.reservoirTemp}
              heatedZoneRadius={wellState.heatedZoneRadius}
              productionRate={wellState.productionRate}
              maxRodLoad={wellState.maxRodLoad}
              sor={wellState.sor}
              onSelectComponent={onSelectComponent}
            />
          </>
        )}
      </Canvas>
    </div>
  );
};

export default DigitalTwinScene;
