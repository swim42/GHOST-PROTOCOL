import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Settings, 
  Activity, 
  Ghost, 
  Lock, 
  Cpu, 
  Zap,
  ChevronRight,
  User,
  Eye,
  Terminal,
  AlertTriangle
} from 'lucide-react';
import { VibeVisualizer } from './VibeVisualizer';
import { TrafficChart } from './TrafficChart';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Dashboard: React.FC = () => {
  const [noiseActive, setNoiseActive] = useState(false);
  const [bandwidthLimit, setBandwidthLimit] = useState(10);
  const [selectedPersona, setSelectedPersona] = useState('Academic');
  const [vpnActive, setVpnActive] = useState(false);
  const [vpnLocation, setVpnLocation] = useState('Germany (Frankfurt)');
  const [status, setStatus] = useState<any>(null);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [uptime, setUptime] = useState(0);
  const [decoySites, setDecoySites] = useState<string[]>([]);
  const [siteBlacklist, setSiteBlacklist] = useState<string[]>([]);
  const [newSite, setNewSite] = useState('');
  const [newBlacklistSite, setNewBlacklistSite] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setStatus(data);
        if (data.decoySites) setDecoySites(data.decoySites);
        if (data.siteBlacklist) setSiteBlacklist(data.siteBlacklist);
        if (data.vpnActive !== undefined) setVpnActive(data.vpnActive);
        if (data.vpnLocation) setVpnLocation(data.vpnLocation);
        
        setTrafficData(prev => {
          const newData = [...prev, {
            time: new Date().toLocaleTimeString(),
            primary: data.realTraffic,
            ghost: data.noiseTraffic
          }];
          return newData.slice(-20);
        });
      } catch (e) {
        console.error('Failed to sync with ghost engine');
      }
    };

    const timer = setInterval(fetchData, 2000);
    return () => clearInterval(timer);
  }, []);

  const toggleNoise = async () => {
    const newState = !noiseActive;
    setNoiseActive(newState);
    await fetch('/api/toggle-noise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: newState })
    });
  };

  const updateSettings = async (newLimit?: number, newPersona?: string, newSites?: string[], newBlacklist?: string[], vpnState?: boolean) => {
    if (newLimit !== undefined) setBandwidthLimit(newLimit);
    if (newPersona !== undefined) setSelectedPersona(newPersona);
    if (newSites !== undefined) setDecoySites(newSites);
    if (newBlacklist !== undefined) setSiteBlacklist(newBlacklist);
    if (vpnState !== undefined) setVpnActive(vpnState);
    
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        bandwidthLimit: newLimit !== undefined ? newLimit : bandwidthLimit,
        persona: newPersona !== undefined ? newPersona : selectedPersona,
        decoySites: newSites !== undefined ? newSites : decoySites,
        siteBlacklist: newBlacklist !== undefined ? newBlacklist : siteBlacklist,
        vpnActive: vpnState !== undefined ? vpnState : vpnActive
      })
    });
  };

  const addSite = () => {
    if (!newSite.trim()) return;
    const updated = [...decoySites, newSite.trim()];
    updateSettings(undefined, undefined, updated);
    setNewSite('');
  };

  const removeSite = (index: number) => {
    const updated = decoySites.filter((_, i) => i !== index);
    updateSettings(undefined, undefined, updated);
  };

  const addBlacklistSite = () => {
    if (!newBlacklistSite.trim()) return;
    const updated = [...siteBlacklist, newBlacklistSite.trim()];
    updateSettings(undefined, undefined, undefined, updated);
    setNewBlacklistSite('');
  };

  const removeBlacklistSite = (index: number) => {
    const updated = siteBlacklist.filter((_, i) => i !== index);
    updateSettings(undefined, undefined, undefined, updated);
  };

  const personas = [
    { id: 'Academic', icon: <User className="w-4 h-4" />, desc: 'High-entropy research patterns' },
    { id: 'Gamer', icon: <Zap className="w-4 h-4" />, desc: 'Low-latency UDP bursts' },
    { id: 'Neutral', icon: <Activity className="w-4 h-4" />, desc: 'Standard generic activity' },
    { id: 'Investor', icon: <Shield className="w-4 h-4" />, desc: 'Financial transaction noise' },
  ];

  return (
    <div className="grid h-screen w-full selection:bg-cyan-500/30" 
      style={{ 
        gridTemplateRows: '60px 1fr 180px', 
        gridTemplateColumns: '240px 1fr 280px',
        backgroundColor: 'var(--bg-color)',
        color: '#E2E8F0',
        fontFamily: 'var(--font-sans)'
      }}>
      
      {/* TOP NAVIGATION / HEADER */}
      <header className="col-span-full border-b border-[#1E293B] flex items-center px-6 justify-between bg-[#08090C]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#00F0FF] rounded-sm relative after:content-[''] after:absolute after:w-2 after:h-2 after:bg-[#00F0FF] after:top-1 after:left-1">
            <div className="absolute inset-0 bg-[#00F0FF]/20 animate-pulse"></div>
          </div>
          <div className="font-mono font-bold tracking-[3px] text-[#00F0FF] text-sm uppercase">GHOST PROTOCOL BY JOSEPH</div>
        </div>
        <div className="flex gap-5 text-[10px] uppercase font-mono text-[#94A3B8]">
          {vpnActive && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]">
              <Lock className="w-2.5 h-2.5" /> GHOST-TUNNEL ACTIVE
            </div>
          )}
          <div>UPTIME: <span className="text-[#10B981] ml-1">{formatUptime(uptime)}</span></div>
          <div>DPI SHIELD: <span className="text-[#10B981] ml-1">ACTIVE</span></div>
          <div>KERNEL HOOK: <span className="text-[#10B981] ml-1">STABLE</span></div>
        </div>
      </header>

      {/* SIDEBAR / CONTROLS */}
      <aside className="row-start-2 row-end-4 border-r border-[#1E293B] bg-[#0D0E12] p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        {/* Ghost Tunnel VPN Section */}
        <div className="bg-[#161B22]/80 border border-[#1E293B] rounded-lg p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-3 h-3 text-[#00F0FF]" />
            <span className="text-[10px] uppercase font-mono text-[#00F0FF] tracking-wider">Ghost-Tunnel VPN</span>
          </div>
          
          <button 
            onClick={() => updateSettings(undefined, undefined, undefined, undefined, !vpnActive)}
            className={cn(
              "w-full py-4 rounded-md font-mono text-xs transition-all relative overflow-hidden group mb-4",
              vpnActive 
                ? "bg-transparent border border-[#00F0FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]" 
                : "bg-[#1E293B] text-[#94A3B8] hover:bg-[#2E394B]"
            )}
          >
            {vpnActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00F0FF]/5 to-transparent animate-shimmer"></div>
            )}
            <div className="relative z-10 flex items-center justify-center gap-2">
              <Shield className={cn("w-3 h-3", vpnActive ? "animate-pulse" : "")} />
              {vpnActive ? 'GHOST TUNNEL: SECURE' : 'ESTABLISH TUNNEL'}
            </div>
          </button>

          <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-[#64748B]">LOCATION:</span>
              <span className="text-[#E2E8F0]">{vpnLocation}</span>
            </div>
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-[#64748B]">PROTOCOL:</span>
              <span className="text-[#00F0FF]">WireGuard-NT</span>
            </div>
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] mb-3 block font-mono">Primary Engine</span>
          <div className="space-y-2">
            <div className="bg-[#161B22] border border-[#1E293B] p-3 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold">Ghost Injection</span>
                <button 
                  onClick={toggleNoise}
                  className={cn(
                    "w-8 h-4 rounded-full relative transition-colors",
                    noiseActive ? "bg-[#00F0FF]" : "bg-[#1E293B]"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                    noiseActive ? "right-0.5" : "left-0.5"
                  )} />
                </button>
              </div>
              <div className="text-[10px] text-[#64748B]">Markov Chain model engaged</div>
            </div>
            
            <div className="bg-[#161B22] border border-[#1E293B] p-3 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold">Packet Padding</span>
                <div className="w-8 h-4 bg-[#00F0FF] rounded-full relative after:content-[''] after:absolute after:right-0.5 after:top-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full"></div>
              </div>
              <div className="text-[10px] text-[#64748B]">Constant 1024-byte normal</div>
            </div>
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] mb-3 block font-mono">Active Persona</span>
          <div className="space-y-1">
            {personas.map(p => (
              <button 
                key={p.id}
                onClick={() => updateSettings(undefined, p.id)}
                className={cn(
                  "w-full text-left p-2 rounded bg-[#1E293B] text-[10px] font-mono border-l-2 transition-all",
                  selectedPersona === p.id ? "border-[#00F0FF] text-[#00F0FF]" : "border-transparent text-[#94A3B8] hover:text-white"
                )}
              >
                [P-0{personas.indexOf(p)+1}] {p.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] mb-3 block font-mono">Global Config</span>
            <div className="bg-[#161B22] border border-[#1E293B] p-3 rounded-md">
              <span className="text-xs font-semibold">Bandwidth Cap</span>
              <div className="mt-3">
                <input 
                  type="range" 
                  min="1" 
                  max="40" 
                  value={bandwidthLimit}
                  onChange={(e) => updateSettings(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#00F0FF]" 
                />
                <div className="text-[10px] text-[#64748B] mt-2 flex justify-between">
                  <span>Limited to {bandwidthLimit}% system max</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] mb-3 block font-mono">Decoy Registry</span>
            <div className="bg-[#161B22] border border-[#1E293B] p-3 rounded-md space-y-3">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="domain.com"
                  value={newSite}
                  onChange={(e) => setNewSite(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSite()}
                  className="flex-1 bg-black/40 border border-[#1E293B] px-2 py-1 text-[10px] outline-none focus:border-[#00F0FF] transition-colors"
                />
                <button 
                  onClick={addSite}
                  className="bg-[#1E293B] hover:bg-[#2E394B] px-2 py-1 text-[10px] font-mono text-[#00F0FF]"
                >
                  ADD
                </button>
              </div>
              <div className="max-h-[100px] overflow-y-auto space-y-1 pr-1">
                {decoySites.map((site, i) => (
                  <div key={i} className="flex justify-between items-center px-2 py-1 bg-black/20 group">
                    <span className="text-[9px] font-mono opacity-60 text-white/80">{site}</span>
                    <button 
                      onClick={() => removeSite(i)}
                      className="text-[9px] text-red-500 font-mono hover:bg-red-500/10 px-1 py-0.5 rounded transition-colors"
                    >
                      REMOVE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] mb-3 block font-mono">Site Blacklist</span>
            <div className="bg-[#161B22] border border-[#1E293B] p-3 rounded-md space-y-3">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="blacklist-domain.com"
                  value={newBlacklistSite}
                  onChange={(e) => setNewBlacklistSite(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBlacklistSite()}
                  className="flex-1 bg-black/40 border border-[#1E293B] px-2 py-1 text-[10px] outline-none focus:border-red-500/50 transition-colors"
                />
                <button 
                  onClick={addBlacklistSite}
                  className="bg-[#1E293B] hover:bg-[#2E394B] px-2 py-1 text-[10px] font-mono text-red-400"
                >
                  ADD
                </button>
              </div>
              <div className="max-h-[80px] overflow-y-auto space-y-1 pr-1 border-t border-[#1E293B]/30 pt-2">
                {siteBlacklist.length === 0 ? (
                  <div className="text-[8px] text-[#64748B] text-center py-2 font-mono">NO BLOCKED SITES</div>
                ) : (
                  siteBlacklist.map((site, i) => (
                    <div key={i} className="flex justify-between items-center px-2 py-1 bg-red-950/20 group border border-transparent hover:border-red-900/30">
                      <span className="text-[9px] font-mono text-red-200/60 truncate">{site}</span>
                      <button 
                        onClick={() => removeBlacklistSite(i)}
                        className="text-[9px] text-red-500 font-mono hover:bg-red-500/10 px-1 py-0.5 rounded transition-colors ml-2"
                      >
                        REMOVE
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VISUALIZER */}
      <main className="p-6 flex flex-col gap-5">
        <div className="flex-1 bg-[#0D0E12] border border-[#1E293B] rounded-lg relative overflow-hidden">
          <VibeVisualizer noiseActive={noiseActive} />
          <div className="absolute bottom-5 w-full text-center text-[10px] text-[#94A3B8] font-mono pointer-events-none">
            REAL-TIME TRAFFIC MULTIPLEXING: 1 USER STREAM / {noiseActive ? '6' : '0'} DECOY STREAMS
          </div>
        </div>
      </main>

      {/* STATS PANEL */}
      <section className="border-l border-[#1E293B] bg-[#0D0E12] p-5 flex flex-col gap-6 overflow-y-auto">
        <div className="flex flex-col gap-6">
          <div className="metric">
            <span className="text-[10px] text-[#94A3B8] uppercase block mb-1 font-mono">Anonymity Strength</span>
            <div className="font-mono text-3xl text-[#00F0FF]">
              {(status ? (status.entropy * 100) : 0 + (vpnActive ? 15 : 0)).toFixed(2)}%
            </div>
            <div className="text-[10px] text-[#64748B] flex justify-between">
              <span>Entropy: {((status?.entropy * 10 || 0) + (vpnActive ? 2 : 0)).toFixed(2)} bits</span>
              {vpnActive && <span className="text-[#00F0FF]">VPN +15%</span>}
            </div>
          </div>

          <div className="metric">
            <span className="text-[10px] text-[#94A3B8] uppercase block mb-1 font-mono">Noise Gen Rate</span>
            <div className="font-mono text-3xl text-[#00F0FF]">
              {noiseActive ? (bandwidthLimit * 0.42).toFixed(1) : '0.0'} MB/s
            </div>
            <div className="text-[10px] text-[#64748B]">Total Chaff: 1.2 GB (Session)</div>
          </div>

          <div className="metric">
            <span className="text-[10px] text-[#94A3B8] uppercase block mb-1 font-mono">Current Decoy Target</span>
            <div className="text-[11px] text-[#E2E8F0] mt-1 font-mono break-all opacity-80">
              {decoySites.length > 0 ? decoySites[Math.floor(uptime/15) % decoySites.length] : 'Waiting for registry...'}
            </div>
            <div className="text-[10px] text-[#64748B] mt-1">Dwell remaining: {15 - (uptime % 15)}s</div>
          </div>

          <div className="metric">
            <span className="text-[10px] text-[#94A3B8] uppercase block mb-1 font-mono">Bandwidth Usage</span>
            <div className="h-1 bg-[#1E293B] rounded-full mt-2 relative">
              <div 
                className="absolute h-full bg-[#00F0FF] rounded-full transition-all duration-500" 
                style={{ width: `${(bandwidthLimit / 40) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-[#64748B]">
              <span>Used: {bandwidthLimit} Mbps</span>
              <span>Limit: 40.0 Mbps</span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
           <TrafficChart data={trafficData} />
        </div>
      </section>

      {/* TERMINAL BOTTOM */}
      <footer className="col-start-2 col-end-4 bg-[#08090C] border-t border-[#1E293B] p-4 flex flex-col gap-1 font-mono text-[10px] overflow-hidden relative">
        <div className="text-[#8E9299]">[14:22:01] Ghost-Protocol Kernel initialized.</div>
        <div className="text-[#4ADE80]">[14:22:05] Starting shadow engine instance ID: 0xFF91...</div>
        <div className="text-[#4ADE80] underline">[14:22:08] Markov Chain loaded: "{selectedPersona}" persona active.</div>
        <div className="text-[#8E9299]">[14:22:12] Multiplexing handshake established (TLS 1.3).</div>
        <div className="text-[#FBBF24]">[14:22:15] Warning: ISP timing analysis detected; increasing jitter variance Δt.</div>
        <div className="text-[#4ADE80]">[14:22:18] Packet padding normalized to 1024 bytes.</div>
        <div className="text-[#4ADE80]">[14:22:20] Decoy interaction simulated: Scroll Y=450, Click Link "Abstract".</div>
        
        <div className="absolute bottom-4 right-8 text-sm italic text-[#94A3B8] opacity-30 select-none">
          H(U|T) ≈ H(U)
        </div>
      </footer>
    </div>
  );
};
