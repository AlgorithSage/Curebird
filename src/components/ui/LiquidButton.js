import React, { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AMBER_COLORS = {
  color1:  "#92400e",  // deep burnt amber (gap/void)
  color2:  "#fbbf24",  // amber yellow
  color3:  "#f97316",  // vivid orange
  color4:  "#f59e0b",  // golden amber
  color5:  "#b45309",  // dark amber
  color6:  "#fcd34d",  // light amber
  color7:  "#fde68a",  // pale yellow
  color8:  "#ea580c",  // dark orange
  color9:  "#d97706",  // amber
  color10: "#fbbf24",  // amber yellow
  color11: "#7c2d12",  // deep burnt orange edge
  color12: "#fb923c",  // warm light orange
  color13: "#fef08a",  // light gold
  color14: "#fbbf24",  // amber
  color15: "#f97316",  // orange
  color16: "#f59e0b",  // amber
  color17: "#fcd34d",  // light amber
};

const SVG_ORDER = ["svg1", "svg2", "svg3", "svg4", "svg3", "svg2", "svg1"];

function buildSvgStates(colors) {
  return {
    svg1: {
      gradientTransform: "translate(287.5 280) rotate(-29.0546) scale(689.807 1000)",
      stops: [
        { offset: 0,        stopColor: colors.color1  },
        { offset: 0.188423, stopColor: colors.color2  },
        { offset: 0.260417, stopColor: colors.color3  },
        { offset: 0.328792, stopColor: colors.color4  },
        { offset: 0.328892, stopColor: colors.color5  },
        { offset: 0.328992, stopColor: colors.color1  },
        { offset: 0.442708, stopColor: colors.color6  },
        { offset: 0.537556, stopColor: colors.color7  },
        { offset: 0.631738, stopColor: colors.color1  },
        { offset: 0.725645, stopColor: colors.color8  },
        { offset: 0.817779, stopColor: colors.color9  },
        { offset: 0.84375,  stopColor: colors.color10 },
        { offset: 0.90569,  stopColor: colors.color1  },
        { offset: 1,        stopColor: colors.color11 },
      ],
    },
    svg2: {
      gradientTransform: "translate(126.5 418.5) rotate(-64.756) scale(533.444 773.324)",
      stops: [
        { offset: 0,        stopColor: colors.color1  },
        { offset: 0.104167, stopColor: colors.color12 },
        { offset: 0.182292, stopColor: colors.color13 },
        { offset: 0.28125,  stopColor: colors.color1  },
        { offset: 0.328792, stopColor: colors.color4  },
        { offset: 0.328892, stopColor: colors.color5  },
        { offset: 0.453125, stopColor: colors.color6  },
        { offset: 0.515625, stopColor: colors.color7  },
        { offset: 0.631738, stopColor: colors.color1  },
        { offset: 0.692708, stopColor: colors.color8  },
        { offset: 0.75,     stopColor: colors.color14 },
        { offset: 0.817708, stopColor: colors.color9  },
        { offset: 0.869792, stopColor: colors.color10 },
        { offset: 1,        stopColor: colors.color1  },
      ],
    },
    svg3: {
      gradientTransform: "translate(264.5 339.5) rotate(-42.3022) scale(946.451 1372.05)",
      stops: [
        { offset: 0,        stopColor: colors.color1  },
        { offset: 0.188423, stopColor: colors.color2  },
        { offset: 0.307292, stopColor: colors.color1  },
        { offset: 0.328792, stopColor: colors.color4  },
        { offset: 0.328892, stopColor: colors.color5  },
        { offset: 0.442708, stopColor: colors.color15 },
        { offset: 0.537556, stopColor: colors.color16 },
        { offset: 0.631738, stopColor: colors.color1  },
        { offset: 0.725645, stopColor: colors.color17 },
        { offset: 0.817779, stopColor: colors.color9  },
        { offset: 0.84375,  stopColor: colors.color10 },
        { offset: 0.90569,  stopColor: colors.color1  },
        { offset: 1,        stopColor: colors.color11 },
      ],
    },
    svg4: {
      gradientTransform: "translate(860.5 420) rotate(-153.984) scale(957.528 1388.11)",
      stops: [
        { offset: 0.109375, stopColor: colors.color11 },
        { offset: 0.171875, stopColor: colors.color2  },
        { offset: 0.260417, stopColor: colors.color13 },
        { offset: 0.328792, stopColor: colors.color4  },
        { offset: 0.328892, stopColor: colors.color5  },
        { offset: 0.328992, stopColor: colors.color1  },
        { offset: 0.442708, stopColor: colors.color6  },
        { offset: 0.515625, stopColor: colors.color7  },
        { offset: 0.631738, stopColor: colors.color1  },
        { offset: 0.692708, stopColor: colors.color8  },
        { offset: 0.817708, stopColor: colors.color9  },
        { offset: 0.869792, stopColor: colors.color10 },
        { offset: 1,        stopColor: colors.color11 },
      ],
    },
  };
}

function buildStopsArray(svgStates, maxStops) {
  const arr = [];
  for (let i = 0; i < maxStops; i++) {
    arr.push(
      SVG_ORDER.map((key) => {
        const s = svgStates[key];
        return s.stops[i] ?? s.stops[s.stops.length - 1];
      })
    );
  }
  return arr;
}

function GradientSvg({ className, isHovered, colors, gradientId }) {
  const svgStates   = buildSvgStates(colors);
  const maxStops    = Math.max(...Object.values(svgStates).map((s) => s.stops.length));
  const stopsArray  = buildStopsArray(svgStates, maxStops);
  const transforms  = SVG_ORDER.map((k) => svgStates[k].gradientTransform);

  const variants = {
    hovered:    { gradientTransform: transforms, transition: { duration: 50, repeat: Infinity, ease: "linear" } },
    notHovered: { gradientTransform: transforms, transition: { duration: 10, repeat: Infinity, ease: "linear" } },
  };

  return (
    <svg
      className={className}
      width="1030"
      height="280"
      viewBox="0 0 1030 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="1030" height="280" rx="140" fill={`url(#${gradientId})`} />
      <defs>
        <motion.radialGradient
          id={gradientId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          animate={isHovered ? variants.hovered : variants.notHovered}
        >
          {stopsArray.map((stopConfigs, i) => (
            <AnimatePresence key={i}>
              <motion.stop
                initial={{ offset: stopConfigs[0].offset, stopColor: stopConfigs[0].stopColor }}
                animate={{
                  offset:    stopConfigs.map((c) => c.offset),
                  stopColor: stopConfigs.map((c) => c.stopColor),
                }}
                transition={{ duration: 0, ease: "linear", repeat: Infinity }}
              />
            </AnimatePresence>
          ))}
        </motion.radialGradient>
      </defs>
    </svg>
  );
}

const LAYER_CONFIG = [
  { small: true,  cls: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-difference" },
  { small: true,  cls: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[164.971deg] mix-blend-difference" },
  { small: true,  cls: "top-1/2 left-1/2 -translate-x-[53%] -translate-y-[53%] rotate-[-11.61deg] mix-blend-difference" },
  { small: false, cls: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-[57%] rotate-[-179.012deg] mix-blend-difference" },
  { small: false, cls: "top-1/2 left-1/2 -translate-x-[57%] -translate-y-1/2 rotate-[-29.722deg] mix-blend-difference" },
  { small: false, cls: "top-1/2 left-1/2 -translate-x-[62%] -translate-y-[24%] rotate-[160.227deg] mix-blend-difference" },
  { small: false, cls: "top-1/2 left-1/2 -translate-x-[67%] -translate-y-[29%] rotate-180 mix-blend-hard-light" },
];

function Liquid({ isHovered, colors, baseId }) {
  return (
    <>
      {LAYER_CONFIG.map(({ small, cls }, i) => (
        <div
          key={i}
          className={`absolute ${small ? "w-[443px] h-[121px]" : "w-[756px] h-[207px]"} ${cls}`}
        >
          <GradientSvg
            className="w-full h-full"
            isHovered={isHovered}
            colors={colors}
            gradientId={`${baseId}-g${i}`}
          />
        </div>
      ))}
    </>
  );
}

export default function LiquidButton({
  children,
  onClick,
  className = "",
  colors = AMBER_COLORS,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const uid = useId().replace(/:/g, "");

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden isolate font-bold text-black transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97] ${className}`}
      {...props}
    >
      {/* Default state: static amber gradient */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #f59e0b, #f97316, #fbbf24)" }}
        animate={{ opacity: isHovered ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Hover state: liquid animated gradient — isolated so blend modes stay inside */}
      <motion.div
        className="absolute inset-0"
        style={{
          borderRadius: "inherit",
          isolation: "isolate",
          overflow: "hidden",
          WebkitMaskImage: "-webkit-radial-gradient(white, white)",
          maskImage: "radial-gradient(white, white)",
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="absolute inset-0 w-full h-full"
          style={{ filter: "blur(2px)", transform: "scale(1.08)", isolation: "isolate" }}
        >
          <Liquid isHovered={isHovered} colors={colors} baseId={uid} />
        </div>
      </motion.div>

      {/* content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
