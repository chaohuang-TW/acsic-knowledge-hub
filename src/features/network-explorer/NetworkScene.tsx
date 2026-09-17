import { Line } from '@react-three/drei';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Locale } from '../../types';
import { getRegion, networkRegions, type NetworkRegion, type Vec3 } from './networkSceneData';
import { mascotSpriteUrl, type MascotGuideProps, type MascotGuideState } from './mascot';

type SceneProps = {
  locale: Locale;
  selectedRegion: NetworkRegion['id'];
  reducedMotion: boolean;
  onSelectRegion: (regionId: NetworkRegion['id']) => void;
  onSelectInstitution: (institutionId: string) => void;
  selectedInstitutionId: string | null;
};

export function NetworkScene({
  selectedRegion,
  reducedMotion,
  onSelectRegion,
  onSelectInstitution,
  selectedInstitutionId,
}: SceneProps) {
  const region = getRegion(selectedRegion);
  return (
    <Canvas
      className="network-canvas"
      dpr={[1, 1.5]}
      camera={{ position: [0, 5.8, 7.6], fov: 39, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      shadows
      aria-label="Schematic ACSIC network visualization - not to scale."
    >
      <color attach="background" args={['#dfeae4']} />
      <ambientLight intensity={1.8} />
      <directionalLight castShadow intensity={2.4} position={[-4, 8, 5]} />
      <DioramaGround />
      <NetworkRoutes />
      {networkRegions.map((item) => (
        <NetworkRegion
          key={item.id}
          region={item}
          active={item.id === selectedRegion}
          onSelect={onSelectRegion}
        />
      ))}
      <MascotGuide
        target={region.mascotTarget}
        state="idle"
        reducedMotion={reducedMotion}
        spriteUrl={mascotSpriteUrl}
      />
      <InstitutionCluster
        region={region}
        active={true}
        selectedInstitutionId={selectedInstitutionId}
        onSelectInstitution={onSelectInstitution}
      />
      <CameraRig target={region.cameraTarget} reducedMotion={reducedMotion} />
    </Canvas>
  );
}

function DioramaGround() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.25, 64]} />
        <meshStandardMaterial color="#c6d9d0" roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[8.7, 0.28, 6.2]} />
        <meshStandardMaterial color="#eef4f0" roughness={0.88} />
      </mesh>
      <mesh position={[-3.6, 0.15, -1.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 32]} />
        <meshStandardMaterial color="#b0cdc1" roughness={0.9} />
      </mesh>
      <mesh position={[3.6, 0.17, 1.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.72, 32]} />
        <meshStandardMaterial color="#d1e2d9" roughness={0.9} />
      </mesh>
    </group>
  );
}

function NetworkRoutes() {
  const lines: Vec3[][] = [
    [
      [-1.85, 0.32, 0.25],
      [-0.4, 1.05, -0.2],
      [1.65, 0.34, -0.75],
    ],
    [
      [1.65, 0.34, -0.75],
      [0.95, 1.0, 0.4],
      [0.35, 0.33, 1.65],
    ],
    [
      [0.35, 0.33, 1.65],
      [-0.65, 0.84, 1.0],
      [-1.85, 0.32, 0.25],
    ],
  ];
  return (
    <group>
      {lines.map((points, index) => (
        <Line
          key={index}
          points={points}
          color="#4f8f80"
          lineWidth={1.2}
          transparent
          opacity={0.42}
        />
      ))}
    </group>
  );
}

function NetworkRegion({
  region,
  active,
  onSelect,
}: {
  region: NetworkRegion;
  active: boolean;
  onSelect: (regionId: NetworkRegion['id']) => void;
}) {
  return (
    <group position={region.position} onClick={() => onSelect(region.id)}>
      <mesh receiveShadow position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.86, 1.02, 0.25, 8]} />
        <meshStandardMaterial color={active ? '#8ebaae' : '#b2cfc2'} roughness={0.78} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <ringGeometry args={active ? [0.46, 0.58, 40] : [0.38, 0.45, 40]} />
        <meshBasicMaterial
          color={active ? '#1b665b' : '#7fae9e'}
          transparent
          opacity={active ? 0.85 : 0.6}
        />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <sphereGeometry args={[active ? 0.14 : 0.1, 12, 8]} />
        <meshStandardMaterial color={active ? '#1b665b' : '#6c9f8d'} roughness={0.68} />
      </mesh>
    </group>
  );
}

function InstitutionCluster({
  region,
  active,
  selectedInstitutionId,
  onSelectInstitution,
}: {
  region: NetworkRegion;
  active: boolean;
  selectedInstitutionId: string | null;
  onSelectInstitution: (institutionId: string) => void;
}) {
  const offsets: Vec3[] = [
    [-0.34, 0, -0.24],
    [0.36, 0, -0.18],
    [0, 0, 0.38],
  ];
  return (
    <group position={region.position} visible={active}>
      {region.institutionIds.map((institutionId, index) => (
        <group
          key={institutionId}
          position={offsets[index] ?? [0, 0, 0]}
          name={`network-node-${institutionId}`}
          userData={{ institutionId }}
          onClick={(event) => {
            event.stopPropagation();
            onSelectInstitution(institutionId);
          }}
        >
          <mesh position={[0, 0.44, 0]} castShadow>
            <cylinderGeometry
              args={
                selectedInstitutionId === institutionId
                  ? [0.18, 0.21, 0.2, 10]
                  : [0.13, 0.17, 0.16, 8]
              }
            />
            <meshStandardMaterial
              color={selectedInstitutionId === institutionId ? '#176b60' : '#f0b35b'}
              roughness={0.72}
            />
          </mesh>
          <mesh position={[0, 0.62, 0]} castShadow>
            <sphereGeometry args={[selectedInstitutionId === institutionId ? 0.15 : 0.12, 8, 8]} />
            <meshStandardMaterial
              color={selectedInstitutionId === institutionId ? '#f8d58a' : '#fffaf0'}
              roughness={0.8}
            />
          </mesh>
          {selectedInstitutionId === institutionId && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.72, 0]}>
              <ringGeometry args={[0.24, 0.3, 24]} />
              <meshBasicMaterial color="#176b60" transparent opacity={0.78} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function MascotGuide({ target, state: initialState, reducedMotion, spriteUrl }: MascotGuideProps) {
  const group = useRef<THREE.Group>(null);
  const progress = useRef(1);
  const from = useRef(new THREE.Vector3(...target));
  const current = useRef(new THREE.Vector3(...target));
  const lastTarget = useRef(target.join(','));
  const state = useRef<MascotGuideState>(initialState);
  const stateStartedAt = useRef(0);
  const texture = useLoader(THREE.TextureLoader, spriteUrl ?? mascotSpriteUrl);
  useFrame((_, delta) => {
    if (!group.current) return;
    const nextKey = target.join(',');
    if (nextKey !== lastTarget.current) {
      from.current.copy(current.current);
      progress.current = reducedMotion ? 1 : 0;
      state.current = reducedMotion ? 'arrive' : 'walk';
      stateStartedAt.current = performance.now();
      lastTarget.current = nextKey;
    }
    progress.current = Math.min(1, progress.current + delta / 0.9);
    const eased = progress.current * progress.current * (3 - 2 * progress.current);
    current.current.lerpVectors(from.current, new THREE.Vector3(...target), eased);
    group.current.position.copy(current.current);
    const now = performance.now();
    if (progress.current < 1) state.current = reducedMotion ? 'arrive' : 'walk';
    else if (state.current === 'walk' || state.current === 'arrive') {
      state.current = now - stateStartedAt.current > 360 ? 'point' : 'arrive';
    }
    group.current.rotation.y = reducedMotion ? 0 : Math.sin(now / 650) * 0.08;
    group.current.position.y += reducedMotion ? 0 : Math.sin(now / 420) * 0.025;
    group.current.userData.state = state.current;
  });
  return (
    <group ref={group} userData={{ state: initialState }}>
      <sprite scale={[0.9, 1.68, 1]} position={[0, 0.85, 0]}>
        <spriteMaterial map={texture} transparent alphaTest={0.04} depthWrite toneMapped />
      </sprite>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <circleGeometry args={[0.38, 32]} />
        <meshBasicMaterial color="#174f47" transparent opacity={0.17} />
      </mesh>
    </group>
  );
}

function CameraRig({ target, reducedMotion }: { target: Vec3; reducedMotion: boolean }) {
  const { camera } = useThree();
  const destination = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    destination.set(target[0] + 3.9, target[1] + 4.9, target[2] + 5.5);
    lookAt.set(target[0], target[1], target[2]);
    const factor = reducedMotion ? 1 : 1 - Math.pow(0.001, delta);
    camera.position.lerp(destination, factor);
    camera.lookAt(lookAt);
  });
  return null;
}
