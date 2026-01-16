'use client';

import { useEffect, useRef } from 'react';

interface NeonHexagonProps {
  className?: string;
  size?: number;
  rotationSpeed?: number;
  glowIntensity?: number;
}

export default function NeonHexagon({
  className = '',
  size = 400,
  rotationSpeed = 0.5,
  glowIntensity = 1,
}: NeonHexagonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const colorOffsetRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const hexRadius = size * 0.4;

    // Color gradient stops (yellow → green → cyan → purple → pink → yellow)
    const colors = [
      { r: 255, g: 200, b: 50 },   // Yellow/Orange
      { r: 180, g: 255, b: 50 },   // Lime green
      { r: 50, g: 255, b: 150 },   // Cyan/Green
      { r: 100, g: 200, b: 255 },  // Light blue
      { r: 150, g: 100, b: 255 },  // Purple
      { r: 200, g: 100, b: 200 },  // Pink/Purple
    ];

    function interpolateColor(offset: number): { r: number; g: number; b: number } {
      const normalizedOffset = ((offset % 1) + 1) % 1;
      const index = normalizedOffset * colors.length;
      const i1 = Math.floor(index) % colors.length;
      const i2 = (i1 + 1) % colors.length;
      const t = index - Math.floor(index);

      return {
        r: Math.round(colors[i1].r + (colors[i2].r - colors[i1].r) * t),
        g: Math.round(colors[i1].g + (colors[i2].g - colors[i1].g) * t),
        b: Math.round(colors[i1].b + (colors[i2].b - colors[i1].b) * t),
      };
    }

    function getHexagonPoints(cx: number, cy: number, radius: number, rotation: number): { x: number; y: number }[] {
      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2 + rotation;
        points.push({
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        });
      }
      return points;
    }

    function drawGlowLine(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      color1: { r: number; g: number; b: number },
      color2: { r: number; g: number; b: number },
      lineWidth: number
    ) {
      const gradient = ctx!.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `rgba(${color1.r}, ${color1.g}, ${color1.b}, 1)`);
      gradient.addColorStop(1, `rgba(${color2.r}, ${color2.g}, ${color2.b}, 1)`);

      // Outer glow
      ctx!.beginPath();
      ctx!.moveTo(x1, y1);
      ctx!.lineTo(x2, y2);
      ctx!.strokeStyle = gradient;
      ctx!.lineWidth = lineWidth + 8 * glowIntensity;
      ctx!.lineCap = 'round';
      ctx!.shadowBlur = 20 * glowIntensity;
      ctx!.shadowColor = `rgba(${(color1.r + color2.r) / 2}, ${(color1.g + color2.g) / 2}, ${(color1.b + color2.b) / 2}, 0.8)`;
      ctx!.stroke();

      // Inner bright line
      ctx!.beginPath();
      ctx!.moveTo(x1, y1);
      ctx!.lineTo(x2, y2);
      ctx!.strokeStyle = gradient;
      ctx!.lineWidth = lineWidth;
      ctx!.lineCap = 'round';
      ctx!.shadowBlur = 10 * glowIntensity;
      ctx!.stroke();

      ctx!.shadowBlur = 0;
    }

    function drawCenterElement(cx: number, cy: number, rotation: number) {
      const armLength = size * 0.04;
      const color = interpolateColor(colorOffsetRef.current + 0.5);

      ctx!.shadowBlur = 15 * glowIntensity;
      ctx!.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;

      for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 / 3) * i + rotation * 2;
        const endX = cx + Math.cos(angle) * armLength;
        const endY = cy + Math.sin(angle) * armLength;

        ctx!.beginPath();
        ctx!.moveTo(cx, cy);
        ctx!.lineTo(endX, endY);
        ctx!.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`;
        ctx!.lineWidth = 1.5;
        ctx!.lineCap = 'round';
        ctx!.stroke();
      }

      ctx!.shadowBlur = 0;
    }

    function drawBottomLine(cx: number, bottomY: number) {
      const lineLength = size * 0.12;
      const color = interpolateColor(colorOffsetRef.current + 0.7);

      ctx!.shadowBlur = 15 * glowIntensity;
      ctx!.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;

      ctx!.beginPath();
      ctx!.moveTo(cx, bottomY);
      ctx!.lineTo(cx, bottomY + lineLength);
      ctx!.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`;
      ctx!.lineWidth = 2;
      ctx!.lineCap = 'round';
      ctx!.stroke();

      ctx!.shadowBlur = 0;
    }

    function animate() {
      // Clear canvas
      ctx!.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx!.fillRect(0, 0, size, size);

      // Update rotation and color offset
      rotationRef.current += 0.002 * rotationSpeed;
      colorOffsetRef.current += 0.003;

      const points = getHexagonPoints(centerX, centerY, hexRadius, rotationRef.current);

      // Draw hexagon edges with gradient colors
      for (let i = 0; i < 6; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % 6];
        const color1 = interpolateColor(colorOffsetRef.current + i / 6);
        const color2 = interpolateColor(colorOffsetRef.current + (i + 1) / 6);
        drawGlowLine(p1.x, p1.y, p2.x, p2.y, color1, color2, 2);
      }

      // Draw center element
      drawCenterElement(centerX, centerY, rotationRef.current);

      // Draw bottom line
      const bottomPoint = points.reduce((a, b) => (a.y > b.y ? a : b));
      drawBottomLine(centerX, bottomPoint.y);

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size, rotationSpeed, glowIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`${className}`}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
