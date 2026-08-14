import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LandingGlobe from "../components/Globe/LandingGlobe";
import {
  preloadDashboardTextures,
  preloadCommandCenterChunk,
} from "../lib/texturePreloader";

function Landing() {
  const navigate = useNavigate();
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
          padding: isMobile ? "16px 18px" : "20px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: isMobile ? "11px" : "13px",
            fontWeight: 500,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
            maxWidth: isMobile ? "50%" : "auto",
            lineHeight: 1.3,
          }}
        >
          <a
            href="https://github.com/AkhileshPachnanda"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Akhilesh Pachnanda
          </a>
        </span>
        <div
          style={{
            display: "flex",
            gap: isMobile ? "12px" : "24px",
            alignItems: "center",
          }}
        >
          <a
            href="https://github.com/AkhileshPachnanda/Elleven.2"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: isMobile ? "12px" : "14px",
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
          paddingTop: isMobile ? "14vh" : "13vh",
          inset: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          textAlign: "center",
          pointerEvents: "none",
          paddingLeft: isMobile ? "20px" : "0",
          paddingRight: isMobile ? "20px" : "0",
        }}
      >
        <p
          style={{
            fontSize: isMobile
              ? "clamp(28px, 10vw, 42px)"
              : "clamp(32px, 5vw, 56px)",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.025em",
            marginBottom: isMobile ? "12px" : "16px",
          }}
        >
          Elleven.2
        </p>

        <p
          style={{
            fontSize: isMobile ? "14px" : "16px",
            fontWeight: 400,
            color: "var(--text-secondary)",
            maxWidth: isMobile ? "92vw" : "650px",
            lineHeight: 1.6,
            marginBottom: isMobile ? "24px" : "32px",
          }}
        >
          Real-time orbital tracking for ISRO assets and major satellites,
          including the ISS, made possible with{" "}
          <b>
            R3F & Three.js, CelesTrak API, satellite.js & gpt-oss through Groq.
          </b>
          {isMobile ? " " : " "}
          <br />
          Deployed on Vercel.
        </p>

        <button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/control")}
          style={{
            padding: isMobile ? "12px 24px" : "12px 32px",
            fontSize: isMobile ? "12px" : "14px",
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
          bottom: isMobile ? "14px" : "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: isMobile ? "wrap" : "nowrap",
          gap: isMobile ? "3px" : "4px",
          fontSize: isMobile ? "11px" : "14px",
          color: "rgb(255, 255, 255)",
          fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
          letterSpacing: isMobile ? "0.01em" : "0.02em",
          pointerEvents: "auto",
          textAlign: "center",
          maxWidth: isMobile ? "85vw" : "auto",
          lineHeight: 1.5,
        }}
      >
        <span>created by pacman.</span>
        <span>contribute</span>
        <a
          href="https://github.com/AkhileshPachnanda/Elleven.2"
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
