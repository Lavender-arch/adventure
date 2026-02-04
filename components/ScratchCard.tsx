
import React, { useRef, useEffect, useState } from 'react';

interface ScratchCardProps {
  onComplete: () => void;
  reward: string;
  icon: string;
}

const ScratchCard: React.FC<ScratchCardProps> = ({ onComplete, reward, icon }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [percent, setPercent] = useState(0);
  const isDrawing = useRef(false);
  const lastUpdate = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // 初始化涂层样式
    const initCanvas = () => {
      // 填充底色
      ctx.fillStyle = '#CBD5E1'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制网格线增强质感
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // 添加提示文字
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 24px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('刮开领取锦囊', canvas.width / 2, canvas.height / 2);
    };

    initCanvas();

    // 检查刮开比例
    const checkPercent = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let clearCount = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 0) clearCount++;
      }
      const newPercent = (clearCount / (pixels.length / 4)) * 100;
      setPercent(newPercent);

      // 刮开超过55%时，视为挑战完成
      if (newPercent > 55 && !isScratched) {
        setIsScratched(true);
        onComplete();
      }
    };

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      // 增加笔触大小，让刮开更容易
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.fill();

      // 节流处理，防止性能损耗
      const now = Date.now();
      if (now - lastUpdate.current > 60) {
        lastUpdate.current = now;
        requestAnimationFrame(checkPercent);
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      // 适配 canvas 坐标比例
      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);
      
      scratch(x, y);
      if (e.cancelable) e.preventDefault();
    };

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawing.current = true;
      handleMove(e);
    };

    const stopDrawing = () => {
      if (isDrawing.current) {
        isDrawing.current = false;
        checkPercent(); // 结束时强制检查一次
      }
    };

    // 绑定事件
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', stopDrawing);
    window.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', stopDrawing);
      window.removeEventListener('touchend', stopDrawing);
    };
  }, [isScratched, onComplete]);

  return (
    <div className="relative w-full h-60 bg-white rounded-[2.5rem] shadow-2xl border-4 border-white overflow-hidden group select-none">
      {/* 奖励层（底部内容） */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-sky-50 to-white">
        <div className={`w-20 h-20 bg-sky-500/10 rounded-3xl flex items-center justify-center text-sky-500 mb-4 ${isScratched ? 'animate-bounce' : ''}`}>
          <i className={`fas ${icon} text-4xl`}></i>
        </div>
        <h3 className="text-2xl font-black text-gray-800 tracking-tight">{reward}</h3>
        <p className="text-[10px] text-sky-400 mt-2 font-black uppercase tracking-[0.2em]">已放入行程清单</p>
      </div>

      {/* 涂层（Canvas层） */}
      {!isScratched && (
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none z-10 transition-opacity duration-700"
          style={{ opacity: percent > 55 ? 0 : 1 }}
        />
      )}
      
      {/* 进度提示 */}
      {!isScratched && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-md px-5 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-3">
            <div className="bg-gray-100 h-1.5 rounded-full overflow-hidden w-28">
              <div 
                className="bg-sky-400 h-full transition-all duration-300" 
                style={{ width: `${Math.min(percent / 0.55, 100)}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-black text-gray-400 min-w-[30px]">{Math.floor(percent)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScratchCard;
