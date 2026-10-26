'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { CampaignCard } from '@/components/CampaignCard';
import { CampaignDetailModal } from '@/components/CampaignDetailModal';
import { CreateCampaignModal } from '@/components/CreateCampaignModal';
import { SmartWalletOnboardingModal } from '@/components/SmartWalletOnboardingModal';
import { BackerCommandCenterModal } from '@/components/BackerCommandCenterModal';
import { Footer } from '@/components/Footer';
import { FundItIntro } from '@/components/FundItIntro';
import { Campaign } from '@/types';
import { Search, Filter, Sparkles, PlusCircle, CheckCircle2, Vote, RefreshCw, LayoutDashboard } from 'lucide-react';

export default function Home() {
  const { campaigns } = useWeb3();

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showCommandCenterModal, setShowCommandCenterModal] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('create') === 'true' || params.get('launch') === 'true') {
        setShowIntro(false);
        setShowCreateModal(true);
      }
    }
  }, []);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'GoalReached' | 'Failed'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ? true : c.state === statusFilter;

    const matchesCategory =
      categoryFilter === 'All' ? true : c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [
    'All',
    'Medical & Health',
    'Emergency & Relief',
    'Family & Pets',
    'Education & Learning',
    'Tech & Software',
    'Hardware & Engineering',
    'Creative & Gaming',
    'Business & Startups',
    'Planet & Environment',
    'Community & Public Goods'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Cinematic FUNDIT Opening Intro */}
      {showIntro && (
        <FundItIntro onComplete={() => setShowIntro(false)} />
      )}

      {/* Top Navbar with Invisible Web3 & Currency Controls */}
      <Navbar
        onOpenCreate={() => setShowCreateModal(true)}
        onOpenOnboarding={() => setShowOnboardingModal(true)}
        onOpenCommandCenter={() => setShowCommandCenterModal(true)}
      />

      {/* Hero Section with Protocol Metrics & Security Pillars */}
      <HeroSection
        onOpenCreate={() => setShowCreateModal(true)}
      />

      {/* The Showroom: Floating Glass Bento-Grid Campaign Explorer */}
      <main id="campaigns-section" className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* The Showroom Header & Search */}
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                  The Showroom
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/10 font-mono">
                  {filteredCampaigns.length} Projects Active
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                Curated High-Impact Innovations
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Protected by automated Milestone Vaults with 100% money-back guarantee. Zero gas fees.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, founders, tags..."
                className="liquid-input w-full pl-11 pr-4 py-2.5 rounded-2xl text-xs placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Status Tabs & Category Filter Rails */}
          <div className="space-y-2.5 pt-2">
            
            {/* Status Pills Rail */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full text-xs">
              <button
                onClick={() => setStatusFilter('All')}
                className={`px-3.5 py-1.5 rounded-2xl font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  statusFilter === 'All'
                    ? 'bg-slate-700/80 text-white border border-white/20'
                    : 'liquid-pill text-slate-400 hover:text-white'
                }`}
              >
                All Projects
              </button>

              <button
                onClick={() => setStatusFilter('Active')}
                className={`px-3.5 py-1.5 rounded-2xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  statusFilter === 'Active'
                    ? 'bg-slate-700/80 text-white border border-white/20'
                    : 'liquid-pill text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                Active Funding
              </button>

              <button
                onClick={() => setStatusFilter('GoalReached')}
                className={`px-3.5 py-1.5 rounded-2xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  statusFilter === 'GoalReached'
                    ? 'bg-slate-700/80 text-white border border-white/20'
                    : 'liquid-pill text-slate-400 hover:text-slate-200'
                }`}
              >
                <Vote className="w-3.5 h-3.5 text-emerald-400" />
                Goal Reached &amp; Voting
              </button>

              <button
                onClick={() => setStatusFilter('Failed')}
                className={`px-3.5 py-1.5 rounded-2xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  statusFilter === 'Failed'
                    ? 'bg-slate-700/80 text-white border border-white/20'
                    : 'liquid-pill text-slate-400 hover:text-slate-200'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                100% Refundable
              </button>
            </div>

            {/* Category Filter Pills Rail */}
            <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto no-scrollbar py-1 w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-2xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-slate-700/80 text-white font-semibold border border-white/20 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* Campaign Bento Grid with Squircle Geometry */}
        {filteredCampaigns.length === 0 ? (
          <div className="p-16 text-center rounded-[28px] bg-white/[0.02] border border-white/10 space-y-4">
            <Sparkles className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No campaigns match your filters</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting your search criteria or deploy a new campaign.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setCategoryFilter('All');
              }}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((camp) => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                onSelect={(c) => setSelectedCampaign(c)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Overlays */}
      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}

      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Zero-Friction Invisible Web3 Onboarding Modal */}
      <SmartWalletOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
      />

      {/* Backer Command Center (Personal Glass Portal) */}
      <BackerCommandCenterModal
        isOpen={showCommandCenterModal}
        onClose={() => setShowCommandCenterModal(false)}
        onSelectCampaign={(c) => setSelectedCampaign(c)}
      />

    </div>
  );
}
