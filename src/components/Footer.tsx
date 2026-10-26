import React from 'react';
import { ExternalLink } from 'lucide-react';
import { FundItBrandText } from './FundItBrandText';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/15 liquid-glass py-12 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Clean Modern Brand */}
        <div className="flex items-center select-none">
          <FundItBrandText height={20} glow={false} />
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <a
            href="https://github.com/ethereum/solidity"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Solidity 0.8.26</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Escrow Contracts Active
          </span>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-right text-[11px] text-slate-500">
          <div>Built with Next.js, OpenZeppelin &amp; Hardhat</div>
          <div className="mt-0.5">Empowering Grassroots Web3 Builders</div>
        </div>

      </div>
    </footer>
  );
};
