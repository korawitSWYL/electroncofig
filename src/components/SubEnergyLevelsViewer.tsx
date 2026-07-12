import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import OrbitalViewer, { OrbitalToRender } from './OrbitalViewer';
import { Layers, Info, Play, Pause, Activity, Sparkles, Minus, Plus, RotateCcw, X } from 'lucide-react';

const ALL_SUBSHELLS = [
  { name: '1s', n: 1, type: 's', orbitals: 1, energyOrder: 1, label: '1s', capacity: 2 },
  { name: '2s', n: 2, type: 's', orbitals: 1, energyOrder: 2, label: '2s', capacity: 2 },
  { name: '2p', n: 2, type: 'p', orbitals: 3, energyOrder: 3, label: '2p', capacity: 6 },
  { name: '3s', n: 3, type: 's', orbitals: 1, energyOrder: 4, label: '3s', capacity: 2 },
  { name: '3p', n: 3, type: 'p', orbitals: 3, energyOrder: 5, label: '3p', capacity: 6 },
  { name: '4s', n: 4, type: 's', orbitals: 1, energyOrder: 6, label: '4s', capacity: 2 },
  { name: '3d', n: 3, type: 'd', orbitals: 5, energyOrder: 7, label: '3d', capacity: 10 },
  { name: '4p', n: 4, type: 'p', orbitals: 3, energyOrder: 8, label: '4p', capacity: 6 },
  { name: '5s', n: 5, type: 's', orbitals: 1, energyOrder: 9, label: '5s', capacity: 2 },
  { name: '4d', n: 4, type: 'd', orbitals: 5, energyOrder: 10, label: '4d', capacity: 10 },
  { name: '5p', n: 5, type: 'p', orbitals: 3, energyOrder: 11, label: '5p', capacity: 6 },
  { name: '6s', n: 6, type: 's', orbitals: 1, energyOrder: 12, label: '6s', capacity: 2 },
  { name: '4f', n: 4, type: 'f', orbitals: 7, energyOrder: 13, label: '4f', capacity: 14 },
  { name: '5d', n: 5, type: 'd', orbitals: 5, energyOrder: 14, label: '5d', capacity: 10 },
  { name: '6p', n: 6, type: 'p', orbitals: 3, energyOrder: 15, label: '6p', capacity: 6 },
  { name: '7s', n: 7, type: 's', orbitals: 1, energyOrder: 16, label: '7s', capacity: 2 },
  { name: '5f', n: 5, type: 'f', orbitals: 7, energyOrder: 17, label: '5f', capacity: 14 },
  { name: '6d', n: 6, type: 'd', orbitals: 5, energyOrder: 18, label: '6d', capacity: 10 },
  { name: '7p', n: 7, type: 'p', orbitals: 3, energyOrder: 19, label: '7p', capacity: 6 },
] as const;

const N_COLORS: Record<number, string> = {
  1: '#ef4444', // red-500
  2: '#f97316', // orange-500
  3: '#eab308', // yellow-500
  4: '#22c55e', // green-500
  5: '#3b82f6', // blue-500
  6: '#06b6d4', // cyan-500
  7: '#8b5cf6', // violet-500
};

const BOHR_RADIUS: Record<string, number> = {
  '1s': 35,
  '2s': 75,
  '2p': 88,
  '3s': 130,
  '3p': 143,
  '4s': 185,
  '3d': 198,
  '4p': 211,
  '5s': 240,
  '4d': 253,
  '5p': 266,
  '6s': 295,
  '4f': 308,
  '5d': 321,
  '6p': 334,
  '7s': 355,
  '5f': 368,
  '6d': 381,
  '7p': 394,
};

interface SubEnergyLevelsViewerProps {
  onOpenRulesExplanation: () => void;
}

export default function SubEnergyLevelsViewer({ onOpenRulesExplanation }: SubEnergyLevelsViewerProps) {
  const [activeSubIndex, setActiveSubIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedN, setSelectedN] = useState(1);
  const [manualVisible, setManualVisible] = useState<string[]>(['1s']);
  const [isManual, setIsManual] = useState(false);
  const [subViewMode, setSubViewMode] = useState<'orbital' | 'bohr'>('orbital');
  const [bohrZoom, setBohrZoom] = useState(1.0);
  const [isOrbitalInfoOpen, setIsOrbitalInfoOpen] = useState(false);

  // Sync selectedN with animation if not in manual mode
  useEffect(() => {
    if (!isManual) {
      setSelectedN(ALL_SUBSHELLS[activeSubIndex].n);
    }
  }, [activeSubIndex, isManual]);

  // Animation logic
  useEffect(() => {
    if (!isPlaying) return;
    setIsManual(false);
    const interval = setInterval(() => {
      setActiveSubIndex(prev => {
        if (prev >= ALL_SUBSHELLS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleNChange = (newN: number) => {
    const validN = Math.max(1, Math.min(7, newN));
    setIsPlaying(false);
    setIsManual(true);
    setSelectedN(validN);
    const subsInN = ALL_SUBSHELLS.filter(s => s.n === validN);
    setManualVisible(subsInN.map(s => s.name));
    setActiveSubIndex(ALL_SUBSHELLS.findIndex(s => s.name === subsInN[subsInN.length - 1].name));
  };

  const handleSubshellClick = (subIndex: number, subName: string) => {
    setIsPlaying(false);
    setIsManual(true);
    setActiveSubIndex(subIndex);
    setManualVisible(prev => {
      let next = [...prev];
      if (next.includes(subName)) {
        if (next.length > 1) {
          next = next.filter(n => n !== subName);
        }
      } else {
        next.push(subName);
      }
      return next;
    });
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsManual(false);
      setActiveSubIndex(0);
      setIsPlaying(true);
    }
  };

  const bohrContainerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(bohrZoom);

  // Keep zoomRef updated so that our stable touch handler has access to latest zoom
  useEffect(() => {
    zoomRef.current = bohrZoom;
  }, [bohrZoom]);

  // Wheel and Pinch Gesture Zoom for Bohr Diagram
  useEffect(() => {
    const container = bohrContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.0015;
      setBohrZoom(prev => Math.max(0.4, Math.min(3.0, prev + delta)));
    };

    let initialDistance = 0;
    let initialZoomVal = 1.0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialZoomVal = zoomRef.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        e.preventDefault();
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDistance / initialDistance;
        // Apply sensitivity modifier to make pinch gestures feel buttery smooth
        const sensitiveFactor = Math.pow(factor, 1.2);
        const targetZoom = initialZoomVal * sensitiveFactor;
        setBohrZoom(Math.max(0.4, Math.min(3.0, targetZoom)));
      }
    };

    const handleTouchEnd = () => {
      initialDistance = 0;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleBohrZoomIn = () => setBohrZoom(prev => Math.min(3.0, prev + 0.15));
  const handleBohrZoomOut = () => setBohrZoom(prev => Math.max(0.4, prev - 0.15));
  const handleBohrZoomReset = () => setBohrZoom(1.0);

  const activeSub = ALL_SUBSHELLS[activeSubIndex];
  
  const displayedSubshellNames = isManual 
    ? manualVisible 
    : ALL_SUBSHELLS.slice(0, activeSubIndex + 1).map(s => s.name);

  const orbitalsToRender: OrbitalToRender[] = ALL_SUBSHELLS
    .filter(s => displayedSubshellNames.includes(s.name))
    .map(s => ({
      n: s.n,
      type: s.type,
      name: s.name,
    }));

  return (
    <div className="absolute inset-0 flex flex-col lg:flex-row text-slate-100 p-2 sm:p-3 md:p-4 gap-3 lg:gap-4 z-10 w-full h-full overflow-y-auto lg:overflow-hidden bg-slate-950">
      
      {/* LEFT COLUMN: Consolidated Container with nested cards */}
      <div className="w-full lg:w-auto lg:flex-[2.2] flex flex-col gap-3 lg:gap-4 lg:shrink h-auto lg:h-full relative overflow-visible bg-transparent lg:min-w-0">

        {/* Content Area - Split lg:flex-row on desktop, single column on mobile */}
        <div className="flex-1 flex flex-col lg:flex-row gap-3 lg:gap-4 min-h-0 lg:h-full">
          
          {/* Panel 1: 3D Orbital Model */}
          <div className={`w-full lg:flex-[1] bg-gradient-to-b from-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-white/10 rounded-3xl relative overflow-hidden flex flex-col shrink-0 h-[400px] lg:h-full shadow-xl ${
            subViewMode === 'orbital' ? 'flex' : 'hidden lg:flex'
          }`}>
            {/* MOBILE UNIFIED TABS - INTEGRATED HEADER STYLE */}
            <div className="lg:hidden flex flex-row items-center justify-between gap-2 p-2 pb-1.5 border-b border-white/5 bg-slate-950/20 z-10 shrink-0">
              <div className="flex bg-slate-950/60 p-0.5 rounded-xl border border-white/10 self-start shadow-inner overflow-x-auto scrollbar-none max-w-[calc(100%-100px)]">
                <button
                  type="button"
                  onClick={() => setSubViewMode('orbital')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                    subViewMode === 'orbital'
                      ? 'bg-blue-600 text-white shadow-sm font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  โมเดล 3D
                </button>
                <button
                  type="button"
                  onClick={() => setSubViewMode('bohr')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                    subViewMode === 'bohr'
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  เส้นพลังงาน
                </button>
              </div>

              <button 
                onClick={onOpenRulesExplanation} 
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black px-2.5 py-1.5 rounded-lg text-[10px] transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm shadow-blue-500/5"
                title="คำอธิบาย"
              >
                <Info size={12} className="shrink-0" />
                <span>คำอธิบาย</span>
              </button>
            </div>

            <div className="shrink-0 border-b border-white/5 pb-3 flex flex-col gap-3 px-4 sm:px-5 pt-4 sm:pt-5 lg:bg-slate-950/20">
              {/* Desktop Header Content (Icons/Title) */}
              <div className="flex flex-row items-center justify-between gap-3">
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-blue-400 flex items-center flex-wrap gap-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={16} />
                      โมเดลออร์บิทัล 3 มิติ
                    </span>
                    <button
                      type="button"
                      onClick={onOpenRulesExplanation}
                      className="hidden lg:inline-flex text-blue-400 hover:text-blue-300 font-bold underline underline-offset-2 text-xs transition-all duration-150 cursor-pointer ml-1 normal-case items-center gap-0.5"
                      title="คลิกเพื่อดูคำอธิบายกฎการเรียงระดับพลังงาน"
                    >
                      <Info size={10} />
                      <span>คำอธิบาย</span>
                    </button>
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    จำลองรูปร่าง: <span className="text-white font-bold">{displayedSubshellNames.join(', ')}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePlayToggle}
                    className={`px-2.5 py-1.5 rounded-lg font-black text-[10px] sm:text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg ${
                      isPlaying 
                        ? 'bg-rose-500 hover:bg-rose-400 text-white animate-pulse' 
                        : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                    }`}
                  >
                    {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                    {isPlaying ? 'หยุด' : 'เล่น'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 relative cursor-grab active:cursor-grabbing w-full h-full">
              <OrbitalViewer orbitals={orbitalsToRender} />
            </div>
            
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
          </div>

          {/* Panel 2: Bohr Model Diagram */}
          <div className={`w-full lg:flex-[1.2] bg-gradient-to-b from-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-white/10 rounded-3xl relative overflow-hidden flex flex-col shrink-0 h-[400px] lg:h-full shadow-xl ${
            subViewMode === 'bohr' ? 'flex' : 'hidden lg:flex'
          }`}>
            {/* MOBILE UNIFIED TABS - INTEGRATED HEADER STYLE */}
            <div className="lg:hidden flex flex-row items-center justify-between gap-2 p-2 pb-1.5 border-b border-white/5 bg-slate-950/20 z-10 shrink-0">
              <div className="flex bg-slate-950/60 p-0.5 rounded-xl border border-white/10 self-start shadow-inner overflow-x-auto scrollbar-none max-w-[calc(100%-100px)]">
                <button
                  type="button"
                  onClick={() => setSubViewMode('orbital')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                    subViewMode === 'orbital'
                      ? 'bg-blue-600 text-white shadow-sm font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  โมเดล 3D
                </button>
                <button
                  type="button"
                  onClick={() => setSubViewMode('bohr')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                    subViewMode === 'bohr'
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  เส้นพลังงาน
                </button>
              </div>

              <button 
                onClick={onOpenRulesExplanation} 
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black px-2.5 py-1.5 rounded-lg text-[10px] transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm shadow-blue-500/5"
                title="คำอธิบาย"
              >
                <Info size={12} className="shrink-0" />
                <span>คำอธิบาย</span>
              </button>
            </div>

            <div className="shrink-0 border-b border-white/5 pb-3 flex flex-col gap-3 px-4 sm:px-5 pt-4 sm:pt-5 lg:bg-slate-950/20">
              {/* Desktop Header Content (Icons/Title) */}
              <div className="flex flex-row items-center justify-between gap-3">
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-amber-400 flex items-center flex-wrap gap-1.5">
                    <span className="flex items-center gap-1.5">
                      <Activity size={16} />
                      เส้นระดับพลังงาน
                    </span>
                    <button
                      type="button"
                      onClick={onOpenRulesExplanation}
                      className="hidden lg:inline-flex text-amber-400 hover:text-amber-300 font-bold underline underline-offset-2 text-xs transition-all duration-150 cursor-pointer ml-1 normal-case items-center gap-0.5"
                      title="คลิกเพื่อดูคำอธิบายกฎการเรียงระดับพลังงาน"
                    >
                      <Info size={10} />
                      <span>คำอธิบาย</span>
                    </button>
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    ลำดับพลังงาน: <span className="text-white font-bold">{displayedSubshellNames.join(', ')}</span>
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={handlePlayToggle}
                    className={`px-3 py-1.5 rounded-lg font-black text-[10px] sm:text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg ${
                      isPlaying 
                        ? 'bg-rose-500 hover:bg-rose-400 text-white animate-pulse' 
                        : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                    }`}
                  >
                    {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                    {isPlaying ? 'หยุด' : 'เล่น'}
                  </button>
                </div>
              </div>
            </div>

            {/* SVG Bohr Diagram Container with gesture support */}
            <div ref={bohrContainerRef} className="flex-1 relative w-full h-full flex items-end justify-center overflow-hidden pb-2 cursor-zoom-in group/bohr select-none touch-pan-y px-4 sm:px-5">
              
              <svg viewBox="0 0 840 420" className="w-full max-w-3xl h-full drop-shadow-xl pointer-events-none" preserveAspectRatio="xMidYMax meet">
                <defs>
                  <radialGradient id="nucleusGradientRed" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ff5c5c" />
                    <stop offset="50%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </radialGradient>
                </defs>

                <g style={{ transform: `scale(${bohrZoom})`, transformOrigin: '420px 400px', transition: 'transform 0.1s ease-out' }}>
                  {/* Nucleus */}
                  <circle cx="420" cy="400" r="14" fill="url(#nucleusGradientRed)" />
                  
                  {/* LAYER 1: Render all paths first (guides and active paths) */}
                  {ALL_SUBSHELLS.map((sub) => {
                    const r = BOHR_RADIUS[sub.name];
                    const color = N_COLORS[sub.n];
                    const isFilled = displayedSubshellNames.includes(sub.name);
                    const isCurrent = isFilled;
                    const pathData = `M ${420 - r} 400 A ${r} ${r} 0 0 1 ${420 + r} 400`;
                    
                    return (
                      <g key={`path-${sub.name}`}>
                        {/* Background faint path (guides) */}
                        <path d={pathData} fill="none" stroke={color} strokeWidth="1.5" opacity="0.12" strokeDasharray="3 3" />
                        
                        {/* Filled path */}
                        {isFilled && (
                          <motion.path 
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            d={pathData} 
                            fill="none" 
                            stroke={color} 
                            strokeWidth={isCurrent ? "4" : "2"} 
                            opacity={isCurrent ? "1" : "0.7"}
                            strokeLinecap="round"
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* LAYER 2: Render all text labels on top, so no lines can ever overlap them */}
                  {ALL_SUBSHELLS.map((sub) => {
                    const r = BOHR_RADIUS[sub.name];
                    const color = N_COLORS[sub.n];
                    const isFilled = displayedSubshellNames.includes(sub.name);
                    const isCurrent = isFilled;
                    
                    return (
                      <g key={`text-${sub.name}`}>
                        {isFilled && (
                          <motion.text 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: isCurrent ? 1 : 0.8, y: 0 }}
                            transition={{ delay: 0.1 }}
                            x="420" 
                            y={400 - r - 4} 
                            fill={color} 
                            fontSize="11" 
                            textAnchor="middle" 
                            fontWeight="900"
                            className="drop-shadow-lg select-none pointer-events-none"
                          >
                            {sub.name}<tspan dy="-4" fontSize="8" fontWeight="bold">{sub.capacity}</tspan>
                          </motion.text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>

        </div>

      </div>

      {/* 3. RIGHT COLUMN: Control Panel & Summary UI */}
      <div className="w-full lg:w-auto lg:flex-[1.0] flex flex-col gap-4 lg:overflow-y-auto overflow-y-visible h-auto lg:h-full scrollbar-none pb-6 lg:pb-0 lg:shrink lg:min-w-[315px]">
        
        {/* N Selector Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-xl shrink-0">
          <h2 className="text-sm font-bold text-sky-400 mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
            <Layers size={16} /> เลื่อนดูระดับพลังงานหลัก
          </h2>
          <div className="flex items-center justify-between gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/5 shadow-inner">
            {Array.from({ length: 7 }).map((_, i) => {
              const currentN = i + 1;
              const isSelected = selectedN === currentN;
              const color = N_COLORS[currentN];
              return (
                <button
                  key={currentN}
                  type="button"
                  onClick={() => handleNChange(currentN)}
                  style={{
                    backgroundColor: isSelected ? color : 'transparent',
                    color: isSelected ? '#020617' : '#94a3b8',
                  }}
                  className={`flex-1 h-8 rounded-lg text-xs font-black font-mono transition-all duration-150 cursor-pointer active:scale-90 flex items-center justify-center ${
                    isSelected ? 'shadow-md shadow-slate-950/10' : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {currentN}
                </button>
              );
            })}
          </div>
          
          <div className="mt-5">
            <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 flex-wrap">
                <span>ออร์บิทัลย่อยในชั้น n={selectedN}</span>
                <button
                  type="button"
                  onClick={() => setIsOrbitalInfoOpen(true)}
                  className="lg:hidden text-blue-400 hover:text-blue-300 font-bold underline underline-offset-2 text-[10px] sm:text-xs transition-all duration-150 cursor-pointer ml-1 inline-flex items-center gap-0.5 normal-case"
                  title="คลิกเพื่อดูข้อมูลออร์บิทัลที่เลือกล่าสุด"
                >
                  <Info size={11} />
                  <span>คำอธิบายออร์บิทัลล่าสุด ({activeSub.name})</span>
                </button>
              </span>
            </h3>
            {/* Extremely compact subshell buttons to guarantee rendering in a single line (4 columns grid) */}
            <div className="grid grid-cols-4 gap-1.5">
              {ALL_SUBSHELLS.filter(sub => sub.n === selectedN).map(sub => {
                const subIndex = ALL_SUBSHELLS.findIndex(s => s.name === sub.name);
                const isSelected = displayedSubshellNames.includes(sub.name);
                const color = N_COLORS[sub.n];
                
                return (
                  <button
                    key={sub.name}
                    onClick={() => handleSubshellClick(subIndex, sub.name)}
                    style={{ 
                      borderColor: isSelected ? color : 'transparent',
                      backgroundColor: isSelected ? `${color}20` : undefined
                    }}
                    className={`p-1.5 sm:p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                      isSelected 
                        ? 'shadow-lg border-2' 
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-500 border-white/5'
                    }`}
                  >
                    <span className={`text-xs sm:text-sm font-black font-mono leading-none ${isSelected ? 'text-white' : ''}`}>
                      {sub.name}
                    </span>
                    <span className={`text-[8px] sm:text-[9px] font-bold leading-none ${isSelected ? 'text-white/80' : 'text-slate-600'}`}>
                      {sub.capacity}e⁻
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Subshell Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-500/20 p-5 rounded-3xl shadow-xl shrink-0 hidden lg:flex flex-col">
          <h2 className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
            <Sparkles size={14} /> ข้อมูลออร์บิทัลที่เลือกล่าสุด
          </h2>
          
          <div className="flex items-center justify-between mb-4 mt-2">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl font-mono shadow-md border-2"
                style={{ 
                  color: N_COLORS[activeSub.n],
                  borderColor: N_COLORS[activeSub.n],
                  backgroundColor: `${N_COLORS[activeSub.n]}15`
                }}
              >
                {activeSub.name}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">ความจุสูงสุด</span>
                <span className="text-sm font-black text-white mt-1 block">
                  {activeSub.capacity} e⁻
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-slate-500 block font-bold mb-1">เลขควอนตัมหลัก (n)</span>
              <span className="text-lg font-black text-sky-400 font-mono">{activeSub.n}</span>
            </div>
            
            <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-slate-500 block font-bold mb-1">เลขโมเมนตัมมุม (l)</span>
              <span className="text-lg font-black text-slate-200">
                {activeSub.type === 's' ? 0 : activeSub.type === 'p' ? 1 : activeSub.type === 'd' ? 2 : 3}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Orbital Info Popup Modal */}
      <AnimatePresence>
        {isOrbitalInfoOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col my-auto"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 bg-slate-900/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Sparkles size={14} />
                  </div>
                  <h2 className="text-xs sm:text-sm font-extrabold text-slate-100">
                    ข้อมูลออร์บิทัลที่เลือกล่าสุด
                  </h2>
                </div>
                <button
                  onClick={() => setIsOrbitalInfoOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center justify-center cursor-pointer transition-all"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl font-mono shadow-md border-2"
                      style={{ 
                        color: N_COLORS[activeSub.n],
                        borderColor: N_COLORS[activeSub.n],
                        backgroundColor: `${N_COLORS[activeSub.n]}15`
                      }}
                    >
                      {activeSub.name}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">ความจุสูงสุด</span>
                      <span className="text-sm font-black text-white mt-1 block">
                        {activeSub.capacity} e⁻
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-slate-500 block font-bold mb-1">เลขควอนตัมหลัก (n)</span>
                    <span className="text-lg font-black text-sky-400 font-mono">{activeSub.n}</span>
                  </div>
                  
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-slate-500 block font-bold mb-1">เลขโมเมนตัมมุม (l)</span>
                    <span className="text-lg font-black text-slate-200">
                      {activeSub.type === 's' ? 0 : activeSub.type === 'p' ? 1 : activeSub.type === 'd' ? 2 : 3}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-white/5 bg-slate-900/50 flex justify-end shrink-0">
                <button
                  onClick={() => setIsOrbitalInfoOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-black text-xs cursor-pointer transition-all active:scale-95"
                >
                  ปิด
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}