import React, { useEffect, useRef, useState } from 'react';

const CircuitCanvas = () => {
    const canvasRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const updateSize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Configuration
        const GRID_SIZE = 30; // Tighter grid
        const SIGNAL_COUNT = 80; // More traffic

        // Pre-calculate grid intersections
        const cols = Math.ceil(dimensions.width / GRID_SIZE);
        const rows = Math.ceil(dimensions.height / GRID_SIZE);

        class Signal {
            constructor() {
                this.reset();
            }

            reset() {
                // Pick a random grid line
                if (Math.random() > 0.5) {
                    // Horizontal
                    this.x = -100;
                    this.y = Math.floor(Math.random() * rows) * GRID_SIZE;
                    this.vx = 2 + Math.random() * 4;
                    this.vy = 0;
                } else {
                    // Vertical
                    this.x = Math.floor(Math.random() * cols) * GRID_SIZE;
                    this.y = -100;
                    this.vx = 0;
                    this.vy = 2 + Math.random() * 4;
                }

                this.length = 50 + Math.random() * 150;
                this.width = Math.random() > 0.8 ? 2 : 1; // Occasional thick beam
                const isEmerald = Math.random() > 0.4;
                this.color = isEmerald ? '16, 185, 129' : '14, 165, 233';
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Random turn (Circuit behavior) - 1% chance per frame to turn 90 degrees
                if (Math.random() < 0.02) {
                    // Snap to grid before turning
                    this.x = Math.round(this.x / GRID_SIZE) * GRID_SIZE;
                    this.y = Math.round(this.y / GRID_SIZE) * GRID_SIZE;

                    if (this.vx !== 0) {
                        // Was moving Horizontal, switch to Vertical
                        this.vx = 0;
                        this.vy = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3);
                    } else {
                        // Was moving Vertical, switch to Horizontal
                        this.vy = 0;
                        this.vx = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3);
                    }
                }

                if (this.x > dimensions.width + 100 || this.x < -100 ||
                    this.y > dimensions.height + 100 || this.y < -100) {
                    this.reset();
                }
            }

            draw(ctx) {
                ctx.beginPath();

                // Draw trail
                const tailX = this.x - (this.vx * this.length * 0.1); // Simplified trail math
                const tailY = this.y - (this.vy * this.length * 0.1);

                // Gradient trail
                const grad = ctx.createLinearGradient(
                    this.x, this.y,
                    this.x - (this.vx * 20), this.y - (this.vy * 20) // Fade out tail
                );
                grad.addColorStop(0, `rgba(${this.color}, 1)`);
                grad.addColorStop(1, `rgba(${this.color}, 0)`);

                ctx.strokeStyle = grad;
                ctx.lineWidth = this.width;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - (this.vx * 15), this.y - (this.vy * 15)); // Visible length
                ctx.stroke();

                // Bright Head
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.width + 1, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color}, 1)`;
                ctx.shadowColor = `rgba(${this.color}, 1)`;
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        const signals = Array.from({ length: SIGNAL_COUNT }, () => new Signal());

        const render = () => {
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);

            // Draw Static Grid (Background)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(51, 65, 85, 0.1)'; // Slate-700 very faint
            ctx.lineWidth = 1;

            // Draw only a subset of grid lines for style, or full grid?
            // Full grid
            for (let x = 0; x <= dimensions.width; x += GRID_SIZE) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, dimensions.height);
            }
            for (let y = 0; y <= dimensions.height; y += GRID_SIZE) {
                ctx.moveTo(0, y);
                ctx.lineTo(dimensions.width, y);
            }
            ctx.stroke();

            // Intersections (Dots)
            ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
            for (let x = 0; x <= dimensions.width; x += GRID_SIZE) {
                for (let y = 0; y <= dimensions.height; y += GRID_SIZE) {
                    if (Math.random() > 0.95) { // Twinkle random dots (more frequent)
                        ctx.fillRect(x - 1, y - 1, 2, 2);
                    }
                }
            }

            // Signals
            signals.forEach(s => {
                s.update();
                s.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [dimensions]);

    return <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="fixed inset-0 pointer-events-none" />;
};

const Background = () => {
    return (
        <>
            {/* Background Layers - TECH BLACK */}
            <div className="fixed inset-0 bg-[#020617] pointer-events-none z-[-50]" />

            {/* Ambient Corner Glows - Sharp/Techy */}
            <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] pointer-events-none z-[-40]" />
            <div className="fixed bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-sky-500/10 blur-[150px] pointer-events-none z-[-40]" />

            {/* The Circuit Board */}
            <div className="fixed inset-0 pointer-events-none z-[-30]">
                <CircuitCanvas />
            </div>

            {/* Vignette */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)] pointer-events-none z-[-20]" />
        </>
    );
};

export default Background;
