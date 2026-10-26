'use client';

import React, { useState } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { useCurrency } from '@/context/CurrencyContext';
import { Campaign, RewardTier } from '@/types';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  QrCode, 
  Apple, 
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  selectedTier?: RewardTier | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  campaign,
  selectedTier
}) => {
  const { pledge } = useWeb3();
  const { currency, formatEthToFiat, ethToUsdRate, ethToInrRate } = useCurrency();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'applepay' | 'smart_wallet'>('card');
  const [customAmountFiat, setCustomAmountFiat] = useState<string>(
    selectedTier ? (currency === 'USD' ? selectedTier.priceUsd.toString() : selectedTier.priceInr.toString()) : '50'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptId, setReceiptId] = useState('');

  React.useEffect(() => {
    if (selectedTier) {
      setCustomAmountFiat(currency === 'USD' ? selectedTier.priceUsd.toString() : selectedTier.priceInr.toString());
    } else {
      setCustomAmountFiat(currency === 'USD' ? '50' : '4000');
    }
  }, [selectedTier, currency, isOpen]);

  if (!isOpen) return null;

  // Convert custom fiat amount back to approximate ETH for smart escrow contract
  const rate = currency === 'USD' ? ethToUsdRate : ethToInrRate;
  const fiatVal = parseFloat(customAmountFiat) || 25;
  const calculatedEth = (fiatVal / rate).toFixed(3);

  const handleConfirmSupport = async () => {
    setIsProcessing(true);

    try {
      const res = await pledge(campaign.id, calculatedEth);
      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setReceiptId(`RCPT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`);
        setIsSuccess(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedAmount = currency === 'USD' ? `$${fiatVal.toLocaleString()}` : `₹${fiatVal.toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg liquid-glass rounded-[28px] border border-white/20 p-4 sm:p-6 md:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.7)] overflow-hidden max-h-[92vh] overflow-y-auto"
        style={{
          boxShadow: 'inset 0 1px 1px 0 rgba(255,255,255,0.7), 0 25px 60px rgba(0,0,0,0.6)'
        }}
      >
        {/* Specular Ambient Glow */}
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-80 h-44 bg-gradient-to-b from-indigo-500/30 via-cyan-400/25 to-transparent blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0 z-20"
          aria-label="Close Checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[11px] text-cyan-300 font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Liquid Escrow Vault Protected</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Support {campaign.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                By {campaign.creatorName} ({campaign.creatorHandle})
              </p>
            </div>

            {/* Selected Tier Banner (if any) */}
            {selectedTier && (
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{selectedTier.title}</span>
                    {selectedTier.popular && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">Popular</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{selectedTier.description}</div>
                </div>
                <div className="text-sm font-extrabold text-cyan-300 font-mono shrink-0 ml-3">
                  {currency === 'USD' ? `$${selectedTier.priceUsd}` : `₹${selectedTier.priceInr.toLocaleString()}`}
                </div>
              </div>
            )}

            {/* Contribution Amount Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Select or Enter Amount ({currency})</span>
                <span className="text-[10px] text-slate-400 font-mono">≈ {calculatedEth} ETH on-chain</span>
              </label>

              {/* Quick Pills */}
              <div className="grid grid-cols-4 gap-2">
                {(currency === 'USD' ? [25, 50, 100, 250] : [2000, 4500, 8500, 20000]).map((amt) => {
                  const isSelected = customAmountFiat === amt.toString();
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCustomAmountFiat(amt.toString())}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {currency === 'USD' ? `$${amt}` : `₹${amt.toLocaleString()}`}
                    </button>
                  );
                })}
              </div>

              {/* Direct Amount Input */}
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {currency === 'USD' ? '$' : '₹'}
                </span>
                <input
                  type="number"
                  min="5"
                  value={customAmountFiat}
                  onChange={(e) => setCustomAmountFiat(e.target.value)}
                  className="liquid-input w-full pl-9 pr-4 py-3 rounded-2xl text-sm font-bold text-white font-mono"
                  placeholder="Enter custom amount"
                />
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Choose Payment Method (100% Gasless)
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-indigo-500/25 border-indigo-400/60 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] font-semibold">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-cyan-500/25 border-cyan-400/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span className="text-[11px] font-semibold">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('applepay')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === 'applepay'
                      ? 'bg-emerald-500/25 border-emerald-400/60 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Apple className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-semibold">Apple Pay</span>
                </button>
              </div>
            </div>

            {/* Price Breakdown & Escrow Guarantee */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Pledge Amount</span>
                <span className="font-semibold text-white font-mono">{formattedAmount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Milestone Protection Vault</span>
                </span>
                <span className="text-emerald-300 font-mono">100% Sealed</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Platform Processing Fee</span>
                <span className="text-cyan-400 font-semibold font-mono">Free ($0.00)</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex items-center justify-between text-sm font-bold text-white">
                <span>Total Due</span>
                <span className="text-cyan-300 font-mono text-base">{formattedAmount}</span>
              </div>
            </div>

            {/* 1-Click CTA */}
            <button
              onClick={handleConfirmSupport}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl liquid-btn-primary text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Locking in Protection Vault...</span>
                </>
              ) : (
                <>
                  <span>Confirm Support ({formattedAmount})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Money-Back Guarantee Tag */}
            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Money-Back Guarantee if goal is unmet by project deadline.</span>
            </p>

          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="py-8 space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-white tracking-tight">
                Support Confirmed!
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                You have successfully backed <span className="text-white font-semibold">{campaign.title}</span> with {formattedAmount}.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Receipt Number:</span>
                <span className="font-mono text-cyan-300">{receiptId}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Escrow Vault Status:</span>
                <span className="text-emerald-400 font-semibold">Protected &amp; Locked</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Voting Rights Granted:</span>
                <span className="text-purple-300 font-semibold">Quadratic DAO Voice Active</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button
                onClick={() => {
                  alert(`Receipt ${receiptId} downloaded.`);
                }}
                className="flex-1 py-3 rounded-2xl liquid-btn-glass text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download Receipt</span>
              </button>

              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="flex-1 py-3 rounded-2xl liquid-btn-primary text-xs font-semibold text-white cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
