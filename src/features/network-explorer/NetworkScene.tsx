import { Line } from '@react-three/drei';
import { asiaLandContours, projectMapPosition } from './asiaMapGeometry';
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
  const mascotTarget: Vec3 = region?.mascotTarget ?? [5.8, 0.18, 0.9];
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
      camera={{ position: [0, 18, 10], fov: 42, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      shadows
      onCreated={handleCreated}
      aria-label={
        locale === 'en'
          ? 'Simplified Asia map for visual exploration only.'
          : '亞洲地圖為視覺化簡化示意。'
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
      <AsiaMapStage />
      {networkRegions.map((item) => (
        <NetworkRegion
          key={item.id}
          region={item}
          active={item.id === selectedRegion}
          subdued={!!selectedRegion && item.id !== selectedRegion}
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
        target={region?.cameraTarget ?? [0, 0, 0]}
        overview={!region}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}

function AsiaMapStage() {
  const shapes = useMemo(
    () =>
      asiaLandContours.map((contour) => {
        const points = contour.map(([longitude, latitude]) => {
          const [x, , z] = projectMapPosition(longitude, latitude);
          return new THREE.Vector2(x, -z);
        });
        const shape = new THREE.Shape(points);
        shape.closePath();
        return shape;
      }),
    [],
  );
  return (
    <group name="asia-map-stage">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]} receiveShadow>
        <planeGeometry args={[16, 12.5]} />
        <meshBasicMaterial color={theme.porcelain} toneMapped={false} />
      </mesh>
      {shapes.map((shape, index) => (
        <group key={index}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <shapeGeometry args={[shape]} />
            <meshBasicMaterial color={theme.sage} toneMapped={false} />
          </mesh>
          <Line
            points={shape.getPoints().map((point) => [point.x, 0.025, -point.y] as Vec3)}
            color={theme.line}
            lineWidth={0.75}
            transparent
            opacity={0.65}
          />
        </group>
      ))}
    </group>
  );
}

function NetworkRegion({
  region,
  active,
  subdued,
  onSelect,
}: {
  region: NetworkRegion;
  active: boolean;
  subdued: boolean;
  onSelect: (regionId: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <group
      position={region.position}
      name={`economy-hotspot-${region.id}`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(region.id);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.19, 32]} />
        <meshBasicMaterial
          color={active || hovered ? theme.deepJade : theme.jade}
          transparent
          opacity={subdued && !hovered ? 0.55 : 1}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry
          args={[active || hovered ? 0.26 : 0.22, active || hovered ? 0.31 : 0.25, 40]}
        />
        <meshBasicMaterial
          color={active || hovered ? theme.deepJade : theme.jade}
          transparent
          opacity={subdued && !hovered ? 0.35 : 0.85}
        />
      </mesh>
      <mesh visible={false}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial />
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
  const { size } = useThree();
  const guideScale = size.width < 480 ? 1.4 : 1;
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
          scale={
            overview
              ? [guideScale, 1.87 * guideScale, 1]
              : [0.76 * guideScale, 1.42 * guideScale, 1]
          }
          position={[0, (overview ? 0.93 : 0.7) * guideScale, 0]}
        >
          <spriteMaterial map={texture} transparent alphaTest={0.04} depthWrite toneMapped />
        </sprite>
      )}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <circleGeometry args={[overview ? 0.28 : 0.23, 32]} />
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
    // Fit the complete map at every aspect ratio. Focus is a restrained pan,
    // preserving the spatial context instead of zooming into an isolated node.
    const aspect = size.width / size.height;
    const distance = Math.max(18, 17 / aspect);
    if (camera instanceof THREE.PerspectiveCamera && camera.fov !== 42) {
      camera.fov = 42;
      camera.updateProjectionMatrix();
    }
    const focusX = overview ? 0 : target[0];
    const focusZ = overview ? 0 : target[2];
    destination.set(focusX, distance, distance * 0.46 + focusZ);
    lookAt.set(focusX, 0, focusZ);
    const factor = reducedMotion ? 1 : 1 - Math.pow(0.001, delta);
    camera.position.lerp(destination, factor);
    camera.lookAt(lookAt);
  });
  return null;
}
