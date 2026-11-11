import React, { useEffect, useRef } from 'react';

export default function LiveWaveCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId = null;
    let width = 0;
    let height = 0;
    let leftGrad = null;
    let rightGrad = null;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const rebuildSizeAndGradients = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      leftGrad = ctx.createLinearGradient(0, height * 0.3, width * 0.45, height * 0.72);
      leftGrad.addColorStop(0, 'rgba(168, 85, 247, 0.78)');
      leftGrad.addColorStop(0.35, 'rgba(192, 132, 252, 0.62)');
      leftGrad.addColorStop(0.72, 'rgba(124, 58, 237, 0.32)');
      leftGrad.addColorStop(1, 'rgba(124, 58, 237, 0)');

      rightGrad = ctx.createLinearGradient(width, height * 0.3, width * 0.55, height * 0.72);
      rightGrad.addColorStop(0, 'rgba(168, 85, 247, 0.78)');
      rightGrad.addColorStop(0.35, 'rgba(192, 132, 252, 0.62)');
      rightGrad.addColorStop(0.72, 'rgba(124, 58, 237, 0.32)');
      rightGrad.addColorStop(1, 'rgba(124, 58, 237, 0)');
    };

    rebuildSizeAndGradients();
    window.addEventListener('resize', rebuildSizeAndGradients, { passive: true });

    let time = 0;
    const strandCount = 24;

    const drawRibbon = (isLeft, gradient) => {
      ctx.strokeStyle = gradient;

      // Batch thin strands
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (let i = 0; i < strandCount; i++) {
        if (i % 4 === 0) continue;
        const tNorm = i / strandCount;
        const startY = height * (0.28 + tNorm * 0.14) + Math.sin(time + i * 0.12) * 8;
        const cp1Y = height * (0.54 + tNorm * 0.18) + Math.cos(time * 0.8 + i * 0.08) * 14;
        const cp2Y = height * (0.75 - tNorm * 0.08) + Math.sin(time * 0.9 + i * 0.1) * 10;
        const endY = height * (0.71 + tNorm * 0.06);

        if (isLeft) {
          ctx.moveTo(-30, startY);
          ctx.bezierCurveTo(
            width * (0.08 + tNorm * 0.03), cp1Y,
            width * (0.22 + tNorm * 0.04), cp2Y,
            width * (0.38 + tNorm * 0.06), endY
          );
        } else {
          ctx.moveTo(width + 30, startY);
          ctx.bezierCurveTo(
            width * (0.92 - tNorm * 0.03), cp1Y,
            width * (0.78 - tNorm * 0.04), cp2Y,
            width * (0.62 - tNorm * 0.06), endY
          );
        }
      }
      ctx.stroke();

      // Batch accent highlight strands (replaces expensive shadowBlur)
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (let i = 0; i < strandCount; i += 4) {
        const tNorm = i / strandCount;
        const startY = height * (0.28 + tNorm * 0.14) + Math.sin(time + i * 0.12) * 8;
        const cp1Y = height * (0.54 + tNorm * 0.18) + Math.cos(time * 0.8 + i * 0.08) * 14;
        const cp2Y = height * (0.75 - tNorm * 0.08) + Math.sin(time * 0.9 + i * 0.1) * 10;
        const endY = height * (0.71 + tNorm * 0.06);

        if (isLeft) {
          ctx.moveTo(-30, startY);
          ctx.bezierCurveTo(
            width * (0.08 + tNorm * 0.03), cp1Y,
            width * (0.22 + tNorm * 0.04), cp2Y,
            width * (0.38 + tNorm * 0.06), endY
          );
        } else {
          ctx.moveTo(width + 30, startY);
          ctx.bezierCurveTo(
            width * (0.92 - tNorm * 0.03), cp1Y,
            width * (0.78 - tNorm * 0.04), cp2Y,
            width * (0.62 - tNorm * 0.06), endY
          );
        }
      }
      ctx.stroke();
    };

    const render = () => {
      if (document.hidden) {
        animationFrameId = null;
        return;
      }

      // Pure deep black background matching reference image
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      time += 0.012; // Smooth, hypnotic silk wave breathing

      // 1. LEFT & RIGHT SILK WAVE RIBBONS (batched, zero per-frame allocations)
      drawRibbon(true, leftGrad);
      drawRibbon(false, rightGrad);

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && !prefersReducedMotion && animationFrameId === null) {
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    render();

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', rebuildSizeAndGradients);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
