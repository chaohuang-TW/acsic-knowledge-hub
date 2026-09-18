import { Line } from '@react-three/drei';
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { sceneTheme as theme } from '../../styles/sceneTheme';
import type { Locale } from '../../types';
import {
  getInstitutionNodeOffsets,
  getRegion,
  networkRegions,
  type NetworkRegion,
  type Vec3,
} from './networkSceneData';
import { mascotSpriteUrl, type MascotGuideProps, type MascotGuideState } from './mascot';
import { reportNetworkDiagnostic, type NetworkFallbackReason } from './webgl';

type SceneProps = {
  locale: Locale;
  selectedRegion: NetworkRegion['id'] | null;
  reducedMotion: boolean;
  onSelectRegion: (regionId: NetworkRegion['id']) => void;
  onSelectInstitution: (institutionId: string) => void;
  selectedInstitutionId: string | null;
  onSceneIssue: (reason: Extract<NetworkFallbackReason, 'context-lost'>) => void;
};

export function NetworkScene({
  selectedRegion,
  reducedMotion,
  onSelectRegion,
  onSelectInstitution,
  selectedInstitutionId,
  locale,
  onSceneIssue,
}: SceneProps) {
  const region = getRegion(selectedRegion);
  const mascotTarget: Vec3 = region?.mascotTarget ?? [0, 0.48, 0.35];
  const handleCreated = useCallback(
    ({ gl }: RootState) => {
      const onContextLost = (event: Event) => {
        event.preventDefault();
        onSceneIssue('context-lost');
      };
      gl.domElement.addEventListener('webglcontextlost', onContextLost, { once: true });
    },
    [onSceneIssue],
  );
  return (
    <Canvas
      className="network-canvas"
      dpr={[1, 1.5]}
      camera={{ position: [0, 9.2, 13.2], fov: 47, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      shadows
      onCreated={handleCreated}
      aria-label={
        locale === 'en'
          ? 'Schematic ACSIC network visualization - not to scale.'
          : 'ACSIC 網絡示意圖，非依比例繪製。'
      }
    >
      <color attach="background" args={[theme.background]} />
      <ambientLight intensity={1.6} />
      <directionalLight
        castShadow
        intensity={2.1}
        position={[-4, 8, 5]}
        shadow-mapSize={[1024, 1024]}
        shadow-radius={4}
      />
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
        target={mascotTarget}
        state="idle"
        reducedMotion={reducedMotion}
        spriteUrl={mascotSpriteUrl}
        overview={!region}
      />
      {region && (
        <InstitutionCluster
          region={region}
          active
          selectedInstitutionId={selectedInstitutionId}
          onSelectInstitution={onSelectInstitution}
        />
      )}
      <CameraRig
        target={region?.cameraTarget ?? [0, 0.2, 0.5]}
        overview={!region}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}

function DioramaGround() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.15, 0]} scale={[1, 1, 0.64]}>
        <cylinderGeometry args={[6.7, 6.88, 0.24, 64]} />
        <meshStandardMaterial color={theme.porcelain} roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} scale={[1, 0.64, 1]}>
        <ringGeometry args={[5.55, 6.05, 64]} />
        <meshBasicMaterial color={theme.sage} transparent opacity={0.16} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} scale={[1, 0.64, 1]}>
        <circleGeometry args={[4.95, 64]} />
        <meshBasicMaterial color={theme.mist} transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function NetworkRoutes() {
  const rows = [
    [-4.5, -1.5, 1.5, 4.5],
    [-4.5, -1.5, 1.5, 4.5],
    [-4.5, -1.5, 1.5, 4.5],
  ];
  const depths = [-2.7, -0.9, 0.9];
  const lines: Vec3[][] = rows.flatMap((row, rowIndex) =>
    row.slice(0, -1).map(
      (x, index) =>
        [
          [x, 0.32, depths[rowIndex]],
          [row[index + 1], 0.34, depths[rowIndex]],
        ] as Vec3[],
    ),
  );
  return (
    <group>
      {lines.map((points, index) => (
        <Line
          key={index}
          points={points}
          color={theme.line}
          lineWidth={0.8}
          transparent
          opacity={0.32}
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
  onSelect: (regionId: string) => void;
}) {
  return (
    <group position={region.position} onClick={() => onSelect(region.id)}>
      <mesh receiveShadow position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.86, 1.02, 0.25, 8]} />
        <meshStandardMaterial color={active ? theme.jade : theme.sage} roughness={0.78} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <ringGeometry args={active ? [0.46, 0.58, 40] : [0.38, 0.45, 40]} />
        <meshBasicMaterial
          color={active ? theme.deepJade : theme.jade}
          transparent
          opacity={active ? 0.85 : 0.6}
        />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <sphereGeometry args={[active ? 0.14 : 0.1, 12, 8]} />
        <meshStandardMaterial color={active ? theme.deepJade : theme.jade} roughness={0.68} />
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
  return (
    <group position={region.position} visible={active}>
      {getInstitutionNodeOffsets(region.institutionIds.length).map((offset, index) => {
        const institutionId = region.institutionIds[index];
        return (
          <InstitutionNode
            key={institutionId}
            institutionId={institutionId}
            offset={offset}
            selected={selectedInstitutionId === institutionId}
            onSelectInstitution={onSelectInstitution}
          />
        );
      })}
    </group>
  );
}

function InstitutionNode({
  institutionId,
  offset,
  selected,
  onSelectInstitution,
}: {
  institutionId: string;
  offset: Vec3;
  selected: boolean;
  onSelectInstitution: (institutionId: string) => void;
}) {
  return (
    <group
      position={offset}
      name={`network-node-${institutionId}`}
      userData={{ institutionId }}
      onClick={(event) => {
        event.stopPropagation();
        onSelectInstitution(institutionId);
      }}
    >
      <mesh position={[0, 0.44, 0]} castShadow>
        <cylinderGeometry args={selected ? [0.18, 0.21, 0.2, 10] : [0.13, 0.17, 0.16, 8]} />
        <meshStandardMaterial color={selected ? theme.deepJade : theme.mist} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.62, 0]} castShadow>
        <sphereGeometry args={[selected ? 0.15 : 0.12, 8, 8]} />
        <meshStandardMaterial color={selected ? theme.jade : theme.porcelain} roughness={0.8} />
      </mesh>
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.72, 0]}>
          <ringGeometry args={[0.24, 0.265, 32]} />
          <meshBasicMaterial color={theme.champagne} transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

function MascotGuide({
  target,
  state: initialState,
  reducedMotion,
  spriteUrl,
  overview,
}: MascotGuideProps & { overview: boolean }) {
  const group = useRef<THREE.Group>(null);
  const progress = useRef(1);
  const from = useRef(new THREE.Vector3(...target));
  const current = useRef(new THREE.Vector3(...target));
  const lastTarget = useRef(target.join(','));
  const state = useRef<MascotGuideState>(initialState);
  const stateStartedAt = useRef(0);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const spriteSource = spriteUrl ?? mascotSpriteUrl;

  useEffect(() => {
    let active = true;
    let loadedTexture: THREE.Texture | null = null;
    setTexture(null);
    new THREE.TextureLoader().load(
      spriteSource,
      (nextTexture) => {
        loadedTexture = nextTexture;
        if (active) setTexture(nextTexture);
        else nextTexture.dispose();
      },
      undefined,
      (error) => {
        if (active) setTexture(null);
        reportNetworkDiagnostic('asset-error', error);
      },
    );
    return () => {
      active = false;
      loadedTexture?.dispose();
    };
  }, [spriteSource]);

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
    else if (state.current === 'walk' || state.current === 'arrive')
      state.current = now - stateStartedAt.current > 360 ? 'point' : 'arrive';
    group.current.rotation.y = reducedMotion ? 0 : Math.sin(now / 650) * 0.08;
    group.current.position.y += reducedMotion ? 0 : Math.sin(now / 420) * 0.025;
    group.current.userData.state = state.current;
  });
  return (
    <group ref={group} userData={{ state: initialState }}>
      {texture && (
        <sprite
          scale={overview ? [1.28, 2.4, 1] : [1.04, 1.94, 1]}
          position={[0, overview ? 1.08 : 0.94, 0]}
        >
          <spriteMaterial map={texture} transparent alphaTest={0.04} depthWrite toneMapped />
        </sprite>
      )}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <circleGeometry args={[overview ? 0.5 : 0.4, 32]} />
        <meshBasicMaterial color={theme.deepJade} transparent opacity={0.14} />
      </mesh>
    </group>
  );
}

function CameraRig({
  target,
  overview,
  reducedMotion,
}: {
  target: Vec3;
  overview: boolean;
  reducedMotion: boolean;
}) {
  const { camera, size } = useThree();
  const destination = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    const mobile = size.width < 600;
    if (camera instanceof THREE.PerspectiveCamera) {
      const nextFov = mobile ? 52 : 47;
      if (camera.fov !== nextFov) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }
    }
    if (overview) {
      destination.set(0, mobile ? 8.4 : 9.2, mobile ? 11.4 : 13.2);
      lookAt.set(0, 0, 0.35);
    } else {
      destination.set(
        target[0] + (mobile ? 2.2 : 3.9),
        target[1] + (mobile ? 4.4 : 4.9),
        target[2] + (mobile ? 5.5 : 5.5),
      );
      lookAt.set(target[0], target[1], target[2]);
    }
    const factor = reducedMotion ? 1 : 1 - Math.pow(0.001, delta);
    camera.position.lerp(destination, factor);
    camera.lookAt(lookAt);
  });
  return null;
}
