'use client';

import React, { useState, useRef } from 'react';
import { Campaign } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { 
  ShieldCheck, 
  Vote, 
  Clock, 
  Users, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Lock,
  BadgeCheck
} from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onSelect }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { formatEthToFiat, currency } = useCurrency();

  const [tilt, setTilt] = useState({ rotX: 0, rotY: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const raised = parseFloat(campaign.totalRaised);
  const goal = parseFloat(campaign.goalAmount);
  const percent = Math.min(Math.round((raised / goal) * 100), 100);
  const hasReachedGoal = raised >= goal;

  const nowSec = Math.floor(Date.now() / 1000);
  const timeLeftSec = campaign.deadline - nowSec;
  const isEnded = timeLeftSec <= 0;
  const daysLeft = Math.max(0, Math.ceil(timeLeftSec / 86400));

  // Determine state badge styling
  let badgeText = 'Active Funding';
  let badgeClass = 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]';
  let statusIcon = <Clock className="w-3 h-3 text-cyan-400" />;

  if (campaign.state === 'GoalReached' || hasReachedGoal) {
    badgeText = 'Goal Met • Voting Open';
    badgeClass = 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
    statusIcon = <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
  } else if (campaign.state === 'Failed' || (isEnded && !hasReachedGoal)) {
    badgeText = '100% Refundable';
    badgeClass = 'bg-rose-500/20 text-rose-200 border-rose-400/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]';
    statusIcon = <AlertTriangle className="w-3 h-3 text-rose-400" />;
  }

  const activeProposalsCount = campaign.proposals.filter(p => !p.executed).length;

  // 90 FPS 3D Card Tilt & Interactive Cursor Sheen Calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 7;
    const rotY = ((x - centerX) / centerX) * 7;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rotX, rotY, glareX, glareY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotX: 0, rotY: 0, glareX: 50, glareY: 50 });
  };

  return (
    <div 
      ref={cardRef}
      onClick={() => onSelect(campaign)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="liquid-card rounded-[28px] overflow-hidden flex flex-col group cursor-pointer transition-transform duration-200 ease-out will-change-transform relative border border-white/15"
      style={{
        transform: isHovered 
          ? `perspective(1000px) rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg) translateY(-4px) scale3d(1.015, 1.015, 1.015)` 
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)',
        transformStyle: 'preserve-3d',
        boxShadow: isHovered
          ? 'inset 0 1px 2px 0 rgba(255,255,255,0.7), 0 25px 60px -10px rgba(0,0,0,0.5), 0 0 25px rgba(6,182,212,0.2)'
          : 'inset 0 1px 1px 0 rgba(255,255,255,0.5), 0 20px 50px -10px rgba(0,0,0,0.4)'
      }}
    >
      {/* 1. INTERACTIVE CURSOR SHEEN SPOTLIGHT */}
      {isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none rounded-[28px] z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 280px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.18) 0%, rgba(6,182,212,0.08) 35%, transparent 70%)`
          }}
        />
      )}

      {/* Media Header with Glass Gradient Mask */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-900/60">
        <img
          src={campaign.imageUrl}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060911]/95 via-[#060911]/35 to-black/30 backdrop-blur-[0.5px]" />

        {/* Category Pill */}
        <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-xl liquid-pill text-[11px] font-semibold text-slate-100 shadow-md">
          {campaign.category}
        </div>

        {/* Status Pill */}
        <div className={`absolute top-3.5 right-3.5 px-3 py-1 rounded-xl backdrop-blur-md border text-[11px] font-semibold flex items-center gap-1.5 shadow-md ${badgeClass}`}>
          {statusIcon}
          <span>{badgeText}</span>
        </div>

        {/* Milestone proposals banner if active */}
        {activeProposalsCount > 0 && (
          <div className="absolute bottom-3.5 left-3.5 right-3.5 px-3.5 py-1.5 rounded-2xl liquid-glass border-purple-400/40 text-[11px] text-purple-200 flex items-center justify-between shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <span className="flex items-center gap-1.5 font-medium">
              <Vote className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>{activeProposalsCount} Milestone Proof Active</span>
            </span>
            <span className="text-[10px] text-purple-300 font-mono font-semibold">Quadratic Vote</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Verified Creator Identity */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-1.5 truncate max-w-[200px]">
              <span className="text-slate-200 font-semibold">{campaign.creatorName}</span>
              <span className="text-slate-400 text-[11px]">{campaign.creatorHandle}</span>
              <span title="Identity & KYC Verified" className="inline-flex items-center">
                <BadgeCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              </span>
            </div>

            <span className="px-2 py-0.5 rounded-lg liquid-pill text-cyan-300 font-mono text-[10px] font-bold">
              ${campaign.tokenSymbol}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-1 drop-shadow-sm">
            {campaign.title}
          </h3>

          {/* Description */}
          <p className="mt-2 text-xs text-slate-300/80 line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Funding Progress Bar with Liquid Physics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white font-mono text-sm">
              {formatEthToFiat(campaign.totalRaised)}
            </span>
            <span className="text-slate-400">
              Goal: <strong className="text-slate-200 font-mono">{formatEthToFiat(campaign.goalAmount)}</strong>
            </span>
          </div>

          {/* Liquid Tube with Wave Shimmer */}
          <div className="w-full h-3 rounded-full bg-slate-900/80 overflow-hidden border border-white/15 relative p-[1px]">
            <div
              className={`h-full rounded-full transition-all duration-700 relative overflow-hidden ${
                hasReachedGoal 
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]' 
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.7)]'
              }`}
              style={{ width: `${percent}%` }}
            >
              {/* Liquid Shimmer Animation Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono pt-1">
            <span className="font-bold text-cyan-300">{percent}% funded</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Users className="w-3 h-3 text-slate-400" />
              {campaign.backerCount} Backers
            </span>
            <span>
              {isEnded ? (
                <span className="text-rose-400 font-semibold">Ended</span>
              ) : (
                `${daysLeft} days left`
              )}
            </span>
          </div>
        </div>

        {/* Bottom Security Assurance & 1-Click Action */}
        <div className="pt-3.5 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Milestone Vault Protected</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(campaign);
            }}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all cursor-pointer"
          >
            <span>View Project</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};
