'use client';

import React, { useState } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { useCurrency } from '@/context/CurrencyContext';
import { Campaign } from '@/types';
import { 
  X, 
  Vote, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  Clock, 
  AlertTriangle,
  Fingerprint,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

interface BackerCommandCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCampaign: (campaign: Campaign) => void;
}

export const BackerCommandCenterModal: React.FC<BackerCommandCenterModalProps> = ({
  isOpen,
  onClose,
  onSelectCampaign
}) => {
  const { 
    campaigns, 
    activeAccount, 
    castVote, 
    claimRefund 
  } = useWeb3();
  const { formatEthToFiat, currency } = useCurrency();

  const [votingId, setVotingId] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  // Campaigns that user has contributed to
  const backedCampaigns = campaigns.filter(c => c.userContribution && parseFloat(c.userContribution.amount) > 0);

  // Total funds currently protected in escrow across user's backed campaigns
  const totalPledgedEth = backedCampaigns.reduce((sum, c) => sum + parseFloat(c.userContribution?.amount || '0'), 0);

  const handleVote = async (campaignId: string, proposalId: number, support: boolean) => {
    setVotingId(proposalId);
    try {
      const res = await castVote(campaignId, proposalId, support);
      setFeedbackMsg({ text: res.message, isError: !res.success });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } finally {
      setVotingId(null);
    }
  };

  const handleRefund = async (campaignId: string) => {
    const res = await claimRefund(campaignId);
    setFeedbackMsg({ text: res.message, isError: !res.success });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl liquid-glass rounded-[28px] border border-white/20 p-4 sm:p-6 md:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.7)] max-h-[90vh] flex flex-col overflow-hidden"
        style={{
          boxShadow: 'inset 0 1px 1px 0 rgba(255,255,255,0.7), 0 25px 60px rgba(0,0,0,0.6)'
        }}
      >
        {/* Specular Ambient Glow */}
        <div className="absolute -top-32 right-1/4 w-96 h-48 bg-gradient-to-b from-purple-500/25 via-cyan-400/20 to-transparent blur-3xl pointer-events-none rounded-full" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 sm:pb-5 border-b border-white/10 relative z-10 shrink-0">
          <div className="min-w-0 flex-1 pr-3">
            {/* Header Badges with Uniform Width */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="w-full xs:w-[170px] h-7 inline-flex items-center justify-center gap-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-[11px] text-indigo-300 font-semibold shadow-sm shrink-0">
                <Award className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">Command Center</span>
              </span>
              <span className="w-full xs:w-[170px] h-7 inline-flex items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono text-[11px] font-semibold shadow-sm shrink-0">
                {activeAccount.role}
              </span>
              {activeAccount.permissions?.quadraticPowerMultiplier && activeAccount.permissions.quadraticPowerMultiplier > 1 && (
                <span className="w-full xs:w-[170px] h-7 inline-flex items-center justify-center rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 font-mono text-[11px] font-semibold shadow-sm shrink-0">
                  {activeAccount.permissions.quadraticPowerMultiplier}x QF Power
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
              {activeAccount.name}
            </h3>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1">
              {activeAccount.handle} • {activeAccount.roleDescription || 'Verified member on Fund It Protocol'} • Device Passkey Active
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
            aria-label="Close Command Center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className={`mt-4 p-3 rounded-2xl text-xs font-medium border flex items-center gap-2 ${
            feedbackMsg.isError 
              ? 'bg-rose-500/20 border-rose-400/40 text-rose-200' 
              : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Metrics Row (Responsive 1-col on phone, 3-col on tablet/desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 my-4 shrink-0">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Pledges</div>
            <div className="text-lg font-black text-white mt-1 font-mono">{formatEthToFiat(totalPledgedEth)}</div>
            <div className="text-[10px] text-cyan-400 mt-0.5">{backedCampaigns.length} Projects Backed</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Quadratic Power</div>
            <div className="text-lg font-black text-purple-300 mt-1 font-mono">√Tokens Active</div>
            <div className="text-[10px] text-purple-400 mt-0.5">1-Person 1-Voice Voice</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Vault Security</div>
            <div className="text-lg font-black text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Sealed</span>
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">Milestone Governed</div>
          </div>
        </div>

        {/* Scrollable Backed Campaigns & Milestone Voting List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Your Backed Innovations &amp; Milestone Approvals</span>
            <span className="text-[10px] text-slate-400 font-normal">Vote on proof to unlock creator funds</span>
          </div>

          {backedCampaigns.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              You haven't backed any campaigns yet. Browse projects below!
            </div>
          ) : (
            backedCampaigns.map((camp) => {
              const userContribution = camp.userContribution!;
              const isRefundable = camp.state === 'Failed' && !userContribution.refunded;
              const pendingProposals = camp.proposals.filter(p => !p.executed);

              return (
                <div 
                  key={camp.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-white/20 transition-all"
                >
                  {/* Campaign Info Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={camp.imageUrl} 
                        alt={camp.title} 
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                      <div>
                        <h4 
                          onClick={() => {
                            onClose();
                            onSelectCampaign(camp);
                          }}
                          className="text-sm font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>{camp.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </h4>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{camp.creatorName}</span>
                          <span>•</span>
                          <span className="text-cyan-300 font-mono">Your Support: {formatEthToFiat(userContribution.amount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Refund Button if Campaign Failed */}
                    {isRefundable && (
                      <button
                        onClick={() => handleRefund(camp.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/25 hover:bg-rose-500/40 border border-rose-400/50 text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Claim 1-Click Refund</span>
                      </button>
                    )}

                    {userContribution.refunded && (
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
                        Refund Claimed
                      </span>
                    )}
                  </div>

                  {/* Active Milestones Requiring Backer Vote */}
                  {pendingProposals.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/25 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                          <Vote className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Active Milestone Vote: {pendingProposals[0].title}</span>
                        </span>
                        <span className="text-cyan-400 font-mono font-semibold">
                          Release: {formatEthToFiat(pendingProposals[0].requestedAmount)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {pendingProposals[0].description}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                        <a 
                          href={pendingProposals[0].proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10.5px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-2 shrink-0"
                        >
                          <span>Inspect Verified Proof</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {/* Backer Voting Actions */}
                        {pendingProposals[0].userVoted ? (
                          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Your Vote Registered (Power: {userContribution.quadraticPower}√)</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            <button
                              onClick={() => handleVote(camp.id, pendingProposals[0].id, true)}
                              disabled={votingId === pendingProposals[0].id}
                              className="flex-1 sm:w-28 h-7 inline-flex items-center justify-center rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-[11px] font-semibold transition-all cursor-pointer"
                            >
                              Approve Proof
                            </button>
                            <button
                              onClick={() => handleVote(camp.id, pendingProposals[0].id, false)}
                              disabled={votingId === pendingProposals[0].id}
                              className="flex-1 sm:w-28 h-7 inline-flex items-center justify-center rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-300 text-[11px] font-semibold transition-all cursor-pointer"
                            >
                              Pause Release
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
