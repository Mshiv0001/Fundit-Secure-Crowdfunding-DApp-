'use client';

import React, { useState, useMemo } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { useCurrency } from '@/context/CurrencyContext';
import confetti from 'canvas-confetti';
import { 
  X, 
  Smartphone, 
  MessageSquare, 
  Fingerprint, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Mail, 
  Users, 
  Lock,
  Apple,
  RefreshCw,
  ChevronDown,
  Search,
  AlertCircle,
  Check,
  UserCheck,
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  Rocket,
  Crown,
  Scale,
  Wallet,
  Landmark,
  Compass,
  Coins
} from 'lucide-react';

interface SmartWalletOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CountryCodeItem {
  code: string;
  name: string;
  flag: string;
  iso: string;
}

const COUNTRY_CODES: CountryCodeItem[] = [
  { code: '+91', name: 'India', flag: '🇮🇳', iso: 'IN' },
  { code: '+1', name: 'United States', flag: '🇺🇸', iso: 'US' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', iso: 'GB' },
  { code: '+1', name: 'Canada', flag: '🇨🇦', iso: 'CA' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪', iso: 'AE' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', iso: 'SG' },
  { code: '+61', name: 'Australia', flag: '🇦🇺', iso: 'AU' },
  { code: '+49', name: 'Germany', flag: '🇩🇪', iso: 'DE' },
  { code: '+33', name: 'France', flag: '🇫🇷', iso: 'FR' },
  { code: '+81', name: 'Japan', flag: '🇯🇵', iso: 'JP' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭', iso: 'CH' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷', iso: 'KR' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱', iso: 'NL' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪', iso: 'SE' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷', iso: 'BR' },
];

const GOOGLE_ACCOUNTS = [
  {
    name: 'Shivam Sharma',
    email: 'mshivam.dev@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    handle: '@shivam_sharma'
  },
  {
    name: 'Alice Wright',
    email: 'alice.wright@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    handle: '@alice_wright'
  },
  {
    name: 'Devin Vance',
    email: 'devin.vance@tech.co',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    handle: '@devin_vance'
  }
];

export const SmartWalletOnboardingModal: React.FC<SmartWalletOnboardingModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    activeAccount, 
    setActiveAccount, 
    simulatedAccounts,
    loginWithSocial,
    registerPasskeyWithWebAuthn
  } = useWeb3();
  const { formatEthToFiat } = useCurrency();

  const [authStep, setAuthStep] = useState<'method' | 'google' | 'apple' | 'otp' | 'passkey' | 'success'>('method');
  const [selectedCountry, setSelectedCountry] = useState<CountryCodeItem>(COUNTRY_CODES[0]);
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  // Email & Contact Method State
  const [contactMethod, setContactMethod] = useState<'phone' | 'email'>('phone');
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [otpChannel, setOtpChannel] = useState<'sms' | 'whatsapp' | 'email'>('sms');

  // Google State
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Apple State
  const [showCustomApple, setShowCustomApple] = useState(false);
  const [customAppleName, setCustomAppleName] = useState('Shivam Sharma');
  const [customAppleEmail, setCustomAppleEmail] = useState('shivam.apple@icloud.com');
  const [appleEmailOption, setAppleEmailOption] = useState<'share' | 'hide'>('hide');

  // Success Confirmation State
  const [successInfo, setSuccessInfo] = useState<{
    name: string;
    handle: string;
    address: string;
    provider: string;
  } | null>(null);

  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [useWhatsApp, setUseWhatsApp] = useState(false);

  // Filter country codes by search term
  const filteredCountries = useMemo(() => {
    if (!searchCountry.trim()) return COUNTRY_CODES;
    const q = searchCountry.toLowerCase();
    return COUNTRY_CODES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.includes(q) || c.iso.toLowerCase().includes(q)
    );
  }, [searchCountry]);

  // Persona Role Category Tab Filter
  const [personaRoleTab, setPersonaRoleTab] = useState<'all' | 'founders' | 'backers' | 'governance' | 'admins'>('all');

  const filteredPersonas = useMemo(() => {
    if (personaRoleTab === 'founders') {
      return simulatedAccounts.filter(a => a.roleType === 'creator');
    }
    if (personaRoleTab === 'backers') {
      return simulatedAccounts.filter(a => a.roleType === 'backer' || a.roleType === 'whale' || a.roleType === 'sponsor');
    }
    if (personaRoleTab === 'governance') {
      return simulatedAccounts.filter(a => a.roleType === 'arbiter' || a.roleType === 'governor' || a.roleType === 'curator');
    }
    if (personaRoleTab === 'admins') {
      return simulatedAccounts.filter(a => a.roleType === 'admin' || a.roleType === 'new_user');
    }
    return simulatedAccounts;
  }, [simulatedAccounts, personaRoleTab]);

  if (!isOpen) return null;

  // Handle phone input changes strictly restricting to 10 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneDigits(rawDigits);
    if (phoneError && rawDigits.length === 10) {
      setPhoneError(null);
    }
  };

  const handleSendOtp = (viaWhatsApp = false) => {
    if (phoneDigits.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }
    setPhoneError(null);
    setUseWhatsApp(viaWhatsApp);
    setOtpChannel(viaWhatsApp ? 'whatsapp' : 'sms');
    setAuthStep('otp');
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendEmailOtp = () => {
    if (!isValidEmail(emailInput)) {
      setEmailError('Please enter a valid email address (e.g. alex@fundit.io)');
      return;
    }
    setEmailError(null);
    setOtpChannel('email');
    setAuthStep('otp');
  };

  // Google Sign-In Execution
  const handleConfirmGoogle = (name: string, email: string, avatar?: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = loginWithSocial({
        provider: 'google',
        name,
        email,
        avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`
      });
      setIsVerifying(false);
      setSuccessInfo({
        name: res.account.name,
        handle: res.account.handle,
        address: res.account.address,
        provider: 'Google Identity'
      });
      setAuthStep('success');
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onClose();
        setAuthStep('method');
      }, 1600);
    }, 750);
  };

  // Apple ID Sign-In Execution with Native WebAuthn Biometrics
  const handleConfirmApple = async (name: string, emailToUse: string) => {
    setIsVerifying(true);
    
    // Real native WebAuthn biometric hardware prompt
    let passkeySuccess = false;
    try {
      passkeySuccess = await registerPasskeyWithWebAuthn({
        name,
        email: emailToUse,
        handle: `@${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      });
    } catch (e) {
      console.warn('WebAuthn hardware prompt:', e);
    }

    setTimeout(() => {
      const res = loginWithSocial({
        provider: 'apple',
        name,
        email: emailToUse,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      });
      setIsVerifying(false);
      setSuccessInfo({
        name: res.account.name,
        handle: res.account.handle,
        address: res.account.address,
        provider: passkeySuccess ? 'Apple ID (Hardware Secure Enclave)' : 'Apple ID (TouchID / FaceID Passkey)'
      });
      setAuthStep('success');
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onClose();
        setAuthStep('method');
      }, 1600);
    }, 850);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0];
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    // Auto-advance
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setAuthStep('passkey');
    }, 700);
  };

  const handleCompleteBiometric = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (otpChannel === 'email' && emailInput) {
        const username = emailInput.split('@')[0] || 'User';
        const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
        const res = loginWithSocial({
          provider: 'email',
          name: formattedName,
          email: emailInput
        });
        setSuccessInfo({
          name: res.account.name,
          handle: res.account.handle,
          address: res.account.address,
          provider: 'Email Smart Account'
        });
      } else {
        setSuccessInfo({
          name: activeAccount.name,
          handle: activeAccount.handle,
          address: activeAccount.address,
          provider: otpChannel === 'whatsapp' ? 'WhatsApp OTP' : 'Phone SMS OTP'
        });
      }
      setAuthStep('success');
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onClose();
        setAuthStep('method');
      }, 1400);
    }, 600);
  };

  const handleSelectPersona = (acc: any) => {
    setActiveAccount(acc);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
    setSuccessInfo({
      name: acc.name,
      handle: acc.handle,
      address: acc.address,
      provider: `${acc.role} (1-Tap Test Persona)`
    });
    setAuthStep('success');
    setTimeout(() => {
      onClose();
      setAuthStep('method');
    }, 1200);
  };

  const getPersonaBadge = (acc: any) => {
    switch (acc.roleType) {
      case 'creator':
        return {
          tag: 'Project Founder',
          icon: <Rocket className="w-2.5 h-2.5 text-cyan-400" />,
          color: 'text-cyan-300 border-cyan-400/40 bg-cyan-500/15',
          perk: '⚡ Launches & Milestones'
        };
      case 'backer':
        return {
          tag: 'Quadratic Backer',
          icon: <Apple className="w-2.5 h-2.5 fill-white" />,
          color: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/15',
          perk: '⚡ 1.5x QF Power'
        };
      case 'arbiter':
        return {
          tag: 'Escrow Arbiter',
          icon: <Scale className="w-2.5 h-2.5 text-amber-300" />,
          color: 'text-amber-300 border-amber-400/40 bg-amber-500/15',
          perk: '⚖️ Audits & Tranches'
        };
      case 'governor':
        return {
          tag: 'DAO Governor',
          icon: <Landmark className="w-2.5 h-2.5 text-purple-300" />,
          color: 'text-purple-300 border-purple-400/40 bg-purple-500/15',
          perk: '🏛️ DAO Matching & Veto'
        };
      case 'whale':
        return {
          tag: 'Guardian Whale (4x)',
          icon: <Crown className="w-2.5 h-2.5 text-amber-300" />,
          color: 'text-amber-300 border-amber-400/40 bg-amber-500/15',
          perk: '👑 4x Whale Weight'
        };
      case 'sponsor':
        return {
          tag: 'Matching Sponsor',
          icon: <Coins className="w-2.5 h-2.5 text-blue-300" />,
          color: 'text-blue-300 border-blue-400/40 bg-blue-500/15',
          perk: '💎 Grant Pool Liquidity'
        };
      case 'admin':
        return {
          tag: 'Platform Admin',
          icon: <ShieldCheck className="w-2.5 h-2.5 text-rose-300" />,
          color: 'text-rose-300 border-rose-400/40 bg-rose-500/15',
          perk: '🛡️ Paymaster & Badges'
        };
      case 'curator':
        return {
          tag: 'Ecosystem Curator',
          icon: <Compass className="w-2.5 h-2.5 text-indigo-300" />,
          color: 'text-indigo-300 border-indigo-400/40 bg-indigo-500/15',
          perk: '🧭 Grants Scout'
        };
      case 'new_user':
      default:
        return {
          tag: 'First-Time User',
          icon: <Sparkles className="w-2.5 h-2.5 text-sky-300" />,
          color: 'text-sky-300 border-sky-400/40 bg-sky-500/15',
          perk: '✨ Clean Slate 1st Pledge'
        };
    }
  };

  const formattedPhoneNumber = phoneDigits 
    ? phoneDigits.replace(/(\d{5})(\d{5})/, '$1 $2')
    : '98201 33901';

  // Compute Apple email based on privacy toggle
  const currentAppleEmail = appleEmailOption === 'share'
    ? (customAppleEmail || 'shivam.apple@icloud.com')
    : `${(customAppleName || 'backer').toLowerCase().replace(/[^a-z0-9]/g, '')}_89f2a@privaterelay.appleid.com`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-[340px] sm:max-w-[350px] rounded-[24px] border border-white/25 p-3.5 sm:p-4 shadow-2xl z-50 my-auto flex flex-col space-y-3 animate-in zoom-in-95 duration-200"
        style={{
          background: 'rgba(15, 20, 34, 0.90)',
          backdropFilter: 'blur(40px) saturate(220%)',
          WebkitBackdropFilter: 'blur(40px) saturate(220%)',
          boxShadow: 'inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.3), 0 30px 60px -10px rgba(0, 0, 0, 0.85), 0 0 25px rgba(6, 182, 212, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Account Header Style matching the Profile Card */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-cyan-300 ring-2 ring-cyan-400/50 shadow-md shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)'
              }}
            >
              <Fingerprint className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span>Sign In to Fund It</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold">
                  ERC-4337
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono truncate">
                Smart Account • Zero Gas Fees
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer border border-white/10 shrink-0 ml-2"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* STEP 1: AUTH METHOD SELECTION */}
        {authStep === 'method' && (
          <div className="space-y-3">
            {/* 1-Tap Apple & Google Social Logins styled like action rows */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setAuthStep('apple')}
                className="w-full flex items-center gap-2.5 p-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all cursor-pointer text-xs font-semibold text-white group"
              >
                <span className="w-6 h-6 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center shrink-0">
                  <Apple className="w-3.5 h-3.5 fill-white group-hover:scale-110 transition-transform" />
                </span>
                <span className="truncate">Continue with Apple ID</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthStep('google')}
                className="w-full flex items-center gap-2.5 p-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all cursor-pointer text-xs font-semibold text-white group"
              >
                <span className="w-6 h-6 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </span>
                <span className="truncate">Continue with Google</span>
              </button>
            </div>

            {/* Inner Card Section (Matching Active Role & Smart Wallet box) */}
            <div className="py-2.5 px-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {contactMethod === 'phone' ? 'Mobile Number' : 'Email Address'}
                </span>
                <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => { setContactMethod('phone'); setEmailError(null); }}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                      contactMethod === 'phone'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Phone
                  </button>
                  <button
                    type="button"
                    onClick={() => { setContactMethod('email'); setPhoneError(null); }}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                      contactMethod === 'email'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Email
                  </button>
                </div>
              </div>

              {contactMethod === 'phone' ? (
                <div className="space-y-2">
                  <div className="flex items-center rounded-xl bg-black/40 border border-white/10 focus-within:border-cyan-400/50 transition-all">
                    <button
                      type="button"
                      onClick={() => setShowCountryMenu(!showCountryMenu)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-bold text-cyan-300 hover:bg-white/10 rounded-l-xl border-r border-white/10 transition-all cursor-pointer shrink-0"
                    >
                      <span>{selectedCountry.iso}</span>
                      <span className="text-slate-300 font-normal">{selectedCountry.code}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Mobile number"
                      value={phoneDigits}
                      onChange={handlePhoneChange}
                      className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none min-w-0"
                    />
                    <div className="pr-2.5 text-[10px] text-slate-400 font-mono shrink-0">
                      {phoneDigits.length === 10 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span>{phoneDigits.length > 0 ? `${phoneDigits.length}/10` : '10 digits'}</span>
                      )}
                    </div>
                  </div>

                  {showCountryMenu && (
                    <div className="relative">
                      <div className="fixed inset-0 z-30" onClick={() => { setShowCountryMenu(false); setSearchCountry(''); }} />
                      <div 
                        className="absolute top-1 left-0 right-0 max-h-56 overflow-hidden rounded-xl border border-white/20 z-50 flex flex-col p-2 space-y-1 shadow-2xl"
                        style={{ background: 'rgba(15, 20, 34, 0.98)', backdropFilter: 'blur(30px)' }}
                      >
                        <div className="relative mb-1">
                          <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={searchCountry}
                            onChange={(e) => setSearchCountry(e.target.value)}
                            placeholder="Search country..."
                            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg text-xs text-white placeholder:text-slate-500 bg-white/[0.06] border border-white/10 focus:outline-none"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-y-auto max-h-40 no-scrollbar space-y-0.5">
                          {filteredCountries.map((c) => (
                            <button
                              key={`${c.iso}-${c.code}`}
                              type="button"
                              onClick={() => { setSelectedCountry(c); setShowCountryMenu(false); setSearchCountry(''); }}
                              className="w-full flex items-center justify-between p-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 text-left cursor-pointer"
                            >
                              <span className="truncate">{c.name}</span>
                              <span className="font-mono text-cyan-300 font-bold ml-2 shrink-0">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {phoneError && (
                    <div className="text-[10px] text-rose-400 flex items-center gap-1 pl-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{phoneError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleSendOtp(false)}
                      className="py-2 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer border border-cyan-400/50 transition-all hover:brightness-110 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.85) 0%, rgba(99, 102, 241, 0.85) 100%)',
                        boxShadow: '0 4px 15px rgba(6, 182, 212, 0.25)'
                      }}
                    >
                      <span>SMS OTP</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendOtp(true)}
                      className="py-2 px-3 rounded-xl text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-950/70 transition-all active:scale-95"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
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
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendEmailOtp();
                      }}
                      className="flex-1 bg-transparent px-2 py-1.5 text-xs text-white placeholder:text-slate-500 font-sans focus:outline-none min-w-0"
                    />
                    <div className="pr-2.5 text-[10px] text-slate-400 font-mono shrink-0">
                      {isValidEmail(emailInput) ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span>name@domain</span>
                      )}
                    </div>
                  </div>

                  {emailError && (
                    <div className="text-[10px] text-rose-400 flex items-center gap-1 pl-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{emailError}</span>
                    </div>
                  )}

                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleSendEmailOtp()}
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
                </div>
              )}
            </div>

            {/* Quick 1-Tap Sandbox Test Personas (Liquid Glass Styling) */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Instant Test Personas</span>
                </span>
                <span className="text-[9px] font-mono text-purple-300 bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20">
                  Pre-Funded
                </span>
              </div>

              {/* 4 Key Platform Role Personas for 1-Tap Testing */}
              <div className="grid grid-cols-2 gap-1.5">
                {simulatedAccounts.slice(0, 4).map((acc) => {
                  const badge = getPersonaBadge(acc);
                  return (
                    <button
                      key={acc.address}
                      type="button"
                      onClick={() => handleSelectPersona(acc)}
                      className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-purple-400/50 text-left transition-all cursor-pointer flex items-center gap-2 group"
                    >
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-white/20 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-white truncate flex items-center justify-between">
                          <span className="truncate">{acc.name.split(' ')[0]}</span>
                        </div>
                        <div className="text-[9px] text-purple-300 font-mono truncate">
                          {acc.role}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP: GOOGLE AUTHENTICATION CHOOSER */}
        {authStep === 'google' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </span>
                <span className="text-xs font-bold text-white">Google Identity</span>
              </div>
              <button
                type="button"
                onClick={() => setAuthStep('method')}
                className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
              >
                ← Back
              </button>
            </div>

            {isVerifying ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
                <div className="text-xs font-semibold text-white">Connecting Google...</div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {GOOGLE_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleConfirmGoogle(acc.name, acc.email, acc.avatar)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 text-left cursor-pointer transition-all group"
                  >
                    <img src={acc.avatar} alt={acc.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{acc.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP: APPLE ID AUTHENTICATION */}
        {authStep === 'apple' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center shrink-0">
                  <Apple className="w-3.5 h-3.5 fill-white" />
                </span>
                <span className="text-xs font-bold text-white">Apple ID Passkey</span>
              </div>
              <button
                type="button"
                onClick={() => setAuthStep('method')}
                className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
              >
                ← Back
              </button>
            </div>

            {isVerifying ? (
              <div className="py-8 text-center space-y-2">
                <Fingerprint className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                <div className="text-xs font-semibold text-white">Authenticating Biometrics...</div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Apple className="w-4 h-4 fill-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{customAppleName || 'Shivam Sharma'}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{currentAppleEmail}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleConfirmApple(customAppleName || 'Shivam Sharma', currentAppleEmail)}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer border border-cyan-400/50 transition-all hover:brightness-110 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.85) 0%, rgba(99, 102, 241, 0.85) 100%)',
                    boxShadow: '0 4px 15px rgba(6, 182, 212, 0.25)'
                  }}
                >
                  <Fingerprint className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Confirm Touch ID / Face ID</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: ENTER OTP */}
        {authStep === 'otp' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                  {otpChannel === 'email' ? <Mail className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                </span>
                <span className="text-xs font-bold text-white truncate">Enter 6-Digit Code</span>
              </div>
              <button
                type="button"
                onClick={() => { setAuthStep('method'); setOtpCode(['', '', '', '', '', '']); }}
                className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
              >
                ← Back
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-mono truncate text-center">
              {otpChannel === 'email' ? emailInput : `${selectedCountry.code} ${formattedPhoneNumber}`}
            </p>

            <div className="flex justify-center gap-1.5 py-1">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={otpCode[idx]}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-8 h-10 text-center text-sm font-bold text-white rounded-lg bg-white/[0.06] border border-white/20 focus:border-cyan-400 focus:scale-105 transition-all outline-none"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer border border-cyan-400/50 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.85) 0%, rgba(99, 102, 241, 0.85) 100%)',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.25)'
              }}
            >
              {isVerifying ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Verify &amp; Create Wallet</span>
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 3: BIOMETRIC STEP-UP SECURITY */}
        {authStep === 'passkey' && (
          <div className="space-y-3 text-center py-2 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-full border border-emerald-400/50 bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Enable Passkey Security</div>
              <div className="text-[10px] text-slate-400">Hardware biometrics for zero-gas pledges</div>
            </div>
            <button
              type="button"
              onClick={handleCompleteBiometric}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-400/60"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.9) 0%, rgba(6,182,212,0.9) 100%)'
              }}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Activate Device Passkey</span>
            </button>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {authStep === 'success' && (
          <div className="space-y-3 text-center py-3 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full border border-emerald-400/60 bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Smart Wallet Connected!</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{successInfo?.handle || activeAccount.handle}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-left text-xs font-mono space-y-1">
              <div className="text-white font-bold">{successInfo?.name || activeAccount.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{successInfo?.address || activeAccount.address}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
