# Eleven.2 Architecture

Eleven.2 is built on a **decoupled client-server architecture** using a **Backend-For-Frontend (BFF)** pattern. It bridges the gap between raw orbital mechanics and accessible user interfaces by combining real-time mathematical propagation with AI-generated human-readable summaries.

## High-Level System Diagram

```mermaid
graph TD
    subgraph Frontend [React 19 + Vite]
        UI[Framer Motion UI]
        Engine[Three.js / React Three Fiber]
        SGP4[satellite.js / WebAssembly]
    end

    subgraph Backend [Node.js + Express]
        Cache[(Node-Cache)]
        API_TLE[/api/celestrak]
        API_AI[/api/groq]
    end

    subgraph External Dependencies
        CelesTrak[CelesTrak API]
        Groq[Groq LLM API]
    end

    UI --> API_TLE
    UI --> API_AI
    Engine --> SGP4
    
    API_TLE <--> Cache
    API_AI <--> Cache
    
    API_TLE --> CelesTrak
    API_AI --> Groq
```

## Core Components

### 1. The Backend-For-Frontend (BFF)
The backend (`/backend`) serves three critical purposes:
1. **Security**: It keeps the `GROQ_API_KEY` off the client.
2. **Caching**: It uses `node-cache` to aggressively cache expensive or rate-limited upstream calls. TLEs (Two-Line Elements) are cached for 6 hours, and AI-generated summaries are cached for 1 hour.
3. **Rate Limit Evasion**: CelesTrak heavily rate-limits direct browser requests. The backend batches and sequences requests to prevent 503 errors.

### 2. Orbital Mechanics Engine
The frontend uses `satellite.js` to implement the **SGP4 (Simplified General Perturbations)** algorithm. 
- The backend provides a TLE (a mathematical model of an orbit at a specific epoch).
- The frontend SGP4 engine takes the TLE and a timestamp (`Date.now()` or a simulated time) to output Geodetic coordinates (Latitude, Longitude, Altitude).
- These coordinates are then converted into Cartesian vectors (X, Y, Z) using spherical trigonometry so that `Three.js` can place the satellite in the 3D scene.

### 3. Rendering Engine (WebGL)
We use `three.js` via `@react-three/fiber` to create a declarative 3D scene.
- Earth textures are mapped to a spherical geometry.
- Satellites are represented as GLTF models (for specific assets like the ISS) or simple geometric markers.
- The `useSatellites` hook manages a batched asynchronous update loop to prevent the heavy SGP4 mathematics from dropping frames in the WebGL renderer.

### 4. AI Intelligence Pipeline
When a satellite is selected, its metadata (Orbit Type, Mission, Mass, Launch Date) is sent to the backend `/api/groq/intel` endpoint. 
- The backend constructs a prompt for the `llama-3.3-70b-versatile` model.
- It asks for a strict 3-sentence layman summary focusing on real-world utility.
- The backend cleans the response (stripping internal `<think>` blocks if present) and returns the sanitized string to the UI.

## Performance Engineering Decisions

- **Asynchronous Batching**: In `useSatellites.js`, propagating 100+ satellites on every frame would block the main thread. We process them in chunks of 6, yielding to the event loop, ensuring the UI remains buttery smooth.
- **Event Quantization**: The Time Scrubber handles rapid slider `onChange` events. Instead of recomputing physics for every pixel moved, it quantizes (snaps) the time to 5-minute intervals, reducing mathematical load by 99%.
- **Bottom-Sheet Morphing**: On mobile devices, fixed sidebars block the 3D canvas. We use `framer-motion` and `useMediaQuery` to seamlessly animate the sidebar into a layered bottom-sheet on screens `<768px`.
