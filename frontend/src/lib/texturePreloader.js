import * as THREE from "three";

/**
 * TexturePreloader — singleton service that background-loads textures
 * into THREE.Cache so they're instant when the dashboard mounts.
 */

// Enable THREE.js built-in cache
THREE.Cache.enabled = true;

const TEXTURE_MANIFEST = {
  // Full-res textures (for Command Center dashboard)
  earthDay8k: "/assets/textures/earth_daymap_8k.jpg",
  earthClouds8k: "/assets/textures/earth_clouds_8k.jpg",
  earthBump4k: "/assets/textures/earth_bump_4k.jpg",

  // Lightweight textures (for Landing page)
  earthDay2k: "/assets/textures/earth_daymap_2k.jpg",
  earthClouds2k: "/assets/textures/earth_clouds_2k.jpg",
  earthBump2k: "/assets/textures/earth_bump_2k.jpg",

  // High-res textures kept warm for the landing globe background
  earthDayLandingHi: "/assets/textures/earth_daymap_8k.jpg",
  earthCloudsLandingHi: "/assets/textures/earth_clouds_8k.jpg",
  earthBumpLandingHi: "/assets/textures/earth_bump_4k.jpg",
};

const textureCache = new Map();
const loadingPromises = new Map();
const loader = new THREE.TextureLoader();

/**
 * Load a single texture by key — returns a promise.
 * If already loaded, resolves immediately from cache.
 */
function loadTexture(key) {
  if (textureCache.has(key)) {
    return Promise.resolve(textureCache.get(key));
  }

  if (loadingPromises.has(key)) {
    return loadingPromises.get(key);
  }

  const url = TEXTURE_MANIFEST[key];
  if (!url) {
    return Promise.reject(new Error(`Unknown texture key: ${key}`));
  }

  const promise = new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        textureCache.set(key, texture);
        loadingPromises.delete(key);
        resolve(texture);
      },
      undefined,
      () => {
        loadingPromises.delete(key);
        reject(new Error(`Failed to load texture: ${key}`));
      },
    );
  });

  loadingPromises.set(key, promise);
  return promise;
}

function preloadDashboardTextures() {
  const dashboardKeys = ["earthDay8k", "earthClouds8k", "earthBump4k"];

  const scheduleWork =
    typeof requestIdleCallback === "function"
      ? requestIdleCallback
      : (cb) => setTimeout(cb, 100);

  dashboardKeys.forEach((key) => {
    scheduleWork(() => {
      loadTexture(key).catch(() => {});
    });
  });
}

/**
 * Loads the landing globe's high-res texture set in parallel.
 * Returns the array of textures once all are ready.
 */
function preloadLandingHighResTextures() {
  const landingHiKeys = [
    "earthDayLandingHi",
    "earthCloudsLandingHi",
    "earthBumpLandingHi",
  ];

  return Promise.all(
    landingHiKeys.map((key) => loadTexture(key).catch(() => null)),
  );
}

function preloadCommandCenterChunk() {
  const scheduleWork =
    typeof requestIdleCallback === "function"
      ? requestIdleCallback
      : (cb) => setTimeout(cb, 200);

  scheduleWork(() => {
    import("../pages/CommandCenter.jsx").catch(() => {});
  });
}

export {
  preloadDashboardTextures,
  preloadLandingHighResTextures,
  preloadCommandCenterChunk,
};
