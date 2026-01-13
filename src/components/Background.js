import React from "react";

const ORBS = [
  { size: 384, color: "bg-yellow-500/35", anim: "float1", top: "5%", left: "5%" },
  { size: 320, color: "bg-amber-500/30", anim: "float2", top: "60%", right: "5%" },
  { size: 288, color: "bg-yellow-600/33", anim: "float3", top: "30%", left: "50%" },
  { size: 256, color: "bg-amber-400/27", anim: "float4", top: "15%", right: "25%" },
  { size: 352, color: "bg-yellow-500/31", anim: "float5", bottom: "15%", left: "20%" },
  { size: 224, color: "bg-amber-600/25", anim: "float6", top: "45%", left: "10%" },
  { size: 272, color: "bg-yellow-400/29", anim: "float7", bottom: "25%", right: "15%" },
  { size: 240, color: "bg-amber-500/26", anim: "float8", top: "70%", left: "60%" },
  { size: 208, color: "bg-yellow-600/28", anim: "float9", top: "10%", left: "75%" },
  { size: 304, color: "bg-amber-400/24", anim: "float10", top: "50%", left: "30%" },
  // NEW ORBS
  { size: 268, color: "bg-yellow-500/32", anim: "float11", top: "22%", right: "40%" },
  { size: 232, color: "bg-amber-400/28", anim: "float12", bottom: "35%", left: "45%" },
  { size: 296, color: "bg-yellow-400/34", anim: "float13", top: "55%", right: "30%" },
  { size: 216, color: "bg-amber-500/27", anim: "float14", bottom: "8%", right: "48%" },
  { size: 248, color: "bg-yellow-600/30", anim: "float15", top: "38%", left: "68%" },
  { size: 280, color: "bg-amber-300/29", anim: "float16", bottom: "42%", right: "12%" },
  { size: 200, color: "bg-yellow-500/26", anim: "float17", top: "65%", left: "35%" },
  { size: 260, color: "bg-amber-600/31", anim: "float18", top: "18%", left: "42%" },
  { size: 228, color: "bg-yellow-400/28", anim: "float19", bottom: "20%", left: "55%" },
  { size: 244, color: "bg-amber-500/33", anim: "float20", top: "42%", right: "22%" }
];

const Background = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show 6 orbs on mobile instead of 20
  const visibleOrbs = isMobile ? ORBS.slice(0, 6) : ORBS;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-blue-950" />

      {/* Accent lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 h-1/3 w-full bg-gradient-to-b from-blue-900/20 to-transparent" />
        <div className="absolute bottom-0 h-1/3 w-full bg-gradient-to-t from-slate-900/20 to-transparent" />
      </div>

      {/* Animated Orbs */}
      <div className="absolute inset-0">
        {visibleOrbs.map((orb, i) => (
          <div
            key={i}
            className={`absolute rounded-full blur-2xl ${orb.color} ${isMobile ? 'opacity-40' : ''}`}
            style={{
              width: isMobile ? orb.size / 1.5 : orb.size,
              height: isMobile ? orb.size / 1.5 : orb.size,
              animation: `${orb.anim} ${isMobile ? '40s' : '20s'} ease-in-out infinite`,
              willChange: i < 3 ? "transform" : "auto", // Only hint top 3 for mobile
              ...orb
            }}
          />
        ))}
      </div>

      {/* Glass overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-white/[0.02]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/25" />

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          div[style*="animation"] {
            animation: none !important;
          }
        }

        @keyframes float1 {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(300px,-200px,0) scale(1.1); }
        }
        @keyframes float2 {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(-250px,200px,0); }
        }
        @keyframes float3 {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(-100px,-300px,0); }
        }
        @keyframes float4 {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(200px,-150px,0) scale(0.9); }
        }
        @keyframes float5 {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(180px,-260px,0); }
        }
        @keyframes float6 {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(280px,240px,0); }
        }
        @keyframes float7 {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(-200px,-150px,0); }
        }
        @keyframes float8 {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(-250px,-180px,0); }
        }
        @keyframes float9 {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(-300px,200px,0); }
        }
        @keyframes float10 {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(200px,200px,0) scale(0.85); }
        }
        @keyframes float11 {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(-220px,180px,0); }
        }
        @keyframes float12 {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(160px,-140px,0) scale(1.15); }
        }
        @keyframes float13 {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(180px,-220px,0); }
        }
        @keyframes float14 {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(140px,180px,0); }
        }
        @keyframes float15 {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-200px,-160px,0) scale(1.1); }
        }
        @keyframes float16 {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(-180px,220px,0); }
        }
        @keyframes float17 {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(240px,-180px,0); }
        }
        @keyframes float18 {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-160px,-200px,0) scale(0.9); }
        }
        @keyframes float19 {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(200px,160px,0); }
        }
        @keyframes float20 {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-240px,-140px,0) scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default Background;
