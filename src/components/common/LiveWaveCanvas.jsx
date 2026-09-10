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

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let time = 0;

    // Ground flow particles
    const groundParticles = Array.from({ length: 45 }, () => ({
      angle: (Math.random() - 0.5) * Math.PI * 0.85,
      dist: Math.random(),
      speed: 0.004 + Math.random() * 0.008,
      size: 1 + Math.random() * 2,
      color: Math.random() > 0.4 ? '#A78BFA' : '#38BDF8'
    }));

    // Floating vertical beacons / nodes
    const verticalBeacons = [
      { xRatio: 0.08, yBaseRatio: 0.42, height: 110, color: '#38BDF8' },
      { xRatio: 0.14, yBaseRatio: 0.48, height: 160, color: '#C084FC' },
      { xRatio: 0.22, yBaseRatio: 0.38, height: 130, color: '#818CF8' },
      { xRatio: 0.29, yBaseRatio: 0.52, height: 180, color: '#38BDF8' },
      { xRatio: 0.71, yBaseRatio: 0.52, height: 170, color: '#38BDF8' },
      { xRatio: 0.78, yBaseRatio: 0.40, height: 140, color: '#C084FC' },
      { xRatio: 0.85, yBaseRatio: 0.46, height: 155, color: '#818CF8' },
      { xRatio: 0.92, yBaseRatio: 0.42, height: 120, color: '#38BDF8' }
    ];

    const render = () => {
      time += 0.022;
      ctx.clearRect(0, 0, width, height);

      // 1. Perspective Speed / Flow Lines on Bottom Floor
      const horizonY = height * 0.74;
      const centerX = width / 2;

      ctx.save();
      // Draw converging stream lines on the floor
      const numLines = 28;
      for (let i = 0; i <= numLines; i++) {
        const spread = (i / numLines - 0.5) * 2; // -1 to 1
        const bottomX = centerX + spread * width * 0.95;
        const curveOffset = Math.sin(spread * Math.PI) * 45;

        const grad = ctx.createLinearGradient(centerX, horizonY, bottomX, height);
        grad.addColorStop(0, 'rgba(124, 58, 237, 0)');
        grad.addColorStop(0.3, 'rgba(139, 92, 246, 0.25)');
        grad.addColorStop(0.8, 'rgba(167, 139, 250, 0.45)');
        grad.addColorStop(1, 'rgba(192, 132, 252, 0.65)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, horizonY);
        ctx.quadraticCurveTo(centerX + spread * 180 + curveOffset, horizonY + 70, bottomX, height);
        ctx.stroke();
      }

      // Draw moving stream particles along perspective floor
      groundParticles.forEach((p) => {
        p.dist += p.speed;
        if (p.dist > 1) {
          p.dist = 0;
          p.angle = (Math.random() - 0.5) * Math.PI * 0.85;
        }

        const currentDist = Math.pow(p.dist, 1.8); // perspective acceleration
        const px = centerX + Math.sin(p.angle) * currentDist * width * 0.85;
        const py = horizonY + currentDist * (height - horizonY);

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, p.size * (0.6 + currentDist * 1.2), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 2. Flowing Sine Waves (Left and Right Bundles)
      const renderWaveBundle = (side) => {
        const lineCount = 18;
        const isLeft = side === 'left';
        const startX = isLeft ? -40 : width + 40;
        const endX = isLeft ? width * 0.55 : width * 0.45;

        for (let j = 0; j < lineCount; j++) {
          const progress = j / lineCount;
          const baseWaveY = height * (0.36 + progress * 0.24);

          ctx.save();
          const lineGrad = ctx.createLinearGradient(startX, baseWaveY, endX, baseWaveY);
          if (isLeft) {
            lineGrad.addColorStop(0, 'rgba(124, 58, 237, 0.8)');
            lineGrad.addColorStop(0.4, 'rgba(168, 85, 247, 0.65)');
            lineGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.45)');
            lineGrad.addColorStop(1, 'rgba(196, 181, 253, 0)');
          } else {
            lineGrad.addColorStop(0, 'rgba(124, 58, 237, 0.8)');
            lineGrad.addColorStop(0.4, 'rgba(168, 85, 247, 0.65)');
            lineGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.45)');
            lineGrad.addColorStop(1, 'rgba(196, 181, 253, 0)');
          }

          ctx.strokeStyle = lineGrad;
          ctx.lineWidth = 1.1 + (j % 3 === 0 ? 0.6 : 0);
          ctx.shadowColor = j % 4 === 0 ? 'rgba(167, 139, 250, 0.65)' : 'transparent';
          ctx.shadowBlur = j % 4 === 0 ? 10 : 0;

          ctx.beginPath();
          const steps = 60;
          const stepSize = Math.abs(endX - startX) / steps;

          for (let step = 0; step <= steps; step++) {
            const currentX = isLeft ? startX + step * stepSize : startX - step * stepSize;
            const xNorm = step / steps;

            // Live oscillating sine formula
            const wave1 = Math.sin(xNorm * 3.8 + time * 1.4 + j * 0.18) * (38 + j * 2.2);
            const wave2 = Math.cos(xNorm * 6.2 - time * 0.9 + j * 0.12) * 18;
            const envelope = Math.sin(xNorm * Math.PI); // Pinches ends
            const currentY = baseWaveY + (wave1 + wave2) * envelope;

            if (step === 0) {
              ctx.moveTo(currentX, currentY);
            } else {
              ctx.lineTo(currentX, currentY);
            }
          }
          ctx.stroke();
          ctx.restore();
        }
      };

      renderWaveBundle('left');
      renderWaveBundle('right');

      // 3. Vertical Light Beacons / Stalks with Glowing Cyan Tips
      ctx.save();
      verticalBeacons.forEach((b, idx) => {
        const bx = width * b.xRatio;
        const byBase = height * b.yBaseRatio + Math.sin(time * 1.2 + idx) * 12;
        const byTop = byBase - b.height;

        // Vertical stalk line
        const stalkGrad = ctx.createLinearGradient(bx, byBase, bx, byTop);
        stalkGrad.addColorStop(0, 'rgba(139, 92, 246, 0)');
        stalkGrad.addColorStop(0.6, 'rgba(167, 139, 250, 0.35)');
        stalkGrad.addColorStop(1, b.color);

        ctx.strokeStyle = stalkGrad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(bx, byBase);
        ctx.lineTo(bx, byTop);
        ctx.stroke();

        // Glowing Beacon Head Dot
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(bx, byTop, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Secondary outer halo on the tip
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bx, byTop, 5.5 + Math.sin(time * 3 + idx) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
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
        zIndex: 2
      }}
    />
  );
}
