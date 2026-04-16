import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrafficData {
  time: string;
  primary: number;
  ghost: number;
}

export const TrafficChart: React.FC<{ data: TrafficData[] }> = ({ data }) => {
  return (
    <div className="w-full h-[180px] bg-[#050608] border border-[#1E293B] rounded-lg p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-[9px] font-mono text-[#94A3B8] uppercase tracking-widest">Entropy Distribution</h4>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00f2ff]" />
            <span className="text-[9px] text-[#00f2ff] font-mono uppercase">User</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff8c00]" />
            <span className="text-[9px] text-[#ff8c00] font-mono uppercase">Decoy</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorGhost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff8c00" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ff8c00" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="time" 
            hide 
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)' }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '10px'
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Area 
            type="monotone" 
            dataKey="primary" 
            stroke="#00f2ff" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrimary)" 
            isAnimationActive={false}
          />
          <Area 
            type="monotone" 
            dataKey="ghost" 
            stroke="#ff8c00" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorGhost)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
