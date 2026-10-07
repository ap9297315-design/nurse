import React, { useRef, useEffect } from 'react';

interface EcgMonitorCanvasProps {
  heartRate: number;
  spo2: number;
  isAlarm?: boolean;
}

export const EcgMonitorCanvas: React.FC<EcgMonitorCanvasProps> = ({
  heartRate,
  spo2,
  isAlarm = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    const width = canvas.width;
    const height = canvas.height;
    const midY = height * 0.45;
    const plethMidY = height * 0.82;

    // Draw initial grid
    const drawGrid = () => {
      ctx.fillStyle = '#050c0e';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#0d2822';
      ctx.lineWidth = 0.5;

      const gridSize = 16;
      for (let gx = 0; gx < width; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }
    };

    drawGrid();

    // Cardiac cycle timing based on heartRate
    let beatPhase = 0;
    const speed = 2.2;

    const render = () => {
      // Clear a 12px vertical slice ahead of the cursor to create real sweep line
      ctx.fillStyle = '#050c0e';
      ctx.fillRect((x + 2) % width, 0, 16, height);

      // Re-draw faint grid in cleared slice
      ctx.strokeStyle = '#0d2822';
      ctx.lineWidth = 0.5;
      const clearX = (x + 2) % width;
      if (clearX % 16 < speed) {
        ctx.beginPath();
        ctx.moveTo(clearX, 0);
        ctx.lineTo(clearX, height);
        ctx.stroke();
      }

      // Calculate ECG voltage point
      // Normal cycle length in pixels based on heart rate
      const cycleLength = Math.max(50, (60 / (heartRate || 75)) * 60 * 1.5);
      const cyclePos = beatPhase % cycleLength;
      const normPos = cyclePos / cycleLength;

      let ecgDelta = 0;
      if (normPos > 0.08 && normPos < 0.16) {
        // P-Wave
        ecgDelta = -Math.sin(((normPos - 0.08) / 0.08) * Math.PI) * 7;
      } else if (normPos >= 0.2 && normPos < 0.22) {
        // Q-Dip
        ecgDelta = 4;
      } else if (normPos >= 0.22 && normPos < 0.26) {
        // R-Spike (tall QRS complex)
        ecgDelta = -34;
      } else if (normPos >= 0.26 && normPos < 0.3) {
        // S-Dip
        ecgDelta = 8;
      } else if (normPos >= 0.42 && normPos < 0.58) {
        // T-Wave
        ecgDelta = -Math.sin(((normPos - 0.42) / 0.16) * Math.PI) * 11;
      } else {
        // Baseline noise
        ecgDelta = (Math.random() - 0.5) * 1.2;
      }

      // Pleth (SpO2 pulsatile wave)
      let plethDelta = 0;
      if (normPos > 0.25 && normPos < 0.75) {
        const pNorm = (normPos - 0.25) / 0.5;
        // Dicrotic notch curve
        plethDelta = -Math.sin(pNorm * Math.PI) * 14;
        if (pNorm > 0.45 && pNorm < 0.6) {
          plethDelta += 3; // dicrotic notch
        }
      }

      // Draw ECG (Green or Red if Alarm)
      ctx.strokeStyle = isAlarm ? '#f43f5e' : '#10b981';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = isAlarm ? '#f43f5e' : '#10b981';
      ctx.shadowBlur = 4;

      ctx.beginPath();
      ctx.moveTo(x, midY + ecgDelta);
      ctx.lineTo((x + speed) % width, midY + ecgDelta);
      ctx.stroke();

      // Draw Pleth (Cyan)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 3;

      ctx.beginPath();
      ctx.moveTo(x, plethMidY + plethDelta);
      ctx.lineTo((x + speed) % width, plethMidY + plethDelta);
      ctx.stroke();

      ctx.shadowBlur = 0;

      x = (x + speed) % width;
      beatPhase += speed;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [heartRate, spo2, isAlarm]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-emerald-900/60 bg-[#050c0e] shadow-inner">
      <div className="absolute top-2 left-3 flex items-center gap-3 z-10 text-[10px] font-mono pointer-events-none">
        <span className="text-emerald-400 font-bold tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          LEAD II • 1.0 mV/cm
        </span>
        <span className="text-cyan-400 font-bold tracking-wider">
          PLETH • SpO2 {spo2}%
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={560}
        height={130}
        className="w-full h-28 object-cover block"
      />

      <div className="absolute bottom-1.5 right-3 text-[9px] font-mono text-emerald-500/70 pointer-events-none">
        Sweep 25 mm/s • Notch 50Hz
      </div>
    </div>
  );
};
