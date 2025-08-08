'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Trade {
  profit: number;
  openTime: string;
  closeTime: string;
  type: 'buy' | 'sell';
}

// 3D Performance Surface Plot
export function PerformanceSurfacePlot({ trades }: { trades: Trade[] }) {
  return (
    <div className="w-full h-[400px] bg-card rounded-xl border border-border/50 overflow-hidden">
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <Suspense fallback={
          <Html center>
            <div className="text-muted-foreground">Yükleniyor...</div>
          </Html>
        }>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          
          {/* Grid */}
          <gridHelper args={[10, 10, 0x444444, 0x222222]} />
          
          {/* Performance Surface */}
          <PerformanceMesh trades={trades} />
          
          {/* Axes Labels */}
          <Text position={[5.5, 0, 0]} fontSize={0.3} color="#888">
            Time →
          </Text>
          <Text position={[0, 0, 5.5]} fontSize={0.3} color="#888">
            Profit →
          </Text>
          <Text position={[0, 5.5, 0]} fontSize={0.3} color="#888">
            Frequency ↑
          </Text>
        </Suspense>
      </Canvas>
    </div>
  );
}

function PerformanceMesh({ trades }: { trades: Trade[] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  
  // Simple visualization if no trades
  if (!trades || trades.length === 0) {
    return (
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#4ade80" wireframe />
      </mesh>
    );
  }
  
  // Create wave mesh based on trades
  return (
    <group ref={meshRef}>
      {trades.slice(0, 50).map((trade, index) => {
        const x = (index / 50 - 0.5) * 10;
        const y = (trade.profit / 100) * 2;
        const z = 0;
        
        return (
          <mesh key={index} position={[x, y, z]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial 
              color={trade.profit > 0 ? '#4ade80' : '#ef4444'} 
              emissive={trade.profit > 0 ? '#4ade80' : '#ef4444'}
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// 3D Risk Cube Visualization
export function RiskCube({ metrics }: { metrics: any }) {
  return (
    <div className="w-full h-[400px] bg-card rounded-xl border border-border/50 overflow-hidden">
      <Canvas camera={{ position: [3, 3, 3], fov: 60 }}>
        <Suspense fallback={
          <Html center>
            <div className="text-muted-foreground">Yükleniyor...</div>
          </Html>
        }>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          
          <RiskCubeComponent metrics={metrics} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function RiskCubeComponent({ metrics }: { metrics: any }) {
  const cubeRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      cubeRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });
  
  // Risk dimensions with null checks
  const riskSize = Math.abs(metrics?.valueAtRisk95 || 5) / 10;
  const volatilitySize = (metrics?.downsideDeviation || 10) / 10;
  const drawdownSize = Math.abs(metrics?.maxDrawdown || -20) / 50;
  
  return (
    <group ref={cubeRef}>
      {/* Main Risk Cube */}
      <Box args={[riskSize, volatilitySize, drawdownSize]}>
        <meshStandardMaterial 
          color="#ff6b6b" 
          transparent 
          opacity={0.6}
          emissive="#ff0000"
          emissiveIntensity={0.2}
        />
      </Box>
      
      {/* Risk Indicators */}
      <Sphere args={[0.1]} position={[riskSize/2, 0, 0]}>
        <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.5} />
      </Sphere>
      <Sphere args={[0.1]} position={[0, volatilitySize/2, 0]}>
        <meshStandardMaterial color="#ff9800" emissive="#ff9800" emissiveIntensity={0.5} />
      </Sphere>
      <Sphere args={[0.1]} position={[0, 0, drawdownSize/2]}>
        <meshStandardMaterial color="#f44336" emissive="#f44336" emissiveIntensity={0.5} />
      </Sphere>
      
      {/* Labels */}
      <Text position={[riskSize/2 + 0.5, 0, 0]} fontSize={0.2} color="#ffeb3b">
        VaR: {(metrics?.valueAtRisk95 || 5).toFixed(2)}%
      </Text>
      <Text position={[0, volatilitySize/2 + 0.5, 0]} fontSize={0.2} color="#ff9800">
        Vol: {(metrics?.downsideDeviation || 10).toFixed(2)}%
      </Text>
      <Text position={[0, 0, drawdownSize/2 + 0.5]} fontSize={0.2} color="#f44336">
        DD: {(metrics?.maxDrawdown || -20).toFixed(2)}%
      </Text>
    </group>
  );
}

// 3D Trade Flow Visualization
export function TradeFlow3D({ trades }: { trades: Trade[] }) {
  return (
    <div className="w-full h-[400px] bg-card rounded-xl border border-border/50 overflow-hidden">
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <Suspense fallback={
          <Html center>
            <div className="text-muted-foreground">Yükleniyor...</div>
          </Html>
        }>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          
          <TradeFlowVisualization trades={trades.slice(0, 50)} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function TradeFlowVisualization({ trades }: { trades: Trade[] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  
  return (
    <group ref={groupRef}>
      {trades.map((trade, index) => {
        const angle = (index / trades.length) * Math.PI * 2;
        const radius = 3 + (trade.profit > 0 ? 1 : 0);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (trade.profit / 100) * 2;
        
        return (
          <group key={index}>
            {/* Trade Node */}
            <Sphere 
              args={[0.1 + Math.abs(trade.profit) / 1000]} 
              position={[x, y, z]}
            >
              <meshStandardMaterial 
                color={trade.type === 'buy' ? '#4caf50' : '#f44336'} 
                emissive={trade.type === 'buy' ? '#4caf50' : '#f44336'}
                emissiveIntensity={0.3}
              />
            </Sphere>
            
            {/* Connection to center */}
            <Line
              points={[[0, 0, 0], [x, y, z]]}
              color={trade.profit > 0 ? '#4caf50' : '#f44336'}
              lineWidth={1}
              transparent
              opacity={0.3}
            />
          </group>
        );
      })}
      
      {/* Center Node */}
      <Sphere args={[0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#2196f3" emissive="#2196f3" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  );
}

// 3D Correlation Matrix
export function CorrelationMatrix3D({ data }: { data: number[][] }) {
  return (
    <div className="w-full h-[400px] bg-card rounded-xl border border-border/50 overflow-hidden">
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <Suspense fallback={
          <Html center>
            <div className="text-muted-foreground">Yükleniyor...</div>
          </Html>
        }>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          
          <CorrelationBars data={data} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function CorrelationBars({ data }: { data: number[][] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });
  
  const size = data.length;
  const spacing = 0.5;
  
  return (
    <group ref={groupRef}>
      {data.map((row, i) => 
        row.map((value, j) => {
          const height = Math.abs(value) * 3;
          const x = (i - size / 2) * spacing;
          const z = (j - size / 2) * spacing;
          const color = value > 0 ? '#4caf50' : '#f44336';
          
          return (
            <Box
              key={`${i}-${j}`}
              args={[0.4, height, 0.4]}
              position={[x, height / 2, z]}
            >
              <meshStandardMaterial 
                color={color}
                transparent
                opacity={0.8}
                emissive={color}
                emissiveIntensity={0.2}
              />
            </Box>
          );
        })
      )}
    </group>
  );
}