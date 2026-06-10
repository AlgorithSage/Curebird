import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import createGlobe from 'cobe';
import {
  TrendingUp, ShieldCheck, Clock,
  ChevronRight, ChevronLeft, Calendar, Siren,
  Globe, Zap, X, ExternalLink, AlertTriangle,
} from './Icons';
import { API_BASE_URL } from '../config';

// ─── Category config ──────────────────────────────────────────────────────────
const CAT = {
  ALERT:    { color: 'text-red-400',     bg: 'bg-red-500/[0.10]',     border: 'border-red-500/25',     dot: 'bg-red-400',     icon: Siren      },
  POLICY:   { color: 'text-sky-400',     bg: 'bg-sky-500/[0.10]',     border: 'border-sky-500/25',     dot: 'bg-sky-400',     icon: Globe      },
  RESEARCH: { color: 'text-emerald-400', bg: 'bg-emerald-500/[0.10]', border: 'border-emerald-500/25', dot: 'bg-emerald-400', icon: Zap        },
  UPDATE:   { color: 'text-violet-400',  bg: 'bg-violet-500/[0.10]',  border: 'border-violet-500/25',  dot: 'bg-violet-400',  icon: TrendingUp },
};

const FILTERS = ['All', 'Alert', 'Policy', 'Research', 'Update'];

const CategoryBadge = ({ cat }) => {
  const cfg = CAT[cat] || CAT.UPDATE;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-[0.14em] ${cfg.color} ${cfg.bg} ${cfg.border} backdrop-blur-sm shadow-[0_1px_4px_rgba(0,0,0,0.15)]`}>
      <Icon size={10} className="shrink-0" />
      {cat}
    </span>
  );
};

const TagPill = ({ label }) => (
  <span className="px-2 py-0.5 rounded-md bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-500/70 font-semibold tracking-wide">
    {label}
  </span>
);

// ─── Globe (cobe) — ported from cobe-globe-live reference ────────────────────
// Key fix: dark:0 (light mode) is required for land-mass rendering.
// dark:1 kills surface lighting and produces a black sphere regardless of mapBrightness.
function SpinningGlobe({ markers = [] }) {
  const canvasRef         = useRef(null);
  const pointerInteracting = useRef(null);
  const dragOffset        = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef      = useRef(1.4);  // start facing India
  const thetaOffsetRef    = useRef(0);
  const isPausedRef       = useRef(false);

  const handlePointerDown = useCallback((e) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current   += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    isPausedRef.current = false;
  }, []);

  // Global pointer-move + pointer-up (matches reference pattern)
  useEffect(() => {
    const onMove = (e) => {
      if (pointerInteracting.current === null) return;
      dragOffset.current = {
        phi:   (e.clientX - pointerInteracting.current.x) / 300,
        theta: (e.clientY - pointerInteracting.current.y) / 1000,
      };
    };
    window.addEventListener('pointermove', onMove,        { passive: true });
    window.addEventListener('pointerup',   handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   handlePointerUp);
    };
  }, [handlePointerUp]);

  // Globe init — uses ResizeObserver (from reference) so it works even when
  // canvas has 0 width at mount time (e.g. inside a flex container)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let globe = null;
    let animId;
    let phi = phiOffsetRef.current;
    let ro;

    const cobeMarkers = markers.map(m => ({
      location: m.location,
      size: m.urgent ? 0.07 : 0.045,
    }));

    function init() {
      const w = canvas.offsetWidth;
      if (w === 0 || globe) return;

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width:  w,
        height: w,
        phi,
        theta: 0.28,
        // dark: 0 = light-mode surface — the only value that makes
        // land masses visible. dark: 1 disables surface diffuse lighting.
        dark: 0,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 10,
        // Warm sand/amber base — matches project amber theme while keeping
        // land-mass contrast on the lit globe surface.
        baseColor:   [0.88, 0.78, 0.48],
        markerColor: [0.85, 0.20, 0.05],
        glowColor:   [0.82, 0.64, 0.22],
        opacity: 0.85,
        markers: cobeMarkers,
      });

      function animate() {
        if (!isPausedRef.current) phi += 0.004;
        globe.update({
          phi:   phi + dragOffset.current.phi,
          theta: 0.28 + thetaOffsetRef.current + dragOffset.current.theta,
        });
        animId = requestAnimationFrame(animate);
      }
      animate();
      setTimeout(() => { if (canvas) canvas.style.opacity = '1'; });
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      if (ro) ro.disconnect();
      if (animId) cancelAnimationFrame(animId);
      if (globe) globe.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers.length]);

  return (
    <div className="relative w-full aspect-square select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: '100%', height: '100%',
          cursor: 'grab',
          opacity: 0,
          transition: 'opacity 1.2s ease',
          borderRadius: '50%',
          touchAction: 'none',
        }}
      />
    </div>
  );
}

// ─── Globe section: globe left + article feed right ──────────────────────────
function GlobeSection({ articles, onSelect }) {
  return (
    <div className="glass-card !p-0 overflow-hidden mb-2">
      <div className="flex flex-col lg:flex-row">

        {/* Globe side — fixed 380px square so ResizeObserver resolves a real width */}
        <div className="relative flex items-center justify-center p-6 shrink-0 w-full lg:w-[380px] lg:h-[380px] aspect-square lg:aspect-auto">
          {/* Ambient glow */}
          <div className="absolute inset-0 rounded-[2rem] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(210,155,30,0.10) 0%, transparent 65%)' }} />

          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full"
          >
            <SpinningGlobe markers={articles} />

            {/* Incident count badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/50 border border-amber-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.25)] pointer-events-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
              </span>
              <span className="text-[9.5px] font-black text-amber-200/90 uppercase tracking-[0.15em]">Live News Feed</span>
            </div>
          </motion.div>
        </div>

        {/* Vertical divider */}
        <div className="hidden lg:block w-px shrink-0 self-stretch"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(251,191,36,0.15) 20%, rgba(14,165,233,0.12) 80%, transparent)' }} />
        <div className="lg:hidden h-px mx-6"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)' }} />

        {/* Article feed panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, rgba(251,191,36,0.025) 0%, rgba(14,165,233,0.025) 100%)' }}>

          {/* Panel header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <span className="absolute -inset-1 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                <span className="relative w-2 h-2 rounded-full bg-red-500 block"
                  style={{ boxShadow: '0 0 6px rgba(239,68,68,0.7)' }} />
              </div>
              <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-[0.14em]">
                Live Health Incidents — India
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 tabular-nums">
              {articles.length} reports
            </span>
          </div>

          {/* Article list */}
          <div className="flex-1 overflow-y-auto no-scrollbar" style={{ maxHeight: 308 }}>
            {articles.map((n, i) => {
              const cfg = CAT[n.category] || CAT.UPDATE;
              const isAmber = n.category === 'ALERT' || n.category === 'UPDATE';
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 300, damping: 26 }}
                  onClick={() => onSelect(n)}
                  className={`group relative flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-all border-b last:border-b-0 ${
                    isAmber ? 'hover:bg-amber-500/[0.05]' : 'hover:bg-sky-500/[0.05]'
                  }`}
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  {/* Left category accent bar */}
                  <div
                    className={`absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full transition-opacity opacity-40 group-hover:opacity-90 ${cfg.dot}`}
                  />

                  {/* Index indicator */}
                  <div className="flex items-center gap-2 shrink-0 select-none pt-0.5" style={{ minWidth: 32 }}>
                    <span className="text-[11px] font-black text-slate-400/80 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="w-[1px] h-3.5 bg-white/10" />
                    <span className="relative flex h-1.5 w-1.5">
                      {n.urgent && (
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75`}></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cfg.dot}`}
                        style={{ boxShadow: `0 0 8px ${cfg.color.includes('red') ? '#f87171' : cfg.color.includes('sky') ? '#38bdf8' : cfg.color.includes('emerald') ? '#34d399' : '#a78bfa'}` }}
                      />
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <CategoryBadge cat={n.category} />
                      {n.urgent && (
                        <span className="text-[8px] font-black text-red-400 uppercase tracking-[0.16em] animate-pulse">● Urgent</span>
                      )}
                    </div>

                    <p className={`text-[12.5px] font-semibold leading-snug line-clamp-2 transition-colors ${
                      isAmber
                        ? 'text-white/90 group-hover:text-amber-300'
                        : 'text-white/90 group-hover:text-sky-300'
                    }`}>
                      {n.headline}
                    </p>

                    {/* Meta — visibly styled */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-400">
                        <ShieldCheck size={9} className="text-emerald-400 shrink-0" />
                        {n.source}
                      </span>
                      <span className="text-slate-600 text-[9px] font-bold">·</span>
                      <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-400">
                        <Calendar size={9} className="text-sky-400/80 shrink-0" />
                        {n.date}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={12}
                    className={`shrink-0 mt-1.5 transition-all ${
                      isAmber
                        ? 'text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5'
                        : 'text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5'
                    }`} />
                </motion.div>
              );
            })}
          </div>

          {/* Legend footer */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 shrink-0 border-t"
            style={{
              borderColor: 'rgba(255,255,255,0.06)',
              background: 'linear-gradient(135deg, rgba(251,191,36,0.02) 0%, rgba(14,165,233,0.02) 100%)',
            }}>
            {Object.entries(CAT).map(([key, cfg]) => {
              const glowColor = cfg.color.includes('red') ? '#f87171' : cfg.color.includes('sky') ? '#38bdf8' : cfg.color.includes('emerald') ? '#34d399' : '#a78bfa';
              return (
                <span key={key} className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-wider ${cfg.color} ${cfg.bg} ${cfg.border} backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-105`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} 
                    style={{ boxShadow: `0 0 6px ${glowColor}` }}
                  />
                  {key}
                </span>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Horizontal news carousel (Framer Carousel style) ─────────────────────────
function NewsCarousel({ articles, onSelect }) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const prevIndexRef = useRef(0);

  // Monitor screen width for mobile sizing offsets
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track previous index to detect wrap-around jumps
  useEffect(() => {
    prevIndexRef.current = index;
  }, [index]);

  // Autoplay: auto-advance every 3 seconds, reset timer on hover or index change
  useEffect(() => {
    if (articles.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setIndex((i) => (i === articles.length - 1 ? 0 : i + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [articles.length, isHovered, index]);

  const getCardStyles = (diff, isMobile) => {
    if (diff === 0) {
      return {
        x: '0%',
        scale: 1,
        opacity: 1,
        zIndex: 10,
        pointerEvents: 'auto',
      };
    }
    if (diff === -1) {
      return {
        x: isMobile ? '-22%' : '-38%',
        scale: 0.82,
        opacity: 0.45,
        zIndex: 5,
        pointerEvents: 'auto',
      };
    }
    if (diff === 1) {
      return {
        x: isMobile ? '22%' : '38%',
        scale: 0.82,
        opacity: 0.45,
        zIndex: 5,
        pointerEvents: 'auto',
      };
    }
    // Hidden cards
    return {
      x: diff < 0 ? '-60%' : '60%',
      scale: 0.7,
      opacity: 0,
      zIndex: 0,
      pointerEvents: 'none',
    };
  };

  return (
    <div 
      className="relative mt-8 max-w-7xl mx-auto px-4 md:px-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cards Wrapper (Seamless stacked carousel design) */}
      <div 
        ref={containerRef}
        className="relative h-[560px] md:h-[520px] w-full overflow-hidden flex items-center justify-center select-none"
      >
        {articles.map((n, i) => {
          const len = articles.length;
          
          // Current diff
          let diff = i - index;
          if (diff < -len / 2) diff += len;
          if (diff > len / 2) diff -= len;

          // Previous diff
          let prevDiff = i - prevIndexRef.current;
          if (prevDiff < -len / 2) prevDiff += len;
          if (prevDiff > len / 2) prevDiff -= len;

          // If a card jumps more than 1 slot (i.e. wrapping around from left to right or vice versa),
          // snap its position instantly to avoid sliding across the center.
          const isJumping = Math.abs(diff - prevDiff) > 1;

          const styles = getCardStyles(diff, isMobile);

          return (
            <motion.div
              key={n.id}
              onClick={(e) => {
                if (diff === 0) {
                  onSelect(n);
                } else {
                  e.stopPropagation();
                  setIndex(i);
                }
              }}
              style={{
                position: 'absolute',
                width: '90%',
                maxWidth: '640px',
                zIndex: styles.zIndex,
                pointerEvents: styles.pointerEvents,
              }}
              animate={{
                x: styles.x,
                scale: styles.scale,
                opacity: styles.opacity,
              }}
              transition={isJumping ? {
                opacity: { duration: 0.25 },
                x: { duration: 0 },
                scale: { duration: 0 }
              } : {
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              className="shrink-0 h-[540px] md:h-[500px]"
            >
              <div className="glass-card-amber opaque-carousel-card w-full h-full !p-0 overflow-hidden flex flex-col md:flex-row cursor-pointer group hover:scale-[1.005] transition-all duration-300 relative shadow-2xl">
                {/* Image panel (45% width on desktop) */}
                <div className="relative w-full md:w-[45%] h-[200px] md:h-full shrink-0 overflow-hidden bg-black/40 border-b md:border-b-0 md:border-r border-white/5">
                  {n.imageUrl ? (
                    <img
                      src={n.imageUrl}
                      alt={n.headline || 'Health news article'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
                      draggable={false}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/5 to-amber-500/10">
                      <Globe size={48} className="text-amber-500/20 animate-pulse" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
                  
                  {/* Category badge & urgent overlay on image */}
                  <div className="absolute top-4 left-4 z-10">
                    <CategoryBadge cat={n.category} />
                  </div>
                  {n.urgent && (
                    <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-red-500/90 text-white text-[9px] font-black tracking-wider uppercase animate-pulse">
                      Urgent
                    </span>
                  )}
                </div>

                {/* Content panel (55% width on desktop) */}
                <div className="flex-1 flex flex-col p-6 md:p-8 justify-between min-w-0 relative">
                  {/* Inner glow */}
                  <div className="absolute inset-x-0 top-0 h-24 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.04) 0%, transparent 70%)' }} />

                  <div className="space-y-4">
                    {/* Date & Source Row */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={11} className="text-emerald-400" />
                        {n.source}
                      </span>
                      <span className="text-slate-600 font-bold">·</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-sky-400/80" />
                        {n.date}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2 md:line-clamp-3">
                      {n.headline}
                    </h3>

                    {/* Excerpt / Summary */}
                    {n.excerpt && (
                      <p className="text-[12.5px] md:text-[13.5px] text-slate-300 leading-relaxed font-normal line-clamp-3 md:line-clamp-5">
                        {n.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Bottom row: Tags and CTA */}
                  <div className="space-y-4 pt-4 border-t border-white/[0.06] mt-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {n.tags && n.tags.slice(0, 3).map(t => (
                          <span key={t} className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400/80 uppercase tracking-wider">
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* CTA Link */}
                      <span className="inline-flex items-center gap-2 text-[12px] font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                        Read Report
                        <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          );
        })}

      </div>

      {/* Navigation Buttons */}
      <button
        disabled={index === 0}
        onClick={(e) => { e.stopPropagation(); setIndex((i) => Math.max(0, i - 1)); }}
        className={`absolute -left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-black/60 border border-white/10 text-slate-400 transition-all shadow-lg
          ${index === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-black/85 hover:border-amber-500/30 hover:text-amber-400 hover:scale-105'}`}
      >
        <ChevronLeft size={isMobile ? 16 : 20} />
      </button>
      <button
        disabled={index === articles.length - 1}
        onClick={(e) => { e.stopPropagation(); setIndex((i) => Math.min(articles.length - 1, i + 1)); }}
        className={`absolute -right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-black/60 border border-white/10 text-slate-400 transition-all shadow-lg
          ${index === articles.length - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-black/85 hover:border-amber-500/30 hover:text-amber-400 hover:scale-105'}`}
      >
        <ChevronRight size={isMobile ? 16 : 20} />
      </button>

      {/* Progress Indicator (Moved outside the card container, positioned cleanly below) */}
      <div className="flex justify-center mt-4">
        <div className="flex gap-2 p-1.5 bg-black/40 rounded-full border border-white/10 backdrop-blur-sm z-20">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Article detail modal ─────────────────────────────────────────────────────
// Portalled to document.body so it escapes all parent overflow/transform contexts
function NewsModal({ news, onClose }) {
  const cfg = CAT[news.category] || CAT.UPDATE;

  // Close on Escape key + lock body scroll
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <>
      {/* Backdrop — completely transparent clickable overlay, allowing modal to sit nakedly on background.js */}
      <motion.div
        className="fixed inset-0 z-[9998] bg-transparent"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />

      {/* Centering wrapper — flexbox centers the card perfectly */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
      >
        {/* Modal card — styled using standard glass-card-amber theme from index.css */}
        <motion.div
          className="glass-card-amber !p-0 overflow-hidden flex flex-col pointer-events-auto relative shadow-2xl"
          style={{
            width: '90vw',
            maxWidth: 680,
            maxHeight: '80vh',
          }}
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        >
          {/* Subtle inner amber glow at top */}
          <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)" }} />

          {/* Hero image */}
          {news.imageUrl && (
            <div className="relative h-48 shrink-0 overflow-hidden">
              <img src={news.imageUrl} alt={news.headline || 'Health news article'}
                className="w-full h-full object-cover"
                onError={e => { e.target.parentElement.style.display = 'none'; }} />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.3) 100%)',
              }} />
              <div className="absolute bottom-4 left-6">
                <CategoryBadge cat={news.category} />
              </div>
            </div>
          )}

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 p-6 relative" style={{ overscrollBehavior: 'contain' }}>
            {/* Close button — standard theme styled */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
            >
              <X size={14} />
            </button>

            {!news.imageUrl && (
              <div className="flex items-center gap-2 mb-4">
                <CategoryBadge cat={news.category} />
                {news.urgent && (
                  <span className="text-[9px] font-black text-red-400 animate-pulse">● URGENT</span>
                )}
              </div>
            )}

            <h2 className="text-xl font-bold leading-snug mb-4 pr-10 text-white">
              {news.headline}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-[11px] mb-5 pb-5 border-b border-amber-500/10 text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={11} className="text-amber-400" />
                {news.source}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={11} className="text-amber-500/80" />
                {news.date}
              </span>
            </div>

            {news.excerpt ? (
              <p className="leading-relaxed text-sm mb-5 text-slate-300">
                {news.excerpt}
              </p>
            ) : (
              <p className="leading-relaxed text-sm mb-5 italic text-slate-500">
                Full article content available at the source. Click the link below to read the complete report.
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-6">
              {news.tags.map(t => (
                <span key={t} className="px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400/80">
                  {t}
                </span>
              ))}
            </div>

            {news.url && (
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[12px] font-bold transition-all duration-200 hover:scale-[1.02] bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 transition-all"
              >
                <ExternalLink size={12} />
                Read full article on {news.source}
              </a>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 flex items-center justify-between shrink-0 border-t border-amber-500/10 bg-black/20">
            <span className="text-[10px] text-slate-500">{news.source} · {news.date}</span>
            <span className="text-[10px] italic text-slate-500">Always verify with a licensed physician.</span>
          </div>
        </motion.div>
      </div>
    </>,
    document.body
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function NewsSkeleton() {
  return (
    <div className="mb-12 animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
          <div className="space-y-2">
            <div className="w-48 h-5 rounded-lg bg-white/[0.06]" />
            <div className="w-64 h-3 rounded-lg bg-white/[0.04]" />
          </div>
        </div>
        <div className="flex gap-1.5">
          {[...Array(5)].map((_, i) => <div key={i} className="w-14 h-7 rounded-lg bg-white/[0.06]" />)}
        </div>
      </div>
      <div className="h-9 rounded-xl bg-white/[0.06] mb-5" />
      <div className="glass-card !p-0 overflow-hidden">
        <div className="flex">
          <div className="w-[420px] shrink-0 flex items-center justify-center p-8">
            <div className="w-[340px] h-[340px] rounded-full bg-white/[0.05]" />
          </div>
          <div className="flex-1 p-6 flex flex-col gap-3 justify-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded bg-white/[0.05] shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 rounded bg-white/[0.06] w-24" />
                  <div className="h-4 rounded bg-white/[0.05]" />
                  <div className="h-3 rounded bg-white/[0.04] w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-5 overflow-hidden px-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="shrink-0 w-72 h-56 rounded-2xl bg-white/[0.06]" />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NationalHealthNews() {
  const [articles,     setArticles] = useState([]);
  const [ticker,       setTicker]   = useState([]);
  const [loading,      setLoading]  = useState(true);
  const [error,        setError]    = useState(null);
  const [activeFilter, setFilter]   = useState('All');
  const [selected,     setSelected] = useState(null);
  const [retryCount,   setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/health-news`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        if (cancelled) return;
        setArticles(data.articles || []);
        setTicker(data.ticker   || []);
        setError(null);
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [retryCount]);

  const filtered = activeFilter === 'All'
    ? articles
    : articles.filter(a => a.category === activeFilter.toUpperCase());

  if (loading) return <NewsSkeleton />;

  if (error) return (
    <div className="mb-10 glass-card !p-8 flex flex-col items-center justify-center text-center gap-4">
      <AlertTriangle size={28} className="text-amber-400" />
      <p className="text-white font-bold">Could not load health news</p>
      <p className="text-slate-400 text-sm">{error}</p>
      <button
        onClick={() => setRetryCount(c => c + 1)}
        className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-bold hover:bg-amber-500/25 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes nh-ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .nh-ticker-track { display:flex; width:max-content; animation:nh-ticker ${Math.max(30, ticker.length * 8)}s linear infinite; }
        .nh-ticker-track:hover { animation-play-state:paused; }
        .opaque-carousel-card {
          background: linear-gradient(135deg, rgb(46, 37, 14) 0%, rgb(10, 10, 10) 100%) !important;
        }
        .opaque-carousel-card:hover {
          background: linear-gradient(135deg, rgb(56, 45, 16) 0%, rgb(15, 15, 15) 100%) !important;
        }
      `}</style>

      <motion.section
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12"
      >
        {/* ── Section header ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="relative glass-button-wrap">
              <div className="glass-button !w-10 !h-10 !rounded-xl !p-0">
                <Globe size={17} className="text-sky-400" />
              </div>
              <div className="glass-button-shadow" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-black animate-pulse z-20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  National Health News
                </h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-[9px] font-black text-red-400 uppercase tracking-widest">
                  <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse inline-block" />LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time health bulletins · Powered by News API
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0 no-scrollbar">
            {FILTERS.map(f => {
              const isActive = activeFilter === f;
              return (
                <div key={f} className={`glass-button-wrap ${isActive ? '' : 'glass-button-gray'}`}>
                  <button
                    onClick={() => setFilter(f)}
                    className={`glass-button !rounded-lg !px-3 !py-1.5 whitespace-nowrap ${
                      isActive ? '!bg-amber-500/20 !border-amber-500/40' : ''
                    }`}
                  >
                    <span className={`glass-button-text !text-[11px] ${isActive ? '!text-amber-400' : ''}`}>
                      {f}
                    </span>
                  </button>
                  <div className="glass-button-shadow" />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Breaking news ticker ─────────────────────────────────── */}
        {ticker.length > 0 && (
          <div className="relative overflow-hidden mb-5 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(22,6,6,0.97) 0%, rgba(12,4,4,0.94) 100%)',
              border: '1px solid rgba(220,38,38,0.22)',
              boxShadow: '0 0 40px rgba(220,38,38,0.07), inset 0 0 24px rgba(220,38,38,0.04)',
            }}>
            {/* Thin accent top line */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(to right, transparent, rgba(220,38,38,0.55) 30%, rgba(220,38,38,0.55) 70%, transparent)' }} />

            <div className="flex items-stretch" style={{ height: 56 }}>
              {/* BREAKING label */}
              <div className="shrink-0 flex items-center gap-3 px-5"
                style={{
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.22) 0%, rgba(220,38,38,0.06) 100%)',
                  borderRight: '1px solid rgba(220,38,38,0.18)',
                  minWidth: 140,
                }}>
                {/* Ping dot */}
                <div className="relative shrink-0">
                  <span className="absolute -inset-1.5 rounded-full bg-red-500/25 animate-ping" style={{ animationDuration: '1.8s' }} />
                  <span className="relative w-2.5 h-2.5 rounded-full bg-red-500 block" style={{ boxShadow: '0 0 8px rgba(239,68,68,0.7)' }} />
                </div>
                <div className="flex flex-col leading-none gap-0.5">
                  <span className="text-[8px] font-semibold text-red-400/60 uppercase tracking-[0.22em]">live feed</span>
                  <span className="text-[12px] font-black text-red-400 uppercase tracking-[0.12em]">Breaking</span>
                </div>
                <Siren size={15} className="text-red-500/50 shrink-0" />
              </div>

              {/* Gradient fade mask on scroll edges */}
              <div className="relative overflow-hidden flex-1 flex items-center min-w-0">
                <div className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to right, rgba(22,6,6,0.95), transparent)' }} />
                <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to left, rgba(22,6,6,0.95), transparent)' }} />

                <div className="nh-ticker-track pl-4">
                  {[...ticker, ...ticker].map((item, i) => (
                    <span key={i}
                      className="inline-flex items-center gap-3 pr-14 whitespace-nowrap text-[12.5px] font-semibold text-slate-200 tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50 shrink-0" />
                      {item}
                      <span className="text-slate-600/70 text-[10px] pl-2">◆</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Globe + Article feed ────────────────────────────────── */}
        {articles.length >= 1 && (
          <GlobeSection articles={articles} onSelect={setSelected} />
        )}

        {/* ── Carousel ────────────────────────────────────────────── */}
        {filtered.length > 0
          ? <NewsCarousel articles={filtered} onSelect={setSelected} />
          : (
            <p className="text-center py-8 text-slate-500 text-sm">
              No {activeFilter} articles available right now.
            </p>
          )
        }

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={10} />
            Powered by News API · {articles.length} articles
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={10} />
            Cached 30 min
          </span>
        </div>
      </motion.section>

      {/* Modal — outside section so it can escape overflow contexts */}
      <AnimatePresence>
        {selected && <NewsModal news={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}
