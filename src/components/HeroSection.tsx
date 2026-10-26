'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { ShieldCheck, Lock, Vote, RefreshCw, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onOpenCreate: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCreate
}) => {
  const { formatEthToFiat } = useCurrency();

  return (
    <section className="relative pt-12 pb-14 px-4 lg:px-8 overflow-hidden">

      {/* Dynamic Liquid Mesh Aurora Underlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-cyan-400/25 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10 text-center">


        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12] drop-shadow-lg">
          The Future of Crowdfunding,{' '}
          <span className="text-gradient-neon drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]">
            Protected by Milestone Vaults.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-300/90 max-w-2xl mx-auto leading-relaxed">
          Back audacious ideas with 1-click UPI, Apple Pay, or Card. No seed phrases, no gas fees. Your pledge is locked safely in smart escrow vaults and released only as creators prove progress.
        </p>

        {/* Action Buttons - Equal Width & Fully Responsive */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
          <button
            onClick={() => {
              const el = document.getElementById('campaigns-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-56 h-12 rounded-2xl liquid-btn-primary text-white font-semibold text-sm flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.4)]"
          >
            <span>Explore The Showroom</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenCreate}
            className="w-full sm:w-56 h-12 rounded-2xl liquid-btn-glass text-white font-semibold text-sm flex items-center justify-center cursor-pointer hover:border-white/30 transition-all"
          >
            Start a Campaign
          </button>
        </div>

        {/* 4 Pillars in Liquid Glass Cards (Responsive Grid) */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">

          <div className="liquid-card rounded-3xl p-5 text-left border border-white/20">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Lock className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-xs font-bold text-white tracking-wide">Milestone Protection Vault</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Funds unlocked in stages only after backers inspect and approve proof.
            </div>
          </div>

          <div className="liquid-card rounded-3xl p-5 text-left border border-white/20">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Vote className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-xs font-bold text-white tracking-wide">1-Person 1-Voice Power</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Quadratic voting ensures community backers stop whale misuse.
            </div>
          </div>

          <div className="liquid-card rounded-3xl p-5 text-left border border-white/20">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xs font-bold text-white tracking-wide">100% Money-Back Shield</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Instant automated refund directly to your account if a goal is missed.
            </div>
          </div>

          <div className="liquid-card rounded-3xl p-5 text-left border border-white/20">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-xs font-bold text-white tracking-wide">Invisible Smart Security</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Biometric passkeys, verified creators, and 100% sponsored gas fees.
            </div>
          </div>

        </div>

        {/* Live Protocol Metric Bar in Responsive Grid */}
        <div className="mt-10 p-4 sm:p-5 liquid-glass rounded-3xl max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 text-center border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="p-2">
            <div className="text-xs text-slate-400 font-medium">Total Protected Value</div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5 text-gradient-neon drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
              {formatEthToFiat('19.80')}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">19.80 ETH Locked</div>
          </div>
          <div className="p-2">
            <div className="text-xs text-slate-400 font-medium">Protected Backers</div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5">192 Backers</div>
            <div className="text-[10px] text-emerald-400 font-medium">0 Fraud Incidents</div>
          </div>
          <div className="p-2">
            <div className="text-xs text-slate-400 font-medium">Milestone Approval Rate</div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5">
              100% Verified
            </div>
            <div className="text-[10px] text-slate-500">Backer-Approved Proofs</div>
          </div>
          <div className="p-2">
            <div className="text-xs text-slate-400 font-medium">Platform Gas Fee</div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5">
              Free (Sponsored)
            </div>
            <div className="text-[10px] text-slate-500">Zero Network Surcharges</div>
          </div>
        </div>

      </div>
    </section>
  );
};
