'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useWeb3 } from '@/context/Web3Context';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/context/CurrencyContext';
import { FundItBrandText } from './FundItBrandText';
import { ThemeToggle } from './ThemeToggle';
import {
  Wallet,
  PlusCircle,
  Users,
  ChevronDown,
  Sparkles,
  Check,
  ExternalLink,
  Sun,
  Moon,
  ShieldCheck,
  LayoutDashboard,
  UserCheck,
  Apple,
  Smartphone,
  LogOut,
  Copy,
  User,
  Mail,
  ArrowRight,
  CheckCircle2,
  X,
  Search,
  RotateCcw,
  Rocket,
  Scale,
  Landmark,
  Crown,
  Coins,
  Compass
} from 'lucide-react';

const getPersonaRoleDetails = (roleType?: string) => {
  switch (roleType) {
    case 'creator':
      return {
        tag: 'Project Founder',
        icon: Rocket,
        color: 'text-cyan-300 border-cyan-400/40 bg-cyan-500/15',
        perk: 'Deploy & Request Escrow Tranches'
      };
    case 'backer':
      return {
        tag: 'Quadratic Backer',
        icon: UserCheck,
        color: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/15',
        perk: '1.5x QF Voting Weight'
      };
    case 'arbiter':
      return {
        tag: 'Escrow Arbiter',
        icon: Scale,
        color: 'text-amber-300 border-amber-400/40 bg-amber-500/15',
        perk: 'Milestone Audits & Dispute Approval'
      };
    case 'governor':
      return {
        tag: 'DAO Governor',
        icon: Landmark,
        color: 'text-purple-300 border-purple-400/40 bg-purple-500/15',
        perk: 'Emergency Veto & Treasury Matching Grants'
      };
    case 'whale':
      return {
        tag: 'Guardian Whale (4x)',
        icon: Crown,
        color: 'text-amber-300 border-amber-400/40 bg-amber-500/15',
        perk: '4x Whale Quadratic Weight'
      };
    case 'sponsor':
      return {
        tag: 'Matching Sponsor',
        icon: Coins,
        color: 'text-blue-300 border-blue-400/40 bg-blue-500/15',
        perk: 'Matching Pool Liquidity Provider'
      };
    case 'admin':
      return {
        tag: 'Platform Admin',
        icon: ShieldCheck,
        color: 'text-rose-300 border-rose-400/40 bg-rose-500/15',
        perk: 'Gasless Paymaster & Protocol Registry'
      };
    case 'curator':
      return {
        tag: 'Ecosystem Curator',
        icon: Compass,
        color: 'text-indigo-300 border-indigo-400/40 bg-indigo-500/15',
        perk: 'Discovery Scout & Ecosystem Grants'
      };
    case 'new_user':
    default:
      return {
        tag: 'First-Time Backer',
        icon: Sparkles,
        color: 'text-sky-300 border-sky-400/40 bg-sky-500/15',
        perk: 'Clean Slate 1st Pledge'
      };
  }
};

interface NavbarProps {
  onOpenCreate: () => void;
  onOpenOnboarding: () => void;
  onOpenCommandCenter: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreate,
  onOpenOnboarding,
  onOpenCommandCenter
}) => {
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency, toggleCurrency, formatEthToFiat } = useCurrency();
  const {
    isDemoMode,
    setIsDemoMode,
    currentAddress,
    ethBalance,
    simulatedAccounts,
    activeAccount,
    setActiveAccount,
    isAuthenticated,
    loginWithSocial,
    logout
  } = useWeb3();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [personaRoleFilter, setPersonaRoleFilter] = useState<'all' | 'founders' | 'backers' | 'governance' | 'admins'>('all');
  const [personaSearch, setPersonaSearch] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [dropdownContactMethod, setDropdownContactMethod] = useState<'email' | 'phone'>('email');
  const [dropdownEmail, setDropdownEmail] = useState('');
  const [dropdownPhone, setDropdownPhone] = useState('');
  const profileModalRef = useRef<HTMLDivElement>(null);
  const personaModalRef = useRef<HTMLDivElement>(null);

  const filteredPersonas = React.useMemo(() => {
    return simulatedAccounts.filter((acc) => {
      let matchesRole = true;
      if (personaRoleFilter === 'founders') {
        matchesRole = acc.roleType === 'creator';
      } else if (personaRoleFilter === 'backers') {
        matchesRole = acc.roleType === 'backer' || acc.roleType === 'whale' || acc.roleType === 'sponsor';
      } else if (personaRoleFilter === 'governance') {
        matchesRole = acc.roleType === 'arbiter' || acc.roleType === 'governor' || acc.roleType === 'curator';
      } else if (personaRoleFilter === 'admins') {
        matchesRole = acc.roleType === 'admin' || acc.roleType === 'new_user';
      }

      let matchesSearch = true;
      if (personaSearch.trim()) {
        const q = personaSearch.trim().toLowerCase();
        matchesSearch = Boolean(
          acc.name.toLowerCase().includes(q) ||
          acc.handle.toLowerCase().includes(q) ||
          acc.role.toLowerCase().includes(q) ||
          (acc.roleDescription && acc.roleDescription.toLowerCase().includes(q))
        );
      }

      return matchesRole && matchesSearch;
    });
  }, [simulatedAccounts, personaRoleFilter, personaSearch]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showProfileMenu && profileModalRef.current) {
      profileModalRef.current.scrollTop = 0;
    }
  }, [showProfileMenu]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileMenu(false);
        setShowPersonaMenu(false);
      }
    };
    if (showProfileMenu || showPersonaMenu) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showProfileMenu, showPersonaMenu]);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailLogin = () => {
    const emailToUse = dropdownEmail.trim() || 'backer@fundit.protocol';
    loginWithSocial({
      provider: 'email',
      name: emailToUse.includes('@') ? emailToUse.split('@')[0] : emailToUse,
      email: emailToUse,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    });
    setShowProfileMenu(false);
  };

  const handlePhoneLogin = () => {
    const phoneToUse = dropdownPhone.trim() || '+1 (555) 019-4982';
    loginWithSocial({
      provider: 'phone',
      name: 'Phone User',
      email: phoneToUse,
      handle: '@phone_backer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    });
    setShowProfileMenu(false);
  };

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeAccount.address && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(activeAccount.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full liquid-glass border-b border-white/15 px-4 lg:px-8 py-3 transition-all backdrop-blur-[40px]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">

        {/* Left: Brand + Currency Toggle */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0 min-w-0">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="h-10 flex items-center cursor-pointer group select-none shrink-0"
            title="Fund It Home"
          >
            <FundItBrandText height={24} className="group-hover:scale-105 transition-transform shrink-0" />
          </div>

          {/* Apple visionOS Liquid Glass Sliding Currency Toggle */}
          <button
            onClick={toggleCurrency}
            role="switch"
            aria-checked={currency === 'INR'}
            aria-label="Toggle currency between USD and INR"
            title={`Current currency: ${currency === 'USD' ? 'US Dollar ($)' : 'Indian Rupee (₹)'} — Click to toggle`}
            className="hidden sm:flex relative items-center h-10 w-[140px] p-1 rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] border border-white/12 hover:border-white/20 shadow-inner transition-all duration-200 active:scale-[0.98] cursor-pointer select-none group"
          >
            {/* Sliding Liquid Glass Indicator Pill */}
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-white/12 border border-white/20 shadow-[0_2px_10px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
              style={{
                left: currency === 'USD' ? '4px' : 'calc(50%)',
                boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.45), 0 2px 8px -1px rgba(0, 0, 0, 0.4), 0 0 12px -2px rgba(6, 182, 212, 0.3)'
              }}
            />

            {/* Labels Layer (Aligned over the track) */}
            <div className="relative z-10 grid grid-cols-2 w-full h-full text-[11px] font-bold">
              <span
                className={`flex items-center justify-center transition-colors duration-200 ${
                  currency === 'USD' ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                $ USD
              </span>
              <span
                className={`flex items-center justify-center transition-colors duration-200 ${
                  currency === 'INR' ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                ₹ INR
              </span>
            </div>
          </button>
        </div>

        {/* Right Actions & Invisible Web3 Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* Backer Command Center (Dashboard) */}
          <button
            onClick={onOpenCommandCenter}
            className="h-10 flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 rounded-2xl liquid-btn-glass text-xs font-semibold text-slate-200 hover:text-white cursor-pointer transition-all shrink-0"
            title="Open Backer Command Center"
            aria-label="Backer Command Center"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden xl:inline">Command Center</span>
            <span className="hidden md:inline xl:hidden">Center</span>
          </button>

          {/* Launch Project Button */}
          <button
            id="navbar-launch-btn"
            onClick={onOpenCreate}
            className="h-10 flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 rounded-2xl liquid-btn-glass text-xs font-semibold text-slate-200 hover:text-white cursor-pointer transition-all shrink-0"
            title="Launch a Project"
            aria-label="Launch a Project"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden xs:inline">Launch</span>
          </button>

          {/* Persona Switcher Button (Apple visionOS Liquid Glass) */}
          {isDemoMode && (
            <button
              onClick={() => setShowPersonaMenu(true)}
              className="h-10 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 rounded-2xl liquid-btn-glass text-xs hover:border-purple-400/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer group shrink-0"
              title="Switch Interactive Test Persona Role"
              aria-label="Switch Persona"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500/30 to-cyan-400/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <span className="truncate max-w-[100px]">{activeAccount.name.split(' ')[0]}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    {activeAccount.role}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-3 h-3 text-purple-400 shrink-0 transition-transform ${showPersonaMenu ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* SEPARATE AMOUNT / BALANCE PILL - Fluid on tablet/desktop, compact in profile on phone */}
          <div
            className="hidden sm:flex h-10 items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 rounded-2xl liquid-pill text-xs font-mono font-bold text-cyan-400 border border-cyan-400/30 shadow-[0_0_12px_rgba(6,182,212,0.25)] shrink-0"
            title="Available Smart Wallet Balance"
          >
            <Wallet className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{formatEthToFiat(ethBalance)}</span>
          </div>

          {/* USER PROFILE PILL: LOGIN PHOTO & NAME */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="h-10 flex items-center gap-2 px-2 sm:px-3 rounded-2xl liquid-pill text-xs cursor-pointer hover:border-cyan-400/50 transition-all group shrink-0"
              title="Manage Invisible Smart Wallet & Passkeys"
              aria-label="User Account"
            >
              {/* Login Photo */}
              <div className="relative w-7 h-7 rounded-full shrink-0">
                <img
                  src={activeAccount.avatar}
                  alt={activeAccount.name}
                  style={{ width: '28px', height: '28px' }}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30 group-hover:ring-cyan-400 transition-all block"
                />
                {activeAccount.authProvider === 'apple' ? (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-black border border-white/40 flex items-center justify-center text-[7px] text-white shadow-sm">
                    <Apple className="w-2 h-2 fill-white" />
                  </span>
                ) : activeAccount.authProvider === 'google' ? (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[7px] shadow-sm">
                    <svg className="w-2 h-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </span>
                ) : null}
              </div>

              {/* User Name & Passkey (Condensed on mobile, full on tablet/desktop) */}
              <div className="hidden md:flex flex-col text-left justify-center leading-tight">
                <span className="text-[11px] font-bold text-white group-hover:text-cyan-300 transition-colors truncate max-w-[110px] leading-tight">
                  {activeAccount.name}
                </span>
                <span className="text-[9px] text-slate-300 flex items-center gap-1 leading-tight">
                  <span className="text-slate-400 font-mono text-[8.5px] truncate max-w-[65px]">{activeAccount.handle || activeAccount.role}</span>
                  <span className="text-emerald-400 text-[8.5px] font-semibold shrink-0">✓ Passkey</span>
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${showProfileMenu ? 'rotate-180 text-cyan-400' : ''}`} />
            </button>

            {/* Profile Modal Window (Pop-up Card) */}
            {showProfileMenu && mounted && createPortal(
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowProfileMenu(false);
                }}
              >
                <div
                  ref={profileModalRef}
                  className="relative w-full max-w-[360px] sm:max-w-[370px] max-h-[92vh] overflow-y-auto no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] rounded-[26px] border border-white/25 p-3.5 sm:p-4 shadow-2xl flex flex-col space-y-2 animate-in zoom-in-95 duration-200"
                  style={{
                    background: 'rgba(15, 20, 34, 0.94)',
                    backdropFilter: 'blur(40px) saturate(220%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(220%)',
                    boxShadow: 'inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.3), 0 30px 70px -10px rgba(0, 0, 0, 0.95), 0 0 35px rgba(6, 182, 212, 0.3)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Account Header with Modal Window Close Button */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={activeAccount.avatar}
                        alt={activeAccount.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-400/50 shadow-md shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{activeAccount.name}</span>
                          {activeAccount.authProvider === 'apple' && (
                            <span className="text-[10px] text-slate-300 font-mono bg-white/10 px-1.5 py-0.2 rounded"> Apple</span>
                          )}
                          {activeAccount.authProvider === 'google' && (
                            <span className="text-[10px] text-cyan-300 font-mono bg-cyan-500/10 px-1.5 py-0.2 rounded">G Google</span>
                          )}
                          {activeAccount.authProvider === 'phone' && (
                            <span className="text-[10px] text-emerald-300 font-mono bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">📱 Phone</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">
                          {activeAccount.email || activeAccount.handle}
                        </div>
                      </div>
                    </div>

                    {/* Modal Window Close X */}
                    <button
                      type="button"
                      onClick={() => setShowProfileMenu(false)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0 ml-2"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Active Role & Capabilities Badge */}
                  <div className="py-2 px-2.5 rounded-2xl bg-white/[0.04] border border-white/10 my-1 space-y-1 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Active Role</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-white/10 text-slate-200 border border-white/20">
                        {activeAccount.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight">
                      {activeAccount.roleDescription || 'Verified member on Fund It Protocol'}
                    </p>
                    {/* Permissions tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {activeAccount.permissions?.canCreateCampaign && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                          ✓ Launch Projects
                        </span>
                      )}
                      {activeAccount.permissions?.canAuditMilestone && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                          ⚖️ Escrow Audit
                        </span>
                      )}
                      {activeAccount.permissions?.canVoteGovernance && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                          🏛️ DAO Vote
                        </span>
                      )}
                      {activeAccount.permissions?.quadraticPowerMultiplier && activeAccount.permissions.quadraticPowerMultiplier > 1 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-mono">
                          {activeAccount.permissions.quadraticPowerMultiplier}x QF Weight
                        </span>
                      )}
                      {activeAccount.permissions?.canManagePaymaster && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30">
                          🛡️ Paymaster Control
                        </span>
                      )}
                      {activeAccount.permissions?.canSponsorPool && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30">
                          💎 Grant Sponsor
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Smart Contract Wallet Address with 1-Click Copy */}
                  <div className="py-1 space-y-0.5 shrink-0">
                    <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center justify-between">
                      <span>Smart Wallet (ERC-4337)</span>
                      <span className="text-emerald-400 font-semibold lowercase">gasless</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-cyan-300">
                      <span className="truncate">{activeAccount.address}</span>
                      <button
                        onClick={handleCopyAddress}
                        className="ml-2 p-1 hover:text-white text-slate-400 transition-colors cursor-pointer"
                        title="Copy wallet address"
                      >
                        {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1 border-t border-white/10">

                    {/* Login / Auth Methods Box (Exact elements matching Pic 1) */}
                    <div className="p-2 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 shrink-0">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Sign In With
                        </span>
                        <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                          Instant Switch
                        </span>
                      </div>

                      {/* 1. Continue with Apple ID */}
                      <button
                        type="button"
                        onClick={() => {
                          loginWithSocial({
                            provider: 'apple',
                            name: 'Apple User',
                            email: 'user@icloud.com',
                            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                          });
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 p-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all cursor-pointer text-xs font-semibold text-white group"
                      >
                        <span className="w-6 h-6 rounded-lg bg-black border border-white/20 flex items-center justify-center shrink-0 shadow-sm">
                          <Apple className="w-3.5 h-3.5 fill-white shrink-0 group-hover:scale-110 transition-transform" />
                        </span>
                        <span className="truncate">Continue with Apple ID</span>
                      </button>

                      {/* 2. Continue with Google */}
                      <button
                        type="button"
                        onClick={() => {
                          loginWithSocial({
                            provider: 'google',
                            name: 'Google User',
                            email: 'user@gmail.com',
                            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                          });
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 p-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all cursor-pointer text-xs font-semibold text-white group"
                      >
                        <span className="w-6 h-6 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-sm">
                          <svg className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                        </span>
                        <span className="truncate">Continue with Google</span>
                      </button>

                      {/* 3. Phone / Email Tab Switcher Card (Exact match with Pic 1) */}
                      <div className="py-2.5 px-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            {dropdownContactMethod === 'phone' ? 'MOBILE NUMBER' : 'EMAIL ADDRESS'}
                          </span>
                          <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/10">
                            <button
                              type="button"
                              onClick={() => setDropdownContactMethod('phone')}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                                dropdownContactMethod === 'phone'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Phone
                            </button>
                            <button
                              type="button"
                              onClick={() => setDropdownContactMethod('email')}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                                dropdownContactMethod === 'email'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Email
                            </button>
                          </div>
                        </div>

                        {dropdownContactMethod === 'phone' ? (
                          <div className="space-y-2">
                            <div className="flex items-center rounded-xl bg-black/40 border border-white/10 focus-within:border-cyan-400/50 transition-all">
                              <div className="pl-2.5 pr-1.5 text-cyan-300 shrink-0">
                                <Smartphone className="w-3.5 h-3.5" />
                              </div>
                              <input
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={dropdownPhone}
                                onChange={(e) => setDropdownPhone(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handlePhoneLogin();
                                }}
                                className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none min-w-0"
                              />
                              <div className="pr-2.5 text-[10px] text-slate-400 font-mono shrink-0">
                                {dropdownPhone.length >= 10 ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <span>10 digits</span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handlePhoneLogin}
                              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer border border-cyan-400/50 transition-all hover:brightness-110 active:scale-95"
                              style={{
                                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.85) 0%, rgba(99, 102, 241, 0.85) 100%)',
                                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.25)'
                              }}
                            >
                              <span>Continue with Phone OTP</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center rounded-xl bg-black/40 border border-white/10 focus-within:border-cyan-400/50 transition-all">
                              <div className="pl-2.5 pr-1.5 text-cyan-300 shrink-0">
                                <Mail className="w-3.5 h-3.5" />
                              </div>
                              <input
                                type="email"
                                placeholder="Email address"
                                value={dropdownEmail}
                                onChange={(e) => setDropdownEmail(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEmailLogin();
                                }}
                                className="flex-1 bg-transparent px-2 py-1.5 text-xs text-white placeholder:text-slate-500 font-sans focus:outline-none min-w-0"
                              />
                              <div className="pr-2.5 text-[10px] text-slate-400 font-mono shrink-0">
                                {isValidEmail(dropdownEmail) ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <span>name@domain</span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleEmailLogin}
                              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer border border-cyan-400/50 transition-all hover:brightness-110 active:scale-95"
                              style={{
                                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.85) 0%, rgba(99, 102, 241, 0.85) 100%)',
                                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.25)'
                              }}
                            >
                              <span>Continue with Email OTP</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 transition-all cursor-pointer border border-transparent hover:border-rose-400/30"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>

          {/* Interactive Sandbox Test Persona Modal Window (Pop-up Card) */}
          {showPersonaMenu && mounted && createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowPersonaMenu(false);
              }}
            >
              <div
                ref={personaModalRef}
                className="relative w-full max-w-xl max-h-[92vh] overflow-hidden rounded-[28px] border border-white/25 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
                style={{
                  background: 'rgba(15, 20, 34, 0.94)',
                  backdropFilter: 'blur(40px) saturate(220%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(220%)',
                  boxShadow: 'inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.3), 0 30px 70px -10px rgba(0, 0, 0, 0.95), 0 0 35px rgba(168, 85, 247, 0.25)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with Title & Close */}
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-400 p-[1px]">
                      <div className="w-full h-full bg-[#0b0f19] rounded-[11px] flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-300" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white tracking-tight">Interactive Sandbox Personas</h3>
                        <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 font-semibold">
                          8 Personas
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Live multi-role simulation with pre-funded wallets & real smart contract permissions
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPersonaMenu(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer border border-white/10 shrink-0"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
                  
                  {/* Active Persona Banner (Currently Logged In) */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-cyan-950/40 border border-purple-500/30 space-y-2">
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>Currently Acting As:</span>
                      </span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {formatEthToFiat(activeAccount.ethBalance)} ({activeAccount.ethBalance} ETH)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={activeAccount.avatar}
                        alt={activeAccount.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-400/60 shadow-md shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{activeAccount.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{activeAccount.handle}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-purple-500/20 text-purple-200 border border-purple-400/40 font-semibold">
                            {activeAccount.role}
                          </span>
                          <span className="text-[10px] text-slate-300 truncate">
                            {activeAccount.roleDescription}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filter Tabs & Search Bar */}
                  <div className="space-y-2">
                    {/* Category Tabs Rail */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                      {[
                        { id: 'all', label: 'All Roles (8)' },
                        { id: 'founders', label: 'Founders' },
                        { id: 'backers', label: 'Backers & Whales' },
                        { id: 'governance', label: 'Governance & Arbiters' },
                        { id: 'admins', label: 'Admins' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setPersonaRoleFilter(tab.id as any)}
                          className={`px-2.5 py-1 rounded-xl text-[10.5px] font-semibold border transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                            personaRoleFilter === tab.id
                              ? 'bg-purple-500/25 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                              : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Quick Search */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
                      <input
                        type="text"
                        value={personaSearch}
                        onChange={(e) => setPersonaSearch(e.target.value)}
                        placeholder="Search personas by name, handle, role, or capabilities..."
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400 focus:bg-white/[0.08] transition-all"
                      />
                      {personaSearch && (
                        <button
                          type="button"
                          onClick={() => setPersonaSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                          title="Clear search"
                          aria-label="Clear search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Persona Cards Deck */}
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                    {filteredPersonas.map((acc) => {
                      const isSelected = acc.address === activeAccount.address;
                      const details = getPersonaRoleDetails(acc.roleType);
                      const RoleIcon = details.icon;

                      return (
                        <div
                          key={acc.address}
                          onClick={() => {
                            setActiveAccount(acc);
                            setShowPersonaMenu(false);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 group relative ${
                            isSelected
                              ? 'bg-purple-600/20 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-1 ring-purple-400/50'
                              : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-purple-400/40 text-slate-300'
                          }`}
                        >
                          {/* Avatar with Status Ring */}
                          <div className="relative shrink-0 mt-0.5">
                            <img
                              src={acc.avatar}
                              alt={acc.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 group-hover:scale-105 transition-transform"
                            />
                            {isSelected && (
                              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] shadow">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            )}
                          </div>

                          {/* Persona Body */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 mb-1">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-xs font-bold text-white truncate">{acc.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono truncate">{acc.handle}</span>
                              </div>
                              <span className="text-cyan-400 font-mono text-[10.5px] font-bold shrink-0">
                                {formatEthToFiat(acc.ethBalance)} ({acc.ethBalance} ETH)
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className={`text-[9.5px] px-2 py-0.5 rounded-full border font-mono font-semibold flex items-center gap-1 ${details.color}`}>
                                <RoleIcon className="w-2.5 h-2.5 shrink-0" />
                                <span>{details.tag}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 truncate">
                                {acc.roleDescription || details.perk}
                              </span>
                            </div>

                            {/* Capabilities Tags */}
                            <div className="flex flex-wrap gap-1 pt-1">
                              {acc.permissions?.canCreateCampaign && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                                  ✓ Launch Projects
                                </span>
                              )}
                              {acc.permissions?.quadraticPowerMultiplier && acc.permissions.quadraticPowerMultiplier > 1 && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-mono">
                                  ⚡ {acc.permissions.quadraticPowerMultiplier}x QF Weight
                                </span>
                              )}
                              {acc.permissions?.canAuditMilestone && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                                  ⚖️ Escrow Arbiter
                                </span>
                              )}
                              {acc.permissions?.canVoteGovernance && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                                  🏛️ DAO Governance
                                </span>
                              )}
                              {acc.permissions?.canManagePaymaster && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30">
                                  🛡️ Paymaster Sponsor
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right Switch Action */}
                          <div className="shrink-0 self-center pl-1">
                            {isSelected ? (
                              <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-1 rounded-lg border border-purple-400/40">
                                Active
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="text-[10.5px] font-semibold text-slate-300 group-hover:text-white bg-white/[0.05] group-hover:bg-purple-500/20 px-2.5 py-1 rounded-lg border border-white/10 group-hover:border-purple-400/40 transition-all cursor-pointer"
                              >
                                Switch →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="px-5 py-3 border-t border-white/10 bg-white/[0.015] flex items-center justify-between text-[10.5px] text-slate-400 shrink-0">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Switching personas updates your wallet balance & smart contract permissions with zero gas.</span>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Animated Morphing Sun ↔ Moon Theme Toggle */}
          <ThemeToggle />
        </div>

      </div>
    </nav>
  );
};
