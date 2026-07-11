import React, { useState, useEffect } from 'react';
import { ORBITAL_DEFS, formatOrbitalNameHtml } from './lib/orbitalData';
import OrbitalViewer from './components/OrbitalViewer';
import SubEnergyLevelsViewer from './components/SubEnergyLevelsViewer';
import ApplicationsViewer from './components/ApplicationsViewer';
import EnergyLevelsViewer, { 
  getSpectroscopicNotation, 
  getShorthandNotation, 
  getOccupancies, 
  ELEMENTS_DATA, 
  ELEMENT_MASS_NUMBERS, 
  getIonOccupancies,
  getSpectroscopicFromOccupancies,
  getShorthandFromOccupancies,
  getOccupanciesForStep
} from './components/EnergyLevelsViewer';
import { Atom, Info, Layers, ChevronDown, ChevronUp, Gamepad2, Sparkles, Trophy, RotateCcw, CheckCircle, XCircle, Trash2, ArrowUp, ArrowDown, Zap, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- TABS & ENERGY LEVELS STATE ---
  const [activeTab, setActiveTab] = useState<'orbitals' | 'subshells' | 'energy' | 'applications'>('orbitals');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedShell, setSelectedShell] = useState<number | 'all'>('all');
  const [totalElectronsEnergy, setTotalElectronsEnergy] = useState<number | ''>(8); // Atomic number (Protons, Z)
  const [energyIonCharge, setEnergyIonCharge] = useState(0); // Ion Charge (Q)
  const [energyAnimatingCount, setEnergyAnimatingCount] = useState(8); // Current electrons in animation frame
  const [isEnergyAnimating, setIsEnergyAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(350); // Default 350ms animation delay
  const [isIonExplanationOpen, setIsIonExplanationOpen] = useState(false);
  const [isRulesExplanationOpen, setIsRulesExplanationOpen] = useState(false);
  const [isAcademicInfoOpen, setIsAcademicInfoOpen] = useState(false);

  const zVal = totalElectronsEnergy === '' ? 0 : totalElectronsEnergy;

  useEffect(() => {
    if (!isEnergyAnimating) return;

    const maxSteps = zVal + Math.abs(energyIonCharge);
    if (energyAnimatingCount < maxSteps) {
      const timer = setTimeout(() => {
        setEnergyAnimatingCount(prev => prev + 1);
      }, animationSpeed);
      return () => clearTimeout(timer);
    } else {
      setIsEnergyAnimating(false);
    }
  }, [isEnergyAnimating, energyAnimatingCount, zVal, energyIonCharge, animationSpeed]);

  const startEnergyAnimation = () => {
    setEnergyAnimatingCount(0);
    setIsEnergyAnimating(true);
  };

  const handleEnergyElectronsChange = (val: number | '', chargeVal?: number) => {
    if (val === '') {
      setTotalElectronsEnergy('');
      setEnergyAnimatingCount(0);
      setIsEnergyAnimating(false);
      return;
    }
    const cleanZ = Math.max(0, Math.min(118, val));
    
    // If the atomic number (Z) is changing, reset the ion charge to 0 (neutral atom).
    // Otherwise, use the provided chargeVal, or default to the current charge.
    let cleanCharge = 0;
    if (cleanZ === zVal && chargeVal !== undefined) {
      cleanCharge = chargeVal;
    } else if (cleanZ !== zVal) {
      cleanCharge = 0; // Reset to neutral atom
    } else {
      cleanCharge = energyIonCharge;
    }

    if (cleanZ - cleanCharge < 0) {
      cleanCharge = cleanZ;
    }
    setTotalElectronsEnergy(cleanZ);
    setEnergyIonCharge(cleanCharge);
    setEnergyAnimatingCount(Math.max(0, cleanZ + Math.abs(cleanCharge)));
    setIsEnergyAnimating(false);
  };

  const EN_LEVELS = [
    { name: '3d', boxes: 5, capacity: 10, label: '3d' },
    { name: '4s', boxes: 1, capacity: 2, label: '4s' },
    { name: '3p', boxes: 3, capacity: 6, label: '3p' },
    { name: '3s', boxes: 1, capacity: 2, label: '3s' },
    { name: '2p', boxes: 3, capacity: 6, label: '2p' },
    { name: '2s', boxes: 1, capacity: 2, label: '2s' },
    { name: '1s', boxes: 1, capacity: 2, label: '1s' },
  ];

  const ELEMENTS_30 = [
    { z: 1, symbol: 'H', name: 'Hydrogen (ไฮโดรเจน)' },
    { z: 2, symbol: 'He', name: 'Helium (ฮีเลียม)' },
    { z: 3, symbol: 'Li', name: 'Lithium (ลิเทียม)' },
    { z: 4, symbol: 'Be', name: 'Beryllium (เบริลเลียม)' },
    { z: 5, symbol: 'B', name: 'Boron (โบรอน)' },
    { z: 6, symbol: 'C', name: 'Carbon (คาร์บอน)' },
    { z: 7, symbol: 'N', name: 'Nitrogen (ไนโตรเจน)' },
    { z: 8, symbol: 'O', name: 'Oxygen (ออกซิเจน)' },
    { z: 9, symbol: 'F', name: 'Fluorine (ฟลูออรีน)' },
    { z: 10, symbol: 'Ne', name: 'Neon (นีออน)' },
    { z: 11, symbol: 'Na', name: 'Sodium (โซเดียม)' },
    { z: 12, symbol: 'Mg', name: 'Magnesium (แมกนีเซียม)' },
    { z: 13, symbol: 'Al', name: 'Aluminium (อะลูมิเนียม)' },
    { z: 14, symbol: 'Si', name: 'Silicon (ซิลิคอน)' },
    { z: 15, symbol: 'P', name: 'Phosphorus (ฟอสฟอรัส)' },
    { z: 16, symbol: 'S', name: 'Sulfur (กำมะถัน)' },
    { z: 17, symbol: 'Cl', name: 'Chlorine (คลอรีน)' },
    { z: 18, symbol: 'Ar', name: 'Argon (อาร์กอน)' },
    { z: 19, symbol: 'K', name: 'Potassium (โพแทสเซียม)' },
    { z: 20, symbol: 'Ca', name: 'Calcium (แคลเซียม)' },
    { z: 21, symbol: 'Sc', name: 'Scandium (สแกนเดียม)' },
    { z: 22, symbol: 'Ti', name: 'Titanium (ไทเทเนียม)' },
    { z: 23, symbol: 'V', name: 'Vanadium (วานาเดียม)' },
    { z: 24, symbol: 'Cr', name: 'Chromium (โครเมียม)' },
    { z: 25, symbol: 'Mn', name: 'Manganese (แมงกานีส)' },
    { z: 26, symbol: 'Fe', name: 'Iron (เหล็ก)' },
    { z: 27, symbol: 'Co', name: 'Cobalt (โคบอลต์)' },
    { z: 28, symbol: 'Ni', name: 'Nickel (นิกเกิล)' },
    { z: 29, symbol: 'Cu', name: 'Copper (ทองแดง)' },
    { z: 30, symbol: 'Zn', name: 'Zinc (สังกะสี)' },
  ];

  // --- LEARNING MODE STATE ---
  const [activeType, setActiveType] = useState('s');
  const [activeSubs, setActiveSubs] = useState<string[]>(['s']);
  
  // Collapse state for sub-orbitals & configuration panel
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  // Collapse state for educational info panel
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);

  // Electron configuration filling loop state for Hund's & Pauli demonstration
  const [fillingCount, setFillingCount] = useState(0);

  const numSubsLearn = activeType === 's' ? 1 : ORBITAL_DEFS[activeType].length;

  // Sync filling loop for Hund's & Pauli visual in learning mode
  useEffect(() => {
    setFillingCount(0);
    const interval = setInterval(() => {
      setFillingCount(prev => (prev >= 2 * numSubsLearn ? 0 : prev + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, [activeType, numSubsLearn]);

  // --- GAME MODE (POPUP MODAL) STATE ---
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [gameOrbital, setGameOrbital] = useState('p');
  const [givenElectrons, setGivenElectrons] = useState(4);
  
  // User's interactive placements: Record of suborbital box index to list of placed spin directions
  // Value can contain any number of elements (e.g. ['up', 'down', 'up']) to allow free-form error-prone filling.
  const [gamePlacements, setGamePlacements] = useState<Record<number, ('up' | 'down')[]>>({});
  
  // Currently highlighted suborbital box in game mode (-1 means none selected)
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number>(0);
  
  const [gameSubmitted, setGameSubmitted] = useState(false);
  const [gameFeedback, setGameFeedback] = useState<{ isCorrect: boolean; title: string; message: string } | null>(null);

  // Initialize/Randomize a new game round
  const initGame = (orbitalType: string) => {
    setGameOrbital(orbitalType);
    const subCount = orbitalType === 's' ? 1 : ORBITAL_DEFS[orbitalType].length;
    const maxCapacity = 2 * subCount;
    
    // Quantum Rule: Randomized electron count is ALWAYS <= maximum capacity of that orbital type
    // Randomize between 1 and the maximum capacity
    const randomE = Math.floor(Math.random() * maxCapacity) + 1;
    setGivenElectrons(randomE);

    // Reset placements
    const initialPlacements: Record<number, ('up' | 'down')[]> = {};
    for (let i = 0; i < subCount; i++) {
      initialPlacements[i] = [];
    }
    setGamePlacements(initialPlacements);
    setSelectedBoxIndex(0); // Focus on the first box by default
    setGameSubmitted(false);
    setGameFeedback(null);
  };

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    setActiveSubs(ORBITAL_DEFS[type].map(orb => orb.name));
  };

  const handleSubToggle = (subName: string) => {
    setActiveSubs(prev => {
      const next = prev.includes(subName)
        ? prev.filter(name => name !== subName)
        : [...prev, subName];
      return next;
    });
  };

  const selectAllSubs = () => {
    if (activeType === 's') return;
    setActiveSubs(ORBITAL_DEFS[activeType].map(orb => orb.name));
  };

  const deselectAllSubs = () => {
    setActiveSubs([]);
  };

  const currentCapacity = activeType === 's' ? 2 : activeSubs.length * 2;

  // Thai labels for educational overview
  const orbitalDescriptions: Record<string, string> = {
    s: 's-orbital มีรูปทรงกลมสมมาตรสมบูรณ์แบบ มีระดับพลังงานต่ำที่สุดในแต่ละคาบ บรรจุอิเล็กตรอนได้สูงสุด 2 ตัว',
    p: 'p-orbitals มีรูปทรงดัมเบลคู่ (Dumbbell) แยกออกตามแกน 3 มิติ (x, y, z) บรรจุอิเล็กตรอนได้สูงสุด 6 ตัว',
    d: 'd-orbitals มีรูปทรงซับซ้อน มักคล้ายใบโคลเวอร์ 4 แฉก (Cloverleaf) มี 5 ออร์บิทัลย่อย บรรจุได้สูงสุด 10 ตัว',
    f: 'f-orbitals มีรูปทรงซับซ้อนระดับสูง มีขั้วพูถึง 8 แฉก มี 7 ออร์บิทัลย่อย บรรจุได้สูงสุด 14 ตัว'
  };

  // Game Control Functions
  const addSpinToSelectedBox = (spin: 'up' | 'down') => {
    if (gameSubmitted || selectedBoxIndex === -1) return;
    setGamePlacements(prev => {
      const currentSpins = prev[selectedBoxIndex] || [];
      return {
        ...prev,
        [selectedBoxIndex]: [...currentSpins, spin]
      };
    });
  };

  const removeLastSpinFromSelectedBox = () => {
    if (gameSubmitted || selectedBoxIndex === -1) return;
    setGamePlacements(prev => {
      const currentSpins = prev[selectedBoxIndex] || [];
      if (currentSpins.length === 0) return prev;
      return {
        ...prev,
        [selectedBoxIndex]: currentSpins.slice(0, -1)
      };
    });
  };

  const clearAllPlacementsInGame = () => {
    if (gameSubmitted) return;
    const subCount = gameOrbital === 's' ? 1 : ORBITAL_DEFS[gameOrbital].length;
    const resetPlacements: Record<number, ('up' | 'down')[]> = {};
    for (let i = 0; i < subCount; i++) {
      resetPlacements[i] = [];
    }
    setGamePlacements(resetPlacements);
    setGameFeedback(null);
  };

  // Strict physics verification of electron configurations
  const verifyGameAnswer = () => {
    const M = gameOrbital === 's' ? 1 : ORBITAL_DEFS[gameOrbital].length;
    
    // Total electrons placed across all boxes
    let totalPlaced = 0;
    const boxDetails: { upCount: number; downCount: number; total: number; spins: ('up' | 'down')[] }[] = [];

    for (let i = 0; i < M; i++) {
      const spins = gamePlacements[i] || [];
      const upCount = spins.filter(s => s === 'up').length;
      const downCount = spins.filter(s => s === 'down').length;
      totalPlaced += spins.length;
      boxDetails.push({ upCount, downCount, total: spins.length, spins });
    }

    // 1. Electron count check
    if (totalPlaced !== givenElectrons) {
      setGameFeedback({
        isCorrect: false,
        title: 'จำนวนอิเล็กตรอนไม่ถูกต้อง!',
        message: `โจทย์มอบหมายให้บรรจุอิเล็กตรอนทั้งหมด ${givenElectrons} ตัว แต่คุณบรรจุไปทั้งสิ้น ${totalPlaced} ตัว กรุณาตรวจสอบและปรับแต่งให้ครบถ้วน`
      });
      setGameSubmitted(true);
      return;
    }

    // 2. Pauli Exclusion Principle Check
    // - Maximum of 2 electrons per suborbital
    for (let i = 0; i < M; i++) {
      const details = boxDetails[i];
      if (details.total > 2) {
        setGameFeedback({
          isCorrect: false,
          title: 'ผิดหลักการกีดกันของเพาลี (Pauli Principle)!',
          message: `ในออร์บิทัลย่อยที่ ${i + 1} มีอิเล็กตรอนบรรจุอยู่มากเกินไป (${details.total} ตัว) ซึ่งในความจริงออร์บิทัลย่อยหนึ่งๆ จะยอมรับอิเล็กตรอนได้สูงสุดเพียง 2 ตัวเท่านั้น!`
        });
        setGameSubmitted(true);
        return;
      }
    }

    // 3. Strict Hund's Rule & Pauli Exclusion sequential checking
    // - Every singly occupied suborbital must contain EXACTLY one 'up' spin (↿).
    // - Only when all available suborbitals contain one 'up' spin (↿), 
    //   can we begin pairing them with 'down' spins (⇂) sequentially from left to right.
    const doubleLimit = givenElectrons > M ? givenElectrons - M : 0;
    const singleLimit = Math.min(givenElectrons, M);

    for (let i = 0; i < M; i++) {
      const spins = boxDetails[i].spins;
      const len = spins.length;

      if (i < doubleLimit) {
        // This box must be doubly occupied: ['up', 'down']
        if (len !== 2) {
          setGameFeedback({
            isCorrect: false,
            title: 'ผิดกฎของฮุนด์ (Hund\'s Rule) - การจับคู่สลับตำแหน่ง!',
            message: `สำหรับอิเล็กตรอน ${givenElectrons} ตัว ช่องที่ 1 ถึงช่องที่ ${doubleLimit} จะต้องได้รับการจับคู่จนครบ 2 ตัวเรียงกันตามลำดับจากซ้ายไปขวาเสียก่อน ช่องถัดๆ ไปจึงจะเป็นอิเล็กตรอนเดี่ยวที่เหลืออยู่`
          });
          setGameSubmitted(true);
          return;
        }
        if (spins[0] !== 'up' || spins[1] !== 'down') {
          setGameFeedback({
            isCorrect: false,
            title: 'ผิดหลักการบรรจุอิเล็กตรอนเดี่ยวก่อนจับคู่!',
            message: `ในออร์บิทัลย่อยที่ ${i + 1} ลำดับหรือทิศทางของสปินผิดพลาด! คุณต้องบรรจุอิเล็กตรอนเดี่ยวสปินขึ้น (↿) ในทุกห้องให้เต็มทั้งหมดก่อน แล้วจึงย้อนกลับมาบรรจุสปินลง (⇂) เพื่อเข้าคู่จากซ้ายไปขวา`
          });
          setGameSubmitted(true);
          return;
        }
      } else if (i < singleLimit) {
        // This box must be singly occupied: ['up']
        if (len !== 1) {
          setGameFeedback({
            isCorrect: false,
            title: 'ผิดกฎของฮุนด์ (Hund\'s Rule) - ข้ามช่องบรรจุ!',
            message: `คุณบรรจุอิเล็กตรอนข้ามช่อง หรือมีบางช่องเว้นว่างไว้สับสน! ตามหลักการ คุณต้องเริ่มบรรจุอิเล็กตรอนเดี่ยวทีละช่องไล่เรียงกันไปจากซ้ายไปขวา (ช่องที่ 1 ถึงช่องที่ ${singleLimit}) โดยห้ามข้ามช่องเป็นอันขาด`
          });
          setGameSubmitted(true);
          return;
        }
        if (spins[0] !== 'up') {
          setGameFeedback({
            isCorrect: false,
            title: 'ผิดทิศทางสปินเริ่มต้น (สปินเดี่ยวต้องชี้ขึ้น)!',
            message: `ในออร์บิทัลย่อยที่ ${i + 1} คุณบรรจุด้วยสปินลง (⇂) ซึ่งตามกฎฟิสิกส์คลาสสิกและสัญนิยมควอนตัม อิเล็กตรอนเดี่ยวตัวแรกที่เข้าสู่ออร์บิทัลย่อยในแต่ละห้องต้องมีทิศสปินขึ้น (↿) ก่อนเสมอ เพื่อรักษาสถานะพลังงานที่เสถียรที่สุด`
          });
          setGameSubmitted(true);
          return;
        }
      } else {
        // This box must be empty: []
        if (len !== 0) {
          setGameFeedback({
            isCorrect: false,
            title: 'ผิดกฎของฮุนด์ (Hund\'s Rule) - ลำดับการบรรจุคลาดเคลื่อน!',
            message: `ออร์บิทัลย่อยที่ ${i + 1} ต้องเว้นว่างไว้ เนื่องจากมีจำนวนอิเล็กตรอนที่ต้องจัดเรียงเพียง ${givenElectrons} ตัว ซึ่งควรบรรจุเรียงเดี่ยวในช่องแรกๆ ให้เป็นระเบียบสมบูรณ์`
          });
          setGameSubmitted(true);
          return;
        }
      }
    }

    // If all tests passed successfully!
    setGameFeedback({
      isCorrect: true,
      title: 'ถูกต้องและเข้มงวดตามหลักฟิสิกส์สูงสุด! 🎉',
      message: `คุณจัดเรียงอิเล็กตรอนจำนวน ${givenElectrons} ตัวลงใน ${gameOrbital.toUpperCase()}-Orbital ได้อย่างสมบูรณ์ไร้ที่ติ สอดคล้องตามหลักการกีดกันของเพาลี และกฎของฮุนด์อย่างถูกต้อง 100% (บรรจุสปินขึ้นเดี่ยวเต็มทุกช่องก่อน แล้วเวียนกลับมาบรรจุคู่สปินลงอย่างถูกต้อง!)`
    });
    setGameSubmitted(true);
  };

  // Helper to count currently placed spins
  const getGamePlacedCount = () => {
    let count = 0;
    const M = gameOrbital === 's' ? 1 : ORBITAL_DEFS[gameOrbital].length;
    for (let i = 0; i < M; i++) {
      count += (gamePlacements[i] || []).length;
    }
    return count;
  };

  const gamePlacedCount = getGamePlacedCount();

  return (
    <div className="min-h-screen lg:h-screen w-screen bg-slate-950 text-slate-100 font-sans select-none flex flex-col lg:overflow-hidden">
      
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 shadow-md shrink-0">
        <div className="max-w-[92rem] mx-auto px-4 md:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-4">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
            <div className="bg-gradient-to-tr from-amber-400 to-orange-500 p-1.5 sm:p-2 rounded-xl text-slate-950 shadow-md shrink-0">
              <Atom size={20} className="animate-spin-slow sm:w-[24px] sm:h-[24px]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent truncate">
                Atomic Electron Configuration
              </h1>
              <p className="text-[9px] sm:text-xs text-slate-400 font-light truncate">
                จำลองการจัดเรียงอิเล็กตรอนเสมือนจริง
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold py-1">
            <button
              onClick={() => {
                setActiveTab('orbitals');
                setIsMobileMenuOpen(false);
              }}
              className={`pb-1 border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === 'orbitals' ? 'border-blue-400 text-blue-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              รู้จักออร์บิทัล
            </button>
            <button
              onClick={() => {
                setActiveTab('subshells');
                setIsMobileMenuOpen(false);
              }}
              className={`pb-1 border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === 'subshells' ? 'border-blue-400 text-blue-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              ระดับพลังงานย่อย
            </button>
            <button
              onClick={() => {
                setActiveTab('energy');
                setIsMobileMenuOpen(false);
              }}
              className={`pb-1 border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === 'energy' ? 'border-blue-400 text-blue-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              การจัดเรียงอิเล็กตรอน
            </button>
            <button
              onClick={() => {
                setActiveTab('applications');
                setIsMobileMenuOpen(false);
              }}
              className={`pb-1 border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === 'applications' ? 'border-blue-400 text-blue-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              การประยุกต์ใช้
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-white/5 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu with Slide-down / Fade animation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 z-[60] md:hidden border-b border-white/10 bg-slate-900/95 backdrop-blur-md px-4 py-3 space-y-2 flex flex-col overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => {
                  setActiveTab('orbitals');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  activeTab === 'orbitals' 
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                รู้จักออร์บิทัล
              </button>
              <button
                onClick={() => {
                  setActiveTab('subshells');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  activeTab === 'subshells' 
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                ระดับพลังงานย่อย
              </button>
              <button
                onClick={() => {
                  setActiveTab('energy');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  activeTab === 'energy' 
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                การจัดเรียงอิเล็กตรอน
              </button>
              <button
                onClick={() => {
                  setActiveTab('applications');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  activeTab === 'applications' 
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                การประยุกต์ใช้
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. MAIN LEARNING ENVIRONMENT DISPLAY */}
      <main className="flex-1 w-full max-w-[98rem] xl:max-w-[104rem] mx-auto p-2 sm:p-3 md:p-4 lg:px-5 xl:px-6 flex flex-col lg:flex-row gap-3 md:gap-4 min-h-0 overflow-y-auto lg:overflow-hidden relative">
        
        {/* Left Side: Gorgeous 3D Probability Cloud Canvas / Energy Levels Bohr Model */}
        {activeTab === 'subshells' ? (
          <SubEnergyLevelsViewer onOpenRulesExplanation={() => setIsRulesExplanationOpen(true)} />
        ) : activeTab === 'applications' ? (
          <ApplicationsViewer />
        ) : (
          <section className="w-full sticky lg:relative top-0 lg:top-0 z-30 lg:h-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col shrink-0 transition-all duration-300 h-[380px] sm:h-[480px] lg:flex-1 lg:flex-[1.6]">
            {activeTab === 'orbitals' ? (
              <>
                <div className="absolute inset-0 z-0">
                  <OrbitalViewer 
                    orbitals={[{ n: 3, type: activeType, name: `3${activeType}`, activeDegenerateNames: activeSubs }]}
                  />
                </div>

                {/* Depth Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none z-10" />

                {/* Orbital s/p/d/f buttons in top-left corner */}
                <div className="absolute top-4 left-4 z-20 bg-slate-950/90 backdrop-blur-md p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-white/10 shadow-lg flex gap-1">
                  {['s', 'p', 'd', 'f'].map(type => {
                    const isSelected = activeType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => handleTypeChange(type)}
                        className={`px-3 py-1.5 md:w-9 md:h-9 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs transition-all duration-200 flex items-center justify-center cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>

                {/* Sub-orbitals selector at the bottom */}
                <div className="absolute bottom-4 left-2 right-2 z-20 flex justify-center">
                  <div className="bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg flex flex-row flex-nowrap gap-1 max-w-full overflow-x-auto scrollbar-none justify-start md:justify-center">
                    {ORBITAL_DEFS[activeType].map(orb => {
                      const isChecked = activeSubs.includes(orb.name);
                      const isF = activeType === 'f';
                      const isD = activeType === 'd';
                      const btnPadding = isF ? 'px-2 sm:px-3 py-1 sm:py-1.5' : isD ? 'px-2 sm:px-3.5 py-1.5' : 'px-3 sm:px-4 py-2';
                      const btnText = isF ? 'text-[9px] sm:text-xs' : 'text-[10px] sm:text-xs';
                      
                      return (
                        <button
                          key={orb.name}
                          onClick={() => {
                            handleSubToggle(orb.name);
                          }}
                          className={`rounded-xl border font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 select-none cursor-pointer whitespace-nowrap ${btnPadding} ${btnText} ${
                            isChecked 
                              ? 'border-blue-500 bg-blue-500/20 text-white font-black' 
                              : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/10 hover:text-slate-200'
                          }`}
                        >
                          <span 
                            className="w-2 h-2 rounded-full shadow-lg shrink-0"
                            style={{ backgroundColor: `#${orb.color.toString(16).padStart(6, '0')}` }} 
                          />
                          <span dangerouslySetInnerHTML={{ __html: formatOrbitalNameHtml(orb.displayName) }} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Game Launcher Button INSIDE the Canvas Frame (as requested: "ปุ่มเล่นเกมส์ท้ายทาให้มาอยู่ในกรอบแสดงผลเหมือนเดิมนะ") */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="p-1 md:p-0 rounded-xl bg-slate-950/90 md:bg-transparent backdrop-blur md:backdrop-blur-none border border-white/10 md:border-none shadow-lg md:shadow-none flex items-center justify-center">
                    <button 
                      onClick={() => {
                        initGame('p');
                        setIsGameOpen(true);
                      }}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black px-3 py-1.5 md:h-12 md:w-12 rounded-lg md:rounded-2xl shadow-lg shadow-orange-500/10 md:shadow-orange-500/30 flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer border border-amber-300/20 text-[10px] md:text-base"
                    >
                      <Gamepad2 size={12} className="md:hidden shrink-0 mr-1 animate-bounce" />
                      <Gamepad2 size={20} className="hidden md:block shrink-0 animate-bounce" />
                      <span className="md:hidden text-[10px] font-black">คำถาม</span>
                    </button>
                  </div>
                </div>
              </>
            ) : activeTab === 'energy' ? (
              <div className="absolute inset-0 z-10">
                <EnergyLevelsViewer 
                  selectedShell={selectedShell} 
                  electronCount={zVal}
                  animatingCount={energyAnimatingCount}
                  charge={energyIonCharge}
                  isEnergyAnimating={isEnergyAnimating}
                  startEnergyAnimation={startEnergyAnimation}
                  animationSpeed={animationSpeed}
                  setAnimationSpeed={setAnimationSpeed}
                />
              </div>
            ) : (
              // Tab 'config' or others can also show OrbitalViewer or some beautiful fallback
              <>
                <div className="absolute inset-0 z-0">
                  <OrbitalViewer 
                    orbitals={[{ n: 3, type: activeType, name: `3${activeType}`, activeDegenerateNames: activeSubs }]}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none z-10" />
              </>
            )}
          </section>
        )}

        {/* Right Side: Learn Control Center with Independent Scrolling on Desktop */}
        {activeTab !== 'subshells' && activeTab !== 'applications' && (
          <aside className="w-full lg:w-96 flex flex-col gap-4 shrink-0 lg:h-full lg:overflow-y-auto pb-6 lg:pb-0 pr-0 lg:pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            
            {/* TAB 1: รู้จักออร์บิทัล (ORBITALS) */}
            {activeTab === 'orbitals' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              {/* Hund's Rule filling demo */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-xl shrink-0">
                <h2 className="text-xs sm:text-sm font-bold text-slate-300 mb-3 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Layers size={15} className="text-blue-400 shrink-0" />
                    <span>การบรรจุอิเล็กตรอนลงในออร์บิทัล:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAcademicInfoOpen(true)}
                    className="lg:hidden text-amber-400 hover:text-amber-300 font-bold underline underline-offset-2 text-[10px] sm:text-xs transition-all duration-150 cursor-pointer inline-flex items-center gap-0.5 normal-case"
                    title="คลิกเพื่อดูคำอธิบายวิชาการและกฎการจัดเรียง"
                  >
                    <Info size={11} />
                    <span>คำอธิบาย</span>
                  </button>
                </h2>
 
                <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-3.5 flex flex-col items-center">
                  <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase mb-2.5 flex items-center gap-1.5">
                    <Sparkles size={12} />
                    การบรรจุเรียงตามลำดับกฎธรรมชาติ
                  </span>
 
                  {/* Boxes */}
                  <div className="flex gap-1.5 justify-center my-1.5 flex-nowrap w-full overflow-x-auto scrollbar-none">
                    {Array.from({ length: numSubsLearn }).map((_, i) => {
                      const hasUp = fillingCount > i;
                      const hasDown = fillingCount > numSubsLearn + i;
                      const isFType = activeType === 'f';
                      const isDType = activeType === 'd';
                      
                      const boxClass = isFType 
                        ? 'w-7 h-9 text-xs gap-0.5' 
                        : isDType 
                          ? 'w-8 h-10 text-sm gap-0.5' 
                          : 'w-9 h-11 text-base gap-1';
                      
                      const labelClass = isFType ? 'text-[7px] bottom-[1px]' : 'text-[8px] bottom-[2px]';

                      return (
                        <div 
                          key={i} 
                          className={`rounded-lg border-2 flex items-center justify-center relative font-mono font-black transition-all duration-300 shrink-0 ${boxClass} ${
                            hasDown 
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-inner' 
                              : hasUp 
                                ? 'border-blue-400 bg-blue-500/10 text-blue-300 shadow-inner' 
                                : 'border-white/10 bg-slate-900/40 text-slate-600'
                          }`}
                        >
                          <span className={`transition-all duration-300 transform ${hasUp ? 'opacity-100 translate-y-0 scale-110' : 'opacity-0 -translate-y-2 scale-50'}`}>
                            ↿
                          </span>
                          <span className={`transition-all duration-300 transform ${hasDown ? 'opacity-100 translate-y-0 scale-110' : 'opacity-0 translate-y-2 scale-50'}`}>
                            ⇂
                          </span>
                          <span className={`absolute text-slate-400/50 font-normal ${labelClass}`}>
                            {activeType}{i+1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
 
                  {/* Info text */}
                  <div className="text-[11px] text-center mt-2.5 font-medium min-h-[36px] flex items-center justify-center px-1 leading-relaxed">
                    {fillingCount === 0 && (
                      <span className="text-slate-400 animate-pulse">
                        เตรียมบรรจุอิเล็กตรอน...
                      </span>
                    )}
                    {fillingCount > 0 && fillingCount <= numSubsLearn && (
                      <span className="text-blue-300">
                        บรรจุสปินเดี่ยวขนาน ↿ ตาม <span className="text-blue-400 font-bold">กฎของฮุนด์</span> (ห้องละ 1 ตัว)
                      </span>
                    )}
                    {fillingCount > numSubsLearn && fillingCount < 2 * numSubsLearn && (
                      <span className="text-amber-300">
                        บรรจุสปินคู่ตรงข้าม ⇂ ตาม <span className="text-amber-400 font-bold">หลักกีดกันของเพาลี</span>
                      </span>
                    )}
                    {fillingCount === 2 * numSubsLearn && (
                      <span className="text-emerald-400 font-semibold animate-pulse">
                        บรรจุสมบูรณ์เต็มพิกัดความจุ!
                      </span>
                    )}
                  </div>
                </div>
              </div>
 
              {/* Step 4: Theoretical knowledge */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-xl shrink-0 hidden lg:flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Info size={14} className="text-amber-400" />
                  <span>ข้อมูลวิชาการและกฎการจัดเรียง</span>
                </h3>
                <p className="text-xs text-slate-200 font-medium bg-white/5 p-3 rounded-2xl leading-relaxed">
                  {orbitalDescriptions[activeType]}
                </p>
                <div className="flex flex-col gap-2 border-t border-white/5 pt-2 text-[11px] leading-relaxed">
                  <p className="text-slate-300">
                    <strong className="text-blue-300">กฎของฮุนด์ (Hund's Rule):</strong> ต้องบรรจุแบบอิเล็กตรอนเดี่ยวที่มีทิศสปินขนานเดียวกัน (สปินขึ้น ↿) ไปทีละห้องจนครบทุกช่องก่อน แล้วจึงย้อนมาจับคู่บรรจุแบบสปินคู่ตรงข้าม (สปินลง ⇂)
                  </p>
                  <p className="text-slate-300">
                    <strong className="text-amber-300">หลักการกีดกันของเพาลี (Pauli Exclusion Principle):</strong> ไม่มีอิเล็กตรอนสองตัวใดๆ ในออร์บิทัลย่อยเดียวกันที่มีเลขควอนตัมเหมือนกันทั้งหมด ส่งผลให้อิเล็กตรอนที่อยู่ในกล่องเดียวกันต้องมีทิศทางสปินสวนทางตรงข้ามกันเสมอ (↿ และ ⇂)
                  </p>
                  <p className="text-slate-400">
                    💡 <span className="text-amber-300 font-semibold">ตรรกะแบบจำลอง 3D:</span> ระบบจำลองของเราแยกการเคลื่อนที่ของอิเล็กตรอนที่มีทิศสปินขึ้น/ลง ให้อยู่คนละซีกขั้วสมมาตร (Lobe A และ Lobe B) เพื่อความถูกต้องทางทัศนศาสตร์ฟิสิกส์
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: การจัดเรียงอิเล็กตรอน (ELECTRON CONFIGURATION) */}
          {activeTab === 'energy' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2.5"
            >
              {/* 1. Interactive Electron Arranger Control Card */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-lg shrink-0">
                <h2 className="text-xs font-black text-amber-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>ระบุเลขอะตอมเพื่อจัดเรียงอิเล็กตรอน</span>
                </h2>

                {/* Number Input with +/- buttons to save space */}
                <div className="flex items-center gap-2 mb-2 bg-slate-950/60 p-1.5 rounded-2xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => handleEnergyElectronsChange(zVal - 1)}
                    disabled={zVal <= 0}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300 font-bold transition cursor-pointer"
                  >
                    -
                  </button>
                  
                  <div className="flex-1 text-center">
                    <input
                      type="number"
                      value={totalElectronsEnergy}
                      onChange={(e) => handleEnergyElectronsChange(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                      min="0"
                      max="118"
                      className="w-full bg-transparent text-center text-sm font-black font-mono text-white focus:outline-none border-b border-transparent focus:border-amber-400/50"
                    />
                    <span className="text-[9px] text-slate-500 font-bold">เลขอะตอม / จำนวนโปรตอน (Z)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEnergyElectronsChange(zVal + 1)}
                    disabled={zVal >= 118}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300 font-bold transition cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Compact element presets - perfect for narrow screens! */}
                <div className="mb-2">
                  <span className="text-[9px] text-slate-400 font-black block mb-1 uppercase tracking-wider">
                    เลือกธาตุตัวอย่าง:
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { z: 1, sym: 'H' },
                      { z: 6, sym: 'C' },
                      { z: 8, sym: 'O' },
                      { z: 11, sym: 'Na' },
                      { z: 17, sym: 'Cl' },
                      { z: 20, sym: 'Ca' },
                      { z: 26, sym: 'Fe' },
                      { z: 29, sym: 'Cu' }
                    ].map((p) => (
                      <button
                        key={p.z}
                        onClick={() => handleEnergyElectronsChange(p.z, 0)}
                        className={`py-1 px-1 rounded-lg text-[10px] font-mono font-bold border transition duration-150 cursor-pointer ${
                          zVal === p.z && energyIonCharge === 0
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-950/40 text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-200'
                        }`}
                      >
                        {p.sym} ({p.z})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Ion Charge Buttons */}
                <div className="border-t border-white/5 pt-2">
                  <div className="text-[9px] text-slate-400 font-black block mb-1.5 uppercase tracking-wider flex justify-between items-center">
                    <span className="flex items-center flex-wrap gap-1">
                      <span>ประจุของไอออน:</span>
                      <button
                        type="button"
                        onClick={() => setIsIonExplanationOpen(true)}
                        className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-2 transition-all duration-150 cursor-pointer ml-1 normal-case inline-flex items-center gap-0.5"
                        title="คลิกเพื่อดูคำอธิบาย"
                      >
                        <Info size={10} />
                        <span>คำอธิบาย</span>
                      </button>
                    </span>
                    {energyIonCharge !== 0 && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${energyIonCharge > 0 ? 'bg-blue-500/10 text-blue-300' : 'bg-rose-500/10 text-rose-300'}`}>
                        {energyIonCharge > 0 ? `สูญเสีย e⁻ (ไอออนบวก)` : `ได้รับ e⁻ (ไอออนลบ)`}
                      </span>
                    )}
                  </div>
                  <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-white/5 gap-1 shadow-inner">
                    <div className="flex-1 grid grid-cols-3 gap-0.5">
                      {[-3, -2, -1].map(c => (
                        <button
                          key={c}
                          onClick={() => handleEnergyElectronsChange(zVal, c)}
                          className={`py-1 rounded-lg text-[10px] font-mono font-bold transition duration-150 cursor-pointer ${
                            energyIonCharge === c
                              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10'
                              : 'text-rose-400/80 hover:text-rose-300 hover:bg-white/5'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handleEnergyElectronsChange(zVal, 0)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition duration-150 cursor-pointer ${
                        energyIonCharge === 0
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      0 (กลาง)
                    </button>
                    <div className="flex-1 grid grid-cols-3 gap-0.5">
                      {[1, 2, 3].map(c => (
                        <button
                          key={c}
                          onClick={() => handleEnergyElectronsChange(zVal, c)}
                          className={`py-1 rounded-lg text-[10px] font-mono font-bold transition duration-150 cursor-pointer ${
                            energyIonCharge === c
                              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/10'
                              : 'text-blue-400/80 hover:text-blue-300 hover:bg-white/5'
                          }`}
                        >
                          +{c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Configuration Output Notation Card */}
              {(() => {
                const maxSteps = zVal + Math.abs(energyIonCharge);
                const isAnimationFinished = energyAnimatingCount >= maxSteps;
                const activeOccupancies = isAnimationFinished
                  ? getIonOccupancies(zVal, energyIonCharge)
                  : getOccupanciesForStep(zVal, energyIonCharge, energyAnimatingCount);

                return (
                  <div className="hidden md:flex bg-slate-900/80 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-lg shrink-0 flex-col gap-2">
                    <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                      <Info size={13} className="text-blue-400" />
                      <span>สรุปการจัดเรียงอิเล็กตรอน:</span>
                    </h3>

                    {/* Nuclear Symbol & Particles Breakdown */}
                    <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-bold uppercase">สัญลักษณ์นิวเคลียร์:</span>
                        <div className="mt-1 flex items-center pl-1">
                          {(() => {
                            const activeElem = ELEMENTS_DATA[zVal] || { symbol: 'X', nameTh: 'ธาตุปริศนา', nameEn: 'Unknown' };
                            const massNum = ELEMENT_MASS_NUMBERS[zVal] || (zVal * 2);
                            const chargeSign = energyIonCharge > 0 ? '+' : '-';
                            const chargeText = energyIonCharge === 0 ? '' : (Math.abs(energyIonCharge) === 1 ? chargeSign : `${Math.abs(energyIonCharge)}${chargeSign}`);
                            
                            return (
                              <div className="flex items-center gap-3">
                                <div className="inline-flex items-center font-mono shrink-0">
                                  <div className="flex flex-col text-right text-[10px] leading-none mr-1 select-none">
                                    <span className="font-bold text-amber-400 text-xs" title="เลขมวล (A)">{massNum}</span>
                                    <span className="font-bold text-sky-400 text-xs" title="เลขอะตอม (Z)">{zVal}</span>
                                  </div>
                                  <span className="text-3xl font-black text-white leading-none tracking-tight">{activeElem.symbol}</span>
                                  {energyIonCharge !== 0 && (
                                    <sup className="text-xs font-black text-rose-400 ml-0.5 leading-none align-super select-none">
                                      {chargeText}
                                    </sup>
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-black text-slate-200 truncate">{activeElem.nameTh}</span>
                                  <span className="text-[9px] text-slate-400 font-medium font-mono truncate">{activeElem.nameEn}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-3 gap-1 bg-slate-900/40 p-2 rounded-xl border border-white/5 text-center">
                        <div>
                          <span className="text-[8px] text-slate-400 font-bold block leading-tight">โปรตอน</span>
                          <span className="text-[7.5px] text-slate-500 font-medium block leading-tight">(p⁺)</span>
                          <span className="text-xs font-black font-mono text-sky-300 mt-0.5 block">{zVal}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-400 font-bold block leading-tight">นิวตรอน</span>
                          <span className="text-[7.5px] text-slate-500 font-medium block leading-tight">(n⁰)</span>
                          <span className="text-xs font-black font-mono text-amber-300 mt-0.5 block">
                            {(ELEMENT_MASS_NUMBERS[zVal] || (zVal * 2)) - zVal}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-400 font-bold block leading-tight">อิเล็กตรอน</span>
                          <span className="text-[7.5px] text-slate-500 font-medium block leading-tight">(e⁻)</span>
                          <span className="text-xs font-black font-mono text-emerald-300 mt-0.5 block">
                            {Math.max(0, zVal - energyIonCharge)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2.1 Spectroscopic Configuration - Now FIRST */}
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 flex flex-col">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">การจัดเรียงอิเล็กตรอนในระดับพลังงานย่อย:</span>
                      <span 
                        className="text-xs font-mono text-amber-300 mt-0.5 leading-relaxed tracking-wider"
                        dangerouslySetInnerHTML={{ __html: getSpectroscopicFromOccupancies(activeOccupancies) }}
                      />
                    </div>

                    {/* 2.2 Shorthand Configuration - Now SECOND */}
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 flex flex-col">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">การจัดเรียงอิเล็กตรอนแบบย่อ (อ้างอิงแก๊สเฉื่อย):</span>
                      <span 
                        className="text-xs font-mono text-sky-400 mt-0.5 tracking-wider"
                        dangerouslySetInnerHTML={{ __html: getShorthandFromOccupancies(activeOccupancies) }}
                      />
                    </div>

                    {/* 2.3 Principal Configuration - Now THIRD / LAST as requested */}
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 flex flex-col border-t border-emerald-500/20">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">การจัดเรียงอิเล็กตรอนในระดับพลังงานหลัก:</span>
                      <span className="text-sm font-black font-mono text-emerald-400 mt-0.5 tracking-wide">
                        {(() => {
                          if (energyAnimatingCount === 0) return '0';
                          const shellCounts = [0, 0, 0, 0, 0, 0, 0];
                          const subshellN = [
                            { name: '1s', n: 1 }, { name: '2s', n: 2 }, { name: '2p', n: 2 },
                            { name: '3s', n: 3 }, { name: '3p', n: 3 }, { name: '4s', n: 4 },
                            { name: '3d', n: 3 }, { name: '4p', n: 4 }, { name: '5s', n: 5 },
                            { name: '4d', n: 4 }, { name: '5p', n: 5 }, { name: '6s', n: 6 },
                            { name: '4f', n: 4 }, { name: '5d', n: 5 }, { name: '6p', n: 6 },
                            { name: '7s', n: 7 }, { name: '5f', n: 5 }, { name: '6d', n: 6 },
                            { name: '7p', n: 7 }
                          ];
                          for (const s of subshellN) {
                            shellCounts[s.n - 1] += (activeOccupancies[s.name] || 0);
                          }
                          let lastIndex = 6;
                          while (lastIndex >= 0 && shellCounts[lastIndex] === 0) {
                            lastIndex--;
                          }
                          if (lastIndex < 0) return '0';
                          return shellCounts.slice(0, lastIndex + 1).join(' , ');
                        })()}
                      </span>
                    </div>

                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* TAB 3: การจัดเรียงอิเล็กตรอน (REMOVED) */}
          {activeTab === 'config' && (
            <div />
          )}

        </aside>
      )}

      </main>

      {/* 3. INTERACTIVE QUANTUM SPIN GAME POPUP MODAL */}
      <AnimatePresence>
        {isGameOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
            >
              
              {/* Header inside popup modal */}
              <div className="p-5 border-b border-white/5 bg-slate-900/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <Trophy className="text-amber-400 animate-pulse" size={20} />
                  <div>
                    <h2 className="text-base font-extrabold text-slate-100">
                      เกมส์ท้าทาย: จัดเรียงอิเล็กตรอนจริง
                    </h2>
                    <p className="text-[10px] text-slate-400 font-light">
                      สุ่มจำนวนอิเล็กตรอนและฝึกฝนการเขียนลูกศรสปินให้ถูกต้อง 100% ตามทฤษฎีควอนตัม
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsGameOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center justify-center cursor-pointer transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body Container */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col lg:flex-row gap-6 min-h-0">
                
                {/* Left Section of Modal: Task Setup & Instructions */}
                <div className="flex-1 flex flex-col gap-4">
                  
                  {/* Step A: Choose Orbital & Randomizer */}
                  <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-400" />
                      1. เลือกชนิดและสุ่มโจทย์ท้าทาย
                    </span>
                    <div className="grid grid-cols-4 gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
                      {['s', 'p', 'd', 'f'].map(type => (
                        <button
                          key={type}
                          onClick={() => initGame(type)}
                          className={`py-1.5 text-center rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                            gameOrbital === type
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {type}-orbital
                        </button>
                      ))}
                    </div>

                    {/* Randomized task board */}
                    <div className="bg-slate-900/80 border border-white/5 rounded-xl p-3 text-center flex items-center justify-between mt-1">
                      <div className="text-left">
                        <span className="text-[10px] text-slate-400 block font-semibold">โจทย์ท้าทาย</span>
                        <span className="text-sm font-bold text-amber-300">
                          จงบรรจุอิเล็กตรอนลงในช่องย่อยของ {gameOrbital.toUpperCase()}
                        </span>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-center">
                        <span className="text-[9px] text-amber-400 block uppercase font-bold tracking-wider">โจทย์ระบุ</span>
                        <span className="text-xl font-mono font-black text-amber-300">
                          {givenElectrons} <span className="text-xs font-medium text-slate-400">e⁻</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Manual guidelines block */}
                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex flex-col gap-2 text-xs text-blue-300/90 leading-relaxed">
                    <span className="font-bold flex items-center gap-1 text-blue-300">
                      📝 วิธีการจัดเรียงแมนนวล (เหมือนทำในกระดาษข้อสอบ):
                    </span>
                    <ol className="list-decimal pl-4 flex flex-col gap-1 text-slate-300">
                      <li>คลิกเลือกช่องออร์บิทัลย่อยด้านขวาที่ต้องการเติม (จะมีกรอบไฟสีน้ำเงินแสดงพิกัดที่เลือก)</li>
                      <li>กดปุ่ม <span className="text-blue-400 font-bold">"สปินขึ้น (↿)"</span> หรือ <span className="text-amber-400 font-bold">"สปินลง (⇂)"</span> จากแถบเครื่องมือภายนอกเพื่อเติมอิเล็กตรอน</li>
                      <li>ห้ามข้ามช่องเดี่ยวตามกฎของฮุนด์ (Sequential Rule) สปินเดี่ยวทิศทางต้องขนานกัน และเข้าคู่ทิศทางสวนทางกัน</li>
                      <li>กดตรวจคำตอบเพื่อตรวจสอบความถูกต้องแบบเข้มงวดที่สุด!</li>
                    </ol>
                  </div>

                </div>

                {/* Right Section of Modal: Interactive Empty Placements & Toolbar */}
                <div className="flex-1 flex flex-col gap-4">
                  
                  {/* Step B: The Interactive boxes container */}
                  <div className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl flex flex-col gap-4 min-h-[220px] justify-center items-center">
                    
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                        เลือกห้องออร์บิทัลย่อยด้านล่างเพื่อทำการแก้ไข:
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        สถานะปัจจุบัน: บรรจุแล้ว {gamePlacedCount} / {givenElectrons} ตัว
                      </span>
                    </div>

                    {/* Horizontal Interactive Boxes */}
                    <div className="flex gap-2.5 justify-center flex-wrap my-1">
                      {Array.from({ length: gameOrbital === 's' ? 1 : ORBITAL_DEFS[gameOrbital].length }).map((_, i) => {
                        const spins = gamePlacements[i] || [];
                        const isSelected = selectedBoxIndex === i;
                        return (
                          <div 
                            key={i}
                            onClick={() => setSelectedBoxIndex(i)}
                            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                              isSelected 
                                ? 'bg-blue-500/10 border border-blue-400/50 shadow-inner' 
                                : 'bg-slate-900 border border-white/5 hover:border-white/10'
                            }`}
                          >
                            <span className="text-[9px] font-mono text-slate-400 font-bold">
                              {gameOrbital}<sub>{i+1}</sub>
                            </span>

                            {/* Custom interactive box that can hold any number of spins */}
                            <div 
                              className={`w-12 h-14 rounded-lg flex items-center justify-center gap-1 text-xl font-bold transition-all relative ${
                                isSelected 
                                  ? 'bg-slate-950 border-2 border-blue-400' 
                                  : 'bg-slate-950 border border-white/10'
                              }`}
                            >
                              {spins.length === 0 ? (
                                <span className="text-[9px] text-slate-600 font-light select-none italic">ว่าง</span>
                              ) : (
                                <div className="flex gap-1 items-center justify-center">
                                  {spins.map((spin, sIdx) => (
                                    <span 
                                      key={sIdx} 
                                      className={`font-black ${spin === 'up' ? 'text-blue-300' : 'text-amber-300'}`}
                                    >
                                      {spin === 'up' ? '↿' : '⇂'}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>

                  {/* Step C: EXTERNAL CONTROL PANEL (ปุ่มอยู่นอกออร์บิทัลย่อย เพื่อความสมจริง) */}
                  <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      แผงบรรจุอิเล็กตรอนและลบความผิดพลาด (ภายนอก):
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addSpinToSelectedBox('up')}
                        disabled={gameSubmitted}
                        className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-500/40 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 min-h-[44px]"
                      >
                        <ArrowUp size={16} />
                        เติมสปินขึ้น (↿)
                      </button>
                      <button
                        onClick={() => addSpinToSelectedBox('down')}
                        disabled={gameSubmitted}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 min-h-[44px]"
                      >
                        <ArrowDown size={16} />
                        เติมสปินลง (⇂)
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        onClick={removeLastSpinFromSelectedBox}
                        disabled={gameSubmitted}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        ย้อนกลับ / ลบตัวหลังสุด
                      </button>
                      <button
                        onClick={clearAllPlacementsInGame}
                        disabled={gameSubmitted}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        ล้างทั้งหมด
                      </button>
                    </div>
                  </div>

                  {/* Submission triggers */}
                  <div className="flex gap-2 mt-1">
                    {!gameSubmitted ? (
                      <button
                        onClick={verifyGameAnswer}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg cursor-pointer transition-all text-xs sm:text-sm min-h-[44px]"
                      >
                        ส่งกระดาษคำตอบ & ตรวจสอบ
                      </button>
                    ) : (
                      <button
                        onClick={() => initGame(gameOrbital)}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl shadow-lg cursor-pointer transition-all text-xs sm:text-sm min-h-[44px] flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw size={14} />
                        โจทย์ต่อไป (สุ่มใหม่)
                      </button>
                    )}
                  </div>

                </div>

              </div>

              {/* Dynamic feedback panel with strict physics descriptions */}
              <AnimatePresence>
                {gameSubmitted && gameFeedback && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/5 bg-slate-950/80"
                  >
                    <div 
                      className={`p-5 flex flex-col gap-2.5 ${
                        gameFeedback.isCorrect 
                          ? 'bg-emerald-500/10 text-emerald-100' 
                          : 'bg-rose-500/10 text-rose-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                        {gameFeedback.isCorrect ? <CheckCircle className="text-emerald-400" size={18} /> : <XCircle className="text-rose-400" size={18} />}
                        <span>{gameFeedback.title}</span>
                      </div>
                      <p className="text-xs leading-relaxed opacity-90">
                        {gameFeedback.message}
                      </p>
                      
                      {gameFeedback.isCorrect && (
                        <div className="bg-emerald-500/15 p-3 rounded-xl text-[11px] leading-relaxed mt-1 border border-emerald-500/20">
                          🏆 <span className="font-semibold">สุดยอดความเข้าใจระดับฟิสิกส์:</span> ข้อมูลนี้ยืนยันว่าคุณมีความแม่นยำสูงในระดับจำลองควอนตัม ในการบรรจุสปินแบบขนานตามกฎของฮุนด์ และจับคู่สวนทางกันตามหลักกีดกันของเพาลีอย่างแท้จริง!
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ion Configuration Explanation Popup Modal */}
      <AnimatePresence>
        {isIonExplanationOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
            >
              
              {/* Header */}
              <div className="p-5 border-b border-white/5 bg-slate-900/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Info size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-100">
                      คำอธิบายการจัดเรียงอิเล็กตรอนของไอออน
                    </h2>
                    <p className="text-[10px] text-slate-400 font-light">
                      ความรู้ทางฟิสิกส์เคมีเกี่ยวกับการจัดเรียงของไอออนบวกและไอออนลบ
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsIonExplanationOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center justify-center cursor-pointer transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                
                {/* Intro */}
                <div className="bg-slate-950/40 border border-white/5 p-3.5 rounded-2xl text-[11px] sm:text-xs leading-relaxed text-slate-300">
                  เมื่ออะตอมกลายเป็นไอออน จะมีการเปลี่ยนแปลงจำนวนอิเล็กตรอนโดยการ <span className="text-amber-300 font-bold">สูญเสียอิเล็กตรอน (เกิดประจุบวก)</span> หรือ <span className="text-rose-300 font-bold">ได้รับอิเล็กตรอนเพิ่ม (เกิดประจุลบ)</span> เพื่อปรับตัวให้มีความเสถียรตามกฎออกเตตหรือสถานะที่สมดุลมากขึ้น
                </div>

                {/* Grid for Positive and Negative Ions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left: Positive Ion (Cation) */}
                  <div className="bg-blue-950/20 border border-blue-500/10 p-4 rounded-2xl flex flex-col gap-3 animate-none">
                    <div className="flex items-center gap-2 border-b border-blue-500/15 pb-2">
                      <span className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center text-blue-300 text-[10px] font-bold">+</span>
                      <h3 className="text-xs font-bold text-blue-300 uppercase">1. ไอออนบวก (Cation)</h3>
                    </div>
                    
                    <div className="text-[11px] leading-relaxed text-slate-300 flex flex-col gap-2">
                      <p>
                        เกิดจากการ <span className="text-blue-300 font-bold">สูญเสียอิเล็กตรอน</span> ทำให้อิเล็กตรอนลดลง
                      </p>
                      
                      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-[10px] space-y-1.5 text-slate-400">
                        <span className="text-blue-300 font-bold block">⚠️ กฎสำคัญมาก:</span>
                        <p>
                          เวลาดึงอิเล็กตรอนออก <span className="text-amber-300 font-semibold underline">ต้องดึงจากระดับพลังงานชั้นนอกสุดที่มีเลข n สูงสุดก่อนเสมอ</span> (เช่น ดึงจาก <span className="text-white font-mono">4s</span> ก่อนดึงจาก <span className="text-white font-mono">3d</span>)
                        </p>
                      </div>

                      <div className="space-y-1 mt-1">
                        <span className="text-[10px] text-slate-400 font-bold block">ตัวอย่าง Iron (Fe, Z = 26):</span>
                        <div className="bg-slate-950 p-2 rounded-lg font-mono text-[10px] text-slate-300 border border-white/5 space-y-1">
                          <div>
                            <span className="text-slate-500">Fe (ปกติ):</span>
                            <br />
                            1s² 2s² 2p⁶ 3s² 3p⁶ <span className="text-blue-300 font-bold">4s²</span> 3d⁶
                          </div>
                          <div className="border-t border-white/5 pt-1 mt-1">
                            <span className="text-blue-400 font-bold">Fe²⁺ (เสีย 2 e⁻):</span>
                            <br />
                            1s² 2s² 2p⁶ 3s² 3p⁶ <span className="text-slate-500 line-through">4s²</span> 3d⁶
                            <br />
                            <span className="text-emerald-400">→ [Ar] 3d⁶</span>
                          </div>
                          <div className="border-t border-white/5 pt-1 mt-1">
                            <span className="text-blue-400 font-bold">Fe³⁺ (เสีย 3 e⁻):</span>
                            <br />
                            1s² 2s² 2p⁶ 3s² 3p⁶ <span className="text-slate-500 line-through">4s²</span> 3d⁵
                            <br />
                            <span className="text-emerald-400">→ [Ar] 3d⁵</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Negative Ion (Anion) */}
                  <div className="bg-rose-950/20 border border-rose-500/10 p-4 rounded-2xl flex flex-col gap-3 animate-none">
                    <div className="flex items-center gap-2 border-b border-rose-500/15 pb-2">
                      <span className="w-5 h-5 rounded-md bg-rose-500/20 flex items-center justify-center text-rose-300 text-[10px] font-bold">-</span>
                      <h3 className="text-xs font-bold text-rose-300 uppercase">2. ไอออนลบ (Anion)</h3>
                    </div>
                    
                    <div className="text-[11px] leading-relaxed text-slate-300 flex flex-col gap-2">
                      <p>
                        เกิดจากการ <span className="text-rose-300 font-bold">ได้รับอิเล็กตรอนเพิ่ม</span> ทำให้อิเล็กตรอนเพิ่มขึ้น
                      </p>
                      
                      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-[10px] space-y-1.5 text-slate-400">
                        <span className="text-rose-300 font-bold block">💡 กฎการบรรจุ:</span>
                        <p>
                          บรรจุอิเล็กตรอนเพิ่มเติมเข้าไปใน <span className="text-white font-semibold">ออร์บิทัลย่อยที่มีพลังงานต่ำสุดที่ยังว่างอยู่</span> ตามกฎปกติของ Aufbau ได้เลยโดยตรง
                        </p>
                      </div>

                      <div className="space-y-1 mt-1">
                        <span className="text-[10px] text-slate-400 font-bold block">ตัวอย่าง Chlorine (Cl, Z = 17):</span>
                        <div className="bg-slate-950 p-2 rounded-lg font-mono text-[10px] text-slate-300 border border-white/5 space-y-1">
                          <div>
                            <span className="text-slate-500">Cl (ปกติ):</span>
                            <br />
                            1s² 2s² 2p⁶ 3s² <span className="text-rose-300/80 font-bold">3p⁵</span>
                          </div>
                          <div className="border-t border-white/5 pt-1 mt-1">
                            <span className="text-rose-400 font-bold">Cl⁻ (ได้รับ 1 e⁻):</span>
                            <br />
                            1s² 2s² 2p⁶ 3s² <span className="text-emerald-400 font-bold">3p⁶</span>
                            <br />
                            <span className="text-emerald-400">→ [Ar] (เสถียรแบบก๊าซเฉื่อย)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer Tip inside popup */}
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-start gap-2.5">
                  <span className="text-amber-400 text-sm mt-0.5">💡</span>
                  <p className="text-[10.5px] leading-relaxed text-amber-200">
                    <span className="font-bold">เคล็ดลับการจำ:</span> ไอออนบวกดึงตัวนอกสุดออกก่อน (หาเลข n มากสุด) ไม่ใช่ดึงออร์บิทัลย่อยที่เขียนหลังสุดเสมอไป! ส่วนไอออนลบก็เติมต่อเข้าไปในช่องว่างที่เหลือตามปกติได้เลย
                  </p>
                </div>

              </div>

              {/* Close Button Footer */}
              <div className="p-4 border-t border-white/5 bg-slate-900/50 flex justify-end shrink-0">
                <button
                  onClick={() => setIsIonExplanationOpen(false)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-blue-600/15"
                >
                  เข้าใจแล้ว
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rules Explanation Popup Modal */}
      <AnimatePresence>
        {isRulesExplanationOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
            >
              
              {/* Header */}
              <div className="p-5 border-b border-white/5 bg-slate-900/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Info size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-100">
                      กฎการจัดเรียงระดับพลังงานย่อย (Energy Level Ordering)
                    </h2>
                    <p className="text-[10px] text-slate-400 font-light">
                      ทำไมระดับพลังงานจึงไม่ได้เรียงตามค่า n เสมอไป?
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRulesExplanationOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center justify-center cursor-pointer transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                
                {/* Intro */}
                <div className="bg-slate-950/40 border border-white/5 p-3.5 rounded-2xl text-[11px] sm:text-xs leading-relaxed text-slate-300">
                  ตาม <span className="text-amber-300 font-bold">หลักการออฟบาว (Aufbau Principle)</span> อิเล็กตรอนจะเข้าไปบรรจุในออร์บิทัลที่มีระดับพลังงานต่ำสุดที่ยังว่างอยู่ก่อนเสมอ ทว่าระดับพลังงานของแต่ละระดับพลังงานย่อยไม่ได้วัดด้วยเลขควอนตัมหลัก (<span className="text-sky-400 font-bold font-mono">n</span>) เพียงอย่างเดียว แต่ขึ้นอยู่กับ <span className="text-emerald-400 font-bold">กฎ (n + l)</span>
                </div>

                {/* Sub-explanation */}
                <div className="space-y-4">
                  
                  {/* The n+l Rule Card */}
                  <div className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl space-y-3">
                    <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      กฎ (n + l) หรือ กฎของคลีชคอฟสกี (Klechkowski's Rule)
                    </h3>
                    <div className="text-[11.5px] leading-relaxed text-slate-300 space-y-2">
                      <p>
                        ระดับพลังงานย่อยจะจัดเรียงลำดับพลังงานจากน้อยไปหามาก โดยพิจารณาตามสองกฎนี้:
                      </p>
                      <ul className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                        <li>
                          ออร์บิทัลที่มีผลรวม <span className="text-emerald-400 font-semibold font-mono">n + l น้อยกว่า</span> จะมีระดับพลังงานต่ำกว่า และได้รับการบรรจุก่อน
                        </li>
                        <li>
                          หากผลรวม <span className="text-emerald-400 font-semibold font-mono">n + l เท่ากัน</span> ออร์บิทัลที่มีค่า <span className="text-sky-400 font-semibold font-mono">n น้อยกว่า</span> จะได้รับการบรรจุก่อนเนื่องจากอยู่ใกล้กับนิวเคลียสมากกว่า
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Table of comparisons */}
                  <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-950/20">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold">
                        <tr>
                          <th className="p-2.5">ออร์บิทัล</th>
                          <th className="p-2.5">n (หลัก)</th>
                          <th className="p-2.5">l (ย่อย)</th>
                          <th className="p-2.5">n + l</th>
                          <th className="p-2.5 text-amber-400">ลำดับการบรรจุ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        <tr>
                          <td className="p-2.5 font-bold text-white">1s</td>
                          <td className="p-2.5 text-sky-400">1</td>
                          <td className="p-2.5">0 (s)</td>
                          <td className="p-2.5 font-bold text-emerald-400">1</td>
                          <td className="p-2.5 text-emerald-400 font-bold">ลำดับที่ 1</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-white">2s</td>
                          <td className="p-2.5 text-sky-400">2</td>
                          <td className="p-2.5">0 (s)</td>
                          <td className="p-2.5 font-bold text-emerald-400">2</td>
                          <td className="p-2.5 text-emerald-400 font-bold">ลำดับที่ 2</td>
                        </tr>
                        <tr className="bg-white/[0.01]">
                          <td className="p-2.5 font-bold text-white">2p</td>
                          <td className="p-2.5 text-sky-400">2</td>
                          <td className="p-2.5">1 (p)</td>
                          <td className="p-2.5 font-bold text-emerald-400">3</td>
                          <td className="p-2.5 text-emerald-400 font-bold">ลำดับที่ 3 (n น้อยกว่า 3s)</td>
                        </tr>
                        <tr className="bg-white/[0.01]">
                          <td className="p-2.5 font-bold text-white">3s</td>
                          <td className="p-2.5 text-sky-400">3</td>
                          <td className="p-2.5">0 (s)</td>
                          <td className="p-2.5 font-bold text-emerald-400">3</td>
                          <td className="p-2.5 text-emerald-400 font-bold">ลำดับที่ 4</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-white">3p</td>
                          <td className="p-2.5 text-sky-400">3</td>
                          <td className="p-2.5">1 (p)</td>
                          <td className="p-2.5 font-bold text-emerald-400">4</td>
                          <td className="p-2.5 text-emerald-400 font-bold">ลำดับที่ 5 (n น้อยกว่า 4s)</td>
                        </tr>
                        <tr className="bg-amber-500/5">
                          <td className="p-2.5 font-bold text-amber-300">4s</td>
                          <td className="p-2.5 text-sky-400">4</td>
                          <td className="p-2.5">0 (s)</td>
                          <td className="p-2.5 font-bold text-amber-400">4</td>
                          <td className="p-2.5 text-amber-400 font-bold">ลำดับที่ 6 (บรรจุก่อน 3d!)</td>
                        </tr>
                        <tr className="bg-blue-500/5">
                          <td className="p-2.5 font-bold text-blue-300">3d</td>
                          <td className="p-2.5 text-sky-400">3</td>
                          <td className="p-2.5">2 (d)</td>
                          <td className="p-2.5 font-bold text-blue-400">5</td>
                          <td className="p-2.5 text-blue-400 font-bold">ลำดับที่ 7 (พลังงานสูงกว่า 4s)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Highlights Case */}
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
                    <span className="text-xl mt-0.5">💡</span>
                    <div className="text-[11px] leading-relaxed text-amber-200">
                      <span className="font-bold block mb-1">ทำไม 4s ถึงบรรจุก่อน 3d?</span>
                      เนื่องจากออร์บิทัล <span className="font-bold text-white">4s</span> มีค่าผลรวม <span className="font-bold text-white">n+l = 4 + 0 = 4</span> ในขณะที่ <span className="font-bold text-white">3d</span> มีผลรวม <span className="font-bold text-white">n+l = 3 + 2 = 5</span> พลังงานของ 4s จึงต่ำกว่า 3d ส่งผลให้อิเล็กตรอนเข้าบรรจุในชั้น 4s ก่อน 3d เสมอ แม้ว่าตัวเลขชั้นพลังงานหลัก n ของ 4s จะเป็น 4 ซึ่งสูงกว่าก็ตาม!
                    </div>
                  </div>

                </div>

              </div>

              {/* Close Button Footer */}
              <div className="p-4 border-t border-white/5 bg-slate-900/50 flex justify-end shrink-0">
                <button
                  onClick={() => setIsRulesExplanationOpen(false)}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-amber-500/15"
                >
                  เข้าใจแล้ว
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Academic Info Popup Modal */}
      <AnimatePresence>
        {isAcademicInfoOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
            >
              
              {/* Header */}
              <div className="p-5 border-b border-white/5 bg-slate-900/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Info size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-100">
                      ข้อมูลวิชาการและกฎการจัดเรียง
                    </h2>
                    <p className="text-[10px] text-slate-400 font-light">
                      กฎการบรรจุอิเล็กตรอนในออร์บิทัลย่อย
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAcademicInfoOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center justify-center cursor-pointer transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <p className="text-xs text-slate-200 font-medium bg-white/5 p-3 rounded-2xl leading-relaxed">
                  {orbitalDescriptions[activeType]}
                </p>
                <div className="flex flex-col gap-3 border-t border-white/5 pt-3 text-[11.5px] leading-relaxed">
                  <p className="text-slate-300">
                    <strong className="text-blue-300">กฎของฮุนด์ (Hund's Rule):</strong> ต้องบรรจุแบบอิเล็กตรอนเดี่ยวที่มีทิศสปินขนานเดียวกัน (สปินขึ้น ↿) ไปทีละห้องจนครบทุกช่องก่อน แล้วจึงย้อนมาจับคู่บรรจุแบบสปินคู่ตรงข้าม (สปินลง ⇂)
                  </p>
                  <p className="text-slate-300">
                    <strong className="text-amber-300">หลักการกีดกันของเพาลี (Pauli Exclusion Principle):</strong> ไม่มีอิเล็กตรอนสองตัวใดๆ ในออร์บิทัลย่อยเดียวกันที่มีเลขควอนตัมเหมือนกันทั้งหมด ส่งผลให้อิเล็กตรอนที่อยู่ในกล่องเดียวกันต้องมีทิศทางสปินสวนทางตรงข้ามกันเสมอ (↿ และ ⇂)
                  </p>
                  <p className="text-slate-400">
                    💡 <span className="text-amber-300 font-semibold">ตรรกะแบบจำลอง 3D:</span> ระบบจำลองของเราแยกการเคลื่อนที่ของอิเล็กตรอนที่มีทิศสปินขึ้น/ลง ให้อยู่คนละซีกขั้วสมมาตร (Lobe A และ Lobe B) เพื่อความถูกต้องทางทัศนศาสตร์ฟิสิกส์
                  </p>
                </div>
              </div>

              {/* Close Button Footer */}
              <div className="p-4 border-t border-white/5 bg-slate-900/50 flex justify-end shrink-0">
                <button
                  onClick={() => setIsAcademicInfoOpen(false)}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-amber-500/15"
                >
                  เข้าใจแล้ว
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. PERSISTENT FOOTER SIGNATURE AT THE VERY BOTTOM */}
      <footer className="w-full bg-slate-900/40 border-t border-white/5 py-3 text-center text-xs text-slate-500 font-medium shrink-0 z-20 mt-auto">
        พัฒนาระบบโดย นายกรวิชญ์ สันอี © 2026
      </footer>

    </div>
  );
}
