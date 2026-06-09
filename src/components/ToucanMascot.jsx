import { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Bounds } from '@react-three/drei';
import * as THREE from 'three';

const TOUCAN_GLB = `${import.meta.env.BASE_URL}toucan/toucan-neutral-flying-pose/toucan.glb`;
const TOUCAN_TEXTURES = `${import.meta.env.BASE_URL}toucan/toucan-neutral-flying-pose/textures`;
const BOX_HALF_W = 80;
const BOX_HALF_H = 70;
const FACING_OFFSET = 180;

function easeScroll(t) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

function getToucanFromScroll(scrollY) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const padX = 16;
  const padTop = 48;
  const padBottom = 24;

  const tl = { x: padX + BOX_HALF_W, y: padTop + BOX_HALF_H };
  const tr = { x: vw - padX - BOX_HALF_W, y: padTop + BOX_HALF_H };
  const bl = { x: padX + BOX_HALF_W, y: vh - padBottom - BOX_HALF_H };
  const br = { x: vw - padX - BOX_HALF_W, y: vh - padBottom - BOX_HALF_H };

  const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
  const clamped = Math.min(Math.max(0, scrollY), maxScroll);
  const section = Math.floor(clamped / vh);
  const rawT = vh > 0 ? (clamped - section * vh) / vh : 0;
  const t = easeScroll(rawT);

  const from = section % 2 === 0 ? tl : tr;
  const to = section % 2 === 0 ? br : bl;

  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;
  const arc = Math.sin(t * Math.PI) * -22;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const flightAngle = (Math.atan2(dy, dx) * 180) / Math.PI + FACING_OFFSET;

  return { x, y: y + arc, flightAngle };
}

function buildSubsetGeometry(source, triangleIndices) {
  if (triangleIndices.length === 0) return null;

  const indexMap = new Map();
  const vertices = [];
  const normals = [];
  const uvs = [];
  const outIndices = [];

  const pushVertex = (idx) => {
    let mapped = indexMap.get(idx);
    if (mapped !== undefined) return mapped;

    mapped = vertices.length / 3;
    indexMap.set(idx, mapped);
    vertices.push(
      source.attributes.position.getX(idx),
      source.attributes.position.getY(idx),
      source.attributes.position.getZ(idx),
    );
    if (source.attributes.normal) {
      normals.push(
        source.attributes.normal.getX(idx),
        source.attributes.normal.getY(idx),
        source.attributes.normal.getZ(idx),
      );
    }
    if (source.attributes.uv) {
      uvs.push(source.attributes.uv.getX(idx), source.attributes.uv.getY(idx));
    }
    return mapped;
  };

  for (let i = 0; i < triangleIndices.length; i += 3) {
    outIndices.push(
      pushVertex(triangleIndices[i]),
      pushVertex(triangleIndices[i + 1]),
      pushVertex(triangleIndices[i + 2]),
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  if (normals.length) geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  if (uvs.length) geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(outIndices);
  return geometry;
}

function splitMeshIntoWings(mesh, material) {
  const geometry = mesh.geometry;
  geometry.computeBoundingBox();

  const bb = geometry.boundingBox;
  const cx = (bb.min.x + bb.max.x) / 2;
  const cy = (bb.min.y + bb.max.y) / 2;
  const cz = (bb.min.z + bb.max.z) / 2;
  const wingThresholdX = (bb.max.x - bb.min.x) * 0.16;
  const wingThresholdZ = (bb.max.z - bb.min.z) * 0.2;
  const yMin = cy - (bb.max.y - bb.min.y) * 0.2;

  const pos = geometry.attributes.position;
  const index = geometry.index;
  const triCount = index ? index.count / 3 : pos.count / 3;

  const bodyTris = [];
  const leftTris = [];
  const rightTris = [];

  for (let t = 0; t < triCount; t += 1) {
    const i0 = index ? index.getX(t * 3) : t * 3;
    const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
    const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;

    const ax = (pos.getX(i0) + pos.getX(i1) + pos.getX(i2)) / 3;
    const ay = (pos.getY(i0) + pos.getY(i1) + pos.getY(i2)) / 3;
    const az = (pos.getZ(i0) + pos.getZ(i1) + pos.getZ(i2)) / 3;

    const extX = Math.abs(ax - cx);
    const extZ = Math.abs(az - cz);
    const isWing = ay > yMin && (extX > wingThresholdX || extZ > wingThresholdZ);

    if (!isWing) {
      bodyTris.push(i0, i1, i2);
      continue;
    }

    const useX = extX >= extZ;
    const lateral = useX ? ax : az;
    const center = useX ? cx : cz;
    if (lateral < center) leftTris.push(i0, i1, i2);
    else rightTris.push(i0, i1, i2);
  }

  const leftPivot = new THREE.Vector3(
    bb.min.x + wingThresholdX * 0.65,
    cy + (bb.max.y - bb.min.y) * 0.05,
    cz,
  );
  const rightPivot = new THREE.Vector3(
    bb.max.x - wingThresholdX * 0.65,
    cy + (bb.max.y - bb.min.y) * 0.05,
    cz,
  );

  return {
    body: buildSubsetGeometry(geometry, bodyTris),
    left: buildSubsetGeometry(geometry, leftTris),
    right: buildSubsetGeometry(geometry, rightTris),
    leftPivot,
    rightPivot,
    leftOffset: leftPivot.clone().negate(),
    rightOffset: rightPivot.clone().negate(),
    material,
  };
}

function ToucanModel({ scrollActivity = 0, bankTilt = 0 }) {
  const bodyRef = useRef();
  const leftWingRef = useRef();
  const rightWingRef = useRef();
  const clock = useRef(new THREE.Clock());
  const activityRef = useRef(scrollActivity);
  const bankRef = useRef(bankTilt);
  const [parts, setParts] = useState(null);
  const { scene } = useGLTF(TOUCAN_GLB);

  useEffect(() => {
    activityRef.current = scrollActivity;
    bankRef.current = bankTilt;
  }, [scrollActivity, bankTilt]);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const basecolor = loader.load(`${TOUCAN_TEXTURES}/Tukan_basecolor.jpeg`);
    const normal = loader.load(`${TOUCAN_TEXTURES}/Tukan_normal.jpeg`);
    const roughness = loader.load(`${TOUCAN_TEXTURES}/Tukan_roughness.jpeg`);
    const metallic = loader.load(`${TOUCAN_TEXTURES}/Tukan_metallic.jpeg`);

    const material = new THREE.MeshStandardMaterial({
      map: basecolor,
      normalMap: normal,
      roughnessMap: roughness,
      metalnessMap: metallic,
      metalness: 0.3,
      roughness: 0.7,
    });

    let sourceMesh = null;
    scene.traverse((child) => {
      if (child.isMesh && !sourceMesh) sourceMesh = child;
    });

    if (sourceMesh) setParts(splitMeshIntoWings(sourceMesh, material));

    return () => material.dispose();
  }, [scene]);

  useFrame(() => {
    const activity = activityRef.current;
    const elapsed = clock.current.getElapsedTime();

    if (bodyRef.current) {
      bodyRef.current.rotation.x = -0.1;
      bodyRef.current.rotation.z = bankRef.current;
    }

    if (!leftWingRef.current || !rightWingRef.current) return;

    if (activity < 0.02) {
      leftWingRef.current.rotation.x = THREE.MathUtils.lerp(leftWingRef.current.rotation.x, 0, 0.15);
      rightWingRef.current.rotation.x = THREE.MathUtils.lerp(rightWingRef.current.rotation.x, 0, 0.15);
      return;
    }

    const flapHz = 5 + activity * 7;
    const flapAngle = Math.sin(elapsed * flapHz) * (0.35 + activity * 0.45);

    leftWingRef.current.rotation.x = flapAngle;
    rightWingRef.current.rotation.x = flapAngle;
  });

  if (!parts?.body) return null;

  return (
    <Bounds fit clip observe margin={1.15}>
      <group rotation={[0, Math.PI * 1.1, 0]}>
        <group ref={bodyRef}>
          <mesh geometry={parts.body} material={parts.material} />
        </group>
        {parts.left && (
          <group ref={leftWingRef} position={parts.leftPivot}>
            <mesh geometry={parts.left} material={parts.material} position={parts.leftOffset} />
          </group>
        )}
        {parts.right && (
          <group ref={rightWingRef} position={parts.rightPivot}>
            <mesh geometry={parts.right} material={parts.material} position={parts.rightOffset} />
          </group>
        )}
      </group>
    </Bounds>
  );
}

export default function ToucanMascot() {
  const initial = typeof window !== 'undefined'
    ? getToucanFromScroll(0)
    : { x: 96, y: 118, flightAngle: 135 + FACING_OFFSET };

  const [display, setDisplay] = useState({
    x: initial.x,
    y: initial.y,
    flightAngle: initial.flightAngle,
  });
  const [scrollActivity, setScrollActivity] = useState(0);
  const [bankTilt, setBankTilt] = useState(0);

  const targetRef = useRef(initial);
  const currentRef = useRef({ x: initial.x, y: initial.y });
  const prevRef = useRef({ x: initial.x, y: initial.y });
  const activityRef = useRef(0);
  const animRef = useRef(null);

  const syncTarget = useCallback(() => {
    targetRef.current = getToucanFromScroll(window.scrollY);
  }, []);

  useEffect(() => {
    syncTarget();
    window.addEventListener('scroll', syncTarget, { passive: true });
    window.addEventListener('resize', syncTarget);
    return () => {
      window.removeEventListener('scroll', syncTarget);
      window.removeEventListener('resize', syncTarget);
    };
  }, [syncTarget]);

  useEffect(() => {
    let lastTs = null;

    const tick = (ts) => {
      if (!lastTs) lastTs = ts;
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;

      const target = targetRef.current;
      const follow = 1 - Math.pow(0.001, dt);
      currentRef.current.x += (target.x - currentRef.current.x) * follow;
      currentRef.current.y += (target.y - currentRef.current.y) * follow;

      const vx = (currentRef.current.x - prevRef.current.x) / Math.max(dt, 0.001);
      const vy = (currentRef.current.y - prevRef.current.y) / Math.max(dt, 0.001);
      const speed = Math.min(Math.hypot(vx, vy) / 380, 1);

      prevRef.current.x = currentRef.current.x;
      prevRef.current.y = currentRef.current.y;

      activityRef.current += (speed - activityRef.current) * 0.18;
      const activity = activityRef.current;

      const bank = Math.max(-12, Math.min(12, vx * 0.018));
      const flightAngle = speed > 0.06
        ? (Math.atan2(vy, vx) * 180) / Math.PI + FACING_OFFSET
        : target.flightAngle;

      setScrollActivity(activity);
      setBankTilt(bank * 0.012);
      setDisplay({
        x: currentRef.current.x,
        y: currentRef.current.y,
        flightAngle,
      });

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '160px',
        height: '140px',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: `translate(${display.x - BOX_HALF_W}px, ${display.y - BOX_HALF_H}px) rotate(${display.flightAngle}deg)`,
        transformOrigin: 'center center',
        filter: scrollActivity > 0.5 ? 'blur(0.3px)' : 'none',
        willChange: 'transform',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', width: '160px', height: '140px' }}
      >
        <ambientLight intensity={2.5} />
        <directionalLight position={[0, 5, 8]} intensity={3} color="#ffffff" />
        <directionalLight position={[-5, 0, 3]} intensity={1.2} color="#fff5e0" />
        <pointLight position={[0, 0, 5]} intensity={2} color="#ffffff" />
        <Suspense fallback={null}>
          <ToucanModel scrollActivity={scrollActivity} bankTilt={bankTilt} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(TOUCAN_GLB);
