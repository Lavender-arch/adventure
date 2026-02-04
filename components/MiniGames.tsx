
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Difficulty } from '../types';

interface GameProps {
  onWin: () => void;
  difficulty: Difficulty;
}

const ParticleBurst: React.FC<{ active: boolean }> = ({ active }) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; s: number; rot: number; delay: number; color: string; icon: string }[]>([]);

  const colors = [
    '#60A5FA', '#818CF8', '#A78BFA', '#F472B6', '#34D399',
    '#FFD700', '#DAA520', '#EEE8AA'
  ];
  const icons = ['fa-star', 'fa-sparkles', 'fa-award', 'fa-bolt', 'fa-crown', 'fa-certificate'];

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 80 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 250 + Math.random() * 550;
        return {
          id: Math.random(),
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity,
          s: Math.random() * 1.8 + 0.3,
          rot: Math.random() * 1080 - 540,
          delay: Math.random() * 0.15,
          color: colors[Math.floor(Math.random() * colors.length)],
          icon: icons[Math.floor(Math.random() * icons.length)]
        };
      });
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 2500);
      return () => clearTimeout(timer);
    }
  }, [active]);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-[60]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute flex items-center justify-center"
          style={{
            '--tx': `${p.x}px`,
            '--ty': `${p.y}px`,
            '--rot': `${p.rot}deg`,
            '--s': p.s,
            animation: `extremeBurst 2.2s cubic-bezier(0.05, 0.9, 0.1, 1) ${p.delay}s forwards`,
            color: p.color,
            transform: `scale(0)`,
          } as React.CSSProperties}
        >
          <i className={`fas ${p.icon} text-xl drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]`}></i>
        </div>
      ))}
      <style>{`
        @keyframes extremeBurst {
          0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 0; }
          5% { opacity: 1; transform: translate(0, 0) scale(var(--s)) rotate(45deg); }
          20% { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export const HeartCatcher: React.FC<GameProps> = ({ onWin, difficulty }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(1);
  const [triggerBurst, setTriggerBurst] = useState(false);
  const [narration, setNarration] = useState("让思绪随灯火摇曳...");

  const NARRATIONS = [
    "每一盏亮起的灯，都是一份默契的投射。",
    "在明暗交错间，找到我们的步调。",
    "有些瞬间，注定要在记忆中熠熠生辉。",
    "灯火映照出的，是探索未知的期待。",
    "让光指引方向，带我们走向下一个目的地。",
    "此时此刻，专注于眼前的色彩。",
    "守住这份光，就守住了此刻的好心情。",
    "经历会流逝，但这一刻的共鸣会留下。"
  ];

  const targetRounds = difficulty === 'easy' ? 3 : difficulty === 'normal' ? 5 : 7;
  const playSpeed = difficulty === 'easy' ? 1000 : difficulty === 'normal' ? 800 : 600;

  const playSequence = useCallback((seq: number[]) => {
    setIsPlaying(true);
    let i = 0;
    const interval = setInterval(() => {
      setActiveIdx(seq[i]);
      setTimeout(() => setActiveIdx(null), playSpeed * 0.4);
      i++;
      if (i >= seq.length) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, playSpeed);
  }, [playSpeed]);

  const startNextRound = useCallback((currentSeq: number[]) => {
    const nextSeq = [...currentSeq, Math.floor(Math.random() * 9)];
    setSequence(nextSeq);
    setUserSequence([]);
    setNarration(NARRATIONS[Math.floor(Math.random() * NARRATIONS.length)]);
    setTimeout(() => playSequence(nextSeq), 800);
  }, [playSequence]);

  useEffect(() => {
    startNextRound([]);
  }, []);

  const handleItemClick = (idx: number) => {
    if (isPlaying) return;
    setActiveIdx(idx);
    setTimeout(() => setActiveIdx(null), 200);

    const newUserSeq = [...userSequence, idx];
    setUserSequence(newUserSeq);

    if (idx !== sequence[newUserSeq.length - 1]) {
      setRound(1);
      setNarration("记忆稍稍断了线，别担心，再来一次。");
      startNextRound([]);
      return;
    }

    if (newUserSeq.length === sequence.length) {
      setTriggerBurst(true);
      setTimeout(() => setTriggerBurst(false), 2000);
      
      if (round >= targetRounds) {
        setNarration("完美通关，默契满分！");
        setTimeout(onWin, 1500);
      } else {
        setRound(r => r + 1);
        startNextRound(sequence);
      }
    }
  };

  return (
    <div className="p-8 bg-[#0a0c10] rounded-[3rem] shadow-2xl flex flex-col items-center relative overflow-visible border-[12px] border-[#161b22]">
      <ParticleBurst active={triggerBurst} />
      
      <div className="mb-6 flex flex-col items-center gap-2 w-full">
        <div className="text-sky-400 font-black tracking-widest uppercase text-[10px] flex items-center gap-3 bg-sky-950/30 px-6 py-2 rounded-full border border-sky-500/20 shadow-lg backdrop-blur-md mb-2">
          <i className="fas fa-microchip animate-pulse"></i>
          <span>记忆重现 {round}/{targetRounds}</span>
        </div>
        <div className="h-12 flex items-center justify-center overflow-hidden">
          <p key={narration} className="text-sky-200/80 text-sm font-medium italic text-center animate-narration-fade">
            {narration}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full aspect-square max-w-[320px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleItemClick(i)}
            disabled={isPlaying}
            className={`rounded-[1.8rem] transition-all duration-300 transform active:scale-90 flex items-center justify-center relative overflow-hidden ${
              activeIdx === i 
                ? 'bg-gradient-to-br from-sky-400 to-indigo-600 shadow-[0_0_50px_rgba(56,189,248,0.8)] scale-105 z-10' 
                : 'bg-sky-950/20 border-2 border-sky-900/40'
            }`}
          >
            <i className={`fas fa-lightbulb text-3xl transition-all duration-500 ${activeIdx === i ? 'text-white' : 'text-sky-900 opacity-20'}`}></i>
            {activeIdx === i && <div className="absolute inset-0 bg-white/20 animate-ping rounded-full m-4"></div>}
          </button>
        ))}
      </div>
      
      <p className="mt-8 text-[11px] text-sky-300/60 uppercase tracking-[0.15em] font-black text-center italic">
        {isPlaying ? "屏住呼吸，记住光影的顺序..." : "轮到你了，重现这段记忆"}
      </p>

      <style>{`
        @keyframes narrationFade {
          0% { opacity: 0; transform: translateY(10px); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-narration-fade {
          animation: narrationFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export const TimingGame: React.FC<GameProps> = ({ onWin, difficulty }) => {
  const [score, setScore] = useState(0);
  const [characterY, setCharacterY] = useState(0); // 0 为地面
  const [isGrounded, setIsGrounded] = useState(true);
  const [obstaclePos, setObstaclePos] = useState(110);
  const [gameState, setGameState] = useState<'start' | 'countdown' | 'playing' | 'end'>('start');
  const [countdown, setCountdown] = useState(3);
  const [bgPosFar, setBgPosFar] = useState(0);
  const [bgPosNear, setBgPosNear] = useState(0);
  
  const velocityRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  
  // 物理参数
  const moveSpeed = difficulty === 'easy' ? 0.8 : difficulty === 'normal' ? 1.2 : 1.8;
  const gravity = 0.08;
  const jumpStrength = difficulty === 'easy' ? 3.8 : difficulty === 'normal' ? 4.2 : 4.6;
  const targetScore = 10;

  const handleJump = useCallback(() => {
    if (gameState === 'start') {
      setGameState('countdown');
    } else if (gameState === 'playing' && isGrounded) {
      velocityRef.current = jumpStrength;
      setIsGrounded(false);
    }
  }, [gameState, isGrounded, jumpStrength]);

  useEffect(() => {
    if (gameState !== 'countdown') return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('playing');
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      // 背景视差滚动速度同步
      setBgPosFar(p => (p - moveSpeed * 0.1) % 100);
      setBgPosNear(p => (p - moveSpeed * 0.4) % 100);

      // 人物物理逻辑
      setCharacterY(prevY => {
        const nextY = prevY + velocityRef.current;
        velocityRef.current -= gravity;
        
        if (nextY <= 0) {
          velocityRef.current = 0;
          setIsGrounded(true);
          return 0;
        }
        return nextY;
      });

      // 障碍物逻辑
      setObstaclePos(prev => {
        const next = prev - moveSpeed;
        if (next < -10) {
          setScore(s => s + 1);
          return 110 + Math.random() * 30;
        }

        // 精确碰撞判定 (基于 Y 轴实际物理高度)
        const charBoxX = 12; // 人物 X 轴位置 (left-12)
        const charBoxWidth = 8;
        const obstacleBoxWidth = 8;
        const currentY = characterY; // 实时获取 Y 坐标

        if (next < charBoxX + charBoxWidth && next + obstacleBoxWidth > charBoxX) {
           // 障碍物高度约 50px，这里换算成 Y 轴单位
           if (currentY < 35) {
             setGameState('end');
             return prev;
           }
        }

        return next;
      });

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState, characterY, moveSpeed, gravity]);

  useEffect(() => {
    if (score >= targetScore) {
      setGameState('end');
      onWin();
    }
  }, [score, onWin]);

  return (
    <div className="relative w-full h-72 bg-gradient-to-b from-[#1a2c3a] to-[#2d4a63] rounded-[2.5rem] border-4 border-white overflow-hidden cursor-pointer shadow-2xl" onClick={handleJump}>
      {/* 远景视差 */}
      <div className="absolute bottom-16 w-[200%] h-40 opacity-10" style={{ transform: `translateX(${bgPosFar}%)` }}>
          <div className="flex gap-40 items-end h-full">
             {Array.from({length: 4}).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 items-center">
                   <div className="w-32 h-48 bg-sky-200 rounded-t-3xl"></div>
                   <div className="w-24 h-32 bg-sky-300 rounded-t-3xl"></div>
                </div>
             ))}
          </div>
      </div>

      {/* 近景视差 */}
      <div className="absolute bottom-16 w-[200%] h-24 opacity-20" style={{ transform: `translateX(${bgPosNear}%)` }}>
          <div className="flex gap-20 items-end h-full">
             {Array.from({length: 8}).map((_, i) => (
                <div key={i} className="w-16 h-12 bg-sky-900 rounded-t-lg"></div>
             ))}
          </div>
      </div>

      {/* 地面 */}
      <div className="absolute bottom-0 w-full h-16 bg-[#334155] border-t-8 border-[#1e293b] shadow-[inset_0_10px_20px_rgba(0,0,0,0.4)]">
         <div className="w-full h-1 bg-white/5 mt-4"></div>
      </div>
      
      {/* 人物 - 物理坐标驱动 */}
      <div className="absolute bottom-16 left-12 text-5xl z-30 flex flex-col items-center" 
           style={{ 
             transform: `translateY(${-characterY}px) scaleX(-1) rotate(${!isGrounded ? Math.min(Math.max(-velocityRef.current * 10, -15), 15) : 0}deg)`,
             transition: isGrounded ? 'transform 0.1s' : 'none'
           }}>
        <div className="relative">
          🏃‍♂️
          {!isGrounded && velocityRef.current < 0 && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white/20 animate-pulse text-xs"><i className="fas fa-angles-down"></i></div>}
        </div>
      </div>

      {/* 障碍物 */}
      <div className="absolute bottom-16 w-14 h-14 flex items-center justify-center bg-indigo-900 border-4 border-indigo-700 rounded-xl shadow-xl z-20" style={{ left: `${obstaclePos}%` }}>
         <i className="fas fa-chess-rook text-white text-2xl"></i>
      </div>

      {/* 顶部状态栏 */}
      <div className="absolute top-6 right-8 bg-black/30 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black text-white border border-white/10 shadow-2xl flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        探险进度: {score}/{targetScore}
      </div>

      {gameState === 'countdown' && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-white font-black text-9xl animate-bounce drop-shadow-2xl">{countdown}</div>
        </div>
      )}

      {gameState === 'start' && (
        <div className="absolute inset-0 bg-[#1a2c3a]/70 backdrop-blur-[4px] flex flex-col items-center justify-center text-white z-40">
          <div className="bg-white/10 p-8 rounded-[3rem] border border-white/20 flex flex-col items-center gap-4 hover:bg-white/20 transition-all">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#1a2c3a] text-3xl animate-bounce">
              <i className="fas fa-bolt"></i>
            </div>
            <span className="font-black uppercase tracking-[0.3em] text-xs">点击屏幕 跃过城垣</span>
          </div>
        </div>
      )}

      {gameState === 'end' && score < targetScore && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl flex flex-col items-center justify-center z-[100]">
          <div className="bg-white p-10 rounded-[4rem] shadow-2xl flex flex-col items-center animate-bounce-in max-w-[280px] text-center">
             <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 text-3xl mb-6 border-4 border-rose-100">
                <i className="fas fa-heart-crack"></i>
             </div>
             <h3 className="text-xl font-black text-slate-800 mb-2">哎呀，绊了一跤</h3>
             <p className="text-slate-400 text-xs mb-8">八姐加油！</p>
             <button onClick={(e) => { e.stopPropagation(); setScore(0); setObstaclePos(110); setGameState('start'); setCharacterY(0); velocityRef.current = 0; }} 
                     className="w-full bg-indigo-500 text-white px-10 py-5 rounded-3xl text-sm font-black shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 transition-all">
               重整旗鼓
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const LoveFlight: React.FC<GameProps> = ({ onWin, difficulty }) => {
  const [birdY, setBirdY] = useState(50);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
  const [obstacles, setObstacles] = useState<{ id: number; x: number; gapTop: number }[]>([]);
  const [bgPosFar, setBgPosFar] = useState(0);
  const [bgPosMid, setBgPosMid] = useState(0);
  const [bgPosNear, setBgPosNear] = useState(0);
  const frameRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  
  const gravity = difficulty === 'easy' ? 0.02 : difficulty === 'normal' ? 0.028 : 0.038;
  const gapHeight = difficulty === 'easy' ? 60 : difficulty === 'normal' ? 48 : 40;
  const moveSpeed = difficulty === 'easy' ? 0.3 : difficulty === 'normal' ? 0.5 : 0.7;
  const jumpStrength = -1.0; 
  const scoreToWin = 10;

  const jump = useCallback(() => {
    if (gameState === 'start') {
      setGameState('playing');
      setObstacles([{ id: Date.now(), x: 100, gapTop: 20 + Math.random() * 20 }]);
    }
    if (gameState === 'playing') {
      velocityRef.current = jumpStrength;
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = () => {
      velocityRef.current += gravity;
      setBirdY(y => {
        const next = y + velocityRef.current;
        if (next < -10 || next > 110) { setGameState('end'); return y; }
        return next;
      });

      setBgPosFar(p => (p - moveSpeed * 0.1) % 100);
      setBgPosMid(p => (p - moveSpeed * 0.3) % 100);
      setBgPosNear(p => (p - moveSpeed * 0.6) % 100);

      setObstacles(prev => {
        let next = prev.map(o => ({ ...o, x: o.x - moveSpeed }));
        if (next[0] && next[0].x < -15) {
          next.shift();
          setScore(s => s + 1);
        }
        if (next.length > 0 && next[next.length - 1].x < 50) {
          next.push({ id: Date.now(), x: 100, gapTop: 5 + Math.random() * (95 - gapHeight - 5) });
        }
        
        const birdX = 20; 
        for (let o of next) {
          if (o.x > birdX - 8 && o.x < birdX + 2) {
             if (birdY < o.gapTop + 2 || birdY > o.gapTop + gapHeight - 2) setGameState('end');
          }
        }
        return next;
      });
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState, birdY, moveSpeed, gravity, gapHeight]);

  useEffect(() => {
    if (score >= scoreToWin) {
      setGameState('end');
      onWin();
    }
  }, [score, onWin, scoreToWin]);

  return (
    <div className="relative w-full h-96 bg-[#0f172a] rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden cursor-pointer touch-none" onClick={jump}>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 10%, #1e293b 0%, #0f172a 100%)' }}></div>
      <div className="absolute top-10 w-[300%] h-32 flex items-center opacity-10" style={{ transform: `translateX(${bgPosFar}%)` }}>
          {Array.from({length: 10}).map((_, i) => <i key={i} className="fas fa-cloud text-8xl text-white mx-20"></i>)}
      </div>

      <div className="absolute bottom-12 w-[300%] h-40 flex items-end opacity-20" style={{ transform: `translateX(${bgPosMid}%)` }}>
          {Array.from({length: 8}).map((_, i) => <i key={i} className="fas fa-mountain text-[10rem] text-[#1e293b] mx-10"></i>)}
      </div>

      <div className="absolute bottom-4 w-[300%] h-24 flex items-end opacity-40" style={{ transform: `translateX(${bgPosNear}%)` }}>
          {Array.from({length: 20}).map((_, i) => <i key={i} className={`fas ${i%2===0?'fa-tree':'fa-seedling'} text-7xl text-emerald-900 mx-4`}></i>)}
      </div>

      <div className="absolute bottom-0 w-full h-4 bg-[#0a1a1f]/80 z-20"></div>

      <div className="absolute w-12 h-10 text-4xl z-30 transition-transform duration-100 flex items-center justify-center" 
           style={{ 
             left: '20%', 
             top: `${birdY}%`, 
             // Fix: added scaleX(-1) to flip bird to face right
             transform: `translate(-50%, -50%) rotate(${Math.min(Math.max(velocityRef.current * 20, -25), 45)}deg) scaleX(-1)` 
           }}>
        🕊️
      </div>

      {obstacles.map(o => (
        <React.Fragment key={o.id}>
          <div className="absolute w-16 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 border-x-2 border-white/5 shadow-2xl z-20" 
               style={{ left: `${o.x}%`, top: 0, height: `${o.gapTop}%` }}>
             <div className="absolute bottom-0 w-full h-4 bg-emerald-700 rounded-b-xl"></div>
          </div>
          <div className="absolute w-16 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 border-x-2 border-white/5 shadow-2xl z-20" 
               style={{ left: `${o.x}%`, top: `${o.gapTop + gapHeight}%`, bottom: 0 }}>
             <div className="absolute top-0 w-full h-4 bg-emerald-700 rounded-t-xl"></div>
          </div>
        </React.Fragment>
      ))}

      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black text-emerald-300 border border-emerald-500/20 shadow-xl z-40">
        飞行进度: {score}/{scoreToWin}
      </div>

      {gameState === 'start' && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white z-50">
          <div className="bg-emerald-500/20 p-5 rounded-full border border-emerald-500/30 animate-pulse mb-4">
             <i className="fas fa-dove text-4xl text-emerald-400"></i>
          </div>
          <span className="font-black text-xs tracking-widest uppercase">点击屏幕 密林穿梭</span>
        </div>
      )}

      {gameState === 'end' && score < scoreToWin && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="bg-[#0f172a] p-8 rounded-[3rem] shadow-2xl flex flex-col items-center border-4 border-emerald-900/30 animate-bounce-in">
            <span className="text-emerald-400 font-bold text-lg mb-6 italic">森林太茂密了，八姐要不要再试一次？</span>
            <button onClick={(e) => { e.stopPropagation(); setScore(0); setBirdY(50); setObstacles([]); setGameState('start'); velocityRef.current = 0; }} 
                    className="bg-emerald-600 text-white px-10 py-4 rounded-3xl text-xs font-black shadow-lg">重新起飞</button>
          </div>
        </div>
      )}
    </div>
  );
};
