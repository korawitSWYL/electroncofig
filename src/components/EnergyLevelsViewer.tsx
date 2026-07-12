import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, Sparkles, Info, RotateCcw, Zap } from 'lucide-react';

interface EnergyLevelsViewerProps {
  selectedShell: number | 'all';
  electronCount: number;
  animatingCount: number;
  charge?: number;
  isEnergyAnimating?: boolean;
  startEnergyAnimation?: () => void;
  animationSpeed?: number;
  setAnimationSpeed?: (speed: number) => void;
}

interface SuborbitalDef {
  name: string;
  n: number;
  type: 's' | 'p' | 'd' | 'f';
  orbitals: number; // number of degenerate orbital lines (s=1, p=3, d=5, f=7)
  energyOrder: number; // relative rank in energy (1s is lowest, 7p is highest)
  label: string;
}

// Complete 19 subshells sorted by energy (Madelung rule)
const ALL_SUBSHELLS: SuborbitalDef[] = [
  { name: '1s', n: 1, type: 's', orbitals: 1, energyOrder: 1, label: '1s' },
  { name: '2s', n: 2, type: 's', orbitals: 1, energyOrder: 2, label: '2s' },
  { name: '2p', n: 2, type: 'p', orbitals: 3, energyOrder: 3, label: '2p' },
  { name: '3s', n: 3, type: 's', orbitals: 1, energyOrder: 4, label: '3s' },
  { name: '3p', n: 3, type: 'p', orbitals: 3, energyOrder: 5, label: '3p' },
  { name: '4s', n: 4, type: 's', orbitals: 1, energyOrder: 6, label: '4s' },
  { name: '3d', n: 3, type: 'd', orbitals: 5, energyOrder: 7, label: '3d' },
  { name: '4p', n: 4, type: 'p', orbitals: 3, energyOrder: 8, label: '4p' },
  { name: '5s', n: 5, type: 's', orbitals: 1, energyOrder: 9, label: '5s' },
  { name: '4d', n: 4, type: 'd', orbitals: 5, energyOrder: 10, label: '4d' },
  { name: '5p', n: 5, type: 'p', orbitals: 3, energyOrder: 11, label: '5p' },
  { name: '6s', n: 6, type: 's', orbitals: 1, energyOrder: 12, label: '6s' },
  { name: '4f', n: 4, type: 'f', orbitals: 7, energyOrder: 13, label: '4f' },
  { name: '5d', n: 5, type: 'd', orbitals: 5, energyOrder: 14, label: '5d' },
  { name: '6p', n: 6, type: 'p', orbitals: 3, energyOrder: 15, label: '6p' },
  { name: '7s', n: 7, type: 's', orbitals: 1, energyOrder: 16, label: '7s' },
  { name: '5f', n: 5, type: 'f', orbitals: 7, energyOrder: 17, label: '5f' },
  { name: '6d', n: 6, type: 'd', orbitals: 5, energyOrder: 18, label: '6d' },
  { name: '7p', n: 7, type: 'p', orbitals: 3, energyOrder: 19, label: '7p' },
];

export const ELEMENT_MASS_NUMBERS: Record<number, number> = {
  1: 1, 2: 4, 3: 7, 4: 9, 5: 11, 6: 12, 7: 14, 8: 16, 9: 19, 10: 20,
  11: 23, 12: 24, 13: 27, 14: 28, 15: 31, 16: 32, 17: 35, 18: 40,
  19: 39, 20: 40, 21: 45, 22: 48, 23: 51, 24: 52, 25: 55, 26: 56,
  27: 59, 28: 58, 29: 64, 30: 65, 31: 70, 32: 73, 33: 75, 34: 79,
  35: 80, 36: 84, 37: 85, 38: 88, 39: 89, 40: 91, 41: 93, 42: 96,
  43: 98, 44: 101, 45: 103, 46: 106, 47: 108, 48: 112, 49: 115, 50: 119,
  51: 122, 52: 128, 53: 127, 54: 131, 55: 133, 56: 137, 57: 139, 58: 140,
  59: 141, 60: 144, 61: 145, 62: 150, 63: 152, 64: 157, 65: 159, 66: 163,
  67: 165, 68: 167, 69: 169, 70: 173, 71: 175, 72: 178, 73: 181, 74: 184,
  75: 186, 76: 190, 77: 192, 78: 195, 79: 197, 80: 201, 81: 204, 82: 207,
  83: 209, 84: 209, 85: 210, 86: 222, 87: 223, 88: 226, 89: 227, 90: 232,
  91: 231, 92: 238, 93: 237, 94: 244, 95: 243, 96: 247, 97: 247, 98: 251,
  99: 252, 100: 257, 101: 258, 102: 259, 103: 262, 104: 267, 105: 270, 106: 271,
  107: 270, 108: 277, 109: 278, 110: 281, 111: 280, 112: 285, 113: 286, 114: 289,
  115: 290, 116: 293, 117: 294, 118: 294
};

export const getOccupancies = (total: number) => {
  const occupancies: Record<string, number> = {};
  let remaining = total;
  
  for (const sub of ALL_SUBSHELLS) {
    occupancies[sub.name] = 0;
  }

  for (const sub of ALL_SUBSHELLS) {
    const cap = sub.orbitals * 2;
    const filled = Math.min(remaining, cap);
    occupancies[sub.name] = filled;
    remaining -= filled;
    if (remaining <= 0) break;
  }

  // High School Exceptions for Cr (24) and Cu (29)
  if (total === 24) {
    if (occupancies['4s'] === 2 && occupancies['3d'] === 4) {
      occupancies['4s'] = 1;
      occupancies['3d'] = 5;
    }
  } else if (total === 29) {
    if (occupancies['4s'] === 2 && occupancies['3d'] === 9) {
      occupancies['4s'] = 1;
      occupancies['3d'] = 10;
    }
  }

  return occupancies;
};

export const getIonOccupancies = (z: number, charge: number) => {
  // First, get neutral configuration for atomic number z
  const occupancies = getOccupancies(z); 
  
  if (charge === 0) {
    return occupancies;
  }
  
  if (charge < 0) {
    // For anions, we just add electrons following Aufbau.
    const totalElectrons = z - charge; // charge is negative, so this adds
    return getOccupancies(totalElectrons);
  }
  
  // For cations (charge > 0), we remove electrons from the highest n, then highest l / energyOrder
  let remainingToRemove = charge;
  while (remainingToRemove > 0) {
    let bestSubshell: string | null = null;
    let highestN = -1;
    let highestEnergyOrder = -1;
    
    for (const sub of ALL_SUBSHELLS) {
      const filled = occupancies[sub.name] || 0;
      if (filled > 0) {
        if (sub.n > highestN) {
          highestN = sub.n;
          bestSubshell = sub.name;
          highestEnergyOrder = sub.energyOrder;
        } else if (sub.n === highestN) {
          if (sub.energyOrder > highestEnergyOrder) {
            highestEnergyOrder = sub.energyOrder;
            bestSubshell = sub.name;
          }
        }
      }
    }
    
    if (!bestSubshell) {
      break; // No electrons left to remove
    }
    
    occupancies[bestSubshell] -= 1;
    remainingToRemove -= 1;
  }
  
  return occupancies;
};

export const getSpectroscopicNotation = (z: number, charge: number = 0) => {
  if (z === 0) return 'ไม่มีอิเล็กตรอน';
  const occupancies = getIonOccupancies(z, charge);
  const parts: string[] = [];
  
  for (const sub of ALL_SUBSHELLS) {
    const filled = occupancies[sub.name] || 0;
    if (filled > 0) {
      parts.push(`${sub.name}<sup>${filled}</sup>`);
    }
  }
  return parts.length > 0 ? parts.join(' ') : 'ไม่มีอิเล็กตรอน';
};

export const getShorthandNotation = (z: number, charge: number = 0) => {
  const totalElectrons = z - charge;
  if (totalElectrons <= 0) return 'ไม่มีอิเล็กตรอน';
  if (totalElectrons < 2) return `1s<sup>${totalElectrons}</sup>`;
  
  let coreGas = '';
  let coreElectrons = 0;
  
  if (totalElectrons >= 86) {
    coreGas = '[Rn]';
    coreElectrons = 86;
  } else if (totalElectrons >= 54) {
    coreGas = '[Xe]';
    coreElectrons = 54;
  } else if (totalElectrons >= 36) {
    coreGas = '[Kr]';
    coreElectrons = 36;
  } else if (totalElectrons >= 18) {
    coreGas = '[Ar]';
    coreElectrons = 18;
  } else if (totalElectrons >= 10) {
    coreGas = '[Ne]';
    coreElectrons = 10;
  } else if (totalElectrons >= 2) {
    coreGas = '[He]';
    coreElectrons = 2;
  }

  if (totalElectrons === coreElectrons) {
    return coreGas;
  }

  const coreOccupancies = getOccupancies(coreElectrons);
  const ionOccupancies = getIonOccupancies(z, charge);
  
  const outerParts: string[] = [];
  for (const sub of ALL_SUBSHELLS) {
    const coreFilled = coreOccupancies[sub.name] || 0;
    const ionFilled = ionOccupancies[sub.name] || 0;
    const diff = ionFilled - coreFilled;
    if (diff > 0) {
      outerParts.push(`${sub.name}<sup>${ionFilled}</sup>`);
    }
  }

  return `${coreGas} ${outerParts.join(' ')}`;
};

export const getSpectroscopicFromOccupancies = (occupancies: Record<string, number>) => {
  const parts: string[] = [];
  let total = 0;
  for (const sub of ALL_SUBSHELLS) {
    const filled = occupancies[sub.name] || 0;
    total += filled;
    if (filled > 0) {
      parts.push(`${sub.name}<sup>${filled}</sup>`);
    }
  }
  return total > 0 ? parts.join(' ') : 'ไม่มีอิเล็กตรอน';
};

export const getShorthandFromOccupancies = (occupancies: Record<string, number>) => {
  let totalElectrons = 0;
  for (const name in occupancies) {
    totalElectrons += occupancies[name];
  }
  if (totalElectrons <= 0) return 'ไม่มีอิเล็กตรอน';
  if (totalElectrons < 2) return `1s<sup>${totalElectrons}</sup>`;
  
  let coreGas = '';
  let coreElectrons = 0;
  
  if (totalElectrons >= 86) {
    coreGas = '[Rn]';
    coreElectrons = 86;
  } else if (totalElectrons >= 54) {
    coreGas = '[Xe]';
    coreElectrons = 54;
  } else if (totalElectrons >= 36) {
    coreGas = '[Kr]';
    coreElectrons = 36;
  } else if (totalElectrons >= 18) {
    coreGas = '[Ar]';
    coreElectrons = 18;
  } else if (totalElectrons >= 10) {
    coreGas = '[Ne]';
    coreElectrons = 10;
  } else if (totalElectrons >= 2) {
    coreGas = '[He]';
    coreElectrons = 2;
  }

  if (totalElectrons === coreElectrons) {
    return coreGas;
  }

  const coreOccupancies = getOccupancies(coreElectrons);
  const outerParts: string[] = [];
  for (const sub of ALL_SUBSHELLS) {
    const coreFilled = coreOccupancies[sub.name] || 0;
    const ionFilled = occupancies[sub.name] || 0;
    const diff = ionFilled - coreFilled;
    if (diff > 0) {
      outerParts.push(`${sub.name}<sup>${ionFilled}</sup>`);
    }
  }

  return `${coreGas} ${outerParts.join(' ')}`;
};

export const ELEMENTS_DATA: Record<number, { symbol: string; nameTh: string; nameEn: string }> = {
  1: { symbol: 'H', nameTh: 'ไฮโดรเจน', nameEn: 'Hydrogen' },
  2: { symbol: 'He', nameTh: 'ฮีเลียม', nameEn: 'Helium' },
  3: { symbol: 'Li', nameTh: 'ลิเทียม', nameEn: 'Lithium' },
  4: { symbol: 'Be', nameTh: 'เบริลเลียม', nameEn: 'Beryllium' },
  5: { symbol: 'B', nameTh: 'โบรอน', nameEn: 'Boron' },
  6: { symbol: 'C', nameTh: 'คาร์บอน', nameEn: 'Carbon' },
  7: { symbol: 'N', nameTh: 'ไนโตรเจน', nameEn: 'Nitrogen' },
  8: { symbol: 'O', nameTh: 'ออกซิเจน', nameEn: 'Oxygen' },
  9: { symbol: 'F', nameTh: 'ฟลูออรีน', nameEn: 'Fluorine' },
  10: { symbol: 'Ne', nameTh: 'นีออน', nameEn: 'Neon' },
  11: { symbol: 'Na', nameTh: 'โซเดียม', nameEn: 'Sodium' },
  12: { symbol: 'Mg', nameTh: 'แมกนีเซียม', nameEn: 'Magnesium' },
  13: { symbol: 'Al', nameTh: 'อะลูมิเนียม', nameEn: 'Aluminium' },
  14: { symbol: 'Si', nameTh: 'ซิลิคอน', nameEn: 'Silicon' },
  15: { symbol: 'P', nameTh: 'ฟอสฟอรัส', nameEn: 'Phosphorus' },
  16: { symbol: 'S', nameTh: 'ซัลเฟอร์', nameEn: 'Sulfur' },
  17: { symbol: 'Cl', nameTh: 'คลอรีน', nameEn: 'Chlorine' },
  18: { symbol: 'Ar', nameTh: 'อาร์กอน', nameEn: 'Argon' },
  19: { symbol: 'K', nameTh: 'โพแทสเซียม', nameEn: 'Potassium' },
  20: { symbol: 'Ca', nameTh: 'แคลเซียม', nameEn: 'Calcium' },
  21: { symbol: 'Sc', nameTh: 'สแกนเดียม', nameEn: 'Scandium' },
  22: { symbol: 'Ti', nameTh: 'ไทเทเนียม', nameEn: 'Titanium' },
  23: { symbol: 'V', nameTh: 'วานาเดียม', nameEn: 'Vanadium' },
  24: { symbol: 'Cr', nameTh: 'โครเมียม', nameEn: 'Chromium' },
  25: { symbol: 'Mn', nameTh: 'แมงกานีส', nameEn: 'Manganese' },
  26: { symbol: 'Fe', nameTh: 'เหล็ก', nameEn: 'Iron' },
  27: { symbol: 'Co', nameTh: 'โคบอลต์', nameEn: 'Cobalt' },
  28: { symbol: 'Ni', nameTh: 'นิกเกิล', nameEn: 'Nickel' },
  29: { symbol: 'Cu', nameTh: 'ทองแดง', nameEn: 'Copper' },
  30: { symbol: 'Zn', nameTh: 'สังกะสี', nameEn: 'Zinc' },
  31: { symbol: 'Ga', nameTh: 'แกลเลียม', nameEn: 'Gallium' },
  32: { symbol: 'Ge', nameTh: 'เจอร์เมเนียม', nameEn: 'Germanium' },
  33: { symbol: 'As', nameTh: 'สารหนู', nameEn: 'Arsenic' },
  34: { symbol: 'Se', nameTh: 'ซีลีเนียม', nameEn: 'Selenium' },
  35: { symbol: 'Br', nameTh: 'โบรมีน', nameEn: 'Bromine' },
  36: { symbol: 'Kr', nameTh: 'คริปทอน', nameEn: 'Krypton' },
  37: { symbol: 'Rb', nameTh: 'รูบิเดียม', nameEn: 'Rubidium' },
  38: { symbol: 'Sr', nameTh: 'สตรอนเชียม', nameEn: 'Strontium' },
  39: { symbol: 'Y', nameTh: 'อิตเทรียม', nameEn: 'Yttrium' },
  40: { symbol: 'Zr', nameTh: 'เซอร์โคเนียม', nameEn: 'Zirconium' },
  41: { symbol: 'Nb', nameTh: 'ไนโอเบียม', nameEn: 'Niobium' },
  42: { symbol: 'Mo', nameTh: 'โมลิบดีนัม', nameEn: 'Molybdenum' },
  43: { symbol: 'Tc', nameTh: 'เทกนีเชียม', nameEn: 'Technetium' },
  44: { symbol: 'Ru', nameTh: 'รูทีเนียม', nameEn: 'Ruthenium' },
  45: { symbol: 'Rh', nameTh: 'โรเดียม', nameEn: 'Rhodium' },
  46: { symbol: 'Pd', nameTh: 'แพลเลเดียม', nameEn: 'Palladium' },
  47: { symbol: 'Ag', nameTh: 'เงิน', nameEn: 'Silver' },
  48: { symbol: 'Cd', nameTh: 'แคดเมียม', nameEn: 'Cadmium' },
  49: { symbol: 'In', nameTh: 'อินเดียม', nameEn: 'Indium' },
  50: { symbol: 'Sn', nameTh: 'ดีบุก', nameEn: 'Tin' },
  51: { symbol: 'Sb', nameTh: 'พลวง', nameEn: 'Antimony' },
  52: { symbol: 'Te', nameTh: 'เทลลูเรียม', nameEn: 'Tellurium' },
  53: { symbol: 'I', nameTh: 'ไอโอดีน', nameEn: 'Iodine' },
  54: { symbol: 'Xe', nameTh: 'ซีนอน', nameEn: 'Xenon' },
  55: { symbol: 'Cs', nameTh: 'ซีเซียม', nameEn: 'Caesium' },
  56: { symbol: 'Ba', nameTh: 'แบเรียม', nameEn: 'Barium' },
  57: { symbol: 'La', nameTh: 'แลนทานัม', nameEn: 'Lanthanum' },
  58: { symbol: 'Ce', nameTh: 'ซีเรียม', nameEn: 'Cerium' },
  59: { symbol: 'Pr', nameTh: 'เพรซีโอดิเมียม', nameEn: 'Praseodymium' },
  60: { symbol: 'Nd', nameTh: 'นีโอดิเมียม', nameEn: 'Neodymium' },
  61: { symbol: 'Pm', nameTh: 'โพรมีเทียม', nameEn: 'Promethium' },
  62: { symbol: 'Sm', nameTh: 'สะมาเรียม', nameEn: 'Samarium' },
  63: { symbol: 'Eu', nameTh: 'ยูโรเปียม', nameEn: 'Europium' },
  64: { symbol: 'Gd', nameTh: 'แกโดลิเนียม', nameEn: 'Gadolinium' },
  65: { symbol: 'Tb', nameTh: 'เทอร์เบียม', nameEn: 'Terbium' },
  66: { symbol: 'Dy', nameTh: 'ดิสโพรเซียม', nameEn: 'Dysprosium' },
  67: { symbol: 'Ho', nameTh: 'โฮลเมียม', nameEn: 'Holmium' },
  68: { symbol: 'Er', nameTh: 'เออร์เบียม', nameEn: 'Erbium' },
  69: { symbol: 'Tm', nameTh: 'ทูเลียม', nameEn: 'Thulium' },
  70: { symbol: 'Yb', nameTh: 'อิตเตอร์เบียม', nameEn: 'Ytterbium' },
  71: { symbol: 'Lu', nameTh: 'ลูทีเชียม', nameEn: 'Lutetium' },
  72: { symbol: 'Hf', nameTh: 'แฮฟเนียม', nameEn: 'Hafnium' },
  73: { symbol: 'Ta', nameTh: 'แทนทาลัม', nameEn: 'Tantalum' },
  74: { symbol: 'W', nameTh: 'ทังสเตน', nameEn: 'Tungsten' },
  75: { symbol: 'Re', nameTh: 'รีเนียม', nameEn: 'Rhenium' },
  76: { symbol: 'Os', nameTh: 'ออสเมียม', nameEn: 'Osmium' },
  77: { symbol: 'Ir', nameTh: 'อิริเดียม', nameEn: 'Iridium' },
  78: { symbol: 'Pt', nameTh: 'แพลทินัม', nameEn: 'Platinum' },
  79: { symbol: 'Au', nameTh: 'ทองคำ', nameEn: 'Gold' },
  80: { symbol: 'Hg', nameTh: 'ปรอท', nameEn: 'Mercury' },
  81: { symbol: 'Tl', nameTh: 'แทลเลียม', nameEn: 'Thallium' },
  82: { symbol: 'Pb', nameTh: 'ตะกั่ว', nameEn: 'Lead' },
  83: { symbol: 'Bi', nameTh: 'บิสมัท', nameEn: 'Bismuth' },
  84: { symbol: 'Po', nameTh: 'โพโลเนียม', nameEn: 'Polonium' },
  85: { symbol: 'At', nameTh: 'แอสทาทีน', nameEn: 'Astatine' },
  86: { symbol: 'Rn', nameTh: 'เรดอน', nameEn: 'Radon' },
  87: { symbol: 'Fr', nameTh: 'แฟรนเซียม', nameEn: 'Francium' },
  88: { symbol: 'Ra', nameTh: 'เรเดียม', nameEn: 'Radium' },
  89: { symbol: 'Ac', nameTh: 'แอกทิเนียม', nameEn: 'Actinium' },
  90: { symbol: 'Th', nameTh: 'ทอเรียม', nameEn: 'Thorium' },
  91: { symbol: 'Pa', nameTh: 'โพรแทกทิเนียม', nameEn: 'Protactinium' },
  92: { symbol: 'U', nameTh: 'ยูเรเนียม', nameEn: 'Uranium' },
  93: { symbol: 'Np', nameTh: 'เนปทูนีเนียม', nameEn: 'Neptunium' },
  94: { symbol: 'Pu', nameTh: 'พลูโทเนียม', nameEn: 'Plutonium' },
  95: { symbol: 'Am', nameTh: 'อะเมริเซียม', nameEn: 'Americium' },
  96: { symbol: 'Cm', nameTh: 'คูเรียม', nameEn: 'Curium' },
  97: { symbol: 'Bk', nameTh: 'เบอร์คีเลียม', nameEn: 'Berkelium' },
  98: { symbol: 'Cf', nameTh: 'แคลิฟอร์เนียม', nameEn: 'Californium' },
  99: { symbol: 'Es', nameTh: 'ไอน์สไตเนียม', nameEn: 'Einsteinium' },
  100: { symbol: 'Fm', nameTh: 'เฟอร์เมียม', nameEn: 'Fermium' },
  101: { symbol: 'Md', nameTh: 'เมนเดเลเวียม', nameEn: 'Mendelevium' },
  102: { symbol: 'No', nameTh: 'โนเบเลียม', nameEn: 'Nobelium' },
  103: { symbol: 'Lr', nameTh: 'ลอว์เรนเซียม', nameEn: 'Lawrencium' },
  104: { symbol: 'Rf', nameTh: 'รัทเทอร์ฟอร์เดียม', nameEn: 'Rutherfordium' },
  105: { symbol: 'Db', nameTh: 'ดับเนียม', nameEn: 'Dubnium' },
  106: { symbol: 'Sg', nameTh: 'ซีบอร์เกียม', nameEn: 'Seaborgium' },
  107: { symbol: 'Bh', nameTh: 'โบห์เรียม', nameEn: 'Bohrium' },
  108: { symbol: 'Hs', nameTh: 'ฮัสเซียม', nameEn: 'Hassium' },
  109: { symbol: 'Mt', nameTh: 'ไมต์เนเรียม', nameEn: 'Meitnerium' },
  110: { symbol: 'Ds', nameTh: 'ดาร์มสตัดเทียม', nameEn: 'Darmstadtium' },
  111: { symbol: 'Rg', nameTh: 'เรินต์เกเนียม', nameEn: 'Roentgenium' },
  112: { symbol: 'Cn', nameTh: 'โคเปอร์นิเซียม', nameEn: 'Copernicium' },
  113: { symbol: 'Nh', nameTh: 'นิโฮเนียม', nameEn: 'Nihonium' },
  114: { symbol: 'Fl', nameTh: 'ฟลีโรเวียม', nameEn: 'Flerovium' },
  115: { symbol: 'Mc', nameTh: 'มอสโกเวียม', nameEn: 'Moscovium' },
  116: { symbol: 'Lv', nameTh: 'ลิเวอร์มอเรียม', nameEn: 'Livermorium' },
  117: { symbol: 'Ts', nameTh: 'เทนเนสซีน', nameEn: 'Tennessine' },
  118: { symbol: 'Og', nameTh: 'ออกาเนสซอน', nameEn: 'Oganesson' }
};

export const getOccupanciesForStep = (z: number, charge: number, step: number) => {
  if (charge <= 0) {
    // Neutral or Anion
    return getOccupancies(step);
  } else {
    // Cation
    if (step <= z) {
      return getOccupancies(step);
    } else {
      const removed = Math.min(charge, step - z);
      return getIonOccupancies(z, removed);
    }
  }
};

export default function EnergyLevelsViewer({
  selectedShell,
  electronCount,
  animatingCount,
  charge = 0,
  isEnergyAnimating = false,
  startEnergyAnimation = () => {},
  animationSpeed = 350,
  setAnimationSpeed = () => {}
}: EnergyLevelsViewerProps) {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [modelType, setModelType] = useState<'bohr' | 'cloud' | 'ladder' | 'summary'>('bohr');
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);

  const activeLeftModel = modelType === 'ladder' || modelType === 'summary' ? 'bohr' : modelType;

  const lastElementRef = useRef<number>(0);
  useEffect(() => {
    if ((electronCount === 24 || electronCount === 29) && charge === 0) {
      if (lastElementRef.current !== electronCount) {
        setShowAnomalyModal(true);
      }
    } else {
      setShowAnomalyModal(false);
    }
    lastElementRef.current = electronCount;
  }, [electronCount, charge]);
  const requestRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Rotation cycle for electrons in Bohr view & Quantum jumping for Cloud view
  const electronStatesRef = useRef<Record<string, any>>({});

  // Reset electron states when animation restarts
  useEffect(() => {
    if (animatingCount === 0) {
      electronStatesRef.current = {};
    }
  }, [animatingCount]);

  useEffect(() => {
    let lastTime = performance.now();
    const updateAnimation = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      
      // Use time-based delta to ensure 100% smooth frame rate-independent movement.
      // 0.03 degrees per ms is roughly 0.5 degrees per frame at 60fps.
      // Do NOT modulo % 360 here: this prevents the orbits from mathematically jumping/stuttering
      // because cos and sin are periodic anyway and can safely handle continuous growth!
      setRotationAngle(prev => prev + (0.03 * delta));
      requestRef.current = requestAnimationFrame(updateAnimation);
    };
    requestRef.current = requestAnimationFrame(updateAnimation);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Filter subshells based on selected shell
  const filteredSubshells = selectedShell === 'all'
    ? [...ALL_SUBSHELLS].reverse() // Show all 19 subshells, highest energy at the top
    : ALL_SUBSHELLS.filter(sub => sub.n === selectedShell).reverse(); // Show subshells for n, sorted highest at the top

  const orbitalColors = {
    s: {
      border: 'border-sky-500/50',
      bg: 'bg-sky-500/10',
      text: 'text-sky-300',
      glow: 'shadow-sky-500/20',
      stroke: '#38bdf8',
    },
    p: {
      border: 'border-violet-500/50',
      bg: 'bg-violet-500/10',
      text: 'text-violet-300',
      glow: 'shadow-violet-500/20',
      stroke: '#a78bfa',
    },
    d: {
      border: 'border-amber-500/50',
      bg: 'bg-amber-500/10',
      text: 'text-amber-300',
      glow: 'shadow-amber-500/20',
      stroke: '#fbbf24',
    },
    f: {
      border: 'border-rose-500/50',
      bg: 'bg-rose-500/10',
      text: 'text-rose-300',
      glow: 'shadow-rose-500/20',
      stroke: '#f43f5e',
    },
  };

  const shellNames: Record<number, string> = {
    1: 'K-shell',
    2: 'L-shell',
    3: 'M-shell',
    4: 'N-shell',
    5: 'O-shell',
    6: 'P-shell',
    7: 'Q-shell',
  };

  // Get dynamic occupancies based on animatingCount (which acts as the current step)
  const maxSteps = electronCount + Math.abs(charge);
  const isAnimationComplete = animatingCount >= maxSteps;
  
  const occupancies = isAnimationComplete
    ? getIonOccupancies(electronCount, charge)
    : getOccupanciesForStep(electronCount, charge, animatingCount);

  // Total electrons currently displayed in orbit
  const currentElectronCount = Object.values(occupancies).reduce((a, b) => a + b, 0);

  // Summarize electron counts per Bohr shell (1 to 7)
  const shellElectronCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  for (const sub of ALL_SUBSHELLS) {
    shellElectronCounts[sub.n] += (occupancies[sub.name] || 0);
  }

  // Find the subshell currently being filled
  let activeSubshellName = '1s';
  for (const sub of ALL_SUBSHELLS) {
    const filled = occupancies[sub.name] || 0;
    const maxCap = sub.orbitals * 2;
    if (filled > 0) {
      activeSubshellName = sub.name;
    }
    if (filled > 0 && filled < maxCap) {
      activeSubshellName = sub.name;
      break;
    }
  }

  // Smooth scroll tracking container to show the active packing suborbital
  useEffect(() => {
    if (!activeSubshellName || !containerRef.current) return;
    
    const scrollToActive = () => {
      const item = document.getElementById(`subshell-${activeSubshellName}`);
      if (item && containerRef.current) {
        const container = containerRef.current;
        const itemTop = item.offsetTop;
        
        // Align active item to the top with a small safety margin (8px),
        // so the active row and the 3 filled rows below it are fully visible inside the viewport.
        const targetScrollTop = itemTop - 8;
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth'
        });
      }
    };

    // Use a small timeout to let the mobile layout finish transitioning display:hidden to flex
    const timer = setTimeout(scrollToActive, 100);
    return () => clearTimeout(timer);
  }, [activeSubshellName, animatingCount, modelType]);

  // Uneven Bohr spacing: gap gets smaller as n increases
  const getBohrRadius = (n: number) => {
    const radii = [0, 34, 64, 88, 106, 120, 131, 140];
    return radii[n] || 24;
  };

  // Element name Th / En / Symbol for display
  const activeElement = ELEMENTS_DATA[electronCount] || ELEMENTS_DATA[1];

  return (
    <div className="w-full h-full flex flex-col p-0 md:p-3 relative z-10 overflow-hidden md:bg-gradient-to-b md:from-slate-900 md:to-slate-950 md:rounded-3xl md:border md:border-white/5">
      
      {/* MOBILE UNIFIED TABS - INTEGRATED HEADER STYLE */}
      <div className="md:hidden flex flex-row items-center justify-between gap-2 p-2 pb-1.5 border-b border-white/5 bg-slate-950/20 z-10 shrink-0">
        <div className="flex bg-slate-950/60 p-0.5 rounded-xl border border-white/10 self-start shadow-inner overflow-x-auto scrollbar-none max-w-full">
          <button
            onClick={() => setModelType('bohr')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
              modelType === 'bohr'
                ? 'bg-blue-600 text-white shadow-sm font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            โบร์
          </button>
          <button
            onClick={() => setModelType('cloud')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
              modelType === 'cloud'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            กลุ่มหมอก
          </button>
          <button
            onClick={() => setModelType('ladder')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
              modelType === 'ladder'
                ? 'bg-emerald-600 text-white shadow-sm font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ผังระดับพลังงาน
          </button>
          <button
            onClick={() => setModelType('summary')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
              modelType === 'summary'
                ? 'bg-violet-600 text-white shadow-sm font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            สรุปการจัดเรียง
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 overflow-hidden">
        
        {/* 1. Atom Model Display Container */}
        <div className={`w-full md:w-[38%] lg:w-[35%] flex-1 md:flex-none flex flex-col items-center justify-start md:justify-center bg-gradient-to-b from-slate-900/40 to-slate-950/40 border-0 md:border border-white/5 rounded-none md:rounded-2xl p-0.5 md:p-3 pt-1 md:pt-3 relative md:shrink-0 min-h-[280px] md:min-h-[350px] ${
          (modelType === 'ladder' || modelType === 'summary') ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Toggleable Atom Model Tabs - Desktop Only */}
          <div className="hidden md:flex absolute top-2.5 inset-x-2.5 flex-row items-center justify-between gap-1.5 z-20">
            <div className="flex items-center gap-1 text-slate-300 text-[10px] font-black uppercase tracking-wider pl-1">
              <Sparkles size={11} className="text-amber-400 animate-pulse" />
              <span>แบบจำลองอะตอม</span>
            </div>
            
            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5 shadow-inner">
              <button
                onClick={() => setModelType('bohr')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  modelType === 'bohr'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                โบร์
              </button>
              <button
                onClick={() => setModelType('cloud')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  modelType === 'cloud'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                กลุ่มหมอก
              </button>
            </div>
          </div>

          {/* Informative Shell Overlay */}
          <div className="absolute bottom-3 text-center w-full px-2">
            {activeElement && (
              <div className="mb-2 bg-slate-950/60 py-1 px-3 rounded-full inline-flex items-center gap-1.5 border border-white/5 mx-auto">
                <span className="text-amber-400 font-black text-xs font-mono bg-amber-500/20 w-5 h-5 rounded-full flex items-center justify-center border border-amber-500/30">
                  {currentElectronCount}
                </span>
                <span className="text-white font-black text-xs">{activeElement.symbol}</span>
                <span className="text-[10px] text-slate-300 font-medium">{activeElement.nameTh}</span>
              </div>
            )}

            {selectedShell !== 'all' ? (
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">กำลังโฟกัส</span>
                <span className="text-xs font-black text-blue-300">
                  n = {selectedShell} ({shellNames[selectedShell as number]})
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  มีอิเล็กตรอนวิ่งอยู่: {shellElectronCounts[selectedShell as number]} ตัว
                </span>
              </div>
            ) : (
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">โครงสร้างภาพรวม ({activeLeftModel === 'bohr' ? 'โบร์' : 'กลุ่มหมอก'})</span>
                <span className="text-xs font-black text-emerald-400">
                  อิเล็กตรอนรวมในวงโคจร: {currentElectronCount} e⁻
                </span>
              </div>
            )}
          </div>

          {/* Bohr Model SVG Drawing */}
          <div className="w-full max-w-[280px] aspect-square flex items-center justify-center mt-6">
            <svg className="w-full h-full" viewBox="0 0 300 300">
              {/* Background Grid Accent */}
              <circle cx="150" cy="150" r="145" fill="none" stroke="rgba(255, 255, 255, 0.015)" strokeDasharray="3 3" />
              <circle cx="150" cy="150" r="115" fill="none" stroke="rgba(255, 255, 255, 0.015)" strokeDasharray="3 3" />
              <circle cx="150" cy="150" r="85" fill="none" stroke="rgba(255, 255, 255, 0.015)" strokeDasharray="3 3" />

              {/* Glowing Center Nucleus */}
              <defs>
                <radialGradient id="nucleusGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#1e3a8a" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                </radialGradient>
                <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="cloudBlur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" />
                </filter>
              </defs>

              {/* Nucleus Area */}
              <circle cx="150" cy="150" r="24" fill="url(#nucleusGlow)" />
              <circle cx="150" cy="150" r="9" fill="#e2e8f0" filter="url(#glowEffect)" />
              <text x="150" y="153" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="900" className="pointer-events-none select-none font-sans">+</text>

              {/* Orbit Lines & Probability Clouds (n = 1 to 7) */}
              {[1, 2, 3, 4, 5, 6, 7].map(n => {
                // Custom Uneven Bohr Radii
                const r = getBohrRadius(n);
                const isSelected = selectedShell === n;
                const isAllSelected = selectedShell === 'all';
                
                // Determine shell-focused or active state
                const isShellActive = isSelected || (isAllSelected && shellElectronCounts[n] > 0);

                // 1. Render soft probability cloud background if we are in Cloud Model mode
                const renderCloudBackground = activeLeftModel === 'cloud' && shellElectronCounts[n] > 0;

                // Orbit line style (Bohr mode)
                let strokeColor = 'rgba(255, 255, 255, 0.05)';
                let strokeWidth = '0.75';
                let strokeDash = '3 3';

                if (isSelected) {
                  strokeColor = '#3b82f6';
                  strokeWidth = '2';
                  strokeDash = '0';
                } else if (isAllSelected) {
                  const hasElectrons = shellElectronCounts[n] > 0;
                  strokeColor = hasElectrons ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.03)';
                  strokeWidth = hasElectrons ? '1' : '0.5';
                  strokeDash = hasElectrons ? '0' : '5 5';
                }

                // 2. Compute electron positions
                const speedFactor = (8 - n) * 0.35;
                const angleRad = (rotationAngle * speedFactor * Math.PI) / 180;
                const eCount = shellElectronCounts[n] || 0;

                const electrons = Array.from({ length: eCount }).map((_, idx) => {
                  const key = `${n}-${idx}`;

                  if (activeLeftModel === 'cloud') {
                    // Retrieve or initialize the smooth 3D probability cloud state for this electron
                    if (!electronStatesRef.current[key] || !electronStatesRef.current[key].isCloud) {
                      const initialTheta = Math.random() * 2 * Math.PI;
                      // Random 3D inclination & longitude of ascending node to span a sphere
                      const i = Math.random() * Math.PI;
                      const omega = Math.random() * 2 * Math.PI;
                      const phase = Math.random() * 2 * Math.PI;
                      // Speed varies by shell n (inner shells orbit faster)
                      const baseSpeed = (8 - n) * 0.015;
                      const speed = baseSpeed * (0.85 + Math.random() * 0.3);

                      electronStatesRef.current[key] = { 
                        theta: initialTheta,
                        i,
                        omega,
                        phase,
                        speed,
                        isCloud: true
                      };
                    }

                    const state = electronStatesRef.current[key];
                    
                    // Increment the orbital angle
                    state.theta += state.speed;

                    // Compute fluctuating quantum radius (distance from nucleus)
                    // Allows the electron to traverse deep near the nucleus and out, simulating radial wavefunctions
                    const R = r * (0.65 + 0.45 * Math.sin(2.5 * state.theta + state.phase));

                    // 3D coordinates on the inclined orbital plane
                    const xp = R * Math.cos(state.theta);
                    const yp = R * Math.sin(state.theta);

                    // Apply inclination rotation (around x-axis) and ascending node rotation (around z-axis)
                    const x_rot_i = xp;
                    const y_rot_i = yp * Math.cos(state.i);
                    const z_rot_i = yp * Math.sin(state.i);

                    const x = x_rot_i * Math.cos(state.omega) - y_rot_i * Math.sin(state.omega);
                    const y = x_rot_i * Math.sin(state.omega) + y_rot_i * Math.cos(state.omega);
                    const z = z_rot_i;

                    const ex = 150 + x;
                    const ey = 150 + y;

                    // Normalize depth z relative to average shell radius to scale size and opacity
                    const zNorm = z / (r || 1); 
                    const rScale = 1.0 + 0.35 * zNorm; // larger in front, smaller in back
                    const opacity = 0.35 + 0.65 * ((zNorm + 1.0) / 2.0); // opaque in front, faint behind nucleus

                    return { ex, ey, rScale, opacity, isCloud: true };
                  } else {
                    // Standard Bohr orbits: smooth circular motion strictly on the orbit path
                    const ex = 150 + r * Math.cos(angleRad + (idx * (2 * Math.PI)) / eCount);
                    const ey = 150 + r * Math.sin(angleRad + (idx * (2 * Math.PI)) / eCount);

                    // Reset the cloud state for clean initialization if the user switches models
                    if (electronStatesRef.current[key]) {
                      delete electronStatesRef.current[key];
                    }

                    return { ex, ey, isCloud: false };
                  }
                });

                return (
                  <g key={n}>
                    {/* Probability Cloud Soft Ambient Glow */}
                    {renderCloudBackground && (
                      <circle
                         cx="150"
                         cy="150"
                         r={r}
                         fill="none"
                         stroke={isSelected ? '#38bdf8' : '#eab308'}
                         strokeWidth={14 + n * 2}
                         opacity={isSelected ? "0.22" : "0.08"}
                         filter="url(#cloudBlur)"
                         className="transition-all duration-300"
                      />
                    )}

                    {/* Orbit Ring (Mainly visible in Bohr, or as a subtle guide in Cloud) */}
                    <circle
                      cx="150"
                      cy="150"
                      r={r}
                      fill="none"
                      stroke={activeLeftModel === 'cloud' ? (isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.015)') : strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={activeLeftModel === 'cloud' ? 'none' : strokeDash}
                      className="transition-all duration-300"
                    />

                    {/* Shell Labels */}
                    <text
                      x={150}
                      y={150 - r - 3}
                      textAnchor="middle"
                      fill={isSelected ? '#60a5fa' : shellElectronCounts[n] > 0 ? (activeLeftModel === 'cloud' ? '#facc15' : '#38bdf8') : 'rgba(255,255,255,0.12)'}
                      fontSize="6"
                      fontWeight={isSelected || shellElectronCounts[n] > 0 ? 'bold' : 'normal'}
                      className="opacity-60 pointer-events-none font-mono"
                    >
                      n={n}
                    </text>

                    {/* Electrons orbiting */}
                    {electrons.map((e, idx) => {
                      const baseR = isSelected 
                        ? (activeLeftModel === 'cloud' ? 4 : 3.5) 
                        : (activeLeftModel === 'cloud' ? 3 : 2.5);
                      const finalR = e.isCloud ? baseR * (e.rScale ?? 1.0) : baseR;
                      const finalOpacity = e.isCloud ? (e.opacity ?? 0.9) : (activeLeftModel === 'cloud' ? 0.9 : 1.0);

                      return (
                        <circle
                          key={idx}
                          cx={e.ex}
                          cy={e.ey}
                          r={finalR}
                          fill={isSelected ? '#38bdf8' : (activeLeftModel === 'cloud' ? '#facc15' : '#fbbf24')}
                          className="pointer-events-none transition-colors duration-300"
                          opacity={finalOpacity}
                          style={{
                            filter: activeLeftModel === 'cloud' 
                              ? 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.8))'
                              : 'drop-shadow(0 0 2px rgba(251, 191, 36, 0.6))'
                          }}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 2. Suborbitals Energy Levels Ladder Display */}
        <div className={`flex-1 flex flex-col bg-gradient-to-b from-slate-900/40 to-slate-950/40 border-0 md:border border-white/5 rounded-none md:rounded-2xl p-3 sm:p-4 md:p-5 relative overflow-hidden pt-2 md:pt-5 ${
          modelType === 'ladder' ? 'flex' : 'hidden md:flex'
        }`}>
          
          {/* Title Block - Desktop Only */}
          <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2.5 mb-3 shrink-0 gap-1.5">
            <div className="flex items-center gap-1.5">
              <ArrowUp className="text-emerald-400 animate-bounce" size={14} />
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                {selectedShell === 'all'
                  ? 'แผนภาพระดับพลังงานย่อย (ต่ำ → สูง)'
                  : `ออร์บิทัลย่อยในระดับพลังงานหลักชั้น n = ${selectedShell}`}
              </span>
            </div>
            <span className="text-[10px] bg-slate-950 text-slate-400 border border-white/5 px-2.5 py-0.5 rounded-full font-bold self-start sm:self-auto">
              สถานะพื้น (Ground State)
            </span>
          </div>

        {/* Scrollable Energy Ladder with ref and container ID */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 relative scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
        >
          {/* Energy Vertical Arrow Guide */}
          <div className="absolute left-2.5 top-0 bottom-0 w-4 flex flex-col items-center pointer-events-none z-0">
            <div className="flex-1 w-[2px] bg-slate-800 relative overflow-hidden rounded-full">
              {/* Dynamic flowing energy pulse from bottom to top */}
              <motion.div
                className="absolute inset-x-0 w-full bg-gradient-to-t from-transparent via-amber-400 to-transparent h-16 opacity-80"
                animate={{
                  y: ['100%', '-100%']
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
            <ArrowUp className="text-amber-400 mt-[-4px] animate-bounce" size={11} strokeWidth={2.5} />
            <span className="text-[7px] text-amber-300 font-extrabold uppercase tracking-wider origin-center -rotate-90 whitespace-nowrap translate-y-[-60px]">
              พลังงานสูงขึ้น ↑
            </span>
          </div>

          <div className="flex flex-col gap-2 pl-9 relative z-10">
            <AnimatePresence mode="popLayout">
              {filteredSubshells.map((sub) => {
                const colors = orbitalColors[sub.type];
                const subFilledCount = occupancies[sub.name] || 0;
                const isSubshellUsed = subFilledCount > 0;
                const isCurrentActive = sub.name === activeSubshellName && animatingCount > 0;

                return (
                  <motion.div
                    key={sub.name}
                    id={`subshell-${sub.name}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center justify-between p-1.5 rounded-xl border transition-all duration-300 group relative ${
                      isCurrentActive
                        ? 'border-amber-400/85 bg-amber-500/10 shadow-md shadow-amber-500/5 scale-[1.01]'
                        : isSubshellUsed 
                          ? 'border-white/10 bg-slate-950/60' 
                          : 'border-white/5 bg-slate-950/20 opacity-30'
                    }`}
                  >
                    {/* Intuitive Energy Order indicator/arrow */}
                    <div 
                      className={`absolute left-[-29px] top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                        isCurrentActive
                          ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/20 scale-110'
                          : isSubshellUsed
                            ? 'border-emerald-500/30 bg-emerald-500/10'
                            : 'border-white/5 bg-slate-950/40 opacity-40'
                      }`}
                    >
                      {isCurrentActive ? (
                        <ArrowUp className="text-amber-400 animate-bounce" size={8} strokeWidth={3.5} />
                      ) : isSubshellUsed ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-slate-600" />
                      )}
                    </div>

                    {/* Suborbital Label */}
                    <div className="flex items-start min-w-[32px] shrink-0">
                      <span className={`text-xs font-black font-mono ${isCurrentActive ? 'text-amber-300' : isSubshellUsed ? colors.text : 'text-slate-500'}`}>
                        {sub.name}
                      </span>
                      {isSubshellUsed && (
                        <sup className={`text-[9px] font-bold font-mono ml-0.5 leading-none align-super ${isCurrentActive ? 'text-amber-400' : 'text-slate-300'}`}>
                          {subFilledCount}
                        </sup>
                      )}
                    </div>

                    {/* degenerate Orbital Lines / Boxes */}
                    <div className="flex gap-1 py-0.5">
                      {Array.from({ length: sub.orbitals }).map((_, i) => {
                        const m = sub.orbitals;
                        const hasSpinUp = subFilledCount > i;
                        const hasSpinDown = subFilledCount > m + i;

                        return (
                          <div
                            key={i}
                            className={`w-7 h-9 rounded-md border flex items-center justify-center gap-0.5 relative font-mono text-sm font-black transition-all duration-200 ${
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
                              {i + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Panel: Dynamic Animation Controls or Shell Information */}
        {selectedShell === 'all' ? (
          <div className="mt-2.5 border-t border-white/5 pt-2.5 shrink-0 flex flex-row flex-nowrap items-center justify-between gap-1 sm:gap-2">
            {/* Play/Stop Button */}
            <button
              onClick={startEnergyAnimation}
              disabled={isEnergyAnimating}
              className={`flex-1 min-w-0 px-2 sm:px-3 py-1.5 text-center rounded-xl text-[10px] sm:text-xs font-black tracking-tight sm:tracking-wide transition duration-200 flex items-center justify-center gap-1 border cursor-pointer shadow-md shrink-0 ${
                isEnergyAnimating
                  ? 'bg-slate-950 text-slate-500 border-slate-900'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 border-amber-400 shadow-orange-500/10'
              }`}
            >
              <RotateCcw size={10} className={isEnergyAnimating ? 'animate-spin' : ''} />
              <span className="truncate">
                {isEnergyAnimating 
                  ? (
                      charge === 0
                        ? `จัดเรียง... (${animatingCount}/${electronCount})`
                        : charge > 0
                          ? (animatingCount <= electronCount
                              ? `จัดเรียง... (${animatingCount}/${electronCount})`
                              : `ดึงออก... (-${animatingCount - electronCount}/${charge})`
                            )
                          : (animatingCount <= electronCount
                              ? `จัดเรียง... (${animatingCount}/${electronCount})`
                              : `เพิ่ม... (+${animatingCount - electronCount}/${Math.abs(charge)})`
                            )
                    )
                  : (
                    <>
                      <span className="hidden sm:inline">แสดงการจัดเรียงแบบเคลื่อนไหว</span>
                      <span className="inline sm:hidden">แสดงการจัดเรียงแบบเคลื่อนไหว</span>
                    </>
                  )
                }
              </span>
            </button>

            {/* Animation Speed Presets Selector in the same row on the right */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-950/40 p-0.5 sm:p-1 rounded-xl border border-white/5 shrink-0">
              <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold flex items-center gap-0.5 shrink-0 pl-1">
                <Zap size={8} className="text-amber-400" />
                <span className="hidden sm:inline">โหมด:</span>
              </span>
              <div className="flex gap-0.5">
                {[
                  { label: 'ช้า', delay: 750 },
                  { label: 'ปกติ', delay: 350 },
                  { label: 'เร็ว', delay: 120 }
                ].map(opt => (
                  <button
                    key={opt.delay}
                    type="button"
                    onClick={() => setAnimationSpeed(opt.delay)}
                    className={`px-1 py-0.5 sm:px-2 rounded-md text-[8px] sm:text-[9px] font-bold transition cursor-pointer ${
                      animationSpeed === opt.delay
                        ? 'bg-amber-500 text-slate-950 font-extrabold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2.5 text-[10px] text-slate-400 flex items-center gap-1.5 border-t border-white/5 pt-2 shrink-0">
            <Info size={12} className="text-sky-400 shrink-0 animate-pulse" />
            <span>
              {`ชั้น n = ${selectedShell} มี ${filteredSubshells.length} ออร์บิทัลย่อย ความจุสูงสุดในชั้นนี้คือ ${2 * Math.pow(selectedShell as number, 2)} e⁻`}
            </span>
          </div>
        )}

        {/* Anomaly Explanation Modal for Cr (24) and Cu (29) */}
        <AnimatePresence>
          {showAnomalyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 text-left"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-5 max-w-md w-full shadow-2xl relative overflow-hidden"
              >
                {/* Accent glow */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />
                
                <div className="flex items-start gap-3.5 mt-2">
                  <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-400 shrink-0">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>กรณีพิเศษการจัดเรียงอิเล็กตรอน (Shift Electron)</span>
                    </h3>
                    <p className="text-xs text-amber-400 font-bold mt-1">
                      {electronCount === 24 ? 'โครเมียม (Chromium, Z=24)' : 'ทองแดง (Copper, Z=29)'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-300 leading-relaxed bg-slate-950/40 border border-white/5 p-3.5 rounded-xl space-y-2.5 font-sans">
                  {electronCount === 24 ? (
                    <>
                      <p>
                        ตามกฎของเอาฟบาว ควรจัดเรียงเป็น <span className="font-mono text-amber-400 font-bold">[Ar] 4s² 3d⁴</span> แต่โครเมียมจริงจัดเรียงเป็น <span className="font-mono text-emerald-400 font-bold">[Ar] 4s¹ 3d⁵</span>
                      </p>
                      <p className="text-slate-400">
                        <strong className="text-slate-300">เหตุผล:</strong> การเลื่อนอิเล็กตรอน 1 ตัวจาก 4s ไปยัง 3d ทำให้ d-orbital บรรจุเป็น <span className="text-emerald-400 font-bold">3d⁵ ซึ่งเป็นการบรรจุครึ่ง (Half-filled state)</span> ที่มีความสมมาตรสูงและมีพลังงานต่ำกว่า (เสถียรกว่า) การจัดโครงสร้างปกติ
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        ตามกฎของเอาฟบาว ควรจัดเรียงเป็น <span className="font-mono text-amber-400 font-bold">[Ar] 4s² 3d⁹</span> แต่ทองแดงจริงจัดเรียงเป็น <span className="font-mono text-emerald-400 font-bold">[Ar] 4s¹ 3d¹⁰</span>
                      </p>
                      <p className="text-slate-400">
                        <strong className="text-slate-300">เหตุผล:</strong> การเลื่อนอิเล็กตรอน 1 ตัวจาก 4s ไปยัง 3d ทำให้ d-orbital บรรจุเต็มเป็น <span className="text-emerald-400 font-bold">3d¹⁰ ซึ่งเป็นการบรรจุเต็ม (Fully-filled state)</span> ซึ่งมีความเสถียรและสมมาตรสูงสุด
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => setShowAnomalyModal(false)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black rounded-xl cursor-pointer hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-150 active:scale-95"
                  >
                    เข้าใจแล้ว
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* 3. Summary Display (Visible on Mobile only when active) */}
      <div className={`flex-1 flex flex-col bg-slate-900/40 border-0 md:border border-white/5 rounded-none md:rounded-2xl p-3 sm:p-4 md:p-5 relative overflow-y-auto pt-2 md:pt-5 ${
        modelType === 'summary' ? 'flex' : 'hidden'
      }`}>
        <div className="flex flex-col gap-3 h-full">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 border-b border-white/5 pb-1.5 shrink-0">
            <Info size={13} className="text-blue-400" />
            <span>สรุปการจัดเรียงอิเล็กตรอน:</span>
          </h3>

          {(() => {
            const maxSteps = electronCount + Math.abs(charge);
            const isAnimationFinished = animatingCount >= maxSteps;
            const activeOccupancies = isAnimationFinished
              ? getIonOccupancies(electronCount, charge)
              : getOccupanciesForStep(electronCount, charge, animatingCount);

            return (
              <div className="flex-1 flex flex-col gap-2.5">
                {/* Nuclear Symbol & Particles Breakdown */}
                <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-white/10 flex items-center justify-between gap-3 shrink-0">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">สัญลักษณ์นิวเคลียร์:</span>
                    <div className="mt-1 flex items-center pl-1">
                      {(() => {
                        const activeElem = ELEMENTS_DATA[electronCount] || { symbol: 'X', nameTh: 'ธาตุปริศนา', nameEn: 'Unknown' };
                        const massNum = ELEMENT_MASS_NUMBERS[electronCount] || (electronCount * 2);
                        const chargeSign = charge > 0 ? '+' : '-';
                        const chargeText = charge === 0 ? '' : (Math.abs(charge) === 1 ? chargeSign : `${Math.abs(charge)}${chargeSign}`);
                        
                        return (
                          <div className="flex items-center gap-3">
                            <div className="inline-flex items-center font-mono shrink-0">
                              <div className="flex flex-col text-right text-[10px] leading-none mr-1 select-none">
                                <span className="font-bold text-amber-400 text-xs" title="เลขมวล (A)">{massNum}</span>
                                <span className="font-bold text-sky-400 text-xs" title="เลขอะตอม (Z)">{electronCount}</span>
                              </div>
                              <span className="text-2xl font-black text-white leading-none tracking-tight">{activeElem.symbol}</span>
                              {charge !== 0 && (
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
                      <span className="text-xs font-black font-mono text-sky-300 mt-0.5 block">{electronCount}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold block leading-tight">นิวตรอน</span>
                      <span className="text-[7.5px] text-slate-500 font-medium block leading-tight">(n⁰)</span>
                      <span className="text-xs font-black font-mono text-amber-300 mt-0.5 block">
                        {(ELEMENT_MASS_NUMBERS[electronCount] || (electronCount * 2)) - electronCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold block leading-tight">อิเล็กตรอน</span>
                      <span className="text-[7.5px] text-slate-500 font-medium block leading-tight">(e⁻)</span>
                      <span className="text-xs font-black font-mono text-emerald-300 mt-0.5 block">
                        {Math.max(0, electronCount - charge)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2.1 Spectroscopic Configuration */}
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 flex flex-col shrink-0">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">การจัดเรียงอิเล็กตรอนในระดับพลังงานย่อย:</span>
                  <span 
                    className="text-xs font-mono text-amber-300 mt-0.5 leading-relaxed tracking-wider"
                    dangerouslySetInnerHTML={{ __html: getSpectroscopicFromOccupancies(activeOccupancies) }}
                  />
                </div>

                {/* 2.2 Shorthand Configuration */}
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 flex flex-col shrink-0">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">การจัดเรียงอิเล็กตรอนแบบย่อ (อ้างอิงแก๊สเฉื่อย):</span>
                  <span 
                    className="text-xs font-mono text-sky-400 mt-0.5 tracking-wider"
                    dangerouslySetInnerHTML={{ __html: getShorthandFromOccupancies(activeOccupancies) }}
                  />
                </div>

                {/* 2.3 Principal Configuration */}
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 flex flex-col border-t border-emerald-500/20 shrink-0">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">การจัดเรียงอิเล็กตรอนในระดับพลังงานหลัก:</span>
                  <span className="text-sm font-black font-mono text-emerald-400 mt-0.5 tracking-wide">
                    {(() => {
                      if (animatingCount === 0) return '0';
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
        </div>
      </div>

    </div>

  </div>
  );
}
