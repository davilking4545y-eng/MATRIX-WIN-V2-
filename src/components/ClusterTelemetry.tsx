import React, { useState } from 'react';
import { ClusterNode } from '../types';
import { Server, ShieldCheck, Key, RefreshCw, Cpu, Globe } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ClusterTelemetryProps {
  nodes: ClusterNode[];
  activeNonce: number;
  serverSeedHash: string;
  onRotateSeeds: () => void;
}

export const ClusterTelemetry: React.FC<ClusterTelemetryProps> = ({
  nodes,
  activeNonce,
  serverSeedHash,
  onRotateSeeds,
}) => {
  const [clientSeed, setClientSeed] = useState('matrix_v2_entropy_seed_' + Math.floor(Math.random() * 90000 + 10000));

  return (
    <div
      id="cluster-telemetry-card"
      className="bg-[#0A0A0A] border border-[#00FF41]/20 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.8)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30 text-xs font-semibold text-[#00FF41]">
          <Server className="w-3.5 h-3.5 text-[#00FF41]" />
          <span className="tracking-wider uppercase text-[10px] font-bold">MATRIX RELAY CLUSTERS & SEED PROOF</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#888888] font-mono">
          <Globe className="w-3 h-3 text-[#38bdf8]" />
          <span>4 Global Edge Nodes</span>
        </div>
      </div>

      {/* 4 Node Cluster Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {nodes.map((node) => (
          <div
            key={node.id}
            id={`cluster-node-${node.id}`}
            className="p-2.5 rounded-lg bg-[#070707] border border-[#1A1A1A] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
              <span className="font-bold text-white">{node.name}</span>
              <span className="w-2 h-2 rounded-full bg-[#00FF41] shadow-[0_0_6px_#00FF41] animate-pulse" />
            </div>
            <div className="text-[10px] text-[#888888] font-mono flex items-center justify-between">
              <span>{node.region}</span>
              <span className="text-[#38bdf8] font-bold">{node.ping}ms</span>
            </div>
            {/* Load bar */}
            <div className="w-full bg-[#141414] h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#00FF41] shadow-[0_0_6px_#00FF41] h-full rounded-full transition-all duration-500"
                style={{ width: `${node.load}%` }}
              />
            </div>
            <div className="text-[9px] text-[#666666] font-mono mt-1 text-right">
              LOAD {node.load}%
            </div>
          </div>
        ))}
      </div>

      {/* Provably Fair Cryptographic Seed Inspector */}
      <div className="p-3 rounded-lg bg-[#070707] border border-[#00FF41]/20 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[#E0E0E0] font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FF41]" />
            <span className="tracking-wider text-[10px] uppercase font-bold text-[#00FF41]">PROVABLY FAIR VERIFIER</span>
          </span>
          <span className="text-[10px] text-[#888888]">
            NONCE: <strong className="text-white font-mono">#{activeNonce}</strong>
          </span>
        </div>

        {/* Server Seed Hash & Client Seed */}
        <div className="space-y-1.5 text-[10px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-[#0A0A0A] p-2 rounded border border-[#1A1A1A]">
            <span className="text-[#888888] flex items-center gap-1">
              <Key className="w-3 h-3 text-amber-400" />
              <span>SERVER SEED (SHA-256):</span>
            </span>
            <span className="text-[#00FF41] truncate font-mono text-[9px]">
              {serverSeedHash}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0A0A0A] p-2 rounded border border-[#1A1A1A]">
            <span className="text-[#888888] flex items-center gap-1">
              <Cpu className="w-3 h-3 text-sky-400" />
              <span>CLIENT ENTROPY:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <input
                id="client-entropy-seed-input"
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                className="bg-[#0E0E0E] border border-[#222222] px-2 py-0.5 rounded text-[#E0E0E0] text-[10px] w-36 sm:w-48 focus:outline-none focus:border-[#00FF41]"
              />
              <button
                id="rotate-seed-btn"
                title="Regenerate seed pair"
                onClick={() => {
                  soundFx.playClick(900);
                  setClientSeed('matrix_v2_entropy_seed_' + Math.floor(Math.random() * 90000 + 10000));
                  onRotateSeeds();
                }}
                className="p-1 rounded bg-[#0E0E0E] hover:bg-[#1A1A1A] border border-[#222222] text-[#00FF41] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
