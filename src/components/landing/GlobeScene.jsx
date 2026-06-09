import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Vertex Shader ───────────────────────────────────────
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = normalize((modelMatrix * vec4(position, 1.0)).xyz);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// ─── Fragment Shader ─────────────────────────────────────
const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  // ── Permutation table for Perlin noise ──
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314*r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0,i1.z,i2.z,1.0))
      + i.y + vec4(0.0,i1.y,i2.y,1.0))
      + i.x + vec4(0.0,i1.x,i2.x,1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0*floor(p*ns.z*ns.z);
    vec4 x_ = floor(j*ns.z);
    vec4 y_ = floor(j - 7.0*x_);
    vec4 x  = x_*ns.x + ns.yyyy;
    vec4 y  = y_*ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(
      dot(p0,p0), dot(p1,p1),
      dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y;
    p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(
      dot(x0,x0), dot(x1,x1),
      dot(x2,x2), dot(x3,x3)), 0.0);
    m = m*m;
    return 42.0*dot(m*m, vec4(
      dot(p0,x0), dot(p1,x1),
      dot(p2,x2), dot(p3,x3)));
  }

  // ── Fractional Brownian Motion ──
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * snoise(p);
      p  = p * 2.0 + vec3(1.7, 9.2, 3.4);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 pos = vPosition;

    // ── Continent mask via fbm noise ──
    float n = fbm(pos * 2.2);
    float isLand = smoothstep(0.04, 0.12, n);

    // ── Latitude for polar caps ──
    float lat = asin(clamp(pos.y, -1.0, 1.0));
    float pole = smoothstep(1.1, 1.57, abs(lat));

    // ── Base colour ──
    // Ocean: deep navy
    vec3 oceanDeep = vec3(0.039, 0.086, 0.157); // #0a1628
    vec3 oceanMid  = vec3(0.102, 0.227, 0.361); // #1a3a5c
    float oceanVar = fbm(pos * 4.0) * 0.5 + 0.5;
    vec3 ocean = mix(oceanDeep, oceanMid, oceanVar * 0.4);

    // Land: dark earthy green
    vec3 landDark  = vec3(0.176, 0.416, 0.310); // #2d6a4f
    vec3 landLight = vec3(0.227, 0.561, 0.384); // #3a8f62
    float landVar  = fbm(pos * 5.0 + vec3(3.3, 1.1, 2.2)) * 0.5 + 0.5;
    vec3 land = mix(landDark, landLight, landVar);

    // Ice caps: near white
    vec3 ice = vec3(0.88, 0.92, 0.96);

    // Blend land/ocean/ice
    vec3 surface = mix(ocean, land, isLand);
    surface = mix(surface, ice, pole);

    // ── Directional light (upper-left, slightly forward) ──
    vec3 lightDir = normalize(vec3(-0.6, 0.7, 0.5));
    float diffuse  = max(0.0, dot(vNormal, lightDir));
    float ambient  = 0.08;
    float lit = ambient + diffuse * 0.92;

    // ── Specular highlight ──
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVec = normalize(lightDir + viewDir);
    float spec = pow(max(0.0, dot(vNormal, halfVec)), 48.0);
    vec3 specColor = vec3(0.78, 0.87, 1.0) * spec * 0.55;

    // ── Night side city glow ──
    float nightMask = max(0.0, -diffuse * 2.0);
    float cityNoise  = fbm(pos * 8.0 + vec3(5.5, 2.1, 7.3));
    float cityGlow   = step(0.35, cityNoise) * isLand * nightMask * 0.22;
    vec3 cityColor   = vec3(1.0, 0.62, 0.18) * cityGlow;

    // ── Fresnel atmosphere rim ──
    vec3 camDir = vec3(0.0, 0.0, 1.0);
    float fresnel = pow(1.0 - abs(dot(vNormal, camDir)), 4.0);
    vec3 rimColor = vec3(0.23, 0.53, 1.0) * fresnel * 0.7;

    // ── Compose ──
    vec3 color = surface * lit + specColor + cityColor + rimColor;

    // ── Soft vignette toward dark side ──
    color = mix(color, color * 0.15, smoothstep(0.0, -0.3, diffuse - 0.0));

    gl_FragColor = vec4(color, 1.0);
  }
`

// ─── Atmosphere Halo (separate mesh) ────────────────────
const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  void main() {
    vec3 camDir = vec3(0.0, 0.0, 1.0);
    float intensity = pow(1.0 - abs(dot(vNormal, camDir)), 3.5);
    vec3 color = vec3(0.2, 0.5, 1.0);
    gl_FragColor = vec4(color, intensity * 0.35);
  }
`

// ─── Component ───────────────────────────────────────────
export default function GlobeScene() {
  const globeRef  = useRef()
  const atmRef    = useRef()

  const globeMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.FrontSide,
  }), [])

  const atmMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    side: THREE.BackSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [])

  useFrame(() => {
    if (globeRef.current)  globeRef.current.rotation.y  += 0.0008
    if (atmRef.current)    atmRef.current.rotation.y    += 0.0008
  })

  return (
    <group position={[2.8, -0.2, -1.0]}>
      {/* Main planet */}
      <mesh ref={globeRef} material={globeMaterial}>
        <sphereGeometry args={[1.4, 96, 96]} />
      </mesh>

      {/* Atmosphere halo — slightly larger, inside-out */}
      <mesh ref={atmRef} material={atmMaterial}>
        <sphereGeometry args={[1.52, 64, 64]} />
      </mesh>
    </group>
  )
}
