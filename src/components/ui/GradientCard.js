import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export const GradientCard = ({ icon, count, label, latestDate, isActive, onClick }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setRotation({
      x: -((e.clientY - rect.top  - rect.height / 2) / rect.height) * 7,
      y:  ((e.clientX - rect.left - rect.width  / 2) / rect.width)  * 7,
    });
  };

  const active = isActive || isHovered;

  return (
    /* ── outer wrapper: owns the border + glow, NOT overflow:hidden ── */
    <motion.div
      ref={cardRef}
      onClick={onClick}
      className="relative flex-shrink-0 w-[40vw] sm:w-auto cursor-pointer snap-center"
      style={{
        aspectRatio: "1 / 1",
        borderRadius: "1.5rem",
        transformStyle: "preserve-3d",
        /* border lives here — outside any clip context */
        border: `1.5px solid ${active ? "rgba(217,119,6,0.80)" : "rgba(180,83,9,0.28)"}`,
        boxShadow: active
          ? [
              "0 0 0 1px rgba(180,83,9,0.18)",
              "0 0 20px 5px rgba(180,83,9,0.50)",
              "0 0 45px 10px rgba(161,54,0,0.28)",
              "0 0 80px 18px rgba(120,40,0,0.14)",
              "inset 0 0 28px rgba(180,83,9,0.12)",
            ].join(", ")
          : [
              "0 0 12px 3px rgba(180,83,9,0.22)",
              "0 0 28px 6px rgba(161,54,0,0.10)",
            ].join(", "),
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
      animate={{
        y: isHovered ? -6 : 0,
        rotateX: rotation.x,
        rotateY: rotation.y,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setRotation({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
    >
      {/* ── inner clip container: handles overflow for effects ── */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius: "calc(1.5rem - 1.5px)" }}
      >
        {/* Warm dark base — matches dashboard card brown-amber theme */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(145deg, #16100a 0%, #0e0b06 55%, #0a0d12 100%)" }} />

        {/* Warm amber corner glow — bottom-left (matches hero card) */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 0% 100%, rgba(180,83,9,0.45) 0%, transparent 60%)" }} />

        {/* Top-right cool edge */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(15,23,40,0.6) 0%, transparent 55%)" }} />

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
        />

        {/* Centre amber glow — brightens on hover/active */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 65%, rgba(234,88,12,0.40) 0%, rgba(180,83,9,0.15) 45%, transparent 70%)" }}
          animate={{ opacity: active ? 1 : 0.55 }}
          transition={{ duration: 0.3 }}
        />

        {/* Top-left warm shimmer sheen */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(255,255,255,0) 40%)" }}
        />
      </div>

      {/* ── card content — sits above the inner clip div ── */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 gap-2.5">
        {/* Icon box */}
        <motion.div
          className="flex items-center justify-center rounded-xl"
          style={{
            padding: "0.65rem",
            background: "linear-gradient(225deg, #1c1408 0%, #130f06 100%)",
            border: `1px solid ${active ? "rgba(180,83,9,0.38)" : "rgba(180,83,9,0.14)"}`,
          }}
          animate={{
            boxShadow: active
              ? "0 0 14px 3px rgba(180,83,9,0.30), inset 1px 1px 3px rgba(255,255,255,0.06)"
              : "inset 1px 1px 2px rgba(255,255,255,0.04)",
            y: isHovered ? -2 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ color: active ? "#f97316" : "#f59e0b" }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
        </motion.div>

        {/* Count */}
        <motion.h3
          className="text-5xl font-bold leading-none tracking-tight text-white"
          animate={{ textShadow: active ? "0 0 20px rgba(245,158,11,0.45)" : "none" }}
          transition={{ duration: 0.3 }}
        >
          {count}
        </motion.h3>

        {/* Label */}
        <motion.p
          className="text-[10px] font-semibold uppercase tracking-widest text-center"
          animate={{ color: active ? "rgba(251,191,36,0.9)" : "rgba(148,163,184,1)" }}
          transition={{ duration: 0.3 }}
        >
          {label}
        </motion.p>

        {/* Date */}
        {latestDate && (
          <motion.span
            className="text-[10px] font-medium"
            animate={{ color: active ? "rgba(203,213,225,0.7)" : "rgba(100,116,139,1)" }}
            transition={{ duration: 0.3 }}
          >
            Last: {latestDate}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

export default GradientCard;
