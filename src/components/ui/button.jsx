import * as React from "react";
import { motion } from "framer-motion";

/**
 * ╔═══════════════════════════════════════════════════════╗
 * ║  Curebird Unified Button System                       ║
 * ║  3 Variants — Global Design System Locked             ║
 * ╠═══════════════════════════════════════════════════════╣
 * ║  primary   → Amber/gold glass + shimmer (major CTAs) ║
 * ║  secondary → Dark glass + subtle border (standard)   ║
 * ║  danger    → Rose glass + destructive (irreversible) ║
 * ╚═══════════════════════════════════════════════════════╝
 *
 * Usage:
 *   import { Button } from '@/components/ui/button'
 *
 *   <Button variant="primary" size="lg">Add Record</Button>
 *   <Button variant="secondary">View Details</Button>
 *   <Button variant="danger" size="sm">Delete</Button>
 */

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

// ─── SIZE PRESETS ───────────────────────────────────────
const SIZE_CLASSES = {
  sm:      "px-4 py-2 text-xs gap-1.5 rounded-xl",
  default: "px-6 py-3 text-sm gap-2 rounded-2xl",
  lg:      "px-8 py-4 text-base gap-2.5 rounded-2xl",
  full:    "px-8 py-4 text-base gap-2.5 rounded-2xl w-full",
  icon:    "p-2.5 rounded-xl aspect-square",
};

// ─── VARIANT STYLES ────────────────────────────────────
const VARIANT_STYLES = {
  primary: {
    base: [
      "bg-gradient-to-br from-amber-500/15 to-[#0a0a0a]/75",
      "border border-amber-500/25",
      "text-amber-400",
      "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_6px_-1px_rgba(0,0,0,0.2)]",
    ].join(" "),
    hover: [
      "hover:from-amber-500/25 hover:to-[#141414]/80",
      "hover:border-amber-500/50",
      "hover:text-amber-200",
      "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_25px_-5px_rgba(0,0,0,0.4),0_0_20px_-5px_rgba(251,191,36,0.25)]",
    ].join(" "),
    active: "active:scale-[0.97] active:from-amber-500/10 active:to-[#0a0a0a]/85",
    shimmerColor: "rgba(251, 191, 36, 0.2)",
    glowColor: "rgba(251, 191, 36, 0.35)",
  },
  secondary: {
    base: [
      "bg-gradient-to-br from-slate-400/5 to-[#0a0a0a]/75",
      "border border-white/10",
      "text-slate-300",
      "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_4px_6px_-1px_rgba(0,0,0,0.15)]",
    ].join(" "),
    hover: [
      "hover:from-slate-400/10 hover:to-[#141414]/80",
      "hover:border-white/20",
      "hover:text-white",
      "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_25px_-5px_rgba(0,0,0,0.3),0_0_15px_-5px_rgba(255,255,255,0.08)]",
    ].join(" "),
    active: "active:scale-[0.97] active:from-slate-400/3 active:to-[#0a0a0a]/85",
    shimmerColor: "rgba(255, 255, 255, 0.15)",
    glowColor: "rgba(156, 163, 175, 0.15)",
  },
  danger: {
    base: [
      "bg-gradient-to-br from-rose-500/10 to-[#0a0a0a]/75",
      "border border-rose-500/20",
      "text-rose-400",
      "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_4px_6px_-1px_rgba(0,0,0,0.2)]",
    ].join(" "),
    hover: [
      "hover:from-rose-500/90 hover:to-rose-600/90",
      "hover:border-rose-400",
      "hover:text-white",
      "hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.4),0_0_20px_-5px_rgba(225,29,72,0.3)]",
    ].join(" "),
    active: "active:scale-[0.97] active:from-rose-500/80 active:to-rose-700/80",
    shimmerColor: "rgba(239, 68, 68, 0.15)",
    glowColor: "rgba(225, 29, 72, 0.25)",
  },
};

const Button = React.forwardRef(
  (
    {
      className,
      children,
      variant = "primary",
      size = "default",
      icon: Icon,
      iconPosition = "left",
      disabled = false,
      loading = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const v = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.default;

    return (
      <motion.button
        ref={ref}
        onClick={disabled || loading ? undefined : onClick}
        whileHover={disabled ? {} : { translateY: -1 }}
        whileTap={disabled ? {} : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        disabled={disabled || loading}
        className={cn(
          // Base layout
          "relative inline-flex items-center justify-center font-bold",
          "backdrop-blur-xl overflow-hidden",
          "transition-all duration-300 ease-out",
          "cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]",
          // Size
          sizeClass,
          // Variant
          v.base,
          v.hover,
          v.active,
          // Disabled
          disabled && "opacity-40 cursor-not-allowed pointer-events-none",
          loading && "cursor-wait",
          className
        )}
        {...props}
      >
        {/* Shimmer sweep on hover */}
        <span
          className="absolute inset-0 -translate-x-full hover-shimmer pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${v.shimmerColor} 20%, rgba(255,255,255,0.25) 50%, ${v.shimmerColor} 80%, transparent)`,
          }}
          aria-hidden="true"
        />

        {/* Ambient glow */}
        <span
          className="absolute inset-0 rounded-[inherit] opacity-40 -z-10 pointer-events-none blur-lg transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle, ${v.glowColor} 0%, transparent 70%)`,
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-inherit">
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <>
              {Icon && iconPosition === "left" && <Icon size={size === "sm" ? 14 : 16} />}
              {children}
              {Icon && iconPosition === "right" && <Icon size={size === "sm" ? 14 : 16} />}
            </>
          )}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button, VARIANT_STYLES, SIZE_CLASSES };
