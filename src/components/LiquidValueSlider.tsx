'use client';

import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface LiquidValueSliderProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  required?: boolean;
  className?: string;
}

export const LiquidValueSlider: React.FC<LiquidValueSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  required = false,
  className = ''
}) => {
  const numericVal = typeof value === 'number' ? value : parseFloat(value) || min;
  const clampedVal = Math.min(max, Math.max(min, numericVal));
  const percent = Math.min(100, Math.max(0, ((clampedVal - min) / (max - min)) * 100));

  const formatValue = (num: number): string => {
    if (step < 1) {
      // Keep 1 decimal place for fractional steps (e.g. 0.1)
      return (Math.round(num * 10) / 10).toFixed(1);
    }
    return Math.round(num).toString();
  };

  const handleStep = (direction: 'up' | 'down') => {
    const delta = direction === 'up' ? step : -step;
    const next = Math.min(max, Math.max(min, numericVal + delta));
    onChange(formatValue(next));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseFloat(e.target.value);
    onChange(formatValue(next));
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and Current Value Pill */}
      <div className="flex items-center justify-between">
        <label className="text-slate-300 font-semibold text-xs tracking-wide">
          {label} {required && <span className="text-cyan-400">*</span>}
        </label>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-medium">
          {clampedVal} {unit}
        </span>
      </div>

      {/* Liquid Glass Input with Custom Stepper Buttons */}
      <div className="relative flex items-stretch rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_16px_rgba(0,0,0,0.35)] transition-all focus-within:border-cyan-400/60 focus-within:shadow-[0_0_16px_rgba(6,182,212,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]">
        <input
          type="number"
          step={step}
          min={min}
          max={max}
          required={required}
          value={value}
          onChange={handleInputChange}
          className="w-full pl-3 pr-1 py-2 bg-transparent text-xs font-mono font-bold text-white placeholder-slate-500 outline-none"
        />

        {/* Currency / Unit Tag */}
        <div className="flex items-center pr-2">
          <span className="text-[11px] font-mono font-semibold text-slate-400 select-none">
            {unit}
          </span>
        </div>

        {/* Liquid Glass Custom Stepper (Replaces ugly browser spinner) */}
        <div className="flex flex-col border-l border-white/10 bg-white/[0.03] overflow-hidden rounded-r-xl w-7">
          <button
            type="button"
            onClick={() => handleStep('up')}
            disabled={numericVal >= max}
            title={`Increase (${step})`}
            className="flex-1 flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/20 active:bg-cyan-500/40 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all border-b border-white/10"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleStep('down')}
            disabled={numericVal <= min}
            title={`Decrease (${step})`}
            className="flex-1 flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/20 active:bg-cyan-500/40 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Liquid Glass Range Slider */}
      <div className="pt-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={clampedVal}
          onChange={handleSliderChange}
          className="liquid-slider w-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, #06b6d4 0%, #6366f1 ${percent}%, rgba(255, 255, 255, 0.08) ${percent}%, rgba(255, 255, 255, 0.08) 100%)`
          }}
          aria-label={label}
        />
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1 px-0.5">
          <span>{min} {unit}</span>
          <span>{max} {unit}</span>
        </div>
      </div>
    </div>
  );
};
