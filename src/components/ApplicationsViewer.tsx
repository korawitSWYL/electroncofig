import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  Info, 
  Sparkles, 
  Minus, 
  Plus, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Compass, 
  HelpCircle, 
  ArrowRight,
  BookOpen,
  LayoutGrid,
  Zap
} from 'lucide-react';

// Define elements from Z=1 to Z=36 for the mini periodic table
export interface PeriodicElement {
  z: number;
  symbol: string;
  name: string;
  period: number;
  group: number;
  block: 's' | 'p' | 'd';
  config: string;
  valence: string;
  groupLabel: string;
  isException?: boolean;
}

const PERIODIC_ELEMENTS: PeriodicElement[] = [
  // Period 1
  { z: 1, symbol: 'H', name: 'Hydrogen (ไฮโดรเจน)', period: 1, group: 1, block: 's', config: '1s¹', valence: '1s¹', groupLabel: 'IA (หมู่ 1)' },
  { z: 2, symbol: 'He', name: 'Helium (ฮีเลียม)', period: 1, group: 18, block: 's', config: '1s²', valence: '1s²', groupLabel: 'VIIIA (หมู่ 18)' },
  // Period 2
  { z: 3, symbol: 'Li', name: 'Lithium (ลิเทียม)', period: 2, group: 1, block: 's', config: '1s² 2s¹', valence: '2s¹', groupLabel: 'IA (หมู่ 1)' },
  { z: 4, symbol: 'Be', name: 'Beryllium (เบริลเลียม)', period: 2, group: 2, block: 's', config: '1s² 2s²', valence: '2s²', groupLabel: 'IIA (หมู่ 2)' },
  { z: 5, symbol: 'B', name: 'Boron (โบรอน)', period: 2, group: 13, block: 'p', config: '1s² 2s² 2p¹', valence: '2s² 2p¹', groupLabel: 'IIIA (หมู่ 13)' },
  { z: 6, symbol: 'C', name: 'Carbon (คาร์บอน)', period: 2, group: 14, block: 'p', config: '1s² 2s² 2p²', valence: '2s² 2p²', groupLabel: 'IVA (หมู่ 14)' },
  { z: 7, symbol: 'N', name: 'Nitrogen (ไนโตรเจน)', period: 2, group: 15, block: 'p', config: '1s² 2s² 2p³', valence: '2s² 2p³', groupLabel: 'VA (หมู่ 15)' },
  { z: 8, symbol: 'O', name: 'Oxygen (ออกซิเจน)', period: 2, group: 16, block: 'p', config: '1s² 2s² 2p⁴', valence: '2s² 2p⁴', groupLabel: 'VIA (หมู่ 16)' },
  { z: 9, symbol: 'F', name: 'Fluorine (ฟลูออรีน)', period: 2, group: 17, block: 'p', config: '1s² 2s² 2p⁵', valence: '2s² 2p⁵', groupLabel: 'VIIA (หมู่ 17)' },
  { z: 10, symbol: 'Ne', name: 'Neon (นีออน)', period: 2, group: 18, block: 'p', config: '1s² 2s² 2p⁶', valence: '2s² 2p⁶', groupLabel: 'VIIIA (หมู่ 18)' },
  // Period 3
  { z: 11, symbol: 'Na', name: 'Sodium (โซเดียม)', period: 3, group: 1, block: 's', config: '[Ne] 3s¹', valence: '3s¹', groupLabel: 'IA (หมู่ 1)' },
  { z: 12, symbol: 'Mg', name: 'Magnesium (แมกนีเซียม)', period: 3, group: 2, block: 's', config: '[Ne] 3s²', valence: '3s²', groupLabel: 'IIA (หมู่ 2)' },
  { z: 13, symbol: 'Al', name: 'Aluminium (อะลูมิเนียม)', period: 3, group: 13, block: 'p', config: '[Ne] 3s² 3p¹', valence: '3s² 3p¹', groupLabel: 'IIIA (หมู่ 13)' },
  { z: 14, symbol: 'Si', name: 'Silicon (ซิลิคอน)', period: 3, group: 14, block: 'p', config: '[Ne] 3s² 3p²', valence: '3s² 3p²', groupLabel: 'IVA (หมู่ 14)' },
  { z: 15, symbol: 'P', name: 'Phosphorus (ฟอสฟอรัส)', period: 3, group: 15, block: 'p', config: '[Ne] 3s² 3p³', valence: '3s² 3p³', groupLabel: 'VA (หมู่ 15)' },
  { z: 16, symbol: 'S', name: 'Sulfur (กำมะถัน)', period: 3, group: 16, block: 'p', config: '[Ne] 3s² 3p⁴', valence: '3s² 3p⁴', groupLabel: 'VIA (หมู่ 16)' },
  { z: 17, symbol: 'Cl', name: 'Chlorine (คลอรีน)', period: 3, group: 17, block: 'p', config: '[Ne] 3s² 3p⁵', valence: '3s² 3p⁵', groupLabel: 'VIIA (หมู่ 17)' },
  { z: 18, symbol: 'Ar', name: 'Argon (อาร์กอน)', period: 3, group: 18, block: 'p', config: '[Ne] 3s² 3p⁶', valence: '3s² 3p⁶', groupLabel: 'VIIIA (หมู่ 18)' },
  // Period 4
  { z: 19, symbol: 'K', name: 'Potassium (โพแทสเซียม)', period: 4, group: 1, block: 's', config: '[Ar] 4s¹', valence: '4s¹', groupLabel: 'IA (หมู่ 1)' },
  { z: 20, symbol: 'Ca', name: 'Calcium (แคลเซียม)', period: 4, group: 2, block: 's', config: '[Ar] 4s²', valence: '4s²', groupLabel: 'IIA (หมู่ 2)' },
  { z: 21, symbol: 'Sc', name: 'Scandium (สแกนเดียม)', period: 4, group: 3, block: 'd', config: '[Ar] 4s² 3d¹', valence: '4s² 3d¹', groupLabel: 'IIIB (หมู่ 3)' },
  { z: 22, symbol: 'Ti', name: 'Titanium (ไทเทเนียม)', period: 4, group: 4, block: 'd', config: '[Ar] 4s² 3d²', valence: '4s² 3d²', groupLabel: 'IVB (หมู่ 4)' },
  { z: 23, symbol: 'V', name: 'Vanadium (วานาเดียม)', period: 4, group: 5, block: 'd', config: '[Ar] 4s² 3d³', valence: '4s² 3d³', groupLabel: 'VB (หมู่ 5)' },
  { z: 24, symbol: 'Cr', name: 'Chromium (โครเมียม)', period: 4, group: 6, block: 'd', config: '[Ar] 4s¹ 3d⁵', valence: '4s¹ 3d⁵', groupLabel: 'VIB (หมู่ 6)', isException: true },
  { z: 25, symbol: 'Mn', name: 'Manganese (แมงกานีส)', period: 4, group: 7, block: 'd', config: '[Ar] 4s² 3d⁵', valence: '4s² 3d⁵', groupLabel: 'VIIB (หมู่ 7)' },
  { z: 26, symbol: 'Fe', name: 'Iron (เหล็ก)', period: 4, group: 8, block: 'd', config: '[Ar] 4s² 3d⁶', valence: '4s² 3d⁶', groupLabel: 'VIIIB (หมู่ 8)' },
  { z: 27, symbol: 'Co', name: 'Cobalt (โคบอลต์)', period: 4, group: 9, block: 'd', config: '[Ar] 4s² 3d⁷', valence: '4s² 3d⁷', groupLabel: 'VIIIB (หมู่ 9)' },
  { z: 28, symbol: 'Ni', name: 'Nickel (นิกเกิล)', period: 4, group: 10, block: 'd', config: '[Ar] 4s² 3d⁸', valence: '4s² 3d⁸', groupLabel: 'VIIIB (หมู่ 10)' },
  { z: 29, symbol: 'Cu', name: 'Copper (ทองแดง)', period: 4, group: 11, block: 'd', config: '[Ar] 4s¹ 3d¹⁰', valence: '4s¹ 3d¹⁰', groupLabel: 'IB (หมู่ 11)', isException: true },
  { z: 30, symbol: 'Zn', name: 'Zinc (สังกะสี)', period: 4, group: 12, block: 'd', config: '[Ar] 4s² 3d¹⁰', valence: '4s² 3d¹⁰', groupLabel: 'IIB (หมู่ 12)' },
  { z: 31, symbol: 'Ga', name: 'Gallium (แกลเลียม)', period: 4, group: 13, block: 'p', config: '[Ar] 4s² 3d¹⁰ 4p¹', valence: '4s² 4p¹', groupLabel: 'IIIA (หมู่ 13)' },
  { z: 32, symbol: 'Ge', name: 'Germanium (เจอร์เมเนียม)', period: 4, group: 14, block: 'p', config: '[Ar] 4s² 3d¹⁰ 4p²', valence: '4s² 4p²', groupLabel: 'IVA (หมู่ 14)' },
  { z: 33, symbol: 'As', name: 'Arsenic (สารหนู)', period: 4, group: 15, block: 'p', config: '[Ar] 4s² 3d¹⁰ 4p³', valence: '4s² 4p³', groupLabel: 'VA (หมู่ 15)' },
  { z: 34, symbol: 'Se', name: 'Selenium (ซีลีเนียม)', period: 4, group: 16, block: 'p', config: '[Ar] 4s² 3d¹⁰ 4p⁴', valence: '4s² 4p⁴', groupLabel: 'VIA (หมู่ 16)' },
  { z: 35, symbol: 'Br', name: 'Bromine (โบรมีน)', period: 4, group: 17, block: 'p', config: '[Ar] 4s² 3d¹⁰ 4p⁵', valence: '4s² 4p⁵', groupLabel: 'VIIA (หมู่ 17)' },
  { z: 36, symbol: 'Kr', name: 'Krypton (คริปตอน)', period: 4, group: 18, block: 'p', config: '[Ar] 4s² 3d¹⁰ 4p⁶', valence: '4s² 4p⁶', groupLabel: 'VIIIA (หมู่ 18)' },
  // Period 5
  { z: 37, symbol: 'Rb', name: 'Rubidium (รูบิเดียม)', period: 5, group: 1, block: 's', config: '[Kr] 5s¹', valence: '5s¹', groupLabel: 'IA (หมู่ 1)' },
  { z: 38, symbol: 'Sr', name: 'Strontium (สตรอนเทียม)', period: 5, group: 2, block: 's', config: '[Kr] 5s²', valence: '5s²', groupLabel: 'IIA (หมู่ 2)' },
  { z: 39, symbol: 'Y', name: 'Yttrium (อิตเทรียม)', period: 5, group: 3, block: 'd', config: '[Kr] 5s² 4d¹', valence: '5s² 4d¹', groupLabel: 'IIIB (หมู่ 3)' },
  { z: 40, symbol: 'Zr', name: 'Zirconium (เซอร์โคเนียม)', period: 5, group: 4, block: 'd', config: '[Kr] 5s² 4d²', valence: '5s² 4d²', groupLabel: 'IVB (หมู่ 4)' },
  { z: 41, symbol: 'Nb', name: 'Niobium (ไนโอเบียม)', period: 5, group: 5, block: 'd', config: '[Kr] 5s¹ 4d⁴', valence: '5s¹ 4d⁴', groupLabel: 'VB (หมู่ 5)', isException: true },
  { z: 42, symbol: 'Mo', name: 'Molybdenum (โมลิบดีนัม)', period: 5, group: 6, block: 'd', config: '[Kr] 5s¹ 4d⁵', valence: '5s¹ 4d⁵', groupLabel: 'VIB (หมู่ 6)', isException: true },
  { z: 43, symbol: 'Tc', name: 'Technetium (เทกนีเทียม)', period: 5, group: 7, block: 'd', config: '[Kr] 5s² 4d⁵', valence: '5s² 4d⁵', groupLabel: 'VIIB (หมู่ 7)' },
  { z: 44, symbol: 'Ru', name: 'Ruthenium (รูทีเนียม)', period: 5, group: 8, block: 'd', config: '[Kr] 5s¹ 4d⁷', valence: '5s¹ 4d⁷', groupLabel: 'VIIIB (หมู่ 8)', isException: true },
  { z: 45, symbol: 'Rh', name: 'Rhodium (โรเดียม)', period: 5, group: 9, block: 'd', config: '[Kr] 5s¹ 4d⁸', valence: '5s¹ 4d⁸', groupLabel: 'VIIIB (หมู่ 9)', isException: true },
  { z: 46, symbol: 'Pd', name: 'Palladium (แพลเลเดียม)', period: 5, group: 10, block: 'd', config: '[Kr] 4d¹⁰', valence: '4d¹⁰', groupLabel: 'VIIIB (หมู่ 10)', isException: true },
  { z: 47, symbol: 'Ag', name: 'Silver (เงิน)', period: 5, group: 11, block: 'd', config: '[Kr] 5s¹ 4d¹⁰', valence: '5s¹ 4d¹⁰', groupLabel: 'IB (หมู่ 11)', isException: true },
  { z: 48, symbol: 'Cd', name: 'Cadmium (แคดเมียม)', period: 5, group: 12, block: 'd', config: '[Kr] 5s² 4d¹⁰', valence: '5s² 4d¹⁰', groupLabel: 'IIB (หมู่ 12)' },
  { z: 49, symbol: 'In', name: 'Indium (อินเดียม)', period: 5, group: 13, block: 'p', config: '[Kr] 5s² 4d¹⁰ 5p¹', valence: '5s² 5p¹', groupLabel: 'IIIA (หมู่ 13)' },
  { z: 50, symbol: 'Sn', name: 'Tin (ดีบุก)', period: 5, group: 14, block: 'p', config: '[Kr] 5s² 4d¹⁰ 5p²', valence: '5s² 5p²', groupLabel: 'IVA (หมู่ 14)' },
  { z: 51, symbol: 'Sb', name: 'Antimony (พลวง)', period: 5, group: 15, block: 'p', config: '[Kr] 5s² 4d¹⁰ 5p³', valence: '5s² 5p³', groupLabel: 'VA (หมู่ 15)' },
  { z: 52, symbol: 'Te', name: 'Tellurium (เทลลูเรียม)', period: 5, group: 16, block: 'p', config: '[Kr] 5s² 4d¹⁰ 5p⁴', valence: '5s² 5p⁴', groupLabel: 'VIA (หมู่ 16)' },
  { z: 53, symbol: 'I', name: 'Iodine (ไอโอดีน)', period: 5, group: 17, block: 'p', config: '[Kr] 5s² 4d¹⁰ 5p⁵', valence: '5s² 5p⁵', groupLabel: 'VIIA (หมู่ 17)' },
  { z: 54, symbol: 'Xe', name: 'Xenon (ซีนอน)', period: 5, group: 18, block: 'p', config: '[Kr] 5s² 4d¹⁰ 5p⁶', valence: '5s² 5p⁶', groupLabel: 'VIIIA (หมู่ 18)' },
];

export default function ApplicationsViewer() {
  // --- APPLICATION SUB-TABS ---
  const [subTab, setSubTab] = useState<'symbol' | 'unpaired' | 'periodic'>('symbol');
  const [activeInfoPopup, setActiveInfoPopup] = useState<'symbol' | 'unpaired' | 'periodic' | null>(null);

  // --- SUB-TAB 1: SYMBOL NOTATION STATES ---
  const [symN, setSymN] = useState<number>(2);
  const [symSub, setSymSub] = useState<'s' | 'p' | 'd' | 'f'>('p');
  const [symElectrons, setSymElectrons] = useState<number>(5);
  const [activeHoverPart, setActiveHoverPart] = useState<'n' | 'l' | 'e'>('n');

  // Maximum electron capacity depending on subshell type
  const getCapacity = (sub: 's' | 'p' | 'd' | 'f') => {
    if (sub === 's') return 2;
    if (sub === 'p') return 6;
    if (sub === 'd') return 10;
    return 14;
  };

  // Keep electrons within capacity when subshell type changes
  useEffect(() => {
    const maxCap = getCapacity(symSub);
    if (symElectrons > maxCap) {
      setSymElectrons(maxCap);
    }
  }, [symSub]);

  // Adjust subshells allowed by principal energy level N
  useEffect(() => {
    if (symN === 1 && symSub !== 's') {
      setSymSub('s');
    } else if (symN === 2 && symSub !== 's' && symSub !== 'p') {
      setSymSub('p');
    } else if (symN === 3 && symSub === 'f') {
      setSymSub('d');
    }
  }, [symN]);

  // --- SUB-TAB 2: UNPAIRED ELECTRON STATES ---
  const [unpSub, setUnpSub] = useState<'s' | 'p' | 'd' | 'f'>('d');
  const [unpElectrons, setUnpElectrons] = useState<number>(7);
  const [quizScore, setQuizScore] = useState(0);

  // Unpaired sub-tab electron safety
  useEffect(() => {
    const maxCap = getCapacity(unpSub);
    if (unpElectrons > maxCap) {
      setUnpElectrons(maxCap);
    }
  }, [unpSub]);

  // Hund's rule orbit arrow calculation
  const getOrbitalFillings = (sub: 's' | 'p' | 'd' | 'f', eCount: number) => {
    const boxCount = sub === 's' ? 1 : sub === 'p' ? 3 : sub === 'd' ? 5 : 7;
    
    // Each orbital starts empty
    const boxes: Array<{ up: boolean; down: boolean }> = Array.from({ length: boxCount }, () => ({
      up: false,
      down: false,
    }));

    // Step 1: Fill spin-up (Hund's Rule)
    for (let i = 0; i < Math.min(eCount, boxCount); i++) {
      boxes[i].up = true;
    }

    // Step 2: Pair with spin-down (Pauli Exclusion Principle)
    if (eCount > boxCount) {
      const remaining = eCount - boxCount;
      for (let i = 0; i < Math.min(remaining, boxCount); i++) {
        boxes[i].down = true;
      }
    }

    // Count unpaired & paired electrons
    let unpaired = 0;
    let pairedPairs = 0;
    boxes.forEach(b => {
      if (b.up && !b.down) unpaired++;
      if (b.up && b.down) pairedPairs++;
    });

    return { boxes, unpaired, pairedCount: pairedPairs * 2 };
  };

  const { boxes: orbitBoxes, unpaired: unpairedCount, pairedCount } = getOrbitalFillings(unpSub, unpElectrons);

  // --- SUB-TAB 3: PERIODIC TABLE STATES ---
  const [selectedZ, setSelectedZ] = useState<number>(8); // Oxygen by default
  const [hoveredZ, setHoveredZ] = useState<number | null>(null);
  
  const activeZ = hoveredZ || selectedZ;
  const activeElement = PERIODIC_ELEMENTS.find(el => el.z === activeZ) || PERIODIC_ELEMENTS[7];

  // --- INTERACTIVE QUIZZES DATA ---
  const [answeredQuizzes, setAnsweredQuizzes] = useState<Set<string>>(new Set());

  // Quiz 1: Symbol Interpretation
  const [symQuizIndex, setSymQuizIndex] = useState(0);
  const [selectedSymAnswer, setSelectedSymAnswer] = useState<number | null>(null);
  const [isSymAnswerCorrect, setIsSymAnswerCorrect] = useState<boolean | null>(null);
  const symQuizzes = [
    {
      q: 'จากสัญลักษณ์ 3d⁷ ตัวเลข "3" มีความหมายว่าอย่างไร?',
      options: [
        'มีอิเล็กตรอน 3 ตัวในระดับพลังงานย่อย d',
        'ระดับพลังงานหลัก (n) เท่ากับ 3',
        'มีจำนวนออร์บิทัล 3 ห้อง',
        'สปินของอิเล็กตรอนชี้ขึ้น 3 ตัว'
      ],
      correct: 1,
      explanation: 'ตัวเลขหน้าสัญลักษณ์ (เช่น 3 ใน 3d) บ่งบอกถึงระดับพลังงานหลัก (n = 3) ที่อิเล็กตรอนอาศัยอยู่'
    },
    {
      q: 'ระดับพลังงานย่อย 4p⁵ สามารถรับอิเล็กตรอนเพิ่มได้อีกกี่ตัว?',
      options: [
        '1 ตัว (เนื่องจาก p บรรจุได้สูงสุด 6 ตัว)',
        '2 ตัว (เนื่องจาก p บรรจุได้สูงสุด 7 ตัว)',
        '5 ตัว (เนื่องจากมีอิเล็กตรอนเดี่ยว 5 ตัว)',
        'เต็มแล้ว ไม่สามารถบรรจุเพิ่มได้อีก'
      ],
      correct: 0,
      explanation: 'ระดับพลังงานย่อย p (มี 3 ออร์บิทัล) จุอิเล็กตรอนสูงสุดได้ 6 ตัว สัญลักษณ์ 4p⁵ มีอยู่แล้ว 5 ตัว จึงเหลือที่ว่างอีก 1 ตัวเท่านั้น'
    },
    {
      q: 'สัญลักษณ์ในข้อใดไม่มีทางเกิดขึ้นได้จริงตามหลักควอนตัม?',
      options: [
        '2s²',
        '1p⁶',
        '3d¹⁰',
        '4f⁵'
      ],
      correct: 1,
      explanation: 'ในระดับพลังงานหลัก n = 1 จะมีเฉพาะระดับพลังงานย่อย s เท่านั้น (1s) ไม่มี 1p เกิดขึ้นได้ เนื่องจากค่าเลขควอนตัมโมเมนตัมเชิงมุม l ต้องน้อยกว่า n เสมอ (l < n)'
    }
  ];

  const handleSymAnswer = (optIndex: number) => {
    setSelectedSymAnswer(optIndex);
    const isCorrect = optIndex === symQuizzes[symQuizIndex].correct;
    setIsSymAnswerCorrect(isCorrect);
    if (isCorrect) {
      const quizId = `sym-${symQuizIndex}`;
      if (!answeredQuizzes.has(quizId)) {
        setQuizScore(prev => prev + 1);
        setAnsweredQuizzes(prev => new Set(prev).add(quizId));
      }
    }
  };

  const nextSymQuiz = () => {
    setSelectedSymAnswer(null);
    setIsSymAnswerCorrect(null);
    setSymQuizIndex(prev => (prev + 1) % symQuizzes.length);
  };

  // Quiz 2: Unpaired Electrons
  const [unpQuizIndex, setUnpQuizIndex] = useState(0);
  const [selectedUnpAnswer, setSelectedUnpAnswer] = useState<number | null>(null);
  const [isUnpAnswerCorrect, setIsUnpAnswerCorrect] = useState<boolean | null>(null);
  const unpQuizzes = [
    {
      q: 'ระดับพลังงานย่อย 3p⁴ มีจำนวนอิเล็กตรอนเดี่ยว (Unpaired Electron) กี่ตัว?',
      options: ['1 ตัว', '2 ตัว', '3 ตัว', '4 ตัว'],
      correct: 1,
      explanation: 'ระดับพลังงานย่อย p มี 3 ออร์บิทัล บรรจุ 4 อิเล็กตรอน: ขั้นแรกใส่เดี่ยวชี้ขึ้น 3 ตัว (↑, ↑, ↑) แล้วอิเล็กตรอนที่ 4 จับคู่แบบชี้ลงตัวแรก (↑↓, ↑, ↑) ส่งผลให้เหลืออิเล็กตรอนเดี่ยว 2 ตัว'
    },
    {
      q: 'ธาตุไนโตรเจน (N, Z=7) มีการจัดเรียงอิเล็กตรอนเป็น 1s² 2s² 2p³ จะมีอิเล็กตรอนเดี่ยวในระดับพลังงานนอกสุดกี่ตัว?',
      options: ['0 ตัว', '1 ตัว', '3 ตัว', '5 ตัว'],
      correct: 2,
      explanation: 'วงนอกสุดคือ 2p³ ออร์บิทัล p มี 3 ห้อง บรรจุ 3 อิเล็กตรอน ทุกห้องจึงได้อิเล็กตรอนเดี่ยว (↑, ↑, ↑) รวมเป็น 3 ตัว'
    },
    {
      q: 'การจัดเรียงข้อใดมีจำนวนอิเล็กตรอนเดี่ยว "มากที่สุด"?',
      options: [
        '3d⁵ (ธาตุแมงกานีส Mn)',
        '3d⁶ (ธาตุเหล็ก Fe)',
        '3d⁸ (ธาตุนิกเกิล Ni)',
        '4s² (ธาตุแคลเซียม Ca)'
      ],
      correct: 0,
      explanation: 'ระดับพลังงานย่อย d มี 5 ออร์บิทัล: 3d⁵ บรรจุเดี่ยวทุกห้อง (↑, ↑, ↑, ↑, ↑) มีอิเล็กตรอนเดี่ยว 5 ตัว ส่วน 3d⁶ เริ่มจับคู่จึงเหลือเดี่ยว 4 ตัว และ 4s² บรรจุเต็มไม่มีอิเล็กตรอนเดี่ยวเลย'
    }
  ];

  const handleUnpAnswer = (optIndex: number) => {
    setSelectedUnpAnswer(optIndex);
    const isCorrect = optIndex === unpQuizzes[unpQuizIndex].correct;
    setIsUnpAnswerCorrect(isCorrect);
    if (isCorrect) {
      const quizId = `unp-${unpQuizIndex}`;
      if (!answeredQuizzes.has(quizId)) {
        setQuizScore(prev => prev + 1);
        setAnsweredQuizzes(prev => new Set(prev).add(quizId));
      }
    }
  };

  const nextUnpQuiz = () => {
    setSelectedUnpAnswer(null);
    setIsUnpAnswerCorrect(null);
    setUnpQuizIndex(prev => (prev + 1) % unpQuizzes.length);
  };

  // Quiz 3: Periodic Table
  const [perQuizIndex, setPerQuizIndex] = useState(0);
  const [selectedPerAnswer, setSelectedPerAnswer] = useState<number | null>(null);
  const [isPerAnswerCorrect, setIsPerAnswerCorrect] = useState<boolean | null>(null);
  const perQuizzes = [
    {
      q: 'ธาตุที่มีการจัดเรียงวาเลนซ์อิเล็กตรอนลงท้ายด้วย 3s² 3p⁵ จะอยู่ในตำแหน่งใดในตารางธาตุ?',
      options: [
        'คาบ 3 หมู่ 5 บล็อก p',
        'คาบ 3 หมู่ 15 บล็อก p',
        'คาบ 3 หมู่ 17 (VIIA) บล็อก p',
        'คาบ 2 หมู่ 17 (VIIA) บล็อก s'
      ],
      correct: 2,
      explanation: 'เลขระดับพลังงานหลักสูงสุดคือ 3 (คาบ 3) มีวาเลนซ์อิเล็กตรอนรวม 7 ตัว จัดเป็นธาตุหมู่ VIIA หรือหมู่ 17 บล็อก p (อโลหะกลุ่มฮาโลเจน)'
    },
    {
      q: 'การที่ธาตุ โครเมียม (Cr, Z=24) จัดเรียงอิเล็กตรอนวงนอกสุดเป็น 4s¹ 3d⁵ ข้อใดอธิบายคาบและหมู่ของมันได้ถูกต้อง?',
      options: [
        'คาบ 3 หมู่ 5 (VB)',
        'คาบ 4 หมู่ 6 (VIB) แทรนซิชัน',
        'คาบ 4 หมู่ 1 (IA)',
        'คาบ 4 หมู่ 5 (VB)'
      ],
      correct: 1,
      explanation: 'Cr มีระดับพลังงานสูงสุด n=4 จึงอยู่คาบ 4 และอิเล็กตรอนใน s และ d รวมกัน 6 ตัว ทำให้อยู่หมู่ 6 หรือ VIB ซึ่งเป็นโลหะแทรนซิชันในบล็อก d'
    },
    {
      q: 'ธาตุที่มีการจัดเรียงอิเล็กตรอนเป็น [Ar] 4s² จัดอยู่ใน "บล็อก" ใดและมีสมบัติเป็นประเภทใด?',
      options: [
        's-block, โลหะแอลคาไลน์เอิร์ท (แคลเซียม)',
        'p-block, อโลหะ',
        'd-block, โลหะแทรนซิชัน',
        's-block, แก๊สเฉื่อย'
      ],
      correct: 0,
      explanation: '[Ar] 4s² คือแคลเซียม (Ca, Z=20) เนื่องจากอิเล็กตรอนตัวสุดท้ายบรรจุใน s orbital จึงจัดอยู่ใน s-block หมู่ IIA ซึ่งเป็นโลหะแอลคาไลน์เอิร์ท'
    }
  ];

  const handlePerAnswer = (optIndex: number) => {
    setSelectedPerAnswer(optIndex);
    const isCorrect = optIndex === perQuizzes[perQuizIndex].correct;
    setIsPerAnswerCorrect(isCorrect);
    if (isCorrect) {
      const quizId = `per-${perQuizIndex}`;
      if (!answeredQuizzes.has(quizId)) {
        setQuizScore(prev => prev + 1);
        setAnsweredQuizzes(prev => new Set(prev).add(quizId));
      }
    }
  };

  const nextPerQuiz = () => {
    setSelectedPerAnswer(null);
    setIsPerAnswerCorrect(null);
    setPerQuizIndex(prev => (prev + 1) % perQuizzes.length);
  };

  // Reset all quizzes score
  const resetQuizScore = () => {
    setQuizScore(0);
    setAnsweredQuizzes(new Set());
    setSelectedSymAnswer(null);
    setIsSymAnswerCorrect(null);
    setSelectedUnpAnswer(null);
    setIsUnpAnswerCorrect(null);
    setSelectedPerAnswer(null);
    setIsPerAnswerCorrect(null);
  };

  // Helper helper to format superscript numbers
  const getSuperscript = (num: number) => {
    const supers = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '¹⁰', '¹¹', '¹²', '¹³', '¹⁴'];
    return supers[num] || num.toString();
  };

  return (
    <div id="applications-container" className="flex-1 relative w-full h-full flex flex-col gap-4 min-h-0 overflow-y-auto lg:overflow-hidden">
      
      {/* Main Double Panel Content */}
      <div id="app-panels-wrapper" className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 pb-16 lg:pb-0">
        
        {/* ================= LEFT PLAYGROUND PANEL ================= */}
        <section 
          id="app-left-playground" 
          className="w-full lg:flex-1 h-[420px] lg:h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl relative overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 flex flex-col shrink-0 shadow-2xl p-0 sm:p-6"
        >
          {/* MOBILE UNIFIED TABS - INTEGRATED HEADER STYLE */}
          <div className="sm:hidden flex flex-row items-center justify-between gap-2 p-2 pb-1.5 border-b border-white/5 bg-slate-950/20 z-10 shrink-0">
            <div className="flex bg-slate-950/60 p-0.5 rounded-xl border border-white/10 self-start overflow-x-auto scrollbar-none max-w-full shadow-inner">
              <button
                id="tab-btn-symbol-mobile"
                type="button"
                onClick={() => { setSubTab('symbol'); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  subTab === 'symbol'
                    ? 'bg-blue-600 text-white shadow-sm font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                สัญลักษณ์
              </button>
              
              <button
                id="tab-btn-unpaired-mobile"
                type="button"
                onClick={() => { setSubTab('unpaired'); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  subTab === 'unpaired'
                    ? 'bg-emerald-600 text-white shadow-sm font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                อิเล็กตรอนเดี่ยว
              </button>
              
              <button
                id="tab-btn-periodic-mobile"
                type="button"
                onClick={() => { setSubTab('periodic'); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  subTab === 'periodic'
                    ? 'bg-amber-600 text-white shadow-sm font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                พิกัดธาตุ
              </button>
            </div>

            <div className="p-0.5">
              <button 
                onClick={() => setActiveInfoPopup('combined')} 
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black px-2.5 py-1.5 rounded-lg text-[10px] transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm shadow-blue-500/5"
                title="คำอธิบาย"
              >
                <Info size={12} className="shrink-0" />
                <span>คำอธิบาย</span>
              </button>
            </div>
          </div>

          {/* Desktop Header with Sub-tabs and Info Button */}
          <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3 mb-3 shrink-0 relative px-6 pt-6">
            <div className="flex bg-slate-950/60 p-0.5 rounded-xl border border-white/10 self-start overflow-x-auto scrollbar-none max-w-full shadow-inner">
              <button
                id="tab-btn-symbol"
                type="button"
                onClick={() => { setSubTab('symbol'); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  subTab === 'symbol'
                    ? 'bg-blue-600 text-white shadow-sm font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap size={12} className="hidden sm:block" />
                <span className="whitespace-nowrap hidden sm:inline text-xs">ถอดรหัสสัญลักษณ์</span>
              </button>
              
              <button
                id="tab-btn-unpaired"
                type="button"
                onClick={() => { setSubTab('unpaired'); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  subTab === 'unpaired'
                    ? 'bg-emerald-600 text-white shadow-sm font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers size={12} className="hidden sm:block" />
                <span className="whitespace-nowrap hidden sm:inline text-xs">นับอิเล็กตรอนเดี่ยว</span>
              </button>
              
              <button
                id="tab-btn-periodic"
                type="button"
                onClick={() => { setSubTab('periodic'); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  subTab === 'periodic'
                    ? 'bg-amber-600 text-white shadow-sm font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid size={12} className="hidden sm:block" />
                <span className="whitespace-nowrap hidden sm:inline text-xs">ระบุตำแหน่งธาตุ</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-0">

          <AnimatePresence mode="wait">
            {/* 1. SYMBOL PLAYGROUND */}
            {subTab === 'symbol' && (
              <motion.div
                key="symbol-play"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col min-h-0 justify-between gap-3 lg:gap-4"
              >
                {/* Main Interactive Giant Symbol Display */}
                <div className="flex-1 flex items-center justify-center py-2 lg:py-4 relative">
                  <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 to-transparent pointer-events-none rounded-full blur-xl" />
                  
                  <div className="flex items-baseline font-mono select-none bg-slate-950/60 p-4 sm:p-6 rounded-3xl border border-white/5 shadow-2xl relative max-w-sm w-full justify-center gap-1.5 group">
                    {/* Part n: Principal Quantum Number */}
                    <div 
                      onMouseEnter={() => setActiveHoverPart('n')}
                      onClick={() => setActiveHoverPart('n')}
                      className={`text-7xl sm:text-8xl font-black transition-all duration-200 cursor-pointer px-2 rounded-2xl relative ${
                        activeHoverPart === 'n' 
                          ? 'text-blue-400 scale-105 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                          : 'text-slate-100 hover:text-blue-300'
                      }`}
                    >
                      {symN}
                      <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[9px] font-sans font-bold text-blue-400 tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ระดับหลัก (n)
                      </span>
                    </div>

                    {/* Part l: Subshell symbol */}
                    <div 
                      onMouseEnter={() => setActiveHoverPart('l')}
                      onClick={() => setActiveHoverPart('l')}
                      className={`text-6xl sm:text-7xl font-bold italic transition-all duration-200 cursor-pointer px-2 rounded-2xl relative ${
                        activeHoverPart === 'l' 
                          ? 'text-indigo-400 scale-105 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                          : 'text-slate-300 hover:text-indigo-300'
                      }`}
                    >
                      {symSub}
                      <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[9px] font-sans font-bold text-indigo-400 tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ระดับย่อย (l)
                      </span>
                    </div>

                    {/* Part e: Electron count */}
                    <div 
                      onMouseEnter={() => setActiveHoverPart('e')}
                      onClick={() => setActiveHoverPart('e')}
                      className={`text-4xl sm:text-5xl font-extrabold transition-all duration-200 cursor-pointer px-2 py-1 rounded-2xl relative -translate-y-8 ${
                        activeHoverPart === 'e' 
                          ? 'text-pink-400 scale-105 bg-pink-500/10 shadow-[0_0_20px_rgba(244,114,182,0.2)]' 
                          : 'text-slate-200 hover:text-pink-300'
                      }`}
                    >
                      {symElectrons}
                      <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-[9px] font-sans font-bold text-pink-400 tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        อิเล็กตรอน (e⁻)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-tab 1 Controllers */}
                <div className="grid grid-cols-3 gap-3 bg-slate-950/40 p-3 rounded-2xl border border-white/5 shrink-0">
                  {/* Selector n */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 text-center uppercase tracking-wider">พลังงานหลัก (n)</span>
                    <div className="flex items-center justify-between bg-slate-950 px-2 py-1 rounded-xl border border-white/5">
                      <button 
                        onClick={() => setSymN(prev => Math.max(1, prev - 1))}
                        disabled={symN <= 1}
                        className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-white text-xs cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-mono font-bold text-sm text-white">{symN}</span>
                      <button 
                        onClick={() => setSymN(prev => Math.min(7, prev + 1))}
                        disabled={symN >= 7}
                        className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-white text-xs cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Selector Subshell */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 text-center uppercase tracking-wider">ระดับย่อย (l)</span>
                    <div className="flex items-center justify-around bg-slate-950 p-1 rounded-xl border border-white/5 h-[34px]">
                      {(['s', 'p', 'd', 'f'] as const).map(sub => {
                        const isAllowed = 
                          (symN === 1 && sub === 's') ||
                          (symN === 2 && (sub === 's' || sub === 'p')) ||
                          (symN === 3 && (sub !== 'f')) ||
                          (symN >= 4);

                        const isSelected = symSub === sub;
                        return (
                          <button
                            key={sub}
                            disabled={!isAllowed}
                            onClick={() => setSymSub(sub)}
                            className={`w-5 h-5 rounded-md text-[10px] font-black uppercase transition-all flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white font-black'
                                : 'text-slate-400 hover:bg-white/5 disabled:opacity-20'
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selector e- count */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 text-center uppercase tracking-wider">อิเล็กตรอน (e⁻)</span>
                    <div className="flex items-center justify-between bg-slate-950 px-2 py-1 rounded-xl border border-white/5">
                      <button 
                        onClick={() => setSymElectrons(prev => Math.max(1, prev - 1))}
                        disabled={symElectrons <= 1}
                        className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-white text-xs cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-mono font-bold text-sm text-white">{symElectrons}</span>
                      <button 
                        onClick={() => setSymElectrons(prev => Math.min(getCapacity(symSub), prev + 1))}
                        disabled={symElectrons >= getCapacity(symSub)}
                        className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-white text-xs cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* 2. UNPAIRED PLAYGROUND */}
            {subTab === 'unpaired' && (
              <motion.div
                key="unpaired-play"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col min-h-0 justify-between gap-3 lg:gap-4"
              >
                {/* Subshell Choice and Slider Control */}
                <div className="flex flex-col gap-3 bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">เลือกระดับพลังงานย่อย (Subshell):</span>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10 gap-1 self-stretch sm:self-auto justify-center">
                      {(['s', 'p', 'd', 'f'] as const).map(sub => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setUnpSub(sub)}
                          className={`px-4 py-1 rounded-lg text-sm font-black transition-all cursor-pointer ${
                            unpSub === sub
                              ? 'bg-emerald-500 text-slate-950 shadow'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-row items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">จำนวนอิเล็กตรอนที่เติม:</span>
                    <div className="flex-1 bg-slate-900/50 rounded-xl p-2 border border-white/5 shadow-inner">
                      <input
                        type="range"
                        min={1}
                        max={getCapacity(unpSub)}
                        value={unpElectrons}
                        onChange={(e) => setUnpElectrons(parseInt(e.target.value))}
                        className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer hover:bg-slate-700 transition-colors block ${unpSub === 's' ? 'accent-pink-500' : unpSub === 'p' ? 'accent-cyan-500' : unpSub === 'd' ? 'accent-amber-500' : 'accent-purple-500'}`}
                        title="เลื่อนปรับจำนวนอิเล็กตรอน"
                      />
                    </div>
                    <span className={`${unpSub === 's' ? 'text-pink-400' : unpSub === 'p' ? 'text-cyan-400' : unpSub === 'd' ? 'text-amber-400' : 'text-purple-400'} font-mono font-black text-xs whitespace-nowrap min-w-[36px] text-right`}>{unpElectrons}/{getCapacity(unpSub)}</span>
                  </div>
                </div>

                {/* Main Interactive Orbital Boxes Visualization */}
                <div className="flex-1 flex flex-col items-center justify-center py-0 w-full">
                  <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-0.5">
                    โครงสร้างห้องวงโคจร (Orbital Diagram)
                  </span>
                  
                  <div className="flex flex-nowrap overflow-x-auto items-center justify-center gap-1.5 sm:gap-2 py-0 w-full px-2 scrollbar-thin scrollbar-thumb-slate-700 pb-0">
                    {orbitBoxes.map((box, index) => {
                      const hasSpinUp = box.up;
                      const hasSpinDown = box.down;

                      return (
                      <div
                        key={index}
                        className={`w-7 h-9 rounded-md border flex items-center justify-center gap-0.5 relative font-mono text-sm font-black transition-all duration-200 shrink-0 ${
                          hasSpinDown
                             ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-inner shadow-amber-500/10'
                             : hasSpinUp
                               ? 'border-sky-400 bg-sky-500/10 text-sky-300'
                               : 'border-white/5 bg-slate-900/30 text-slate-700'
                        }`}
                      >
                        {/* Spin Up Arrow */}
                        <span
                           className={`transition-all duration-300 select-none ${
                            hasSpinUp ? 'opacity-100 scale-110 translate-y-0' : 'opacity-0 -translate-y-2 scale-75'
                          }`}
                        >
                          ↿
                        </span>
                        {/* Spin Down Arrow */}
                        <span
                           className={`transition-all duration-300 select-none ${
                            hasSpinDown ? 'opacity-100 scale-110 translate-y-0 text-amber-400' : 'opacity-0 translate-y-2 scale-75'
                          }`}
                        >
                          ⇂
                        </span>
                        
                        <span className="absolute bottom-[0.5px] right-[1.5px] text-[5px] text-slate-400/20 font-normal">
                          {index + 1}
                        </span>
                      </div>
                    )})}
                  </div>
                </div>

                {/* Calculation breakdown summary */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-white/5 text-center shadow-lg shrink-0">
                  <div className="border-r border-white/5">
                    <span className="block text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">อิเล็กตรอนเดี่ยว</span>
                    <span className="text-lg sm:text-xl font-black text-sky-400 font-mono animate-pulse">{unpairedCount}</span>
                    <span className="block text-[7px] sm:text-[8px] text-slate-500 mt-0.5">ตัว (สปินชี้เดี่ยว ↑)</span>
                  </div>
                  
                  <div className="border-r border-white/5">
                    <span className="block text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">อิเล็กตรอนจับคู่</span>
                    <span className="text-lg sm:text-xl font-black text-amber-400 font-mono">{pairedCount}</span>
                    <span className="block text-[7px] sm:text-[8px] text-slate-500 mt-0.5">ตัว ({pairedCount / 2} คู่ ↑↓)</span>
                  </div>

                  <div>
                    <span className="block text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ลักษณะการจัดเรียง</span>
                    <span className="text-[10px] sm:text-xs font-black text-slate-200 uppercase leading-normal mt-1 block">
                      {unpElectrons === getCapacity(unpSub) ? (
                        <span className="text-emerald-400 font-bold">บรรจุเต็ม (Full)</span>
                      ) : unpElectrons === getCapacity(unpSub) / 2 ? (
                        <span className="text-amber-400 font-bold">บรรจุครึ่ง (Half)</span>
                      ) : (
                        <span className="text-slate-400 font-bold">บรรจุทั่วไป (Partial)</span>
                      )}
                    </span>
                    <span className="block text-[8px] text-slate-500 mt-0.5">ความเสถียรชั้นย่อย</span>
                  </div>
                </div>

              </motion.div>
            )}

            {/* 3. PERIODIC TABLE PLAYGROUND */}
            {subTab === 'periodic' && (
              <motion.div
                key="periodic-play"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col min-h-0 justify-between gap-4"
              >
                {/* Color Legend */}
                <div className="flex flex-row flex-wrap items-center gap-3 text-[9px] font-bold text-slate-400 px-1 shrink-0 justify-center">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-pink-500/20 border border-pink-500/40" />s-block (โลหะหมู่หลัก)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cyan-500/20 border border-cyan-500/40" />p-block (อโลหะ/กึ่งโลหะ)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/40" />d-block (โลหะแทรนซิชัน)</span>
                </div>

                {/* 18-Column Interactive Miniature Periodic Table Grid */}
                <div className="flex-1 w-full py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800 shrink-0 relative flex flex-col justify-center">
                  <div className="grid gap-1 min-w-[500px] lg:min-w-[700px] select-none p-2 lg:p-4 bg-slate-950/40 rounded-2xl border border-white/5 mx-auto w-full" style={{ gridTemplateColumns: 'repeat(18, minmax(24px, 1fr))' }}>
                    
                    {/* Render Periodic Grid Cells manually according to coordinates */}
                    {Array.from({ length: 5 }).map((_, rIdx) => {
                      const currentPeriod = rIdx + 1;
                      
                      return Array.from({ length: 18 }).map((_, cIdx) => {
                        const currentGroup = cIdx + 1;
                        
                        // Find element matching Period and Group
                        const element = PERIODIC_ELEMENTS.find(
                          el => el.period === currentPeriod && el.group === currentGroup
                        );

                        if (!element) {
                          // Return empty spacer grid cell
                          return <div key={`empty-${currentPeriod}-${currentGroup}`} className="aspect-square lg:aspect-[4/5]" />;
                        }

                        const isSelected = element.z === activeZ;
                        const blockColors = 
                          element.block === 's' ? 'bg-pink-500/10 hover:bg-pink-500/25 border-pink-500/30 text-pink-300' :
                          element.block === 'p' ? 'bg-cyan-500/10 hover:bg-cyan-500/25 border-cyan-500/30 text-cyan-300' :
                          'bg-amber-500/10 hover:bg-amber-500/25 border-amber-500/30 text-amber-300';

                        const selectedBorder = isSelected 
                          ? 'ring-2 ring-white scale-110 shadow-lg z-10 font-black ' + 
                            (element.block === 's' ? 'shadow-pink-500/30 bg-pink-500/40 text-white' : 
                             element.block === 'p' ? 'shadow-cyan-500/30 bg-cyan-500/40 text-white' : 
                             'shadow-amber-500/30 bg-amber-500/40 text-white')
                          : 'border text-[10px]';

                        return (
                          <button
                            key={element.z}
                            type="button"
                            onClick={() => setSelectedZ(element.z)}
                            onMouseEnter={() => setHoveredZ(element.z)}
                            onMouseLeave={() => setHoveredZ(null)}
                            className={`aspect-square lg:aspect-[4/5] rounded-md border flex flex-col items-center justify-center cursor-pointer transition-all ${blockColors} ${selectedBorder}`}
                          >
                            <span className="text-[7px] lg:text-[9px] leading-none text-slate-400 font-mono absolute -translate-y-2 sm:-translate-y-3 lg:-translate-y-4">
                              {element.z}
                            </span>
                            <span className="text-[10px] sm:text-xs lg:text-base font-black tracking-tighter block translate-y-0.5 sm:translate-y-1 lg:translate-y-1.5">
                              {element.symbol}
                            </span>
                          </button>
                        );
                      });
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>

        </section>

        {/* ================= RIGHT CONTROLS & THEORY PANEL ================= */}
        <aside 
          id="app-right-sidebar" 
          className="w-full lg:w-96 flex flex-col gap-4 shrink-0 lg:h-full lg:overflow-y-auto pr-0 lg:pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
        >

          {/* Panel: Theory and Core Academic Summary */}
          <div className="hidden lg:flex relative">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-xl flex flex-col gap-4 min-h-[180px] w-full">
              <h4 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-white/5 pb-2">
                <BookOpen size={15} className="text-blue-400" /> 
                {subTab === 'symbol' && 'หัวข้อ: ความลับในสัญลักษณ์พลังงาน'}
                {subTab === 'unpaired' && 'หัวข้อ: ความสปินของอิเล็กตรอนเดี่ยว'}
                {subTab === 'periodic' && 'หัวข้อ: ถอดพิกัดคาบ-หมู่ ตารางธาตุ'}
              </h4>

              {subTab === 'symbol' && (
                <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
                  <p>
                    สัญลักษณ์ทางเคมีเช่น <code className="text-blue-400 font-black">2p⁵</code> สามารถแกะเป็นข้อมูลควอนตัมได้ทันที:
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-400">
                    <li>
                      <strong className="text-slate-300">ตัวเลข (2)</strong>: บอกระดับพลังงานหลัก (n) แสดงถึงขนาดของออร์บิทัล
                    </li>
                    <li>
                      <strong className="text-slate-300">ตัวอักษร (p)</strong>: บอกรูปร่างออร์บิทัล (s, p, d, f)
                    </li>
                    <li>
                      <strong className="text-slate-300">เลขยกกำลัง (⁵)</strong>: จำนวนอิเล็กตรอนที่บรรจุในออร์บิทัลนั้น
                    </li>
                  </ul>
                </div>
              )}

              {subTab === 'unpaired' && (
                <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
                  <p>
                    <strong className="text-emerald-400">ทำไมจำนวนอิเล็กตรอนเดี่ยวจึงสำคัญ?</strong> เพราะมันสอดคล้องโดยตรงกับ <strong className="text-white">คุณสมบัติแม่เหล็ก</strong> และความสามารถในการทำปฏิกิริยาเคมี!
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-400">
                    <li>
                      <strong className="text-slate-300">พาราแมกเนติก (Paramagnetic)</strong>: ธาตุที่มีอิเล็กตรอนเดี่ยวเหลืออยู่ จะตอบสนองและถูกดึงดูดโดยแม่เหล็กภายนอก
                    </li>
                    <li>
                      <strong className="text-slate-300">ไดอะแมกเนติก (Diamagnetic)</strong>: ธาตุที่อิเล็กตรอนเข้าคู่กันหมดสมบูรณ์ (ไม่มีอิเล็กตรอนเดี่ยวเลย) จะถูกผลักออกเล็กน้อยโดยแม่เหล็กภายนอก
                    </li>
                  </ul>
                </div>
              )}

              {subTab === 'periodic' && (
                <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
                  <p>
                    เมื่อเราจัดเรียงวาเลนซ์อิเล็กตรอนเสร็จสิ้น เราจะสามารถคาดเดาตำแหน่งพิกัดและพฤติกรรมดั่งแผนที่ได้ดังนี้:
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-400">
                    <li>
                      <strong className="text-slate-300">ค่า n สูงสุด</strong>: ระบุคาบ (Period) ในแนวราบ
                    </li>
                    <li>
                      <strong className="text-slate-300">จำนวนวาเลนซ์อิเล็กตรอน</strong>: ระบุหมู่ (Group) ในแนวดิ่ง
                    </li>
                    <li>
                      <strong className="text-slate-300">ระดับพลังงานย่อยสุดท้าย</strong>: ระบุบล็อก (s, p, d, f) แบ่งแยกสมบัติโลหะ-อโลหะ
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Desktop embedded details panel overlaying theory card */}
            <AnimatePresence>
              {subTab === 'periodic' && hoveredZ && activeElement && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="hidden lg:flex absolute inset-0 z-20 flex-col items-stretch justify-center border border-white/20 bg-slate-900/95 backdrop-blur-md rounded-3xl p-5 text-left shadow-2xl pointer-events-none"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-amber-400 font-black text-base">{activeElement.name}</span>
                    </h4>
                    {activeElement.isException && (
                      <span className="text-[9px] bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded font-black uppercase tracking-wider animate-pulse shrink-0">
                        ข้อยกเว้นพิเศษ
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="flex flex-col bg-slate-950/60 p-2 rounded-xl border border-white/5 items-center justify-center text-center">
                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">เลขอะตอม</span>
                      <span className="text-slate-300 font-mono font-black text-sm mt-0.5">{activeElement.z}</span>
                    </div>
                    <div className="flex flex-col bg-slate-950/60 p-2 rounded-xl border border-white/5 items-center justify-center text-center">
                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">คาบ</span>
                      <span className="text-indigo-400 font-mono font-black text-sm mt-0.5">{activeElement.period}</span>
                    </div>
                    <div className="flex flex-col bg-slate-950/60 p-2 rounded-xl border border-white/5 items-center justify-center text-center">
                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">หมู่</span>
                      <span className="text-emerald-400 font-mono font-black text-sm mt-0.5 truncate w-full px-1" title={activeElement.groupLabel}>{activeElement.groupLabel.split(' ')[0]}</span>
                    </div>
                    <div className="flex flex-col bg-slate-950/60 p-2 rounded-xl border border-white/5 items-center justify-center text-center">
                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">บล็อก</span>
                      <span className="text-amber-400 font-mono font-black text-sm mt-0.5 uppercase">{activeElement.block}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-950/50 px-3 py-2 rounded-xl border border-white/5 mt-3">
                    <span className="text-[9px] text-slate-400 font-bold">การจัดเรียง:</span>
                    <span className="text-[11px] text-amber-300 font-mono font-black">{activeElement.config}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Panel: Live interactive Self-Assessment Quiz */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h4 className="text-xs sm:text-sm font-black text-slate-200 flex items-center gap-2">
                <HelpCircle size={15} className="text-amber-400" />
                แบบทดสอบท้าทายความเข้าใจ
              </h4>
              <span className="text-[10px] font-bold bg-slate-950 px-2 py-0.5 rounded-lg border border-white/5 text-amber-400 font-mono">
                คะแนนสะสม: {quizScore}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {/* SYMBOL QUIZ */}
              {subTab === 'symbol' && (
                <motion.div
                  key={`sym-quiz-${symQuizIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-3"
                >
                  <p className="text-xs font-black text-slate-100 leading-snug">
                    คำถาม {symQuizIndex + 1}: {symQuizzes[symQuizIndex].q}
                  </p>

                  <div className="flex flex-col gap-2">
                    {symQuizzes[symQuizIndex].options.map((option, idx) => {
                      const isSelected = selectedSymAnswer === idx;
                      const isCorrectAnswer = idx === symQuizzes[symQuizIndex].correct;
                      
                      let btnStyle = 'bg-slate-950/60 hover:bg-slate-950 text-slate-300 border-white/5';
                      if (selectedSymAnswer !== null) {
                        if (isCorrectAnswer) {
                          btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
                        } else if (isSelected) {
                          btnStyle = 'bg-red-500/20 text-red-300 border-red-500/50';
                        } else {
                          btnStyle = 'bg-slate-950/20 text-slate-500 border-transparent pointer-events-none';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={selectedSymAnswer !== null}
                          onClick={() => handleSymAnswer(idx)}
                          className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-bold leading-normal transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {selectedSymAnswer !== null && isCorrectAnswer && (
                            <CheckCircle size={12} className="text-emerald-400 shrink-0 ml-2" />
                          )}
                          {selectedSymAnswer !== null && isSelected && !isCorrectAnswer && (
                            <XCircle size={12} className="text-red-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedSymAnswer !== null && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-slate-950/60 p-3 rounded-xl border border-white/5 mt-1"
                    >
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        <strong className="text-amber-400 font-bold">อธิบายเพิ่มเติม:</strong> {symQuizzes[symQuizIndex].explanation}
                      </p>
                      <button
                        type="button"
                        onClick={nextSymQuiz}
                        className="w-full mt-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase cursor-pointer flex items-center justify-center gap-1 transition-all"
                      >
                        <span>ข้อต่อไป</span>
                        <ArrowRight size={11} />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* UNPAIRED ELECTRON QUIZ */}
              {subTab === 'unpaired' && (
                <motion.div
                  key={`unp-quiz-${unpQuizIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-3"
                >
                  <p className="text-xs font-black text-slate-100 leading-snug">
                    คำถาม {unpQuizIndex + 1}: {unpQuizzes[unpQuizIndex].q}
                  </p>

                  <div className="flex flex-col gap-2">
                    {unpQuizzes[unpQuizIndex].options.map((option, idx) => {
                      const isSelected = selectedUnpAnswer === idx;
                      const isCorrectAnswer = idx === unpQuizzes[unpQuizIndex].correct;
                      
                      let btnStyle = 'bg-slate-950/60 hover:bg-slate-950 text-slate-300 border-white/5';
                      if (selectedUnpAnswer !== null) {
                        if (isCorrectAnswer) {
                          btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
                        } else if (isSelected) {
                          btnStyle = 'bg-red-500/20 text-red-300 border-red-500/50';
                        } else {
                          btnStyle = 'bg-slate-950/20 text-slate-500 border-transparent pointer-events-none';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={selectedUnpAnswer !== null}
                          onClick={() => handleUnpAnswer(idx)}
                          className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-bold leading-normal transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {selectedUnpAnswer !== null && isCorrectAnswer && (
                            <CheckCircle size={12} className="text-emerald-400 shrink-0 ml-2" />
                          )}
                          {selectedUnpAnswer !== null && isSelected && !isCorrectAnswer && (
                            <XCircle size={12} className="text-red-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedUnpAnswer !== null && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-slate-950/60 p-3 rounded-xl border border-white/5 mt-1"
                    >
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        <strong className="text-amber-400 font-bold">อธิบายเพิ่มเติม:</strong> {unpQuizzes[unpQuizIndex].explanation}
                      </p>
                      <button
                        type="button"
                        onClick={nextUnpQuiz}
                        className="w-full mt-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase cursor-pointer flex items-center justify-center gap-1 transition-all"
                      >
                        <span>ข้อต่อไป</span>
                        <ArrowRight size={11} />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* PERIODIC QUIZ */}
              {subTab === 'periodic' && (
                <motion.div
                  key={`per-quiz-${perQuizIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-3"
                >
                  <p className="text-xs font-black text-slate-100 leading-snug">
                    คำถาม {perQuizIndex + 1}: {perQuizzes[perQuizIndex].q}
                  </p>

                  <div className="flex flex-col gap-2">
                    {perQuizzes[perQuizIndex].options.map((option, idx) => {
                      const isSelected = selectedPerAnswer === idx;
                      const isCorrectAnswer = idx === perQuizzes[perQuizIndex].correct;
                      
                      let btnStyle = 'bg-slate-950/60 hover:bg-slate-950 text-slate-300 border-white/5';
                      if (selectedPerAnswer !== null) {
                        if (isCorrectAnswer) {
                          btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
                        } else if (isSelected) {
                          btnStyle = 'bg-red-500/20 text-red-300 border-red-500/50';
                        } else {
                          btnStyle = 'bg-slate-950/20 text-slate-500 border-transparent pointer-events-none';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={selectedPerAnswer !== null}
                          onClick={() => handlePerAnswer(idx)}
                          className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-bold leading-normal transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {selectedPerAnswer !== null && isCorrectAnswer && (
                            <CheckCircle size={12} className="text-emerald-400 shrink-0 ml-2" />
                          )}
                          {selectedPerAnswer !== null && isSelected && !isCorrectAnswer && (
                            <XCircle size={12} className="text-red-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedPerAnswer !== null && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-slate-950/60 p-3 rounded-xl border border-white/5 mt-1"
                    >
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        <strong className="text-amber-400 font-bold">อธิบายเพิ่มเติม:</strong> {perQuizzes[perQuizIndex].explanation}
                      </p>
                      <button
                        type="button"
                        onClick={nextPerQuiz}
                        className="w-full mt-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase cursor-pointer flex items-center justify-center gap-1 transition-all"
                      >
                        <span>ข้อต่อไป</span>
                        <ArrowRight size={11} />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={resetQuizScore}
              className="mt-2 text-[10px] font-bold text-slate-400 hover:text-white underline text-center cursor-pointer flex items-center justify-center gap-1 transition-colors"
            >
              <RotateCcw size={10} />
              <span>ล้างผลคะแนนเริ่มต้นใหม่</span>
            </button>
          </div>

        </aside>

      </div>

      {/* Info Popup Modal */}
      <AnimatePresence>
        {activeInfoPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 max-w-md w-full relative"
            >
              <button 
                onClick={() => setActiveInfoPopup(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1 z-10"
              >
                <XCircle size={20} />
              </button>
              
              {activeInfoPopup && (
                <div className="space-y-6 pt-2">
                  <div>
                    <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-2">
                      <Zap size={18} /> ความลับในสัญลักษณ์พลังงาน
                    </h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                      สัญลักษณ์เช่น <code className="text-blue-400 font-black">2p⁵</code> คือระดับพลังงานหลัก (n), รูปร่างออร์บิทัล (l) และจำนวนอิเล็กตรอน
                    </p>
                    <ul className="space-y-1 text-[10px] text-slate-400 list-disc list-inside">
                      <li><strong className="text-slate-300">ตัวเลข</strong>: บอกระดับพลังงานหลัก (n)</li>
                      <li><strong className="text-slate-300">ตัวอักษร</strong>: บอกรูปร่างออร์บิทัล (s, p, d, f)</li>
                      <li><strong className="text-slate-300">เลขยกกำลัง</strong>: จำนวนอิเล็กตรอน</li>
                    </ul>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-2">
                      <Layers size={18} /> สปินของอิเล็กตรอนเดี่ยว
                    </h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      อิเล็กตรอนเดี่ยว (สปินเดี่ยว ↑) สอดคล้องกับคุณสมบัติแม่เหล็ก (พาราแมกเนติก) ส่วนธาตุที่อิเล็กตรอนเข้าคู่หมดจะเป็นไดอะแมกเนติก
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2">
                      <LayoutGrid size={18} /> ถอดพิกัดในตารางธาตุ
                    </h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      ค่า n สูงสุดระบุคาบ จำนวนวาเลนซ์ระบุหมู่ และระดับพลังงานย่อยสุดท้ายระบุบล็อกออร์บิทัล (s, p, d, f)
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Popup for Element Details (Periodic Table Tab) */}
      <AnimatePresence>
        {subTab === 'periodic' && hoveredZ && activeElement && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[340px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 pointer-events-none"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-amber-400">{activeElement.name}</span>
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Z = {activeElement.z} | {activeElement.config}
                </p>
              </div>
              {activeElement.isException && (
                <span className="text-[9px] bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded font-black uppercase tracking-wider animate-pulse ml-2 shrink-0">
                  ข้อยกเว้นพิเศษ
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center text-[10px]">
              <div className="flex flex-col items-center w-1/3">
                <span className="text-slate-400 font-bold mb-1">คาบ</span>
                <span className="text-indigo-400 font-mono font-black text-lg leading-none">{activeElement.period}</span>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="flex flex-col items-center w-1/3 text-center">
                <span className="text-slate-400 font-bold mb-1">หมู่</span>
                <div className="flex flex-col items-center justify-center leading-none">
                  <span className="text-emerald-400 font-mono font-black text-base">{activeElement.groupLabel.split(' ')[0]}</span>
                  <span className="text-[8px] text-emerald-400/80 mt-0.5 font-sans">{activeElement.groupLabel.split(' ').slice(1).join(' ')}</span>
                </div>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="flex flex-col items-center w-1/3 text-center">
                <span className="text-slate-400 font-bold mb-1">บล็อก</span>
                <span className="text-amber-400 font-mono font-black text-lg uppercase leading-none">{activeElement.block}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
