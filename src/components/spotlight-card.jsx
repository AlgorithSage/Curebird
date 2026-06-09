import React, { useEffect, useRef } from 'react';

const glowColorMap = {
  blue: { base: 210, spread: 50 },
  purple: { base: 270, spread: 50 },
  green: { base: 120, spread: 50 },
  red: { base: 0, spread: 50 },
  orange: { base: 28, spread: 24 },
  amber: { base: 45, spread: 15 }
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

let listenerRefCount = 0;
const activeCards = new Set();
const syncPointer = (e) => {
  const { clientX: x, clientY: y } = e;
  const xp = (x / window.innerWidth).toFixed(2);
  const yp = (y / window.innerHeight).toFixed(2);
  const xStr = x.toFixed(2);
  const yStr = y.toFixed(2);

  activeCards.forEach((card) => {
    card.style.setProperty('--x', xStr);
    card.style.setProperty('--xp', xp);
    card.style.setProperty('--y', yStr);
    card.style.setProperty('--yp', yp);
  });
};

const GlowCard = ({
  children,
  className = '',
  glowColor = 'amber',
  size = 'md',
  width,
  height,
  customSize = false
}) => {
  const cardRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const cardEl = cardRef.current;
    if (cardEl) {
      activeCards.add(cardEl);
    }
    if (listenerRefCount === 0) {
      document.addEventListener('pointermove', syncPointer);
    }
    listenerRefCount++;

    return () => {
      if (cardEl) {
        activeCards.delete(cardEl);
      }
      listenerRefCount--;
      if (listenerRefCount === 0) {
        document.removeEventListener('pointermove', syncPointer);
      }
    };
  }, []);

  const { base, spread } = glowColorMap[glowColor] || glowColorMap.amber;

  // Determine sizing
  const getSizeClasses = () => {
    if (customSize) {
      return ''; // Let className or inline styles handle sizing
    }
    return sizeMap[size];
  };

  const getInlineStyles = () => {
    const baseStyles = {
      '--base': base,
      '--spread': spread,
      '--radius': '14',
      '--border': '3',
      '--backdrop': 'hsl(0 0% 60% / 0.18)',
      '--backup-border': 'var(--backdrop)',
      '--size': '200',
      '--outer': '1',
      '--border-size': 'calc(var(--border, 2) * 1px)',
      '--spotlight-size': 'calc(var(--size, 150) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      '--bg-spot-opacity': '0',
      '--border-spot-opacity': '0',
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 38) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.22)), transparent
      ),
      radial-gradient(ellipse 80% 60% at 5% 40%, rgba(249, 115, 22, 0.45), transparent 67%),
      radial-gradient(ellipse 70% 60% at 45% 45%, rgba(245, 158, 11, 0.48), transparent 67%),
      radial-gradient(ellipse 62% 52% at 83% 76%, rgba(249, 115, 22, 0.52), transparent 63%),
      radial-gradient(ellipse 60% 48% at 75% 20%, rgba(245, 158, 11, 0.45), transparent 66%),
      linear-gradient(135deg, #3a1c07 0%, #4c300a 100%)`,
      backgroundColor: '#3a1c07',
      backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
      backgroundPosition: '50% 50%',
      backgroundAttachment: 'fixed',
      border: 'var(--border-size) solid var(--backup-border)',
      position: "relative",
      touchAction: "none",
    };

    // Add width and height if provided
    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return baseStyles;
  };

  const beforeAfterStyles = `
    [data-glow]:hover {
      --bg-spot-opacity: 0.22;
      --border-spot-opacity: 1;
    }

    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-attachment: fixed;
      background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
      opacity: var(--border-spot-opacity, 0);
      transition: opacity 0.15s ease;
    }
    
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 38) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / 1), transparent 100%
      );
      filter: brightness(2);
    }
    
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(0 100% 100% / var(--border-light-opacity, 1)), transparent 100%
      );
    }
    
    [data-glow] [data-glow] {
      position: absolute;
      inset: 0;
      will-change: filter;
      opacity: var(--outer, 1);
      border-radius: calc(var(--radius) * 1px);
      border-width: calc(var(--border-size) * 20);
      filter: blur(calc(var(--border-size) * 10));
      background: none;
      pointer-events: none;
      border: none;
    }
    
    [data-glow] > [data-glow]::before {
      inset: -10px;
      border-width: 10px;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        style={getInlineStyles()}
        className={`
          ${getSizeClasses()}
          ${!customSize ? 'aspect-[3/4] grid grid-rows-[1fr_auto] p-4 gap-4' : ''}
          rounded-2xl 
          relative 
          shadow-[0_1rem_2rem_-1rem_black] 
          backdrop-blur-[5px]
          ${className}
        `}>
        <div ref={innerRef} data-glow></div>
        {children}
      </div>
    </>
  );
};

export { GlowCard }