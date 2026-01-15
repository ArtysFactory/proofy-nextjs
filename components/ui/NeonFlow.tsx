'use client';

import { useEffect, useRef } from 'react';

interface NeonFlowProps {
  className?: string;
  lineColor?: string;
  backgroundColor?: string;
  speed?: number;
  lineCount?: number;
  lineWidth?: number;
  blur?: number;
}

export default function NeonFlow({
  className = '',
  lineColor = '#bff227',
  backgroundColor = '#000000',
  speed = 0.5,
  lineCount = 30,
  lineWidth = 2,
  blur = 4,
}: NeonFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Line class
    class NeonLine {
      x: number;
      y: number;
      length: number;
      angle: number;
      speed: number;
      width: number;
      hue: number;
      opacity: number;
      curve: number;
      curveSpeed: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.reset(canvasWidth, canvasHeight);
      }

      reset(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = canvasHeight + 50;
        this.length = 100 + Math.random() * 200;
        this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        this.speed = 1 + Math.random() * 2;
        this.width = 1 + Math.random() * lineWidth;
        this.hue = Math.random() > 0.7 ? 75 : (Math.random() > 0.5 ? 280 : 75); // Mix of lime and purple
        this.opacity = 0.3 + Math.random() * 0.7;
        this.curve = Math.random() * 0.02 - 0.01;
        this.curveSpeed = Math.random() * 0.001;
      }

      update(canvasWidth: number, canvasHeight: number, deltaSpeed: number) {
        this.x += Math.cos(this.angle) * this.speed * deltaSpeed;
        this.y += Math.sin(this.angle) * this.speed * deltaSpeed;
        this.angle += this.curve;
        this.curve += (Math.random() - 0.5) * this.curveSpeed;

        // Reset when off screen
        if (this.y < -this.length || this.x < -50 || this.x > canvasWidth + 50) {
          this.reset(canvasWidth, canvasHeight);
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        const endX = this.x + Math.cos(this.angle) * this.length;
        const endY = this.y + Math.sin(this.angle) * this.length;

        // Create gradient for neon effect
        const gradient = ctx.createLinearGradient(this.x, this.y, endX, endY);
        
        if (this.hue === 75) {
          // Lime green (#bff227)
          gradient.addColorStop(0, `hsla(${this.hue}, 95%, 55%, 0)`);
          gradient.addColorStop(0.3, `hsla(${this.hue}, 95%, 55%, ${this.opacity * 0.8})`);
          gradient.addColorStop(0.7, `hsla(${this.hue}, 95%, 55%, ${this.opacity})`);
          gradient.addColorStop(1, `hsla(${this.hue}, 95%, 55%, 0)`);
        } else {
          // Purple
          gradient.addColorStop(0, `hsla(${this.hue}, 80%, 60%, 0)`);
          gradient.addColorStop(0.3, `hsla(${this.hue}, 80%, 60%, ${this.opacity * 0.6})`);
          gradient.addColorStop(0.7, `hsla(${this.hue}, 80%, 60%, ${this.opacity * 0.8})`);
          gradient.addColorStop(1, `hsla(${this.hue}, 80%, 60%, 0)`);
        }

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glow effect
        ctx.shadowBlur = blur;
        ctx.shadowColor = this.hue === 75 ? lineColor : '#8a59ff';
      }
    }

    // Create lines
    const rect = canvas.getBoundingClientRect();
    const lines: NeonLine[] = Array.from(
      { length: lineCount },
      () => new NeonLine(rect.width, rect.height)
    );

    // Distribute initial positions
    lines.forEach((line, i) => {
      line.y = rect.height - (rect.height / lineCount) * i;
    });

    // Animation loop
    let lastTime = 0;
    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      const deltaSpeed = (deltaTime / 16) * speed;

      const rect = canvas.getBoundingClientRect();
      
      // Clear with fade effect for trails
      ctx.fillStyle = `${backgroundColor}15`;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Update and draw lines
      ctx.shadowBlur = blur;
      lines.forEach((line) => {
        line.update(rect.width, rect.height, deltaSpeed);
        line.draw(ctx);
      });
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [lineColor, backgroundColor, speed, lineCount, lineWidth, blur]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ 
        background: backgroundColor,
        mixBlendMode: 'screen',
      }}
    />
  );
}
