import React from "react";
import { useLocation } from "react-router-dom";
import { MeshGradient, DotOrbit } from "@paper-design/shaders-react";

// 70% warm (orange / amber / yellow-amber) + 30% obsidian blue
const MESH_COLORS = ["#0a0f1e", "#12102e", "#ea580c", "#d97706", "#fbbf24"];

const Background = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (!isLandingPage) return;
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    let timeoutId;
    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 200);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timeoutId);
    };
  }, [isLandingPage]);

  // Non-landing pages — same shader, heavier dark overlay so UI stays readable
  if (!isLandingPage) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: "#0a0f1e" }}>
        <MeshGradient
          className="absolute inset-0 w-full h-full"
          colors={MESH_COLORS}
          speed={0.4}
          backgroundColor="#0a0f1e"
        />
        {/* dark overlay to keep UI readable */}
        <div className="absolute inset-0 bg-black/55 pointer-events-none" />
        {/* golden centre glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(202, 138, 4, 0.18) 0%, transparent 70%)",
          }}
        />
      </div>
    );
  }

  // Landing page
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: "#0a0f1e" }}>
      {isMobile ? (
        // Mobile: static radial gradient
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 15% 20%, rgba(234, 88, 12, 0.40) 0%, transparent 45%),
              radial-gradient(circle at 85% 65%, rgba(251, 191, 36, 0.25) 0%, transparent 45%),
              radial-gradient(ellipse 70% 50% at 50% 60%, rgba(217, 119, 6, 0.20) 0%, transparent 60%),
              #0a0f1e
            `,
          }}
        />
      ) : (
        <>
          {/* Primary mesh shader */}
          <MeshGradient
            className="absolute inset-0 w-full h-full"
            colors={MESH_COLORS}
            speed={0.6}
            backgroundColor="#0a0f1e"
          />

          {/* Dot orbit texture layer */}
          <div className="absolute inset-0 opacity-20">
            <DotOrbit
              className="w-full h-full"
              dotColor="#d97706"
              orbitColor="#12102e"
              speed={0.5}
              intensity={1.1}
            />
          </div>
        </>
      )}

      {/* Golden centre glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 48%, rgba(202, 138, 4, 0.22) 0%, rgba(180, 83, 9, 0.12) 40%, transparent 70%)",
        }}
      />

      {/* Soft golden top bloom */}
      <div
        className="absolute top-0 left-0 right-0 h-72 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(217, 119, 6, 0.18) 0%, transparent 70%)",
        }}
      />

      {/* Bottom fade to obsidian */}
      <div className="absolute bottom-0 h-1/3 w-full bg-gradient-to-t from-[#0a0f1e]/80 to-transparent pointer-events-none" />

      {/* Edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(6, 6, 18, 0.65) 100%)",
        }}
      />
    </div>
  );
};

export default Background;
