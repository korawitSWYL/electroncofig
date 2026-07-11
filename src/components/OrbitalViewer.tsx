import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ORBITAL_DEFS, angularFunction, OrbitalDef } from '../lib/orbitalData';

export interface OrbitalToRender {
  n: number;
  type: string;
  name: string;
  activeDegenerateNames?: string[];
}

interface OrbitalViewerProps {
  orbitals: OrbitalToRender[];
}

interface AnimatedElectron {
  mesh: THREE.Mesh;
  target: THREE.Vector3;
  orbitalVertices: number[];
}

export default function OrbitalViewer({ orbitals }: OrbitalViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const orbitalGroupRef = useRef<THREE.Group | null>(null);
  const electronGroupRef = useRef<THREE.Group | null>(null);
  const electronsRef = useRef<AnimatedElectron[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene, Camera, Renderer
    const container = containerRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(10, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 50;
    controls.minDistance = 3;

    // 2. Setup Lighting & Nucleus
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const pointLight = new THREE.PointLight(0xffffff, 2.0);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Breathtaking glowing nucleus
    const nucleusGeometry = new THREE.SphereGeometry(0.4, 32, 16);
    const nucleusMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff7e00,
      emissive: 0xff3c00,
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.9,
    });
    scene.add(new THREE.Mesh(nucleusGeometry, nucleusMaterial));

    // 3. Setup Groups
    const orbitalGroup = new THREE.Group();
    scene.add(orbitalGroup);
    orbitalGroupRef.current = orbitalGroup;

    const electronGroup = new THREE.Group();
    scene.add(electronGroup);
    electronGroupRef.current = electronGroup;

    // 4. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      // Smoothly rotate the scene slightly to feel alive
      if (orbitalGroup) {
        orbitalGroup.rotation.y += 0.001;
      }
      if (electronGroup) {
        electronGroup.rotation.y += 0.001;
      }

      // Animate electrons along orbital paths
      const speed = 0.07;
      electronsRef.current.forEach(e => {
        if (e.mesh.position.distanceTo(e.target) < 0.4) {
          // Reached target, pick another random coordinate from the orbital cloud
          const pts = e.orbitalVertices;
          if (pts.length > 0) {
            const idx = Math.floor(Math.random() * (pts.length / 3)) * 3;
            e.target.set(pts[idx], pts[idx + 1], pts[idx + 2]);
          }
        }
        e.mesh.position.lerp(e.target, speed);
      });

      renderer.render(scene, camera);
    };
    animate();

    // 5. Resize Handler
    let resizeAnimationFrameId: number;
    const handleResize = () => {
      if (!container) return;
      cancelAnimationFrame(resizeAnimationFrameId);
      resizeAnimationFrameId = requestAnimationFrame(() => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      });
    };
    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver for full screen size responsiveness
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      cancelAnimationFrame(resizeAnimationFrameId);
      container.removeChild(renderer.domElement);
      renderer.dispose();
      scene.clear();
    };
  }, []);

    // Sync state changes for active types and subs
  useEffect(() => {
    if (!orbitalGroupRef.current || !electronGroupRef.current) return;
    const orbitalGroup = orbitalGroupRef.current;
    const electronGroup = electronGroupRef.current;

    // Helper to dispose of geometries and materials in a group to prevent memory leaks
    const disposeGroup = (group: THREE.Group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    };

    // Dispose of previous render GPU resources
    disposeGroup(orbitalGroup);
    disposeGroup(electronGroup);

    // Clear previous elements
    orbitalGroup.clear();
    electronGroup.clear();
    electronsRef.current = [];

    const activeOrbitalDefs: { def: OrbitalDef, n: number }[] = [];
    
    orbitals.forEach(activeOrb => {
      ORBITAL_DEFS[activeOrb.type].forEach(orb => {
        if (!activeOrb.activeDegenerateNames || activeOrb.activeDegenerateNames.includes(orb.name)) {
          activeOrbitalDefs.push({ def: orb, n: activeOrb.n });
        }
      });
    });

    const electronGeo = new THREE.SphereGeometry(0.21, 16, 16);

    activeOrbitalDefs.forEach(({ def, n }) => {
      const { name, color } = def;
      const scale = n * 1.5; // Scale dynamically based on n
      const shapeFunc = angularFunction(name);
      
      // Highly optimized point counts for silky-smooth framerates & instant loads
      const pointCount = name.startsWith('f') ? 2200 : name.startsWith('d') ? 1600 : name.startsWith('p') ? 1000 : 700;
      const vertices: number[] = [];
      
      for (let i = 0; i < pointCount * 2; i++) {
        const theta = Math.random() * Math.PI * 2;
        const u = Math.random() * 2 - 1;
        const v = Math.sqrt(1 - u * u);
        
        const x = v * Math.cos(theta);
        const y = v * Math.sin(theta);
        const z = u;

        const r2 = x*x + y*y + z*z;
        const r = Math.sqrt(r2);
        
        const angularVal = shapeFunc(x, y, z, r, r2);
        
        if (Math.abs(angularVal) < 1e-5) continue;
        
        const length = scale * Math.abs(angularVal);
        vertices.push(x * length, y * length, z * length);
      }
      
      const group = new THREE.Group();
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      
      const material = new THREE.PointsMaterial({ 
        color: color, 
        size: 0.08, 
        transparent: true, 
        opacity: 0.6, 
        blending: THREE.AdditiveBlending, 
        depthWrite: false 
      });

      const points = new THREE.Points(geometry, material);
      group.add(points);
      orbitalGroup.add(group);

      // Add exactly 2 glowing electrons per suborbital, representing Pauli pairs
      if (vertices.length > 0) {
        // Divide vertices into Lobe A and Lobe B (opposite spatial hemispheres) to model electron repulsion
        const lobeA: number[] = [];
        const lobeB: number[] = [];
        
        for (let idx = 0; idx < vertices.length; idx += 3) {
          const vx = vertices[idx];
          const vy = vertices[idx+1];
          const vz = vertices[idx+2];
          // Use x+y+z to split into two hemispheres/opposite sides
          if (vx + vy + vz > 0) {
            lobeA.push(vx, vy, vz);
          } else {
            lobeB.push(vx, vy, vz);
          }
        }

        const lobes = [lobeA.length > 0 ? lobeA : vertices, lobeB.length > 0 ? lobeB : vertices];

        for(let i = 0; i < 2; i++) {
          // Yellow-hot neon glow for maximum visibility
          const electronMat = new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff,
            emissive: 0xffea00, // vibrant yellow
            emissiveIntensity: 3.5,
            roughness: 0.1,
            metalness: 0.9,
          });

          const lobeVertices = lobes[i];
          const mesh = new THREE.Mesh(electronGeo, electronMat);
          const startIdx = Math.floor(Math.random() * (lobeVertices.length / 3)) * 3;
          mesh.position.set(lobeVertices[startIdx], lobeVertices[startIdx+1], lobeVertices[startIdx+2]);
          
          electronGroup.add(mesh);
          electronsRef.current.push({
            mesh,
            target: new THREE.Vector3(lobeVertices[startIdx], lobeVertices[startIdx+1], lobeVertices[startIdx+2]),
            orbitalVertices: lobeVertices
          });
        }
      }
    });

    return () => {
      electronGeo.dispose();
    };
  }, [orbitals]);

  return <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing outline-none" />;
}

