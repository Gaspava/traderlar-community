'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Trade {
  profit: number;
  openTime: string;
  closeTime: string;
  type: 'buy' | 'sell';
}

// CSS 3D Performance Visualization
export function Performance3DVisualization({ trades }: { trades: Trade[] }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) return null;
  
  const maxTrades = 30;
  const displayTrades = trades.slice(0, maxTrades);
  
  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-background to-muted/20 rounded-xl border border-border/50 overflow-hidden relative perspective-[1000px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative w-full h-full preserve-3d"
          animate={{ rotateY: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {displayTrades.map((trade, index) => {
            const angle = (index / maxTrades) * 360;
            const radius = 150;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const z = Math.sin((angle * Math.PI) / 180) * radius;
            const height = Math.min(Math.abs(trade.profit) * 2, 100);
            
            return (
              <motion.div
                key={index}
                className="absolute w-4 bg-gradient-to-t from-transparent"
                style={{
                  height: `${height}px`,
                  bottom: '50%',
                  left: '50%',
                  transform: `translateX(-50%) translateZ(${z}px) translateX(${x}px) rotateY(${-angle}deg)`,
                  backgroundColor: trade.profit > 0 ? 'rgb(74 222 128)' : 'rgb(239 68 68)',
                  boxShadow: `0 0 20px ${trade.profit > 0 ? 'rgb(74 222 128 / 0.5)' : 'rgb(239 68 68 / 0.5)'}`
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
              />
            );
          })}
        </motion.div>
      </div>
      
      <div className="absolute top-4 left-4 text-sm text-muted-foreground">
        <div className="font-semibold">3D Performans Görselleştirmesi</div>
        <div className="text-xs">İşlem sayısı: {trades.length}</div>
      </div>
    </div>
  );
}

// CSS 3D Risk Metrics Cube
export function RiskMetricsCube({ metrics }: { metrics: any }) {
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) return null;
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 60;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -60;
    setRotation({ x: y - 20, y: x + 45 });
  };
  
  const cubeSize = 200;
  const halfSize = cubeSize / 2;
  
  const faces = [
    { transform: `translateZ(${halfSize}px)`, label: 'Risk', value: metrics?.valueAtRisk95 || 0, color: 'from-red-500/20 to-red-600/20' },
    { transform: `translateZ(-${halfSize}px) rotateY(180deg)`, label: 'Volatilite', value: metrics?.downsideDeviation || 0, color: 'from-orange-500/20 to-orange-600/20' },
    { transform: `translateX(${halfSize}px) rotateY(90deg)`, label: 'Drawdown', value: metrics?.maxDrawdown || 0, color: 'from-yellow-500/20 to-yellow-600/20' },
    { transform: `translateX(-${halfSize}px) rotateY(-90deg)`, label: 'Sharpe', value: 2.1, color: 'from-green-500/20 to-green-600/20' },
    { transform: `translateY(-${halfSize}px) rotateX(90deg)`, label: 'Omega', value: metrics?.omega || 0, color: 'from-blue-500/20 to-blue-600/20' },
    { transform: `translateY(${halfSize}px) rotateX(-90deg)`, label: 'Calmar', value: metrics?.calmarRatio || 0, color: 'from-purple-500/20 to-purple-600/20' }
  ];
  
  return (
    <div 
      className="w-full h-[400px] bg-gradient-to-b from-background to-muted/20 rounded-xl border border-border/50 overflow-hidden relative perspective-[800px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotation({ x: -20, y: 45 })}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative preserve-3d"
          style={{ width: cubeSize, height: cubeSize }}
          animate={{ rotateX: rotation.x, rotateY: rotation.y }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {faces.map((face, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-gradient-to-br ${face.color} backdrop-blur-sm border border-white/10 rounded-lg flex flex-col items-center justify-center`}
              style={{ transform: face.transform }}
            >
              <div className="text-lg font-semibold text-foreground/80">{face.label}</div>
              <div className="text-2xl font-bold text-primary">
                {typeof face.value === 'number' ? face.value.toFixed(2) : face.value}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
      
      <div className="absolute top-4 left-4 text-sm text-muted-foreground">
        <div className="font-semibold">Risk Metrikleri Küpü</div>
        <div className="text-xs">Mouse ile döndürün</div>
      </div>
    </div>
  );
}

// CSS 3D Trade Network
export function TradeNetwork3D({ trades }: { trades: Trade[] }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) return null;
  
  const maxTrades = 20;
  const displayTrades = trades.slice(0, maxTrades);
  
  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-background to-muted/20 rounded-xl border border-border/50 overflow-hidden relative">
      <div className="absolute inset-0">
        {/* Center node */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center z-10">
          <div className="w-12 h-12 bg-primary rounded-full animate-pulse" />
        </div>
        
        {/* Trade nodes */}
        {displayTrades.map((trade, index) => {
          const angle = (index / maxTrades) * 360;
          const radius = 120;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          const profit = trade.profit;
          
          return (
            <motion.div
              key={index}
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Connection line */}
              <svg
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: radius,
                  height: 2,
                  transform: `translate(-50%, -50%) rotate(${angle + 180}deg) translateX(${radius/2}px)`
                }}
              >
                <line
                  x1="0"
                  y1="1"
                  x2={radius}
                  y2="1"
                  stroke={profit > 0 ? 'rgb(74 222 128)' : 'rgb(239 68 68)'}
                  strokeWidth="1"
                  opacity="0.3"
                />
              </svg>
              
              {/* Trade node */}
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  profit > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}
                whileHover={{ scale: 1.2 }}
              >
                <div 
                  className={`w-4 h-4 rounded-full ${
                    profit > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{
                    boxShadow: `0 0 20px ${profit > 0 ? 'rgb(74 222 128 / 0.5)' : 'rgb(239 68 68 / 0.5)'}`
                  }}
                />
              </motion.div>
              
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background/90 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                {trade.type === 'buy' ? 'Alış' : 'Satış'}: {profit > 0 ? '+' : ''}{profit.toFixed(2)}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="absolute top-4 left-4 text-sm text-muted-foreground">
        <div className="font-semibold">İşlem Ağı Görselleştirmesi</div>
        <div className="text-xs">Son {displayTrades.length} işlem</div>
      </div>
    </div>
  );
}

// Style helper
const styles = `
  .preserve-3d {
    transform-style: preserve-3d;
  }
  .perspective-[800px] {
    perspective: 800px;
  }
  .perspective-[1000px] {
    perspective: 1000px;
  }
`;

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}