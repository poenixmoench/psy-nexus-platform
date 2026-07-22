import React from 'react';

const VortexDashboard: React.FC = () => {
  // 9 Knoten auf dem Kreis (40° Schritte, Start bei 12 Uhr)
  const nodes = Array.from({ length: 9 }).map((_, i) => {
    const angle = ((i + 1) * 40 - 90) * (Math.PI / 180);
    const radius = 180;
    return {
      id: i + 1,
      x: 250 + radius * Math.cos(angle),
      y: 250 + radius * Math.sin(angle),
    };
  });

  // Rodin-Sequenz: 1 → 2 → 4 → 8 → 7 → 5 → 1
  const sequence = [1, 2, 4, 8, 7, 5];
  const pathData = `M ${nodes[0].x} ${nodes[0].y} ` + 
                   sequence.slice(1).map(id => {
                     const n = nodes.find(node => node.id === id);
                     return `L ${n!.x} ${n!.y}`;
                   }).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 font-sans">
      <div className="relative w-[500px] h-[500px] bg-slate-900/10 rounded-full border border-cyan-500/10 shadow-inner">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          {/* Triade (3-6-9) - Energetisches Feld */}
          <path 
            d={`M ${nodes[2].x} ${nodes[2].y} L ${nodes[5].x} ${nodes[5].y} L ${nodes[8].x} ${nodes[8].y} Z`}
            className="fill-none stroke-[1px]"
            style={{ strokeDasharray: '4,4', stroke: '#ff00ff', opacity: 0.3 }}
          />
          
          {/* Vortex-Pfad (1-2-4-8-7-5) */}
          <path
            d={pathData}
            className="fill-none stroke-[3px] animate-pulse"
            style={{ 
              stroke: '#22d3ee',
              filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.8))'
            }}
          />

          {/* Knoten */}
          {nodes.map((node) => (
            <g key={node.id}>
              <circle 
                cx={node.x} cy={node.y} r="5" 
                fill={[3,6,9].includes(node.id) ? '#ff00ff' : '#22d3ee'} 
              />
              <text 
                x={node.x} y={node.y} 
                dx={node.x > 250 ? 15 : -25} dy="5" 
                className="fill-white/40 text-[12px] font-mono"
              >
                {node.id}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-6 text-cyan-500/50 font-mono text-[10px] tracking-tighter uppercase">
        Rodin Circuit: 1-2-4-8-7-5 // Field: 3-6-9 // Sentinel-Coder Verified
      </div>
    </div>
  );
};

export default VortexDashboard;
