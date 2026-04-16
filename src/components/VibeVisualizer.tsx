// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleSystem = ({ count = 500, color, speed = 1, isActive = true }) => {
  const mesh = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 20 - 10;
      const y = Math.random() * 20 - 10;
      const z = (Math.random() - 0.5) * 10;
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, [count]);

  useFrame((state) => {
    if (!mesh.current || !isActive) return;
    const time = state.clock.getElapsedTime();
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Move speed
      positions[i3 + 1] -= speed * 0.05;
      
      // Reset if out of bounds
      if (positions[i3 + 1] < -10) {
        positions[i3 + 1] = 10;
        positions[i3] = Math.random() * 20 - 10;
      }
      
      // Wave effect
      positions[i3] += Math.sin(time + positions[i3 + 1]) * 0.01;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={color}
        transparent
        opacity={isActive ? 0.6 : 0.1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const VibeVisualizer: React.FC<{ noiseActive: boolean }> = ({ noiseActive }) => {
  return (
    <div className="w-full h-full bg-[#0D0E12] overflow-hidden relative group">
      <div className="absolute top-4 left-6 z-10">
        <h3 className="text-[#94A3B8] text-[9px] font-mono uppercase tracking-[0.2em]">Traffic Multiplexer</h3>
        <p className="text-[#E2E8F0] text-xs font-medium">Real-time Bitstream</p>
      </div>
      
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <color attach="background" args={['#0D0E12']} />
        <ambientLight intensity={0.5} />
        
        {/* Primary Traffic - Blue/Cyan */}
        <ParticleSystem count={400} color="#00f2ff" speed={1.2} />
        
        {/* Ghost Traffic - Orange/Amber */}
        <ParticleSystem 
          count={800} 
          color="#ff8c00" 
          speed={0.8} 
          isActive={noiseActive} 
        />
        
        <gridHelper args={[20, 10, 0x1E293B, 0x1E293B]} rotation={[Math.PI / 2, 0, 0]} />
      </Canvas>
      
      <div className="absolute bottom-4 right-6 flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest bg-[#050608]/80 px-3 py-1 border border-[#1E293B] rounded-sm">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]" />
          <span className="text-[#00f2ff]">Primary</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${noiseActive ? 'bg-[#ff8c00] shadow-[0_0_8px_#ff8c00]' : 'bg-white/20'}`} />
          <span className={noiseActive ? 'text-[#ff8c00]' : 'text-white/20'}>Ghost</span>
        </div>
      </div>
    </div>
  );
};
