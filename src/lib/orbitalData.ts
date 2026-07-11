export interface OrbitalDef {
  name: string;
  displayName: string;
  color: number;
  tailwindColor: string; // for UI
}

export const ORBITAL_DEFS: Record<string, OrbitalDef[]> = {
  s: [{ name: 's', displayName: 's', color: 0x3b82f6, tailwindColor: 'bg-blue-500' }],
  p: [
    { name: 'p_x', displayName: 'p_x', color: 0xef4444, tailwindColor: 'bg-red-500' },
    { name: 'p_y', displayName: 'p_y', color: 0x22c55e, tailwindColor: 'bg-green-500' },
    { name: 'p_z', displayName: 'p_z', color: 0xeab308, tailwindColor: 'bg-yellow-500' }
  ],
  d: [
    { name: 'd_xy', displayName: 'd_xy', color: 0x8b5cf6, tailwindColor: 'bg-violet-500' },
    { name: 'd_yz', displayName: 'd_yz', color: 0xec4899, tailwindColor: 'bg-pink-500' },
    { name: 'd_xz', displayName: 'd_xz', color: 0x6366f1, tailwindColor: 'bg-indigo-500' },
    { name: 'd_x2-y2', displayName: 'd_x²-y²', color: 0xf97316, tailwindColor: 'bg-orange-500' },
    { name: 'd_z2', displayName: 'd_z²', color: 0x14b8a6, tailwindColor: 'bg-teal-500' }
  ],
  f: [
    { name: 'f_z3', displayName: 'f_z³', color: 0xff6347, tailwindColor: 'bg-rose-500' },
    { name: 'f_xz2', displayName: 'f_xz²', color: 0x4682b4, tailwindColor: 'bg-sky-500' },
    { name: 'f_yz2', displayName: 'f_yz²', color: 0x32cd32, tailwindColor: 'bg-emerald-500' },
    { name: 'f_xyz', displayName: 'f_xyz', color: 0xffd700, tailwindColor: 'bg-amber-500' },
    { name: 'f_z(x2-y2)', displayName: 'f_z(x²-y²)', color: 0xdda0dd, tailwindColor: 'bg-fuchsia-500' },
    { name: 'f_x(x2-3y2)', displayName: 'f_x(x²-3y²)', color: 0xff4500, tailwindColor: 'bg-orange-600' },
    { name: 'f_y(3x2-y2)', displayName: 'f_y(3x²-y²)', color: 0x00ced1, tailwindColor: 'bg-cyan-500' }
  ]
};

export const angularFunction = (name: string) => {
  return (x: number, y: number, z: number, r: number, r2: number) => {
    switch (name) {
      case 's': return 1;
      case 'p_x': return x / r;
      case 'p_y': return y / r;
      case 'p_z': return z / r;
      // Normalizing factor for d orbitals: peaks are at 1.0
      case 'd_xy': return 2.0 * (x * y) / r2;
      case 'd_yz': return 2.0 * (y * z) / r2;
      case 'd_xz': return 2.0 * (x * z) / r2;
      case 'd_x2-y2': return (x * x - y * y) / r2;
      case 'd_z2': return 0.5 * (2 * z * z - x * x - y * y) / r2;
      // Normalizing factor for f orbitals: peaks are at 1.0
      case 'f_z3': return 0.5 * z * (5 * z * z - 3 * r2) / (r2 * r);
      case 'f_xz2': return 0.7261 * x * (5 * z * z - r2) / (r2 * r);
      case 'f_yz2': return 0.7261 * y * (5 * z * z - r2) / (r2 * r);
      case 'f_xyz': return 5.1962 * (x * y * z) / (r2 * r);
      case 'f_z(x2-y2)': return 2.5981 * z * (x * x - y * y) / (r2 * r);
      case 'f_x(x2-3y2)': return x * (x * x - 3 * y * y) / (r2 * r);
      case 'f_y(3x2-y2)': return y * (3 * x * x - y * y) / (r2 * r);
      default: return 0;
    }
  };
};

export function formatOrbitalNameHtml(displayName: string) {
  return displayName
    .replace(/_([a-zA-Z0-9²³]+)/g, '<sub>$1</sub>');
}
