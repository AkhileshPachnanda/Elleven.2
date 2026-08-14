import { useRef, Suspense, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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

    const timer = setTimeout(() => {
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
    }, 3000);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const earthTexture = highResTextures?.day ?? lowEarthTexture;
  const bumpTexture = highResTextures?.bump ?? lowBumpTexture;
  const cloudTexture = highResTextures?.clouds ?? lowCloudTexture;

  const clipPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.8),
    [],
  );
  const clipPlanes = useMemo(() => [clipPlane], [clipPlane]);

  const cloudMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        cloudMap: { value: cloudTexture },
        opacity: { value: 0.45 },
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
      cloudRef.current.rotation.y += delta * 0.06; // Slightly faster than earth for drift effect
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
          bumpScale={0.014}
          roughness={0.9}
          metalness={0.04}
        />
      </mesh>

      {/* Cloud layer — even lower poly for landing */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.002, 64, 64]} />
        <primitive object={cloudMaterial} attach="material" />
      </mesh>
    </group>
  );
}

function LandingGlobe() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Canvas
      camera={{
        position: [0, 0, isMobile ? 2.7 : 2],
        fov: isMobile ? 46 : 32,
      }}
      style={{ background: "transparent" }}
      dpr={[1, 1.1]} // Keep mobile texture crisp while avoiding oversized render
      gl={{
        powerPreference: "high-performance",
        antialias: true,
        localClippingEnabled: true,
      }}
    >
      <ambientLight intensity={0.65} color="#feffff" />
      <directionalLight position={[5, 7, 1]} intensity={3} color="#fff4d6" />

      <Suspense fallback={null}>
        <group scale={isMobile ? 0.94 : 1}>
          <Earth />
        </group>
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={isMobile ? 0.12 : 0.2}
      />
    </Canvas>
  );
}

export default LandingGlobe;
