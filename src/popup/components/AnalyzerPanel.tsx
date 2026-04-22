import React, { useEffect, useRef } from 'react';

export type AnalyzerMode = 'spectrum' | 'level';

interface Props { tabId: number | null; mode: AnalyzerMode; }

function drawSpectrum(ctx: CanvasRenderingContext2D, data: number[], w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  const bw = w / data.length;
  data.forEach((db, i) => {
    const norm = Math.max(0, (db + 100) / 100);
    ctx.fillStyle = `hsl(${200 - norm * 120}, 75%, 55%)`;
    ctx.fillRect(i * bw, h - norm * h, Math.max(bw - 1, 1), norm * h);
  });
}

function drawLevel(ctx: CanvasRenderingContext2D, db: number, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  const norm = Math.max(0, Math.min(1, (db + 60) / 60));
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#4ade80');
  grad.addColorStop(0.7, '#facc15');
  grad.addColorStop(1, '#f87171');
  ctx.fillStyle = grad;
  ctx.fillRect(0, h * 0.2, norm * w, h * 0.6);
  ctx.fillStyle = 'rgba(150,150,150,0.8)';
  ctx.font = '9px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${isFinite(db) ? db.toFixed(1) : '—'} dB`, w - 4, h * 0.78);
}

const AnalyzerPanel: React.FC<Props> = ({ tabId, mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!tabId || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let tid: ReturnType<typeof setTimeout>;
    const poll = () => {
      chrome.tabs.sendMessage(tabId, {
        type: mode === 'spectrum' ? 'getSpectrumData' : 'getLevelData'
      }).then(resp => {
        if (mode === 'spectrum' && resp?.data) drawSpectrum(ctx, resp.data, canvas.width, canvas.height);
        else if (mode === 'level' && resp?.db !== undefined) drawLevel(ctx, resp.db, canvas.width, canvas.height);
      }).catch(() => ctx.clearRect(0, 0, canvas.width, canvas.height));
      tid = setTimeout(poll, 50);
    };
    poll();
    return () => clearTimeout(tid);
  }, [tabId, mode]);

  return (
    <canvas
      ref={canvasRef}
      width={320} height={48}
      className="w-full block bg-bg-secondary border-b border-border-light"
    />
  );
};

export default AnalyzerPanel;
