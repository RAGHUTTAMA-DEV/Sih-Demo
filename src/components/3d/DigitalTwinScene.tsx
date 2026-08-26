import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { SurfacePumpjack } from './SurfacePumpjack';
import { WellboreCrossSection } from './WellboreCrossSection';
import { ReservoirZone } from './ReservoirZone';
import { DynamometerGhostOverlay } from './DynamometerGhostOverlay';
import { SpatialAnnotations } from './SpatialAnnotations';
import { WellState, CameraPreset } from '../../types/simulation';

interface DigitalTwinSceneProps {
  wellState: WellState;
  activeCameraPreset: CameraPreset;
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
        endPosRef.current.set(9, 6, 18);
        endTargetRef.current.set(-2, -3.5, 0);
        break;
      case 'pumpjack':
        endPosRef.current.set(3, 3.5, 9);
        endTargetRef.current.set(0, 2.2, 0);
        break;
      case 'wellbore':
        endPosRef.current.set(-1, -4, 11);
        endTargetRef.current.set(-5.4, -6.5, 0);
        break;
      case 'reservoir':
        endPosRef.current.set(-1, -11, 11);
        endTargetRef.current.set(-5.4, -14.5, 0);
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
  onSelectComponent
}) => {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative bg-[#182232]">
      <Canvas 
        shadows 
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Bright Background Color */}
        <color attach="background" args={['#182232']} />

        {/* Perspective Camera */}
        <PerspectiveCamera makeDefault position={[9, 6, 18]} fov={45} near={0.1} far={150} />
        <CameraPresetController activePreset={activeCameraPreset} controlsRef={controlsRef} />

        {/* Free Orbit Controls */}
        <OrbitControls 
          ref={controlsRef}
          makeDefault
          enableDamping={true}
          dampingFactor={0.06}
          rotateSpeed={0.8}
          zoomSpeed={1.0}
          panSpeed={0.8}
          maxPolarAngle={Math.PI * 0.95}
          minDistance={2}
          maxDistance={55}
        />

        {/* ULTRA-BRIGHT RELIABLE LIGHTING SETUP */}
        {/* 1. Hemisphere Light for Sky/Ground Fill */}
        <hemisphereLight skyColor="#ffffff" groundColor="#94a3b8" intensity={2.2} />

        {/* 2. Global Ambient Light */}
        <ambientLight intensity={2.2} color="#ffffff" />

        {/* 3. Key Sun Directional Light with Shadows */}
        <directionalLight 
          position={[22, 32, 18]} 
          intensity={3.0} 
          color="#ffffff"
          castShadow 
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={70}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-25}
          shadow-bias={-0.0001}
        />

        {/* 4. Secondary Fill Sun (Opposing direction) */}
        <directionalLight position={[-20, 25, -18]} intensity={2.0} color="#f1f5f9" />

        {/* 5. Surface Pumpjack Point Light */}
        <pointLight position={[3, 10, 6]} intensity={3.5} color="#fffbeb" distance={25} />

        {/* 6. Subsurface Wellbore Floodlights */}
        <pointLight position={[-5.4, 3.0, 5]} intensity={4.0} color="#ffffff" distance={25} />
        <pointLight position={[-5.4, -6.5, 5]} intensity={4.5} color="#38bdf8" distance={25} />
        <pointLight position={[-5.4, -14.0, 5]} intensity={5.0} color="#ff6600" distance={25} />

        {/* Ground & Subsurface Environment */}
        <group position={[0, 0, 0]}>
          {/* Surface Ground Plane */}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[80, 80]} />
            <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.1} />
          </mesh>

          {/* Bright Grid */}
          <gridHelper args={[80, 80, '#64748b', '#475569']} position={[0, 0.01, 0]} />

          {/* Contact Shadows under Pumpjack */}
          <ContactShadows 
            position={[0, 0.02, 0]} 
            opacity={0.5} 
            scale={22} 
            blur={1.2} 
            far={10} 
            color="#000000" 
          />

          {/* Subsurface Geological Wall Backdrop */}
          <mesh position={[-5.4, -8.0, -1.2]}>
            <planeGeometry args={[18, 18]} />
            <meshStandardMaterial color="#2d3748" roughness={0.7} metalness={0.1} />
          </mesh>
        </group>

        {/* 3D SURFACE PUMPJACK MODEL */}
        <SurfacePumpjack 
          crankAngle={wellState.crankAngle}
          strokeLength={wellState.strokeLength}
          polishedRodPos={wellState.polishedRodPos}
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

        {/* 3D DYNAMOMETER GHOST OVERLAY */}
        <DynamometerGhostOverlay 
          liveCard={wellState.liveDynoCard}
          normalCard={wellState.normalDynoCard}
          isAnomaly={wellState.anomalyDetected}
        />

        {/* 3D SPATIAL ANNOTATIONS & LIVE CHANGING TELEMETRY HUD BADGES */}
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
      </Canvas>
    </div>
  );
};
