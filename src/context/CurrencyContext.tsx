'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'INR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  ethToUsdRate: number;
  ethToInrRate: number;
  formatEthToFiat: (ethAmount: string | number, showEthSubtext?: boolean) => string;
  getFiatNumber: (ethAmount: string | number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('USD');

  // Realistic exchange rates: 1 ETH = $3,500 = ₹2,90,000
  const ethToUsdRate = 3500;
  const ethToInrRate = 290500;

  // Persist preference
  useEffect(() => {
    const saved = localStorage.getItem('fundit_currency');
    if (saved === 'USD' || saved === 'INR') {
      setCurrency(saved);
    }
  }, []);

  const handleSetCurrency = (c: Currency) => {
    setCurrency(c);
    localStorage.setItem('fundit_currency', c);
  };

  const toggleCurrency = () => {
    const next = currency === 'USD' ? 'INR' : 'USD';
    handleSetCurrency(next);
  };

  const getFiatNumber = (ethAmount: string | number): number => {
    const parsed = typeof ethAmount === 'string' ? parseFloat(ethAmount) || 0 : ethAmount;
    const rate = currency === 'USD' ? ethToUsdRate : ethToInrRate;
    return Math.round(parsed * rate);
  };

  const formatEthToFiat = (ethAmount: string | number, showEthSubtext = false): string => {
    const num = getFiatNumber(ethAmount);
    let formatted = '';

    if (currency === 'USD') {
      formatted = `$${num.toLocaleString('en-US')}`;
    } else {
      formatted = `₹${num.toLocaleString('en-IN')}`;
    }

    if (showEthSubtext) {
      const parsedEth = typeof ethAmount === 'string' ? parseFloat(ethAmount) || 0 : ethAmount;
      return `${formatted} (${parsedEth.toFixed(2)} ETH)`;
    }

    return formatted;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        toggleCurrency,
        ethToUsdRate,
        ethToInrRate,
        formatEthToFiat,
        getFiatNumber,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
