import { useRef, Suspense, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { TextureLoader } from "three";
import * as THREE from "three";
import { preloadLandingHighResTextures } from "../../lib/texturePreloader";

/* ── Lightweight cloud fragment shader (same as GlobeView but simpler) ── */
const cloudVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const cloudFragmentShader = `
  uniform sampler2D cloudMap;
  uniform float opacity;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(cloudMap, vUv);
    float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    float alpha = smoothstep(0.15, 0.55, lum) * opacity;
    gl_FragColor = vec4(vec3(1.0), alpha);
  }
`;

function Earth() {
  const meshRef = useRef();
  const cloudRef = useRef();
  const [highResTextures, setHighResTextures] = useState(null);

  const lowEarthTexture = useLoader(
    TextureLoader,
    "/assets/textures/earth_daymap_2k.jpg",
  );
  const lowBumpTexture = useLoader(
    TextureLoader,
    "/assets/textures/earth_bump_2k.jpg",
  );
  const lowCloudTexture = useLoader(
    TextureLoader,
    "/assets/textures/earth_clouds_2k.jpg",
  );

  useEffect(() => {
    let active = true;

    preloadLandingHighResTextures()
      .then(([day, clouds, bump]) => {
        if (!active) return;

        if (day && clouds && bump) {
          setHighResTextures({ day, clouds, bump });
        }
      })
      .catch(() => {
        if (active) setHighResTextures(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const earthTexture = highResTextures?.day ?? lowEarthTexture;
  const bumpTexture = highResTextures?.bump ?? lowBumpTexture;
  const cloudTexture = highResTextures?.clouds ?? lowCloudTexture;

  const clipPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.2),
    [],
  );
  const clipPlanes = useMemo(() => [clipPlane], [clipPlane]);

  const cloudMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        cloudMap: { value: cloudTexture },
        opacity: { value: 0.3 }, // Slightly more subtle on landing
      },
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
      clippingPlanes: clipPlanes,
    });
  }, [cloudTexture, clipPlanes]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.04;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.05; // Slightly faster than earth for drift effect
    }
  });

  return (
    <group position={[0, -1, 0]}>
      {/* Earth — 32 segments (landing bg, doesn't need 64) */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          clippingPlanes={clipPlanes}
          bumpMap={bumpTexture}
          bumpScale={0.025}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Cloud layer — even lower poly for landing */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.006, 64, 64]} />
        <primitive object={cloudMaterial} attach="material" />
      </mesh>
    </group>
  );
}

function LandingGlobe() {
  return (
    <Canvas
      camera={{ position: [0, 0, 2], fov: 30 }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]} // Cap pixel ratio for performance
      gl={{
        powerPreference: "high-performance",
        antialias: true,
        localClippingEnabled: true,
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1.8} color="#ffffff" />

      <Suspense fallback={null}>
        <Earth />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.2}
      />
    </Canvas>
  );
}

export default LandingGlobe;
