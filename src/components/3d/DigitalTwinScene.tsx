import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
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

// Smooth Camera Preset Controller
const CameraPresetController: React.FC<{ 
  activePreset: CameraPreset;
  controlsRef: React.RefObject<any>;
}> = ({ activePreset, controlsRef }) => {
  const { camera } = useThree();
  const isTransitioningRef = useRef<boolean>(false);
  const transitionProgressRef = useRef<number>(1.0);
  const startPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const startTargetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const endPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const endTargetRef = useRef<THREE.Vector3>(new THREE.Vector3());

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

      if (t >= 1.0) {
        isTransitioningRef.current = false;
      }
    }
  });

  return null;
};

export const DigitalTwinScene: React.FC<DigitalTwinSceneProps> = ({
  wellState,
  activeCameraPreset,
  showSpatialTags = false,
  onSelectComponent
}) => {
  const controlsRef = useRef<any>(null);
  const wellheadX = -5.4;

  return (
    <div className="w-full h-full relative bg-[#0c1425]">
      <Canvas 
        shadows 
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Sleek Illuminated Industrial Slate Background */}
        <color attach="background" args={['#0c1425']} />
        {/* Extended Atmospheric Fog - keeps subterranean & distant models bright and visible */}
        <fog attach="fog" args={['#0c1425', 40, 180]} />

        {/* Camera Setup */}
        <PerspectiveCamera makeDefault position={[3.5, 4.0, 11.5]} fov={42} near={0.1} far={180} />
        <CameraPresetController activePreset={activeCameraPreset} controlsRef={controlsRef} />

        {/* Orbit Controls */}
        <OrbitControls 
          ref={controlsRef}
          makeDefault
          enableDamping={true}
          dampingFactor={0.06}
          rotateSpeed={0.8}
          zoomSpeed={1.0}
          panSpeed={0.8}
          maxPolarAngle={Math.PI * 0.95}
          minDistance={1.8}
          maxDistance={60}
        />

        {/* HIGH-VISIBILITY MULTI-SOURCE LIGHTING SETUP */}
        {/* Ambient & Hemisphere Fill */}
        <hemisphereLight color="#ffffff" groundColor="#475569" intensity={2.2} />
        <ambientLight intensity={2.5} color="#f8fafc" />

        {/* Key Surface Sunlight */}
        <directionalLight 
          position={[20, 30, 20]} 
          intensity={3.2} 
          color="#fffbeb"
          castShadow 
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={70}
          shadow-bias={-0.0001}
        />

        {/* Surface Front-Left Fill Light */}
        <directionalLight position={[-18, 18, 20]} intensity={2.2} color="#38bdf8" />

        {/* DEDICATED SUBSURFACE POINT LIGHTS (Illuminates Wellbore String & Reservoir) */}
        <pointLight 
          position={[-5.4, -4.0, 4.0]} 
          intensity={4.5} 
          color="#38bdf8" 
          distance={28} 
          decay={1}
        />
        <pointLight 
          position={[-5.4, -13.5, 4.5]} 
          intensity={6.0} 
          color="#fbbf24" 
          distance={28} 
          decay={1}
        />
        <pointLight 
          position={[2.0, 3.5, 5.0]} 
          intensity={3.0} 
          color="#f59e0b" 
          distance={20} 
        />
        <directionalLight position={[0, -10, -8]} intensity={1.8} color="#a855f7" />

        {/* GEOLOGICAL SUBSURFACE STRATA WALL BACKDROP (z = -1.2) */}
        <group position={[-3.5, -7.5, -1.2]}>
          {/* Layer 1: Overburden Caprock (-0.3m to -4.0m) */}
          <mesh position={[0, 5.5, 0]}>
            <planeGeometry args={[36, 4.5]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} metalness={0.2} />
          </mesh>
          {/* Layer 2: Impermeable Shale Formation (-4.0m to -10.0m) */}
          <mesh position={[0, 1.0, 0]}>
            <planeGeometry args={[36, 5.5]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
          </mesh>
          {/* Layer 3: Jodhpur Sandstone Heavy Oil Reservoir Bed (-10.0m to -16.0m) */}
          <mesh position={[0, -4.5, 0]}>
            <planeGeometry args={[36, 6.0]} />
            <meshStandardMaterial color="#33241b" roughness={0.85} metalness={0.15} />
          </mesh>
          {/* Glowing Geological Stratigraphy Grid Lines */}
          {[-2, -5, -8, -11, -14].map((yLevel) => (
            <mesh key={yLevel} position={[0, yLevel + 7.5, 0.01]}>
              <planeGeometry args={[36, 0.04]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
            </mesh>
          ))}
        </group>

        {/* GROUND & SUBSURFACE ENVIRONMENT */}
        <group position={[0, 0, 0]}>
          {/* Concrete Base Pad under Pumpjack (Cutout around Wellhead at x=-5.4 so top of wellbore is fully visible) */}
          <mesh position={[0.5, 0.01, 0]} receiveShadow>
            <boxGeometry args={[14, 0.08, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
          </mesh>

          {/* Grid Overlay */}
          <gridHelper args={[70, 70, '#64748b', '#1e293b']} position={[0, 0.02, 0]} />

          {/* Contact Shadows under Pumpjack & Storage Tank */}
          <ContactShadows 
            position={[-3.5, 0.03, 0]} 
            opacity={0.65} 
            scale={24} 
            blur={1.8} 
            far={8} 
            color="#000000" 
          />
        </group>

        {/* 3D SURFACE PUMPJACK MODEL */}
        <SurfacePumpjack 
          crankAngle={wellState.crankAngle}
          strokeLength={wellState.strokeLength}
          polishedRodPos={wellState.polishedRodPos}
          onClickComponent={onSelectComponent}
        />

        {/* 3D SURFACE FLOWLINE PIPELINE & CRUDE OIL STORAGE TANK BATTERY */}
        <SurfaceStorageTank 
          wellheadX={wellheadX}
          productionRate={wellState.productionRate}
          fluidViscosityIndex={wellState.fluidViscosityIndex}
          onClickComponent={onSelectComponent}
        />

        {/* 3D WELLBORE CROSS-SECTION */}
        <WellboreCrossSection 
          polishedRodPos={wellState.polishedRodPos}
          strokeLength={wellState.strokeLength}
          fluidViscosityIndex={wellState.fluidViscosityIndex}
          onClickComponent={onSelectComponent}
        />

        {/* 3D RESERVOIR STEAM HEATED ZONE */}
        <ReservoirZone 
          phase={wellState.phase}
          reservoirTemp={wellState.reservoirTemp}
          heatedZoneRadius={wellState.heatedZoneRadius}
          onClickComponent={onSelectComponent}
        />

        {/* CONDITIONALLY RENDER 3D SPATIAL OVERLAYS WHEN TAGS ARE TOGGLED ON */}
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
