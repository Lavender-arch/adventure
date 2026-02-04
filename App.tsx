import React, { useState, useEffect, useRef } from 'react';
import { LEVELS, DEFAULT_ACTIVITIES, LOCAL_INSPIRATION_POOL, PRESET_ICONS } from './constants';
import { GameState, ActivityOption, Difficulty } from './types';
import ScratchCard from './components/ScratchCard';
import { HeartCatcher, LoveFlight, TimingGame } from './components/MiniGames';

const PENALTY_OPTIONS = ["一杯奶茶 🧋", "一个小零食 🍪", "一个甜筒 🍦", "一盒切片水果 🍉", "一个可爱的挂件 🧸"];

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const WinCelebration: React.FC<{ active: boolean }> = ({ active }) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number; size: number; rot: number; color: string; icon: string }[]>([]);

  useEffect(() => {
    if (active) {
      const icons = ['fa-star', 'fa-sparkles', 'fa-award', 'fa-thumbs-up'];
      const colors = ['#FFD700', '#60A5FA', '#F472B6', '#FFFFFF', '#FFFACD'];
      const newParticles = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 50,
        delay: Math.random() * 2,
        size: 0.5 + Math.random() * 1.5,
        rot: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        icon: icons[Math.floor(Math.random() * icons.length)]
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 4000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            color: p.color,
            fontSize: `${p.size}rem`,
            animation: `confettiFall 3s linear ${p.delay}s forwards`,
            transform: `rotate(${p.rot}deg)`,
            opacity: 0
          }}
        >
          <i className={`fas ${p.icon} drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]`}></i>
        </div>
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [activityPool, setActivityPool] = useState<ActivityOption[]>(() => {
    const saved = localStorage.getItem('nanjing-adventure-pool');
    return saved ? JSON.parse(saved) : DEFAULT_ACTIVITIES;
  });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [currentPenalty, setCurrentPenalty] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [state, setState] = useState<GameState>({
    currentLevelIdx: 0,
    step: 'intro',
    selectedOptionIdx: null,
    penalties: [],
    itinerary: [],
    difficulty: 'normal',
  });

  useEffect(() => {
    audioRef.current = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"); 
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2;
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, []);

  useEffect(() => {
    localStorage.setItem('nanjing-adventure-pool', JSON.stringify(activityPool));
  }, [activityPool]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleUpdateActivity = (idx: number, field: keyof ActivityOption, value: string) => {
    const newPool = [...activityPool];
    newPool[idx] = { ...newPool[idx], [field]: value };
    setActivityPool(newPool);
  };

  const handleRandomizePool = () => {
    const shuffled = shuffleArray(LOCAL_INSPIRATION_POOL);
    setActivityPool(shuffled.slice(0, 9));
  };

  const currentLevel = {
    ...LEVELS[state.currentLevelIdx],
    optionsPool: activityPool.slice(state.currentLevelIdx * 3, (state.currentLevelIdx * 3) + 3)
  };

  const getLevelCSSBackground = (id: number) => {
    switch(id) {
      case 1: return "bg-gradient-to-br from-indigo-900 via-purple-950 to-black"; 
      case 2: return "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"; 
      case 3: return "bg-gradient-to-br from-emerald-950 via-teal-950 to-black"; 
      default: return "bg-sky-100";
    }
  };

  const startGame = () => {
    if (activityPool.length < 9) {
      alert("请确保锦囊里有 9 个活动项哦！");
      return;
    }
    setIsConfiguring(false);
    setState(prev => ({ ...prev, step: 'intro', currentLevelIdx: 0, itinerary: [], penalties: [] }));
  };

  const handleRestart = () => {
    setState({
      currentLevelIdx: 0,
      step: 'intro',
      selectedOptionIdx: null,
      penalties: [],
      itinerary: [],
      difficulty: 'normal',
    });
  };

  const handleBackToConfig = () => {
    setIsConfiguring(true);
  };

  const handleWin = () => {
    setIsCelebrating(true);
    setTimeout(() => {
      setIsCelebrating(false);
      setState(prev => ({ ...prev, step: 'choosing' }));
    }, 2000);
  };

  const triggerSkip = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const randomPenalty = PENALTY_OPTIONS[Math.floor(Math.random() * PENALTY_OPTIONS.length)];
    setCurrentPenalty(randomPenalty);
    setShowSkipModal(true);
  };

  const confirmSkip = () => {
    setState(prev => ({
      ...prev,
      penalties: [...prev.penalties, `${LEVELS[prev.currentLevelIdx].title}: ${currentPenalty}`],
      itinerary: [...prev.itinerary, "SKIP_MARKER"], 
      step: 'choosing'
    }));
    setShowSkipModal(false);
  };

  const handleSelectOption = (idx: number) => {
    setState(prev => ({ ...prev, selectedOptionIdx: idx }));
  };

  // Fixed error: Corrected typo 'new Itinerary' to 'newItinerary' to properly declare and use the local variable.
  const handleScratchComplete = () => {
    if (state.selectedOptionIdx !== null) {
      const rewardTitle = currentLevel.optionsPool[state.selectedOptionIdx].title;
      setState(prev => {
        const newItinerary = [...prev.itinerary];
        if (newItinerary.length > prev.currentLevelIdx) {
            newItinerary[prev.currentLevelIdx] = rewardTitle;
        } else {
            newItinerary.push(rewardTitle);
        }
        return { 
          ...prev, 
          step: 'scratched',
          itinerary: newItinerary
        };
      });
    }
  };

  const setDifficulty = (diff: Difficulty) => {
    setState(prev => ({ ...prev, difficulty: diff }));
  };

  const nextLevel = () => {
    if (state.currentLevelIdx < LEVELS.length - 1) {
      setState(prev => ({
        ...prev,
        currentLevelIdx: prev.currentLevelIdx + 1,
        step: 'intro',
        selectedOptionIdx: null,
        difficulty: 'normal', 
      }));
    } else setState(prev => ({ ...prev, step: 'finished' }));
  };

  const renderGame = () => {
    const commonProps = { onWin: handleWin, difficulty: state.difficulty };
    switch (LEVELS[state.currentLevelIdx].id) {
      case 1: return <HeartCatcher {...commonProps} />;
      case 2: return <TimingGame {...commonProps} />;
      case 3: return <LoveFlight {...commonProps} />;
      default: return null;
    }
  };

  if (isConfiguring) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-8 bg-[#f0f9ff] overflow-y-auto w-full">
        <main className="w-full max-w-[1100px] bg-white rounded-[3rem] shadow-2xl p-6 sm:p-12 border border-white">
          <div className="mb-10 text-center space-y-4">
            <h2 className="text-3xl font-black text-gray-800">午后行程计划 · 配置锦囊</h2>
            <p className="text-gray-400 text-sm">定制本次旅程的锦囊项，挑战成功后将从中抽取惊喜。</p>
            
            <div className="flex justify-center gap-4">
               <button onClick={handleRandomizePool} className="px-6 py-3 bg-sky-50 text-sky-500 rounded-2xl text-xs font-black border-2 border-sky-100 hover:bg-sky-100 transition-all flex items-center gap-2">
                <i className="fas fa-dice"></i> 随机灵感
              </button>
              <button onClick={() => setActivityPool(DEFAULT_ACTIVITIES)} className="px-6 py-3 bg-gray-50 text-gray-400 rounded-2xl text-xs font-black border-2 border-gray-100 hover:bg-gray-100 transition-all flex items-center gap-2">
                <i className="fas fa-undo"></i> 恢复默认
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {activityPool.map((act, idx) => (
              <div key={idx} className="p-6 bg-white rounded-3xl border-2 border-sky-50 hover:border-sky-200 transition-all shadow-sm hover:shadow-xl relative group flex flex-col">
                <div className="flex justify-between items-center mb-4">
                   <div className="relative group/icon">
                      <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-400 text-xl cursor-pointer hover:bg-sky-500 hover:text-white transition-colors">
                        <i className={`fas ${act.icon || 'fa-star'}`}></i>
                      </div>
                      <div className="absolute top-full left-0 mt-3 bg-white shadow-2xl rounded-2xl p-4 border border-sky-50 z-[100] grid grid-cols-5 gap-2 opacity-0 pointer-events-none group-hover/icon:opacity-100 group-hover/icon:pointer-events-auto transition-opacity max-h-48 overflow-y-auto">
                        {PRESET_ICONS.map(icon => (
                          <button key={icon} onClick={() => handleUpdateActivity(idx, 'icon', icon)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${act.icon === icon ? 'bg-sky-500 text-white' : 'text-gray-300 hover:text-sky-400 hover:bg-sky-50'}`}>
                            <i className={`fas ${icon}`}></i>
                          </button>
                        ))}
                      </div>
                   </div>
                   <span className="text-[10px] font-black text-sky-200 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full">锦囊 {idx + 1}</span>
                </div>
                <div className="space-y-3">
                  <input value={act.title} onChange={(e) => handleUpdateActivity(idx, 'title', e.target.value)} className="w-full text-base font-black border-none focus:ring-0 p-0 text-gray-700 bg-transparent placeholder-gray-300" placeholder="锦囊名称" />
                  <textarea value={act.description} onChange={(e) => handleUpdateActivity(idx, 'description', e.target.value)} className="w-full text-[11px] text-gray-400 bg-transparent border-none focus:ring-0 p-0 resize-none h-16 leading-relaxed placeholder-gray-200" placeholder="简单描述一下吧..." />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button onClick={startGame} className="w-full max-w-2xl py-8 bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-black text-xl rounded-[2.5rem] shadow-xl hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-4 transition-transform">
              <span>配置完成 · 开始挑战</span>
              <i className="fas fa-chevron-right text-sm"></i>
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 bg-[#f0f9ff] w-full">
      <WinCelebration active={isCelebrating} />
      <button onClick={toggleMusic} className="fixed top-6 right-6 z-50 w-12 h-12 bg-white/80 rounded-full shadow-lg flex items-center justify-center text-sky-500"><i className={`fas ${isMusicPlaying ? 'fa-music animate-spin-slow' : 'fa-play'}`}></i></button>

      {showSkipModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border-4 border-sky-100 text-center space-y-6">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto text-sky-500 text-2xl"><i className="fas fa-mug-hot"></i></div>
            <div><h3 className="text-xl font-black text-gray-800 mb-2">触发惊喜补给</h3><p className="text-gray-500 text-sm">跳过这关的话，之后要补偿一份：<br/><span className="text-sky-500 font-bold text-lg mt-2 inline-block bg-sky-50 px-4 py-1 rounded-full">【{currentPenalty}】</span></p></div>
            <div className="flex flex-col gap-3"><button onClick={confirmSkip} className="w-full py-4 bg-sky-500 text-white font-bold rounded-2xl shadow-lg">没问题，直接跳过</button><button onClick={() => setShowSkipModal(false)} className="w-full py-3 bg-gray-50 text-gray-400 font-bold rounded-2xl">我自己来挑战</button></div>
          </div>
        </div>
      )}

      <header className="w-full max-w-2xl text-center mb-8 mt-4 animate-fade-in">
        <h1 className="text-4xl font-cursive text-sky-600 mb-2">八姐的午后大冒险</h1>
        <p className="text-gray-400 flex items-center justify-center gap-2 text-sm font-medium"><span>八姐专属定制</span><i className="fas fa-map-marker-alt"></i></p>
      </header>

      <main className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative border-8 border-white">
        {state.step !== 'finished' ? (
          <>
            <div className={`relative h-64 w-full overflow-hidden ${getLevelCSSBackground(LEVELS[state.currentLevelIdx].id)} transition-all duration-700`}>
              <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
                {Array.from({length: 20}).map((_, i) => (
                  <div key={i} className="absolute text-white/20 animate-float" style={{
                    left: `${Math.random()*100}%`,
                    top: `${Math.random()*100}%`,
                    fontSize: `${Math.random()*2+1}rem`,
                    animationDelay: `${Math.random()*5}s`
                  }}>
                    <i className="fas fa-star"></i>
                  </div>
                ))}
              </div>
              
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div className="w-full flex justify-between items-end">
                  <div>
                    <span className="bg-sky-500 text-white text-[10px] px-3 py-1 rounded-full mb-2 inline-block font-black shadow-lg">STAGE {LEVELS[state.currentLevelIdx].id}</span>
                    <h2 className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight">{LEVELS[state.currentLevelIdx].title}</h2>
                  </div>
                  {state.step === 'playing' && <button onClick={(e) => triggerSkip(e)} className="bg-white/10 text-white text-[10px] px-4 py-2 rounded-full font-bold border border-white/20 backdrop-blur-xl hover:bg-white/20 transition-colors">跳过 ☕</button>}
                </div>
              </div>
            </div>

            <div className="p-8">
              {state.step === 'intro' && (
                <div className="text-center space-y-6 animate-fade-in">
                  <div className="bg-sky-50/50 p-6 rounded-[2.5rem] border-2 border-white shadow-inner relative">
                    <i className="fas fa-quote-left absolute -top-2 -left-2 text-sky-200 text-2xl"></i>
                    <p className="text-gray-600 text-sm italic leading-relaxed">"{LEVELS[state.currentLevelIdx].gameInstructions}"</p>
                    <i className="fas fa-quote-right absolute -bottom-2 -right-2 text-sky-200 text-2xl"></i>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-sky-300 uppercase tracking-widest">选择挑战难度</p>
                    <div className="flex justify-center gap-2">
                      {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
                        <button key={diff} onClick={() => setDifficulty(diff)} className={`px-6 py-2 rounded-full text-[11px] font-black uppercase transition-all ${state.difficulty === diff ? 'bg-sky-500 text-white shadow-lg scale-105' : 'bg-sky-50 text-sky-300 border border-sky-100'}`}>
                          {diff === 'easy' ? '挑战' : diff === 'normal' ? '适中' : '硬核'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4"><button onClick={() => setState(prev => ({ ...prev, step: 'playing' }))} className="w-full py-6 bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-black text-lg rounded-3xl shadow-xl active:scale-95 flex items-center justify-center gap-3"><span>开启挑战</span><i className="fas fa-bolt-lightning"></i></button></div>
                </div>
              )}

              {state.step === 'playing' && <div className="animate-fade-in">{renderGame()}</div>}

              {state.step === 'choosing' && (
                <div className="animate-fade-in space-y-8">
                  <div className="text-center">
                    <div className="inline-block bg-green-50 text-green-500 px-4 py-1 rounded-full text-[11px] font-black mb-2 shadow-sm border border-green-100">{state.penalties.some(p => p.startsWith(LEVELS[state.currentLevelIdx].title)) ? '已跳过 · 记得补给哦! 🎁' : '挑战大成功！✨'}</div>
                    <h3 className="text-xl font-black text-gray-800">
                      {state.selectedOptionIdx === null ? "惊喜锦囊三选一" : "你选择了这个锦囊"}
                    </h3>
                  </div>

                  {state.selectedOptionIdx === null ? (
                    <div className="grid grid-cols-3 gap-4 animate-fade-in">
                      {currentLevel.optionsPool.map((_, idx) => (
                        <button key={idx} onClick={() => handleSelectOption(idx)} className="group relative h-44 rounded-3xl border-4 border-white bg-gray-50 hover:bg-white hover:border-sky-50 transition-all flex flex-col items-center justify-center gap-3 shadow-inner hover:shadow-xl active:scale-95">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-white text-sky-200 group-hover:bg-sky-500 group-hover:text-white group-hover:rotate-12 group-hover:shadow-lg">
                            <i className="fas fa-question text-2xl"></i>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">锦囊 {idx + 1}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 animate-bounce-in space-y-6">
                      <div className="relative">
                        <ScratchCard reward={currentLevel.optionsPool[state.selectedOptionIdx].title} icon={currentLevel.optionsPool[state.selectedOptionIdx].icon} onComplete={handleScratchComplete} />
                      </div>
                      <p className="text-center text-[10px] text-gray-400 font-bold italic animate-pulse">
                        <i className="fas fa-hand-sparkles mr-1"></i> 手指在这里涂抹来刮开惊喜
                      </p>
                    </div>
                  )}
                </div>
              )}

              {state.step === 'scratched' && state.selectedOptionIdx !== null && (
                <div className="animate-fade-in space-y-8 text-center">
                  <div className="bg-gradient-to-br from-white to-sky-50 p-10 rounded-[3.5rem] shadow-xl border-4 border-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><i className="fas fa-star text-9xl"></i></div>
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg transform -rotate-3 border border-sky-50"><i className={`fas ${currentLevel.optionsPool[state.selectedOptionIdx].icon} text-5xl text-sky-500`}></i></div>
                    <h3 className="text-3xl font-black text-gray-800 mb-4 tracking-tighter">{currentLevel.optionsPool[state.selectedOptionIdx].title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed px-2 font-medium">"{currentLevel.optionsPool[state.selectedOptionIdx].description}"</p>
                  </div>
                  <button onClick={nextLevel} className="w-full py-6 bg-sky-600 text-white font-black rounded-3xl shadow-xl active:scale-95 flex items-center justify-center gap-3 transition-transform">
                    <span>{state.currentLevelIdx < LEVELS.length - 1 ? "解锁下一步" : "生成专属探险清单"}</span>
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-8 text-center animate-fade-in overflow-y-auto max-h-[85vh]">
            <div className="w-24 h-24 bg-gradient-to-tr from-sky-500 to-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3 border-4 border-white"><i className="fas fa-scroll text-4xl text-white"></i></div>
            <h2 className="text-4xl font-cursive text-sky-600 mb-8 tracking-wide">专属探险清单</h2>
            
            <div className="space-y-6">
              <div className="text-left bg-white p-6 rounded-[2.5rem] border-4 border-sky-50 shadow-sm">
                <h3 className="text-xs font-black text-sky-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <i className="fas fa-location-dot"></i> 我们的预定旅程
                </h3>
                <ul className="space-y-4">
                  {LEVELS.map((lvl, i) => {
                    const item = state.itinerary[i];
                    const isSkip = item === "SKIP_MARKER";
                    return (
                      <li key={i} className={`flex items-center gap-4 p-5 rounded-3xl border-2 ${isSkip ? 'bg-gray-50 border-gray-100 opacity-50' : 'bg-sky-50/20 border-sky-100/30'}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 ${isSkip ? 'bg-gray-200 text-gray-400' : 'bg-sky-500 text-white shadow-md'}`}>
                          {i + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-sky-300 font-black uppercase tracking-tighter">{lvl.title}</span>
                          <span className={`font-black text-lg ${isSkip ? 'text-gray-300 italic' : 'text-gray-700'}`}>
                            {isSkip ? "这一站选择跳过" : (item || "锦囊未揭晓")}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {state.penalties.length > 0 && (
                <div className="text-left bg-indigo-50/30 p-8 rounded-[3rem] border-4 border-white shadow-inner">
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <i className="fas fa-gift"></i> 待完成的心意补给
                  </h3>
                  <ul className="space-y-4">
                    {state.penalties.map((p, i) => (
                      <li key={i} className="flex justify-between items-center text-sm p-4 bg-white rounded-2xl shadow-sm border border-indigo-100/50">
                        <span className="text-gray-400 text-[11px] font-black leading-tight max-w-[50%]">{p.split(':')[0]}</span>
                        <div className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse"></span>
                           <span className="font-black text-indigo-500">{p.split(':')[1]}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-8 bg-gray-50 rounded-[2.5rem] border-4 border-white shadow-sm relative overflow-hidden">
                <p className="text-gray-500 text-sm leading-relaxed text-left relative z-10 font-medium italic">
                  八姐：<br/><br/>
                  小游戏告一段落啦，之后如果你还想玩的话可以好好做一个小游戏给你玩。
                  现在我们的行程安排已经确定啦。但是不管小游戏里面计划出了什么，只要是和你一起玩感觉都很开心。我们等26号见啦！
                </p>
                <p className="text-right font-black mt-10 text-sky-500 relative z-10">— 探险伙伴留</p>
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-3">
              <button onClick={handleRestart} className="w-full py-6 bg-sky-500 text-white font-black rounded-3xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3">
                <i className="fas fa-repeat"></i> 重新开始
              </button>
              <button onClick={handleBackToConfig} className="w-full py-5 bg-white text-sky-300 font-bold rounded-3xl border-2 border-sky-100 active:scale-95 transition-transform flex items-center justify-center gap-3 text-sm">
                <i className="fas fa-pen-to-square"></i> 修改锦囊池
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 pb-12 text-gray-300 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
         Made for 8 JIE · Adventure Explorer Edition
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.8) translateY(20px); } 50% { opacity: 1; transform: scale(1.02) translateY(-5px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-bounce-in { animation: bounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-20px) rotate(10deg); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default App;