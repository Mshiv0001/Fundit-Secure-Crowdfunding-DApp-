'use client';

import React, { useState } from 'react';
import { Campaign, MilestoneProposal, BackerTier, RewardTier } from '@/types';
import { useWeb3 } from '@/context/Web3Context';
import { useCurrency } from '@/context/CurrencyContext';
import { CheckoutModal } from './CheckoutModal';
import {
  X,
  ShieldCheck,
  Vote,
  RefreshCw,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Play,
  CreditCard,
  Receipt,
  Calendar,
  BadgeCheck,
  Download,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

interface CampaignDetailModalProps {
  campaign: Campaign;
  onClose: () => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({ campaign, onClose }) => {
  const { pledge, claimRefund, proposeMilestone, castVote, executeMilestone, activeAccount } = useWeb3();
  const { currency, formatEthToFiat } = useCurrency();

  const [activeTab, setActiveTab] = useState<'overview' | 'vaults' | 'tiers' | 'governance' | 'activity' | 'refund'>('overview');
  const [pledgeAmount, setPledgeAmount] = useState<string>('0.1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Video pitch trailer state
  const [isPlayingPitch, setIsPlayingPitch] = useState(false);

  // 1-Click Checkout Modal state
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState<RewardTier | null>(null);

  // Milestone submission state
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newProof, setNewProof] = useState('');
  const [newAmount, setNewAmount] = useState('1.0');

  const raised = parseFloat(campaign.totalRaised);
  const goal = parseFloat(campaign.goalAmount);
  const percent = Math.min(Math.round((raised / goal) * 100), 100);
  const isGoalReached = raised >= goal;

  const nowSec = Math.floor(Date.now() / 1000);
  const isEnded = campaign.deadline <= nowSec;

  // Calculate live tier perks for input amount
  const inputEth = parseFloat(pledgeAmount) || 0;
  let estimatedTier: BackerTier = 'Supporter';
  let multiplier = 1.0;
  if (inputEth >= 0.5) {
    estimatedTier = 'Guardian';
    multiplier = 1.5;
  } else if (inputEth >= 0.1) {
    estimatedTier = 'Patron';
    multiplier = 1.25;
  }
  const estimatedTokens = Math.floor(inputEth * 1000 * multiplier);
  const estimatedQuadPower = Math.floor(Math.sqrt(estimatedTokens));

  const handlePledge = async () => {
    setIsSubmitting(true);
    setFeedback(null);
    const res = await pledge(campaign.id, pledgeAmount);
    setIsSubmitting(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleClaimRefund = async () => {
    setIsSubmitting(true);
    setFeedback(null);
    const res = await claimRefund(campaign.id);
    setIsSubmitting(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    setIsSubmitting(true);
    setFeedback(null);
    const res = await castVote(campaign.id, proposalId, support);
    setIsSubmitting(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleExecute = async (proposalId: number) => {
    setIsSubmitting(true);
    setFeedback(null);
    const res = await executeMilestone(campaign.id, proposalId);
    setIsSubmitting(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    const res = await proposeMilestone(campaign.id, newTitle, newDescription, newProof, newAmount);
    setIsSubmitting(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setShowProposeModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewProof('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Default reward tiers if none in campaign
  const rewardTiers: RewardTier[] = campaign.rewardTiers || [
    {
      id: 'tier-1',
      title: 'Early Backer Special',
      priceUsd: 49,
      priceInr: 4099,
      ethAmount: '0.02',
      description: 'Receive production unit with laser engraving, backer role, and milestone voting rights.',
      perks: ['Production hardware unit', 'Laser engraved backer serial', 'Milestone DAO voting rights'],
      estimatedDelivery: 'Dec 2026',
      backerCount: 142
    },
    {
      id: 'tier-2',
      title: 'Developer Kit & API Access',
      priceUsd: 149,
      priceInr: 12499,
      ethAmount: '0.05',
      description: 'Prototype hardware, developer SDK, Discord VIP channel, and direct roadmap voting.',
      perks: ['Early hardware prototype', 'Full SDK & API access', 'Patron Discord role'],
      estimatedDelivery: 'Oct 2026',
      backerCount: 88,
      popular: true
    },
    {
      id: 'tier-3',
      title: 'Founding Patron VIP Box',
      priceUsd: 499,
      priceInr: 41499,
      ethAmount: '0.15',
      description: 'Collector edition kit, quarterly founder dinners, and DAO Council proposal seat.',
      perks: ['Collector edition kit', 'Quarterly founder calls', 'DAO Council voting seat'],
      estimatedDelivery: 'Aug 2026',
      backerCount: 19
    }
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
        
        {/* Modal Dialog Card in Liquid Glass with Specular Rim Lighting */}
        <div className="relative w-full max-w-4xl liquid-glass rounded-[28px] border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.7)] overflow-hidden my-6 max-h-[92vh] flex flex-col">
          
          {/* Header with Video Pitch / Image Showcase */}
          <div className="relative h-52 sm:h-64 w-full bg-slate-950 shrink-0 overflow-hidden">
            {isPlayingPitch ? (
              <div className="w-full h-full relative bg-black flex items-center justify-center">
                <div className="text-center space-y-3 p-6 animate-in fade-in">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/40 mx-auto flex items-center justify-center animate-pulse">
                    <Play className="w-8 h-8 text-cyan-300 translate-x-0.5" />
                  </div>
                  <h4 className="text-white text-base font-bold">Creator Video Pitch Live Demo</h4>
                  <p className="text-xs text-slate-400 max-w-md">
                    Streaming verified pitch presentation for "{campaign.title}". Recorded with zero-latency hardware telemetry.
                  </p>
                  <button
                    onClick={() => setIsPlayingPitch(false)}
                    className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200"
                  >
                    Close Video Pitch
                  </button>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover scale-105 filter brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/65 to-transparent" />
                
                {/* Play Video Pitch Button */}
                <button
                  onClick={() => setIsPlayingPitch(true)}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2.5 rounded-2xl liquid-glass border border-white/30 text-white font-semibold text-xs flex items-center gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:scale-105 transition-all cursor-pointer backdrop-blur-md"
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-400 text-slate-900 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                    <Play className="w-3.5 h-3.5 translate-x-0.5 fill-current" />
                  </div>
                  <span>Watch Creator Pitch Reel (2:15)</span>
                </button>
              </>
            )}

            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 text-slate-300 hover:text-white hover:bg-black/90 transition-all border border-white/15 cursor-pointer z-20 backdrop-blur-md"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Badges & Title in Header */}
            <div className="absolute bottom-4 left-6 right-6 flex flex-col gap-1.5 z-10 pointer-events-none">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold backdrop-blur-md">
                  {campaign.category}
                </span>

                {/* Verified Creator Badge */}
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-1 font-semibold backdrop-blur-md">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{campaign.creatorName || 'Verified Innovator'} ({campaign.creatorHandle || '@founder'})</span>
                </span>

                {/* 100% Money-Back Shield */}
                <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs flex items-center gap-1 font-semibold backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>100% Refund Shield</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
                {campaign.title}
              </h2>
            </div>
          </div>

          {/* Apple-Style Segmented Navigation Tabs */}
          <div className="px-4 sm:px-6 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-[#080c14]/90 shrink-0 py-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'liquid-glass text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Project &amp; Tiers</span>
            </button>

            <button
              onClick={() => setActiveTab('vaults')}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'vaults'
                  ? 'liquid-glass text-indigo-300 border-indigo-400/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Milestone Vaults</span>
            </button>

            <button
              onClick={() => setActiveTab('governance')}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'governance'
                  ? 'liquid-glass text-purple-300 border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Vote className="w-3.5 h-3.5" />
              <span>Backer Voting ({campaign.proposals.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'activity'
                  ? 'liquid-glass text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Disbursement Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab('refund')}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'refund'
                  ? 'liquid-glass text-rose-300 border-rose-400/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Pull-Refund</span>
            </button>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div className={`mx-6 mt-3 p-3 rounded-2xl text-xs flex items-center justify-between border ${
              feedback.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <span>{feedback.message}</span>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Modal Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* TAB 1: OVERVIEW & 1-CLICK REWARD TIERS */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Funding Progress Bar & Fiat Metrics */}
                <div className="p-5 rounded-3xl liquid-card space-y-4 border border-white/15">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs text-slate-400">Total Backed (Strict Fiat Valuation)</div>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-extrabold text-white font-mono text-gradient-neon">
                          {formatEthToFiat(campaign.totalRaised)}
                        </span>
                        <span className="text-xs text-slate-400">
                          of {formatEthToFiat(campaign.goalAmount)} Goal ({campaign.totalRaised} ETH)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold font-mono text-xs border border-cyan-500/30">
                        {percent}% Funded
                      </span>
                    </div>
                  </div>

                  {/* Liquid Wave Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-slate-800/80 p-0.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-700 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Vault Locked: <strong>{formatEthToFiat(campaign.escrowBalance)}</strong></span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Released on Proof: <strong>{formatEthToFiat(campaign.fundsReleased)}</strong></span>
                    </span>
                    <span><strong>{campaign.backerCount}</strong> Verified Backers</span>
                  </div>
                </div>

                {/* About Project */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-200">The Vision</h4>
                  <p className="text-xs text-slate-300/90 leading-relaxed">
                    {campaign.description}
                  </p>
                </div>

                {/* 1-Click Reward Tier Selection Cards */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-cyan-400" />
                      <span>Select Reward Tier (1-Click Instant Backing)</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">Card • UPI • Apple Pay • Zero Gas</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {rewardTiers.map((tier) => {
                      const tierPrice = currency === 'USD' ? `$${tier.priceUsd}` : `₹${tier.priceInr.toLocaleString('en-IN')}`;
                      return (
                        <div
                          key={tier.id}
                          className="p-4 rounded-3xl liquid-card border border-white/15 flex flex-col justify-between hover:border-cyan-400/50 transition-all group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-cyan-300">{tier.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono">
                                {tier.backerCount} Backers
                              </span>
                            </div>
                            <div className="text-lg font-extrabold text-white font-mono">
                              {tierPrice}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {tier.description}
                            </p>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Est. Delivery: {tier.estimatedDelivery}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setCheckoutTier(tier);
                              setShowCheckout(true);
                            }}
                            className="mt-4 w-full py-2.5 rounded-2xl liquid-btn-primary text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>1-Click Back Tier</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Amount Quick Pledge Button */}
                <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-white">Custom Contribution</div>
                    <div className="text-[11px] text-slate-400">Back with any custom amount in UPI or Card with zero gas fees.</div>
                  </div>
                  <button
                    onClick={() => {
                      setCheckoutTier(null);
                      setShowCheckout(true);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-2xl liquid-btn-glass text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer hover:border-cyan-400/50"
                  >
                    <span>Custom Amount Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            )}

            {/* TAB 2: MILESTONE PROTECTION VAULTS */}
            {activeTab === 'vaults' && (
              <div className="space-y-6">
                
                <div className="p-5 rounded-3xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span>How Your Money is Protected by Milestone Vaults</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Creators receive zero upfront lump sums. 100% of collected funds are secured in automated smart contracts. Funds are released solely in stages after creator uploads verified deliverable proof and backers approve the release via quadratic governance.
                  </p>
                </div>

                {/* Visual 3-Stage Milestone Vault Timeline */}
                <div className="space-y-4">
                  
                  {/* Stage 1 */}
                  <div className="p-4 rounded-3xl liquid-card border border-emerald-500/30 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 font-bold text-xs">
                      ✓
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-white">Stage 1: Working Prototype & Architecture (25% Released)</h5>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold font-mono">
                          Backer Approved
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Design verification, silicon test bench schematics, and open-source GitHub telemetry audited by 192 backers.
                      </p>
                    </div>
                  </div>

                  {/* Stage 2 */}
                  <div className="p-4 rounded-3xl liquid-card border border-cyan-500/30 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 font-bold text-xs animate-pulse">
                      2
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-white">Stage 2: Production Tooling & Assembly (50% Locked)</h5>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold font-mono">
                          Voting Underway
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Supplier procurement invoices and factory tooling run. Backers can vote 'Approve' or 'Pause' in the Voting tab.
                      </p>
                    </div>
                  </div>

                  {/* Stage 3 */}
                  <div className="p-4 rounded-3xl liquid-card border border-white/10 flex items-start gap-4 opacity-75">
                    <div className="w-8 h-8 rounded-2xl bg-slate-800 text-slate-400 border border-white/10 flex items-center justify-center shrink-0 font-bold text-xs">
                      3
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-300">Stage 3: Global Logistics & Backer Fulfillment (25% Locked)</h5>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-slate-400 font-semibold font-mono">
                          Sealed Vault
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Final batch fulfillment and doorstep tracking carrier confirmation. Sealed until Stage 2 verification concludes.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: BACKER QUADRATIC GOVERNANCE */}
            {activeTab === 'governance' && (
              <div className="space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Vote className="w-4 h-4 text-purple-400" />
                      <span>Backer Democracy Proposals</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Vote to approve or pause creator milestone fund releases. 1-person 1-voice quadratic weight prevents whale domination.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowProposeModal(true)}
                    className="px-3.5 py-1.5 rounded-2xl liquid-btn-glass text-purple-300 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Submit Proposal</span>
                  </button>
                </div>

                {/* Active Persona Role Capability Bar */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{activeAccount.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      {activeAccount.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center gap-2">
                    {activeAccount.roleType === 'arbiter' && (
                      <span className="text-amber-300 font-medium">
                        ⚖️ Escrow Audit Authority: Certified to inspect evidence & approve tranche disbursements
                      </span>
                    )}
                    {activeAccount.roleType === 'creator' && (
                      <span className="text-cyan-300 font-medium">
                        🚀 Campaign Founder: Authorized to submit milestone deliverable proofs for funding
                      </span>
                    )}
                    {activeAccount.roleType === 'whale' && (
                      <span className="text-amber-300 font-medium">
                        👑 Guardian Whale: 4x Quadratic voting multiplier automatically active
                      </span>
                    )}
                    {activeAccount.roleType === 'governor' && (
                      <span className="text-purple-300 font-medium">
                        🏛️ DAO Governor: Protocol governance and emergency policy veto authority
                      </span>
                    )}
                    {activeAccount.roleType === 'admin' && (
                      <span className="text-rose-300 font-medium">
                        🛡️ Platform Admin: Gasless Paymaster limits & smart account verification steward
                      </span>
                    )}
                    {activeAccount.roleType === 'sponsor' && (
                      <span className="text-blue-300 font-medium">
                        💎 Grant Sponsor: Matching pool liquidity allocation authority
                      </span>
                    )}
                    {activeAccount.roleType === 'curator' && (
                      <span className="text-indigo-300 font-medium">
                        🧭 Ecosystem Curator: Vetting innovation & quadratic matching grant rounds
                      </span>
                    )}
                    {(!activeAccount.roleType || activeAccount.roleType === 'backer' || activeAccount.roleType === 'new_user') && (
                      <span className="text-emerald-300 font-medium">
                        ⚡ Quadratic Backer: 1-person 1-voice democratic milestone release voting
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit Milestone Form */}
                {showProposeModal && (
                  <form onSubmit={handlePropose} className="p-5 rounded-3xl bg-purple-950/40 border border-purple-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-purple-200">New Milestone Release Proposal</h5>
                      <button type="button" onClick={() => setShowProposeModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Milestone Title</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Stage 2: Hardware Production Run Complete"
                        className="liquid-input w-full px-3 py-2 rounded-2xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Deliverables & Proof Description</label>
                      <textarea
                        required
                        rows={2}
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Provide details and evidence..."
                        className="liquid-input w-full px-3 py-2 rounded-2xl text-xs resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Proof URL (GitHub/Doc)</label>
                        <input
                          type="url"
                          required
                          value={newProof}
                          onChange={(e) => setNewProof(e.target.value)}
                          placeholder="https://..."
                          className="liquid-input w-full px-3 py-2 rounded-2xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Release Amount (ETH)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newAmount}
                          onChange={(e) => setNewAmount(e.target.value)}
                          placeholder="1.0"
                          className="liquid-input w-full px-3 py-2 rounded-2xl text-xs font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-2xl liquid-btn-primary text-white font-semibold text-xs cursor-pointer"
                    >
                      Publish Proposal for Backer Vote
                    </button>
                  </form>
                )}

                {/* Proposals List */}
                {campaign.proposals.length === 0 ? (
                  <div className="p-8 text-center rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                    <Vote className="w-8 h-8 text-slate-500 mx-auto" />
                    <div className="text-xs font-semibold text-slate-300">No Proposals Yet</div>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Proposals submitted by creator will appear here for backer vote.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaign.proposals.map((prop) => {
                      const totalSqrtVotes = prop.forVotesSqrt + prop.againstVotesSqrt;
                      const forPercent = totalSqrtVotes > 0 
                        ? Math.round((prop.forVotesSqrt / totalSqrtVotes) * 100) 
                        : 0;

                      return (
                        <div key={prop.id} className="p-5 rounded-3xl liquid-card border border-white/15 space-y-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-semibold">
                                  Milestone #{prop.id}
                                </span>
                                {prop.executed ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Released & Approved
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">
                                    Active Voting
                                  </span>
                                )}
                              </div>
                              <h5 className="font-bold text-sm text-white mt-1.5">{prop.title}</h5>
                            </div>

                            <div className="text-right font-mono">
                              <span className="text-xs text-slate-400">Release: </span>
                              <span className="font-bold text-white text-sm text-gradient-neon">
                                {formatEthToFiat(prop.requestedAmount)}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300/80 leading-relaxed">
                            {prop.description}
                          </p>

                          {/* Proof link */}
                          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
                            <FileCheck className="w-3.5 h-3.5" />
                            <a href={prop.proofUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                              <span>Inspect Deliverable Proof Receipt</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          {/* Vote Bar */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-emerald-400 font-semibold">
                                Approve: {prop.forVotesSqrt} √votes ({forPercent}%)
                              </span>
                              <span className="text-rose-400 font-semibold">
                                Pause: {prop.againstVotesSqrt} √votes ({100 - forPercent}%)
                              </span>
                            </div>

                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                              <div
                                className="h-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${forPercent}%` }}
                              />
                              <div
                                className="h-full bg-rose-500 transition-all duration-500"
                                style={{ width: `${100 - forPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Voting Action Buttons - Equal Width & Non-Overlapping */}
                          {!prop.executed && (
                            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                  onClick={() => handleVote(prop.id, true)}
                                  disabled={isSubmitting || prop.userVoted}
                                  className="flex-1 sm:w-32 h-8 inline-flex items-center justify-center rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold cursor-pointer disabled:opacity-40 transition-all"
                                >
                                  {prop.userVoted ? 'Vote Cast' : 'Vote Approve'}
                                </button>

                                <button
                                  onClick={() => handleVote(prop.id, false)}
                                  disabled={isSubmitting || prop.userVoted}
                                  className="flex-1 sm:w-32 h-8 inline-flex items-center justify-center rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold cursor-pointer disabled:opacity-40 transition-all"
                                >
                                  Vote Pause
                                </button>
                              </div>

                              {prop.forVotesSqrt > prop.againstVotesSqrt && prop.voterCount > 0 && (
                                <button
                                  onClick={() => handleExecute(prop.id)}
                                  disabled={isSubmitting}
                                  className="w-full sm:w-auto px-4 h-8 inline-flex items-center justify-center rounded-xl liquid-btn-primary text-white text-xs font-semibold cursor-pointer transition-all"
                                >
                                  Disburse Vault Tranche
                                </button>
                              )}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* TAB 4: DISBURSEMENT LEDGER (BANK-STATEMENT STYLE) */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span>Transparent Fund Release Ledger</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Every single rupee and dollar released from the Milestone Vault is publicly verifiable with downloadable payment receipts.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-3xl liquid-card border border-white/15 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 text-[11px] pb-2">
                        <th className="py-2.5 font-semibold">Date &amp; Phase</th>
                        <th className="py-2.5 font-semibold">Milestone Purpose</th>
                        <th className="py-2.5 font-semibold">Amount Released</th>
                        <th className="py-2.5 font-semibold">Backer Approval</th>
                        <th className="py-2.5 text-right font-semibold">Proof Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                      <tr>
                        <td className="py-3 text-slate-300">2026-10-18</td>
                        <td className="py-3 text-white font-sans font-medium">Stage 1: Hardware Prototype Sign-Off</td>
                        <td className="py-3 text-emerald-400 font-bold">{formatEthToFiat('1.00')}</td>
                        <td className="py-3 text-cyan-300">192 Votes (100% For)</td>
                        <td className="py-3 text-right">
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              alert('Downloaded Cryptographic Release Receipt #RCP-STAGE1');
                            }}
                            className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                          >
                            <Download className="w-3 h-3" />
                            <span>Receipt</span>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-slate-400">2026-10-24</td>
                        <td className="py-3 text-slate-300 font-sans font-medium">Stage 2: Production Tooling Order</td>
                        <td className="py-3 text-amber-400 font-bold">{formatEthToFiat('1.50')} (Pending)</td>
                        <td className="py-3 text-purple-300">Voting In Progress</td>
                        <td className="py-3 text-right">
                          <span className="text-slate-500">Awaiting Vote</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* TAB 5: 100% AUTO-REFUND SHIELD */}
            {activeTab === 'refund' && (
              <div className="space-y-6">
                
                <div className="p-5 rounded-3xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Automated 100% Money-Back Shield</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    If this campaign does not meet its target goal before the deadline, all funds are permanently frozen from the creator. You can trigger an instant 1-click refund straight back to your original payment method with zero platform deductions.
                  </p>
                </div>

                <div className="p-4 rounded-3xl liquid-card border border-white/10 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Campaign Target:</span>
                    <span className="text-white font-bold">{formatEthToFiat(campaign.goalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Backed:</span>
                    <span className="text-white">{formatEthToFiat(campaign.totalRaised)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-slate-400">Your Eligible Refund Balance:</span>
                    <span className="font-bold text-cyan-300 text-sm">
                      {campaign.userContribution ? formatEthToFiat(campaign.userContribution.amount) : formatEthToFiat('0')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleClaimRefund}
                  disabled={isSubmitting || !campaign.userContribution || parseFloat(campaign.userContribution.amount) <= 0 || campaign.userContribution.refunded}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold text-xs shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:opacity-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>
                    {campaign.userContribution?.refunded
                      ? 'Refund Already Processed'
                      : `Claim 100% Instant Refund (${campaign.userContribution ? formatEthToFiat(campaign.userContribution.amount) : '$0'})`}
                  </span>
                </button>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* 1-Click Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        campaign={campaign}
        selectedTier={checkoutTier}
      />
    </>
  );
};
