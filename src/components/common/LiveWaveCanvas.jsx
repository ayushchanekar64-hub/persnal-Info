import React, { useEffect, useRef } from 'react';

export default function LiveWaveCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      // Pure deep black background matching reference image
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      time += 0.012; // Smooth, hypnotic silk wave breathing

      // 1. LEFT SILK WAVE RIBBON
      const strandCount = 24;
      for (let i = 0; i < strandCount; i++) {
        const tNorm = i / strandCount;
        ctx.save();

        const grad = ctx.createLinearGradient(0, height * 0.3, width * 0.45, height * 0.72);
        grad.addColorStop(0, 'rgba(168, 85, 247, 0.78)');
        grad.addColorStop(0.35, 'rgba(192, 132, 252, 0.62)');
        grad.addColorStop(0.72, 'rgba(124, 58, 237, 0.32)');
        grad.addColorStop(1, 'rgba(124, 58, 237, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = i % 4 === 0 ? 1.8 : 0.9;

        if (i % 6 === 0) {
          ctx.shadowColor = '#A855F7';
          ctx.shadowBlur = 18;
        }

        ctx.beginPath();
        const startX = -30;
        const startY = height * (0.28 + tNorm * 0.14) + Math.sin(time + i * 0.12) * 8;

        const cp1X = width * (0.08 + tNorm * 0.03);
        const cp1Y = height * (0.54 + tNorm * 0.18) + Math.cos(time * 0.8 + i * 0.08) * 14;

        const cp2X = width * (0.22 + tNorm * 0.04);
        const cp2Y = height * (0.75 - tNorm * 0.08) + Math.sin(time * 0.9 + i * 0.1) * 10;

        const endX = width * (0.38 + tNorm * 0.06);
        const endY = height * (0.71 + tNorm * 0.06);

        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
        ctx.stroke();
        ctx.restore();
      }

      // 2. RIGHT SILK WAVE RIBBON
      for (let i = 0; i < strandCount; i++) {
        const tNorm = i / strandCount;
        ctx.save();

        const grad = ctx.createLinearGradient(width, height * 0.3, width * 0.55, height * 0.72);
        grad.addColorStop(0, 'rgba(168, 85, 247, 0.78)');
        grad.addColorStop(0.35, 'rgba(192, 132, 252, 0.62)');
        grad.addColorStop(0.72, 'rgba(124, 58, 237, 0.32)');
        grad.addColorStop(1, 'rgba(124, 58, 237, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = i % 4 === 0 ? 1.8 : 0.9;

        if (i % 6 === 0) {
          ctx.shadowColor = '#A855F7';
          ctx.shadowBlur = 18;
        }

        ctx.beginPath();
        const startX = width + 30;
        const startY = height * (0.28 + tNorm * 0.14) + Math.sin(time + i * 0.12) * 8;

        const cp1X = width * (0.92 - tNorm * 0.03);
        const cp1Y = height * (0.54 + tNorm * 0.18) + Math.cos(time * 0.8 + i * 0.08) * 14;

        const cp2X = width * (0.78 - tNorm * 0.04);
        const cp2Y = height * (0.75 - tNorm * 0.08) + Math.sin(time * 0.9 + i * 0.1) * 10;

        const endX = width * (0.62 - tNorm * 0.06);
        const endY = height * (0.71 + tNorm * 0.06);

        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
        ctx.stroke();
        ctx.restore();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        background: '#000000'
      }}
    />
  );
}
