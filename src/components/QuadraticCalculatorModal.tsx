'use client';

import React, { useState } from 'react';
import { X, Vote, Users, ShieldCheck, Sparkles, Scale, Info } from 'lucide-react';

interface QuadraticCalculatorModalProps {
  onClose: () => void;
}

export const QuadraticCalculatorModal: React.FC<QuadraticCalculatorModalProps> = ({ onClose }) => {
  // Scenario simulation: 1 Whale vs N Community Backers
  const [whaleTokens, setWhaleTokens] = useState<number>(10000);
  const [backerCount, setBackerCount] = useState<number>(50);
  const [tokensPerBacker, setTokensPerBacker] = useState<number>(100);

  // Linear Voting
  const whaleLinearVotes = whaleTokens;
  const communityLinearVotes = backerCount * tokensPerBacker;

  // Quadratic Voting: Power = Math.sqrt(tokens)
  const whaleQuadVotes = Math.floor(Math.sqrt(whaleTokens));
  const quadPerBacker = Math.floor(Math.sqrt(tokensPerBacker));
  const communityQuadVotes = backerCount * quadPerBacker;

  const totalLinear = whaleLinearVotes + communityLinearVotes;
  const whaleLinearPercent = totalLinear > 0 ? Math.round((whaleLinearVotes / totalLinear) * 100) : 50;
  const communityLinearPercent = 100 - whaleLinearPercent;

  const totalQuad = whaleQuadVotes + communityQuadVotes;
  const whaleQuadPercent = totalQuad > 0 ? Math.round((whaleQuadVotes / totalQuad) * 100) : 50;
  const communityQuadPercent = 100 - whaleQuadPercent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl liquid-glass rounded-3xl border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#0b0f19] rounded-[7px] flex items-center justify-center">
                <Vote className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Interactive Quadratic Voting Simulator</h3>
              <p className="text-[11px] text-slate-400">Formula: <code className="text-cyan-400 font-mono">Weight = ⌊√Tokens⌋</code> (Glen Weyl & Vitalik Buterin)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/25 flex items-start gap-3 text-slate-300 leading-relaxed">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              In traditional (1-token-1-vote) systems, a single wealthy backer (&ldquo;whale&rdquo;) can unilaterally release milestone escrow funds or pass self-serving proposals. With <strong>Quadratic Voting</strong>, voting cost scales quadratically, giving broad community consensus dramatically more influence than concentrated capital.
            </span>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <div>
              <div className="flex items-center justify-between font-medium mb-1 text-slate-300">
                <span>Whale Contributor Tokens</span>
                <span className="font-mono text-cyan-400 font-bold">{whaleTokens.toLocaleString()} Tokens</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={whaleTokens}
                onChange={(e) => setWhaleTokens(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between font-medium mb-1 text-slate-300">
                <span>Community Backers Count</span>
                <span className="font-mono text-purple-400 font-bold">{backerCount} Backers</span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={backerCount}
                onChange={(e) => setBackerCount(parseInt(e.target.value))}
                className="w-full accent-purple-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between font-medium mb-1 text-slate-300">
                <span>Tokens Per Community Backer</span>
                <span className="font-mono text-emerald-400 font-bold">{tokensPerBacker} Tokens each</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="20"
                value={tokensPerBacker}
                onChange={(e) => setTokensPerBacker(parseInt(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>
          </div>

          {/* Comparison Cards: Linear vs Quadratic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Standard Linear 1-Token-1-Vote */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between text-rose-300 font-bold">
                <span>Traditional (Linear 1:1)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20">Plutocracy Risk</span>
              </div>

              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>1 Whale ({whaleTokens}):</span>
                  <span className="text-white font-bold">{whaleLinearVotes} votes ({whaleLinearPercent}%)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{backerCount} Community ({communityLinearVotes}):</span>
                  <span className="text-white font-bold">{communityLinearVotes} votes ({communityLinearPercent}%)</span>
                </div>
              </div>

              {/* Linear Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div className="h-full bg-rose-500" style={{ width: `${whaleLinearPercent}%` }} />
                <div className="h-full bg-slate-600" style={{ width: `${communityLinearPercent}%` }} />
              </div>

              <div className="text-[11px] text-rose-300">
                {whaleLinearPercent > 50 ? '⚠️ Whale controls absolute majority! Can single-handedly force milestones.' : 'Split decision.'}
              </div>
            </div>

            {/* Fund It Quadratic Voting */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between text-emerald-300 font-bold">
                <span>Fund It Quadratic (√Tokens)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Democratic</span>
              </div>

              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>1 Whale (√{whaleTokens}):</span>
                  <span className="text-white font-bold">{whaleQuadVotes} √votes ({whaleQuadPercent}%)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{backerCount} Backers (each √{tokensPerBacker}={quadPerBacker}):</span>
                  <span className="text-emerald-400 font-bold">{communityQuadVotes} √votes ({communityQuadPercent}%)</span>
                </div>
              </div>

              {/* Quadratic Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div className="h-full bg-cyan-500" style={{ width: `${whaleQuadPercent}%` }} />
                <div className="h-full bg-emerald-500" style={{ width: `${communityQuadPercent}%` }} />
              </div>

              <div className="text-[11px] text-emerald-300 font-medium">
                {communityQuadPercent > 50 
                  ? '✅ Community consensus outvotes the whale! Rug-pulls prevented.' 
                  : 'Balanced governance.'}
              </div>
            </div>

          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              This mathematical property is enforced on-chain in <code>SecureCrowdfundingDAO.sol</code> via <code>Math.sqrt(tokenBalance)</code>.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
