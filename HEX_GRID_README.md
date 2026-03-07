# Interactive Canvas Hexagon Grid
## "Cursor Proximity Trail"

This document explains how to implement the Interactive Hexagon Canvas Particle Grid (or "Mouse Proximity Trail") into any React project. This creates a screen-spanning canvas of hexagons that react and glow when the user's cursor moves near them.

This guide extracts the core logic to give you a clean, abstracted, and ready-to-use component that you can drop loosely into your web layout.

---

### Step 1: Create the Reusable Component
First, create a new file in your project (e.g., `components/InteractiveHexGrid.jsx` or `.tsx`). Copy and paste the following code. 

```javascript
import React, { useState, useEffect, useRef } from 'react';

/**
 * InteractiveHexGrid Component
 * Creates a screen-spanning canvas of hexagons that react and glow
 * when the user's cursor moves near them.
 * 
 * @param {string} baseColor - The default color of the grid (rgba format recommended)
 * @param {string} glowColor - The highlighted color when the cursor is near
 * @param {number} interactionRadius - How close the cursor needs to be to trigger the glow (px)
 */
const InteractiveHexGrid = ({ 
    baseColor = 'rgba(255, 255, 255, 0.05)', 
    glowColor = 'rgba(16, 185, 129, 1)', // Default: Emerald Green Glow
    interactionRadius = 130 
}) => {
    // 1. Reference the canvas DOM element directly
    const canvasRef = useRef(null);
    
    // 2. Track screen dimensions to ensure the canvas always fits
    const [dimensions, setDimensions] = useState({ 
        width: window.innerWidth, 
        height: window.innerHeight 
    });

    // Handle Window Resizing
    useEffect(() => {
        const updateSize = () => setDimensions({ 
            width: window.innerWidth, 
            height: window.innerHeight 
        });
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // 3. The Core Render Engine
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Configuration for the Hexagons
        const hexSize = 35; // Size of each individual hexagon
        const hexWidth = Math.sqrt(3) * hexSize; // Mathematical width of a flat-topped hex
        const hexHeight = 2 * hexSize;           // Mathematical height

        // We calculate how many hexagons we need based on the screen size.
        // We multiply by 2.2 to create an "oversized" canvas. This ensures the grid 
        // completely covers the screen even when we rotate it later.
        const baseWidth = dimensions.width * 2.2; 
        const baseHeight = dimensions.height * 2.2;
        
        const cols = Math.ceil(baseWidth / hexWidth) + 20;
        const rows = Math.ceil(baseHeight / (hexHeight * 0.75)) + 20;
        
        // Center the oversized grid over the actual screen dimensions
        const offsetX = (baseWidth - dimensions.width) / 2;
        const offsetY = (baseHeight - dimensions.height) / 2;

        // Initialize the Grid State
        const grid = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Shift odd rows half a step to make them interlock properly
                const xOffset = (r % 2 === 0) ? 0 : hexWidth / 2;
                const x = (c * hexWidth + xOffset) - offsetX;
                const y = (r * (hexHeight * 0.75)) - offsetY;
                
                // baseOpacity: Default visibility
                // intensity: Current "glow" level (0 to 1)
                grid.push({ x, y, intensity: 0, baseOpacity: 0.07 });
            }
        }

        // 4. Mouse Tracking variables
        let mouseX = -1000; 
        let mouseY = -1000;
        
        // We rotate the grid by -30 degrees so the hexagons sit "point-up" 
        // instead of "flat-topped"
        const angleDeg = -30; 
        const angleRad = angleDeg * (Math.PI / 180);
        
        const handleMouseMove = (e) => { 
            mouseX = e.clientX; 
            mouseY = e.clientY; 
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Utility function to draw a single 6-sided polygon on the canvas
        const drawHexagon = (ctx, size) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                // Calculate corner points based on 60-degree increments
                const angle_deg = 60 * i - 30;
                const angle_rad = Math.PI / 180 * angle_deg;
                ctx.lineTo(size * Math.cos(angle_rad), size * Math.sin(angle_rad));
            }
            ctx.closePath();
        };

        // 5. The Render Loop (Runs 60 times a second)
        const render = () => {
            // Clear the previous frame
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);
            
            const cx = dimensions.width / 2; 
            const cy = dimensions.height / 2;
            
            // Adjust mouse coordinates to account for our -30 degree canvas rotation
            const dx = mouseX - cx; 
            const dy = mouseY - cy;
            const invAngle = -angleRad;
            const gridMouseX = dx * Math.cos(invAngle) - dy * Math.sin(invAngle) + cx;
            const gridMouseY = dx * Math.sin(invAngle) + dy * Math.cos(invAngle) + cy;

            // Rotate the entire canvas context
            ctx.save();
            ctx.translate(cx, cy); 
            ctx.rotate(angleRad); 
            ctx.translate(-cx, -cy);

            // Draw every single hexagon
            grid.forEach(cell => {
                // Calculate distance between this hexagon and the mouse
                const dist = Math.hypot(cell.x - gridMouseX, cell.y - gridMouseY);
                
                // Interactivity Logic: Increase intensity if the mouse is near
                if (dist < interactionRadius) { 
                    // Creates a smooth ramp up. The closer the mouse, the higher the intensity
                    cell.intensity = Math.min(cell.intensity + (1 - dist / interactionRadius) * 0.2, 1.0); 
                }
                
                // Decay Logic: Drop the intensity slightly every frame to create a fading "trail"
                cell.intensity *= 0.94;
                
                const totalAlpha = cell.baseOpacity + cell.intensity;
                
                // Optimization: Don't bother drawing invisible lines
                if (totalAlpha < 0.02) return;

                ctx.save(); 
                ctx.translate(cell.x, cell.y);
                drawHexagon(ctx, hexSize - 2);

                // Styling Logic
                if (cell.intensity > 0.05) {
                    // When the tile is glowing, use the highlight styling
                    ctx.strokeStyle = glowColor;
                    ctx.lineWidth = 1.5 + (cell.intensity * 1.5); 
                    ctx.shadowColor = glowColor; 
                    ctx.shadowBlur = cell.intensity * 25; // Glow radius
                } else {
                    // Default quiet state styling
                    ctx.strokeStyle = baseColor;
                    ctx.lineWidth = 1;
                    ctx.shadowBlur = 0;
                }

                ctx.lineCap = 'round'; 
                ctx.lineJoin = 'round'; 
                ctx.stroke(); // Physically paint the line
                ctx.restore(); // Reset context for the next calculation
            });
            ctx.restore(); // Reset global layout context

            // Schedule the next frame
            animationFrameId = requestAnimationFrame(render);
        };

        // Start the engine
        render();

        // Cleanup function (runs when component unmounts)
        return () => { 
            window.removeEventListener('mousemove', handleMouseMove); 
            cancelAnimationFrame(animationFrameId); 
        };
    }, [dimensions, baseColor, glowColor, interactionRadius]);

    // Render a transparent, click-through canvas locked to the background
    return (
        <canvas 
            ref={canvasRef} 
            width={dimensions.width} 
            height={dimensions.height} 
            className="fixed inset-0 pointer-events-none z-[-1]" 
        />
    );
};

export default InteractiveHexGrid;
```

---

### Step 2: How to Apply It to a Layout

To use the canvas background, you simply mount the component at the top-most level of the page/view you want to style. Crucially, the parent container should have `relative` positioning, and the background canvas must not block clicks meant for buttons below it (which is handled by `pointer-events-none`).

Here is an example of applying it to a generic Dashboard view context:

```javascript
import React from 'react';
import InteractiveHexGrid from '../components/InteractiveHexGrid';

const MyDashboard = () => {
    return (
        // 1. The wrapper must be relative and ideally have a dark background
        // because the effect looks best on dark themes.
        <div className="relative min-h-screen bg-slate-900 overflow-hidden">
            
            {/* 2. Drop the component here. 
                You can customize the glow to match your brand. */}
            <InteractiveHexGrid 
                glowColor="rgba(59, 130, 246, 1)" // E.g., a nice Blue glow
                interactionRadius={150} // Make the trail wider
                baseColor="rgba(255, 255, 255, 0.03)" // Make non-active grid very faint
            />
            
            {/* 3. Your actual content goes here. 
                Ensure content is z-10 so it sits ABOVE the canvas. */}
            <div className="relative z-10 p-8 text-white">
                <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
                
                <div className="grid grid-cols-3 gap-6">
                   <div className="bg-slate-800/80 p-6 rounded-xl backdrop-blur-md border border-white/10">
                       <h2>Stat 1</h2>
                   </div>
                   <div className="bg-slate-800/80 p-6 rounded-xl backdrop-blur-md border border-white/10">
                       <h2>Stat 2</h2>
                   </div>
                   <div className="bg-slate-800/80 p-6 rounded-xl backdrop-blur-md border border-white/10">
                       <h2>Stat 3</h2>
                   </div>
                </div>
            </div>
            
        </div>
    );
};

export default MyDashboard;
```

### Key Technical Concepts to Keep in Mind

1. **\`requestAnimationFrame()\` (Performance):** 
   You must use this rather than \`setInterval\` for animations. \`requestAnimationFrame\` tells the browser that you wish to perform an animation and requests that the browser update it before the next repaint. It pauses automatically when the user switches away to a different tab, saving battery and CPU. 

2. **\`pointer-events-none\`:**
   In modern CSS, adding this to the canvas ensures the canvas ignores all mouse events. This allows CSS clicks and hovers to "pass through" the invisible canvas layer entirely and hit the buttons or input fields beneath it. The \`mousemove\` event we track inside the component is bound globally to the \`window\`, so it doesn't matter what element the user is actually hovering over.

3. **\`ctx.save()\` vs \`ctx.restore()\`:**
   The Canvas API uses a global "state". If you rotate the entire canvas by 30 degrees, everything drawn after that point will be permanently rotated. \`ctx.save()\` takes a snapshot of the current state, and \`ctx.restore()\` rewinds to that snapshot. We wrap the entire translation inside this to avoid corrupting the map layout.
