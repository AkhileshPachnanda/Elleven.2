import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LandingGlobe from "../components/Globe/LandingGlobe";
import {
  preloadDashboardTextures,
  preloadCommandCenterChunk,
} from "../lib/texturePreloader";

function Landing() {
  const navigate = useNavigate();

  // Background preload: warm GPU texture cache + JS chunk while user reads hero
  useEffect(() => {
    preloadDashboardTextures();
    preloadCommandCenterChunk();
  }, []);

  return (
    <div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "var(--bg-primary)",
      }}
    >
      {/* Globe — background, slightly offset downward */}
      <div
        style={{
          position: "absolute",
          inset: 10,
          zIndex: 0,
        }}
      >
        <LandingGlobe />
      </div>

      {/* Gradient overlay — helps text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          background: `
          radial-gradient(ellipse at center 70%, transparent 20%, var(--bg-primary) 80%),
          linear-gradient(to bottom, var(--bg-primary) 0%, transparent 20%, transparent 90%, var(--bg-primary) 100%)
        `,
          pointerEvents: "none",
        }}
      />

      {/* Top nav */}
      <nav
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          padding: "20px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          <a href="https://github.com/AkhileshPachnanda"
            target="_blank"
            rel="noopener noreferrer">
          Akhilesh Pachnanda
          </a>
        </span>
        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "center",
          }}
        >
          <a
            href="https://github.com/AkhileshPachnanda/Elleven.2"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 150ms ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
            onMouseLeave={(e) =>
              (e.target.style.color = "var(--text-secondary)")
            }
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero content */}
      <div
        style={{
          position: "absolute",
          paddingTop: "13vh",
          inset: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.025em",
            marginBottom: "16px",
          }}
        >
          Elleven.2
        </p>

        <p
          style={{
            fontSize: "16px",
            fontWeight: 400,
            color: "var(--text-secondary)",
            maxWidth: "600px",
            lineHeight: 1.6,
            marginBottom: "32px",
          }}
        >
          Real-time orbital tracking for ISRO assets and major satellites,
          including the ISS, made possible with{" "}
          <b>R3F & Three.js, CelesTrak API & satellite.js</b>.
        </p>

        <button

          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/control")}
          style={{
            padding: "12px 32px",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "inherit",
            background: "var(--accent)",
            color: "#ffffff",
            border: "none",
            borderRadius: "var(--radius-pill)",
            cursor: "pointer",
            pointerEvents: "auto",
            transition: "background 150ms ease",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) =>
            (e.target.style.background = "var(--accent-hover)")
          }
          onMouseLeave={(e) => (e.target.style.background = "var(--accent)")}
        >
          Explore →
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "4px",
          fontSize: "14px",
          color: "rgb(255, 255, 255)",
          fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
          letterSpacing: "0.02em",
          pointerEvents: "auto",
        }}
      >
        <span>created by pacman.</span>
        <span>contribute</span>
        <a
          href="https://github.com/AkhileshPachnanda/ISRO-Mission_Control"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "rgb(255, 255, 255)",
            textDecoration: "none",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            transition: "all 150ms ease",
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#E59C4F";
            e.currentTarget.style.borderBottomColor = "#E59C4F";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.65)";
            e.currentTarget.style.borderBottomColor =
              "rgba(255, 255, 255, 0.2)";
          }}
        >
          here
        </a>
        <span>.</span>
      </div>
    </div>
  );
}

export default Landing;
