'use client';

import React, { useState } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { useCurrency } from '@/context/CurrencyContext';
import {
  X,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Video,
  Globe,
  Github,
  Cpu,
  Lock,
  Dna,
  Zap,
  Layers,
  AlertCircle,
  Plus,
  Trash2,
  Coins,
  Calendar,
  Layers3,
  ExternalLink,
  HeartPulse,
  ShieldAlert,
  PawPrint,
  GraduationCap,
  Code2,
  Wrench,
  Gamepad2,
  Rocket,
  Leaf,
  HandHeart,
  Search,
  RotateCcw
} from 'lucide-react';
import { LiquidValueSlider } from './LiquidValueSlider';
import { RewardTier } from '@/types';

interface CreateCampaignModalProps {
  onClose: () => void;
}

export interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'Medical & Health',
    title: 'Medical & Health',
    subtitle: 'Surgeries, hospital bills, treatments, therapy & recovery.',
    icon: HeartPulse,
    keywords: [
      'medical', 'health', 'surgery', 'surgeries', 'hospital', 'bills', 'treatment',
      'treatments', 'therapy', 'recovery', 'doctor', 'cancer', 'dental', 'clinic',
      'illness', 'medicine', 'pharma', 'operation', 'rehab', 'transplant', 'care',
      'icu', 'medication', 'physician', 'mental'
    ]
  },
  {
    id: 'Emergency & Relief',
    title: 'Emergency & Relief',
    subtitle: 'Accidents, natural disasters, funeral/memorial & legal aid.',
    icon: ShieldAlert,
    keywords: [
      'emergency', 'relief', 'accident', 'accidents', 'disaster', 'disasters', 'natural',
      'flood', 'fire', 'wildfire', 'earthquake', 'storm', 'hurricane', 'funeral',
      'memorial', 'legal', 'aid', 'court', 'lawyer', 'crisis', 'urgent', 'evacuation',
      'damage', 'tragedy', 'rescue', 'victim'
    ]
  },
  {
    id: 'Family & Pets',
    title: 'Family & Pets',
    subtitle: 'Pet care, veterinary bills, family hardship, adoption & living costs.',
    icon: PawPrint,
    keywords: [
      'family', 'pets', 'pet', 'dog', 'dogs', 'cat', 'cats', 'veterinary', 'vet',
      'animal', 'animals', 'puppy', 'kitten', 'adoption', 'hardship', 'living',
      'costs', 'rent', 'food', 'groceries', 'childcare', 'children', 'baby', 'elder',
      'shelter', 'foster', 'survival'
    ]
  },
  {
    id: 'Education & Learning',
    title: 'Education & Learning',
    subtitle: 'Tuition, college funds, student debt, research & skill bootcamps.',
    icon: GraduationCap,
    keywords: [
      'education', 'learning', 'tuition', 'college', 'university', 'funds', 'student',
      'debt', 'loans', 'research', 'bootcamp', 'bootcamps', 'skills', 'school',
      'scholarship', 'degree', 'master', 'phd', 'academy', 'stem', 'study', 'course',
      'classes', 'books'
    ]
  },
  {
    id: 'Tech & Software',
    title: 'Tech & Software',
    subtitle: 'AI, mobile apps, SaaS, open-source dev tools & Web3/crypto.',
    icon: Code2,
    keywords: [
      'tech', 'software', 'ai', 'artificial intelligence', 'mobile', 'apps', 'app',
      'saas', 'open-source', 'dev', 'tools', 'web3', 'crypto', 'blockchain', 'coding',
      'code', 'developers', 'api', 'bot', 'algorithm', 'platform', 'cloud', 'machine learning'
    ]
  },
  {
    id: 'Hardware & Engineering',
    title: 'Hardware & Engineering',
    subtitle: 'Physical gadgets, IoT, robotics, biotech lab tools & green energy.',
    icon: Wrench,
    keywords: [
      'hardware', 'engineering', 'physical', 'gadgets', 'gadget', 'iot', 'robotics',
      'robot', 'biotech', 'lab', 'tools', 'green energy', 'electronics', 'devices',
      'sensors', 'drones', 'drone', 'machinery', 'mechanical', 'prototypes', 'circuits',
      'fab', '3d printing'
    ]
  },
  {
    id: 'Creative & Gaming',
    title: 'Creative & Gaming',
    subtitle: 'Indie video games, tabletop, films, music, books & digital art.',
    icon: Gamepad2,
    keywords: [
      'creative', 'gaming', 'game', 'games', 'indie', 'video games', 'tabletop',
      'films', 'film', 'movie', 'cinema', 'music', 'album', 'band', 'song', 'books',
      'book', 'novel', 'author', 'digital art', 'art', 'comic', 'animation', 'rpg',
      'board game', 'design', 'podcast'
    ]
  },
  {
    id: 'Business & Startups',
    title: 'Business & Startups',
    subtitle: 'New products, e-commerce, retail brands, cafes & local shops.',
    icon: Rocket,
    keywords: [
      'business', 'startups', 'startup', 'products', 'product', 'ecommerce', 'retail',
      'brands', 'brand', 'cafes', 'cafe', 'coffee', 'local shops', 'shop', 'store',
      'restaurant', 'inventory', 'company', 'franchise', 'venture', 'commercial', 'bakery'
    ]
  },
  {
    id: 'Planet & Environment',
    title: 'Planet & Environment',
    subtitle: 'Clean tech, ocean/forest conservation, solar & animal sanctuaries.',
    icon: Leaf,
    keywords: [
      'planet', 'environment', 'clean tech', 'ocean', 'forest', 'conservation',
      'solar', 'animal sanctuaries', 'green', 'climate', 'trees', 'wildlife', 'recycling',
      'carbon', 'biodiversity', 'earth', 'renewable', 'ecology', 'sustainability',
      'sanctuary', 'nature'
    ]
  },
  {
    id: 'Community & Public Goods',
    title: 'Community & Public Goods',
    subtitle: 'Charities, civic spaces, youth sports, social impact & non-profits.',
    icon: HandHeart,
    keywords: [
      'community', 'public goods', 'charities', 'charity', 'civic', 'spaces',
      'youth sports', 'sports', 'league', 'social impact', 'non-profits', 'nonprofit',
      'volunteer', 'park', 'playground', 'neighborhood', 'mutual aid', 'foundation',
      'society', 'donation', 'grassroots'
    ]
  },
  {
    id: 'Other / Custom',
    title: 'Other / Custom',
    subtitle: 'Custom cause tailored to your specialized campaign initiative.',
    icon: Sparkles,
    keywords: [
      'other', 'custom', 'tailored', 'specialized', 'initiative', 'cause', 'niche',
      'unique', 'miscellaneous', 'personal', 'special'
    ]
  }
];

// Curated High-Resolution Artwork per Category (Automatic fallback & variations)
export const CATEGORY_ARTWORK_GALLERY: Record<string, string[]> = {
  'Medical & Health': [
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80'
  ],
  'Emergency & Relief': [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80'
  ],
  'Family & Pets': [
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80'
  ],
  'Education & Learning': [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80'
  ],
  'Tech & Software': [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
  ],
  'Hardware & Engineering': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
  ],
  'Creative & Gaming': [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&w=1200&q=80'
  ],
  'Business & Startups': [
    'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80'
  ],
  'Planet & Environment': [
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80'
  ],
  'Community & Public Goods': [
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80'
  ],
  'Other / Custom': [
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80'
  ]
};

export const getCategoryDefaultArtwork = (cat: string, index: number = 0): string => {
  const list = CATEGORY_ARTWORK_GALLERY[cat] || CATEGORY_ARTWORK_GALLERY['Other / Custom'];
  return list[Math.abs(index) % list.length];
};

interface MilestoneItem {
  id: number;
  title: string;
  description: string;
  stagePercent: number;
  timeframe: string;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ onClose }) => {
  const { createNewCampaign, activeAccount } = useWeb3();
  const { currency, formatEthToFiat } = useCurrency();

  // Wizard Step (1: Identity, 2: Escrow Vault & Milestones, 3: DAO Token & Tiers, 4: Preview & Deploy)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Project Identity & Visuals
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Medical & Health');
  const [customCategoryText, setCustomCategoryText] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(0);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [videoPitchUrl, setVideoPitchUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Active cover artwork dynamically resolved from category with custom URL override
  const activeCoverImage = customImageUrl.trim() || getCategoryDefaultArtwork(category, selectedArtworkIndex);

  // Step 2: Milestone Escrow Vault & Caps
  const [goalAmount, setGoalAmount] = useState('5.0');
  const [hardCapAmount, setHardCapAmount] = useState('10.0');
  const [durationDays, setDurationDays] = useState(30);

  // Milestone Tranches
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    {
      id: 1,
      title: 'Phase 1: Architecture & Smart Contract Audit',
      description: 'Formal verification of escrow bytecodes and testnet contracts.',
      stagePercent: 40,
      timeframe: 'Month 1 - 2'
    },
    {
      id: 2,
      title: 'Phase 2: Alpha Testnet & Backer Testing',
      description: 'MVP sandbox deployment with early backer feedback and security telemetry.',
      stagePercent: 30,
      timeframe: 'Month 3 - 4'
    },
    {
      id: 3,
      title: 'Phase 3: Production Mainnet & Public Launch',
      description: 'Mainnet contract deployment with decentralized liquidity pools.',
      stagePercent: 30,
      timeframe: 'Month 5 - 6'
    }
  ]);

  // Step 3: DAO Governance Token & Tiers
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenSupply, setTokenSupply] = useState('10,000,000');
  const [tokensPerEth, setTokensPerEth] = useState('1,000');

  // Backer Tiers
  const [tiers, setTiers] = useState<RewardTier[]>([
    {
      id: 'tier-1',
      title: 'Early Supporter',
      priceUsd: 25,
      priceInr: 2100,
      ethAmount: '0.008',
      description: 'Backer Discord role, milestone newsletters, and quadratic voting rights.',
      perks: ['Milestone Voting Rights', 'Supporter Discord Role', 'Quarterly Updates'],
      estimatedDelivery: 'Q1 2027',
      backerCount: 0
    },
    {
      id: 'tier-2',
      title: 'Protocol Patron',
      priceUsd: 100,
      priceInr: 8400,
      ethAmount: '0.030',
      description: '1.25x Quadratic voting power, early beta access, and commemorative backer NFT.',
      perks: ['1.25x QF Voting Weight', 'Early Beta Sandbox', 'Limited Commemorative NFT'],
      estimatedDelivery: 'Q2 2027',
      popular: true,
      backerCount: 0
    },
    {
      id: 'tier-3',
      title: "Founder's Circle",
      priceUsd: 500,
      priceInr: 42000,
      ethAmount: '0.150',
      description: '1.5x Quadratic voting power, quarterly founder strategy calls, and VIP DAO badge.',
      perks: ['1.5x QF Voting Weight', 'Quarterly Founder AMA', 'VIP Governance Tag'],
      estimatedDelivery: 'Q3 2027',
      backerCount: 0
    }
  ]);

  // Submission & Deployment States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deployStageText, setDeployStageText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Validate Soft vs Hard Cap
  const softCapNum = parseFloat(goalAmount) || 0.1;
  const hardCapNum = Math.max(softCapNum, parseFloat(hardCapAmount) || softCapNum);

  // Milestone Sum Calculation
  const totalMilestonePercent = milestones.reduce((sum, m) => sum + (m.stagePercent || 0), 0);

  // Handle milestone add/remove/edit
  const handleMilestonePercentChange = (id: number, val: number) => {
    setMilestones(prev =>
      prev.map(m => (m.id === id ? { ...m, stagePercent: Math.max(5, Math.min(100, val)) } : m))
    );
  };

  const handleMilestoneTextChange = (id: number, field: 'title' | 'description' | 'timeframe', val: string) => {
    setMilestones(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const handleAddMilestone = () => {
    if (milestones.length >= 4) return;
    const nextId = Math.max(...milestones.map(m => m.id), 0) + 1;
    setMilestones(prev => [
      ...prev,
      {
        id: nextId,
        title: `Phase ${nextId}: Expanded Protocol Deliverables`,
        description: 'Verification of technical deliverables and community audit approval.',
        stagePercent: 20,
        timeframe: `Month ${nextId * 2}`
      }
    ]);
  };

  const handleRemoveMilestone = (id: number) => {
    if (milestones.length <= 2) return;
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  // Step Validation
  const validateStep1 = () => {
    if (!title.trim()) {
      setFeedback('Please provide a project title.');
      return false;
    }
    if (category === 'Other / Custom' && !customCategoryText.trim()) {
      setFeedback('Please specify your custom category name.');
      return false;
    }
    if (!description.trim()) {
      setFeedback('Please write a short project overview.');
      return false;
    }
    setFeedback(null);
    return true;
  };

  const validateStep2 = () => {
    if (totalMilestonePercent !== 100) {
      setFeedback(`Milestone allocations must sum to 100% (currently ${totalMilestonePercent}%).`);
      return false;
    }
    setFeedback(null);
    return true;
  };

  const validateStep3 = () => {
    if (!tokenSymbol.trim()) {
      setFeedback('Please specify a DAO token symbol (e.g. HELIX).');
      return false;
    }
    setFeedback(null);
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep((prev) => Math.min(4, prev + 1) as any);
  };

  const handlePrevStep = () => {
    setFeedback(null);
    setCurrentStep((prev) => Math.max(1, prev - 1) as any);
  };

  // Final Smart Contract Deployment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;

    setIsSubmitting(true);
    setDeployStageText('1/3: Compiling OpenZeppelin Escrow Bytecode...');

    await new Promise(r => setTimeout(r, 600));
    setDeployStageText('2/3: Minting DAO Governance Token Contract...');

    await new Promise(r => setTimeout(r, 600));
    setDeployStageText('3/3: Registering Milestone Vault Rules on Protocol Registry...');

    const finalCategory = category === 'Other / Custom'
      ? (customCategoryText.trim() || 'Custom Initiative')
      : category;

    const res = await createNewCampaign({
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      imageUrl: activeCoverImage,
      videoPitchUrl: videoPitchUrl.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      goalAmount: softCapNum.toFixed(1),
      hardCapAmount: hardCapNum.toFixed(1),
      durationDays,
      tokenName: tokenName.trim() || `${title.trim()} DAO`,
      tokenSymbol: tokenSymbol.trim().toUpperCase(),
      tokenSupply,
      milestones: milestones.map(m => ({
        ...m,
        amountEth: (softCapNum * (m.stagePercent / 100)).toFixed(2)
      })),
      rewardTiers: tiers
    });

    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setFeedback(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl liquid-glass rounded-3xl border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden my-4 sm:my-6 max-h-[92vh] flex flex-col">
        
        {/* Header with Title & Close */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px] shrink-0">
              <div className="w-full h-full bg-[#0b0f19] rounded-[7px] flex items-center justify-center">
                <PlusCircle className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white tracking-tight truncate">Deploy Quadratic Crowdfund</h3>
              <p className="text-[11px] text-slate-400 truncate hidden xs:block">Milestone-Secured Escrow Vault with Quadratic DAO Governance</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all shrink-0" aria-label="Close Deploy Wizard">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Stage Wizard Breadcrumb Navigation (Responsive 2x2 on phone, 4-in-a-row on tablet/desktop) */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 bg-white/[0.015] shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { step: 1, label: '1. Identity', desc: 'Project & Media' },
              { step: 2, label: '2. Escrow Vault', desc: 'Caps & Milestones' },
              { step: 3, label: '3. Token & Tiers', desc: 'DAO & Rewards' },
              { step: 4, label: '4. Preview & Launch', desc: '1-Click Deploy' }
            ].map(item => {
              const isActive = currentStep === item.step;
              const isPassed = currentStep > item.step;
              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => {
                    if (item.step < currentStep) setCurrentStep(item.step as any);
                    else if (item.step === 2 && validateStep1()) setCurrentStep(2);
                    else if (item.step === 3 && validateStep1() && validateStep2()) setCurrentStep(3);
                    else if (item.step === 4 && validateStep1() && validateStep2() && validateStep3()) setCurrentStep(4);
                  }}
                  className={`text-left p-2 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/15 border-cyan-400/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : isPassed
                      ? 'bg-white/[0.04] border-emerald-500/30 text-emerald-300 hover:border-emerald-500/50'
                      : 'bg-white/[0.02] border-white/5 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold truncate">{item.label}</span>
                    {isPassed && <Check className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <div className="text-[9.5px] text-slate-400 truncate hidden sm:block">{item.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Wizard Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* ========================================================================= */}
          {/* STAGE 1: PROJECT IDENTITY & VISUALS                                       */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              {/* Project Title */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!tokenName) setTokenName(`${e.target.value} DAO`);
                    if (!tokenSymbol && e.target.value.length >= 3) {
                      setTokenSymbol(e.target.value.replace(/[^A-Za-z]/g, '').substring(0, 4).toUpperCase());
                    }
                  }}
                  placeholder="e.g. Helix: Decentralized CRISPR Genome Sequencing"
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                />
              </div>

              {/* Category Selection with Smart Search Assist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                    <span>Campaign Category *</span>
                    <span className="text-[10px] text-slate-500 font-normal">(10 Curated Domains + Custom)</span>
                  </label>
                  <span className="text-[10.5px] text-cyan-300 font-medium">
                    Active: <strong className="text-white">{category === 'Other / Custom' ? (customCategoryText || 'Custom') : category}</strong>
                  </span>
                </div>

                {/* Smart Search Assist Input Bar */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-indigo-950/30 border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>Smart Search Assist</span>
                      <span className="text-[10px] text-slate-400 font-normal ml-1 hidden sm:inline">
                        Type your reason or cause to discover the best fit
                      </span>
                    </div>
                    {categorySearch && (
                      <button
                        type="button"
                        onClick={() => setCategorySearch('')}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Clear
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="e.g. 'Dog needs surgery', 'Indie game on Steam', 'College tuition', 'Clean solar'..."
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:bg-white/[0.08] transition-all"
                    />
                    {categorySearch && (
                      <button
                        type="button"
                        onClick={() => setCategorySearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                        title="Clear search"
                        aria-label="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Quick Preset Cause Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[9.5px] text-slate-500">Quick test:</span>
                    {[
                      'Dog Vet Bills',
                      'Cancer Surgery',
                      'Flood Relief',
                      'College Tuition',
                      'AI SaaS Tool',
                      'Indie Game',
                      'Cafe Startup'
                    ].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setCategorySearch(chip)}
                        className={`text-[9.5px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          categorySearch === chip
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                            : 'bg-white/[0.04] hover:bg-cyan-500/15 border-white/5 hover:border-cyan-400/30 text-slate-400 hover:text-cyan-200'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Real-time Match Banner Recommendation */}
                  {(() => {
                    const raw = categorySearch.trim().toLowerCase();
                    if (!raw) return null;
                    const tokens = raw.split(/\s+/).filter(t => t.length > 1);

                    const scored = CATEGORIES.map(cat => {
                      let score = 0;
                      const lt = cat.title.toLowerCase();
                      const ls = cat.subtitle.toLowerCase();
                      if (lt.includes(raw)) score += 35;
                      if (ls.includes(raw)) score += 20;
                      tokens.forEach(tok => {
                        if (lt.includes(tok)) score += 15;
                        if (ls.includes(tok)) score += 10;
                        cat.keywords.forEach(kw => {
                          if (kw === tok) score += 12;
                          else if (kw.includes(tok) || tok.includes(kw)) score += 6;
                        });
                      });
                      return { ...cat, score };
                    }).sort((a, b) => b.score - a.score);

                    const top = scored[0];
                    if (!top || top.score <= 0) return null;

                    const matchPercentage = Math.min(99, Math.round(55 + top.score * 5));

                    return (
                      <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-between text-[11px] animate-in fade-in duration-150">
                        <div className="flex items-center gap-1.5 text-slate-200 truncate">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                          <span className="text-slate-400">Smart Match:</span>
                          <strong className="text-cyan-300 font-semibold">{top.title}</strong>
                          <span className="text-[9.5px] text-cyan-400/90 px-1.5 py-0.2 rounded-full bg-cyan-500/20 font-mono">
                            {matchPercentage}% Confidence
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCategory(top.id)}
                          className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer shrink-0 ml-2 ${
                            category === top.id
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                          }`}
                        >
                          {category === top.id ? 'Selected ✓' : 'Auto-Select'}
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* 10 Clean Category Cards + Other / Custom (No Emojis, Lucide Icons) */}
                <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CATEGORIES.map((cat, idx) => {
                      const isSelected = category === cat.id;
                      const Icon = cat.icon;
                      const isCustomCard = cat.id === 'Other / Custom';

                      // Real-time query scoring for this specific card
                      const raw = categorySearch.trim().toLowerCase();
                      let isMatch = false;
                      let isBestMatch = false;
                      if (raw) {
                        const tokens = raw.split(/\s+/).filter(t => t.length > 1);
                        let score = 0;
                        const lt = cat.title.toLowerCase();
                        const ls = cat.subtitle.toLowerCase();
                        if (lt.includes(raw)) score += 35;
                        if (ls.includes(raw)) score += 20;
                        tokens.forEach(tok => {
                          if (lt.includes(tok)) score += 15;
                          if (ls.includes(tok)) score += 10;
                          cat.keywords.forEach(kw => {
                            if (kw === tok) score += 12;
                            else if (kw.includes(tok) || tok.includes(kw)) score += 6;
                          });
                        });
                        if (score > 8) isMatch = true;
                        if (score >= 20) isBestMatch = true;
                      }

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative group flex items-start gap-2.5 ${
                            isCustomCard ? 'col-span-1 sm:col-span-2' : ''
                          } ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                              : isBestMatch
                              ? 'bg-cyan-950/40 border-cyan-400/60 text-slate-200 hover:border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                              : isMatch
                              ? 'bg-white/[0.06] border-cyan-500/30 text-slate-300'
                              : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 hover:bg-white/[0.06]'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-xl shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                                : isBestMatch
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                                : 'bg-white/5 text-cyan-400/80 group-hover:text-cyan-300 group-hover:bg-white/10'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                {cat.title}
                              </span>
                              {isSelected ? (
                                <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              ) : isBestMatch ? (
                                <span className="text-[9px] font-semibold text-cyan-300 px-1.5 py-0.2 rounded-full bg-cyan-500/25 border border-cyan-400/30">
                                  Best Fit
                                </span>
                              ) : isMatch ? (
                                <span className="text-[9px] text-cyan-400/80 px-1 rounded bg-cyan-500/10">
                                  Match
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                              {cat.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Inline Custom Category Input when 'Other / Custom' is selected */}
                  {category === 'Other / Custom' && (
                    <div className="p-3 rounded-2xl bg-cyan-500/[0.08] border border-cyan-400/30 animate-in fade-in slide-in-from-top-1 duration-150 space-y-1.5">
                      <label className="block text-cyan-200 font-semibold text-[11px] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Specify Your Custom Category Name *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customCategoryText}
                        onChange={(e) => setCustomCategoryText(e.target.value)}
                        placeholder="e.g. Investigative Journalism, VR Esports League, Deep Space Exploration..."
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium placeholder-slate-500"
                        autoFocus
                      />
                      <p className="text-[10px] text-slate-400">
                        This custom category tag will be registered with your escrow vault and displayed to backers.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Overview */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Project Overview & Objectives *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your breakthrough innovation, key technical challenges, and why backer community funding accelerates your timeline..."
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs resize-none"
                />
              </div>

              {/* Cover Artwork: Fully Automatic by Category with Custom Override */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cover Artwork</span>
                    <span className="text-[10px] text-emerald-400/90 font-normal bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                      {customImageUrl.trim() ? 'Custom URL Loaded' : `Auto-Assigned from ${category}`}
                    </span>
                  </label>
                  {!customImageUrl.trim() && (
                    <button
                      type="button"
                      onClick={() => setSelectedArtworkIndex(prev => (prev + 1) % 3)}
                      className="text-[10.5px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 bg-white/[0.04] hover:bg-white/[0.08] px-2 py-0.5 rounded-lg border border-white/10 transition-all cursor-pointer"
                      title="Cycle between curated artwork variations for this category"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> Variation {(selectedArtworkIndex % 3) + 1}/3
                    </button>
                  )}
                </div>

                {/* Live High-Gloss Banner Preview */}
                <div className="relative h-28 sm:h-32 rounded-2xl overflow-hidden border border-white/15 shadow-lg group">
                  <img
                    src={activeCoverImage}
                    alt="Campaign Banner Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Dynamic Badges */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[10.5px] text-white font-medium">
                      {customImageUrl.trim() ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                          <span>Custom Creator Artwork</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span>Curated {category} Theme</span>
                        </>
                      )}
                    </div>

                    {customImageUrl.trim() && (
                      <button
                        type="button"
                        onClick={() => setCustomImageUrl('')}
                        className="pointer-events-auto text-[10px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full transition-all cursor-pointer"
                      >
                        Reset to Category Default
                      </button>
                    )}
                  </div>
                </div>

                {/* Custom Image URL Input (Optional Override) */}
                <div className="relative">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Optional: Paste custom artwork URL (https://...) to override category default"
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono placeholder-slate-500"
                  />
                  {customImageUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomImageUrl('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Trust & Social Proof Links */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Trust & Social Proof (Optional but Recommended)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center rounded-xl bg-black/40 border border-white/10 px-2.5 py-1.5 focus-within:border-cyan-400/50">
                    <Video className="w-3.5 h-3.5 text-cyan-400 mr-2 shrink-0" />
                    <input
                      type="url"
                      value={videoPitchUrl}
                      onChange={(e) => setVideoPitchUrl(e.target.value)}
                      placeholder="Video Pitch URL"
                      className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
                    />
                  </div>
                  <div className="flex items-center rounded-xl bg-black/40 border border-white/10 px-2.5 py-1.5 focus-within:border-cyan-400/50">
                    <Github className="w-3.5 h-3.5 text-slate-300 mr-2 shrink-0" />
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="GitHub Repo"
                      className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
                    />
                  </div>
                  <div className="flex items-center rounded-xl bg-black/40 border border-white/10 px-2.5 py-1.5 focus-within:border-cyan-400/50">
                    <Globe className="w-3.5 h-3.5 text-slate-300 mr-2 shrink-0" />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="Official Website"
                      className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: MILESTONE ESCROW VAULT & CAPS                                    */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              {/* Caps & Duration Grid with Liquid Sliders */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Escrow Funding Goals & Duration
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                    100% Milestone-Guaranteed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <LiquidValueSlider
                      label="Soft Cap Goal"
                      value={goalAmount}
                      onChange={(val) => {
                        setGoalAmount(val);
                        if (parseFloat(val) > parseFloat(hardCapAmount)) {
                          setHardCapAmount((parseFloat(val) * 1.5).toFixed(1));
                        }
                      }}
                      min={0.1}
                      max={50}
                      step={0.1}
                      unit="ETH"
                      required
                    />
                    <div className="mt-1 text-[10px] font-mono text-slate-400">
                      ≈ {formatEthToFiat(goalAmount)}
                    </div>
                  </div>

                  <div>
                    <LiquidValueSlider
                      label="Hard Cap Maximum"
                      value={hardCapAmount}
                      onChange={(val) => {
                        if (parseFloat(val) < parseFloat(goalAmount)) {
                          setHardCapAmount(goalAmount);
                        } else {
                          setHardCapAmount(val);
                        }
                      }}
                      min={parseFloat(goalAmount) || 0.1}
                      max={100}
                      step={0.1}
                      unit="ETH"
                      required
                    />
                    <div className="mt-1 text-[10px] font-mono text-slate-400">
                      ≈ {formatEthToFiat(hardCapAmount)}
                    </div>
                  </div>

                  <div>
                    <LiquidValueSlider
                      label="Campaign Duration"
                      value={durationDays}
                      onChange={(val) => setDurationDays(parseInt(val) || 30)}
                      min={7}
                      max={90}
                      step={1}
                      unit="Days"
                      required
                    />
                    <div className="mt-1 text-[10px] font-mono text-slate-400">
                      Closes in ~{Math.round(durationDays / 7)} weeks
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestone Tranche Configurator */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers3 className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Escrow Milestone Tranches</div>
                      <div className="text-[10px] text-slate-400">Funds unlock only when backers audit and approve proof</div>
                    </div>
                  </div>

                  {/* Allocation Status Badge */}
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border ${
                    totalMilestonePercent === 100
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                      : 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                  }`}>
                    <span>Total: {totalMilestonePercent}%</span>
                    {totalMilestonePercent === 100 && <Check className="w-3 h-3" />}
                  </div>
                </div>

                {/* Milestone Cards */}
                <div className="space-y-2.5">
                  {milestones.map((milestone, idx) => {
                    const trancheEth = (softCapNum * (milestone.stagePercent / 100)).toFixed(2);
                    return (
                      <div
                        key={milestone.id}
                        className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={milestone.title}
                              onChange={(e) => handleMilestoneTextChange(milestone.id, 'title', e.target.value)}
                              placeholder={`Milestone ${idx + 1} Title`}
                              className="bg-transparent text-xs font-bold text-white placeholder-slate-500 outline-none flex-1 border-b border-transparent hover:border-white/20 focus:border-cyan-400 transition-all"
                            />
                          </div>

                          {/* Percentage & ETH allocation */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-mono text-cyan-300 font-bold">
                              {trancheEth} ETH
                            </span>
                            <div className="flex items-center rounded-lg bg-black/40 border border-white/10 px-1.5 py-0.5">
                              <input
                                type="number"
                                min={5}
                                max={100}
                                value={milestone.stagePercent}
                                onChange={(e) => handleMilestonePercentChange(milestone.id, parseInt(e.target.value) || 0)}
                                className="w-9 bg-transparent text-xs font-mono font-bold text-white text-right outline-none"
                              />
                              <span className="text-[10px] text-slate-400 font-mono ml-0.5">%</span>
                            </div>
                            {milestones.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMilestone(milestone.id)}
                                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                                title="Remove Milestone"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Description & Timeframe */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                          <input
                            type="text"
                            value={milestone.description}
                            onChange={(e) => handleMilestoneTextChange(milestone.id, 'description', e.target.value)}
                            placeholder="Deliverable details (e.g. Audit certificate, GitHub release, prototype demo)"
                            className="sm:col-span-3 bg-black/30 px-2.5 py-1.5 rounded-lg border border-white/5 text-slate-300 placeholder-slate-500 outline-none focus:border-cyan-400/40"
                          />
                          <input
                            type="text"
                            value={milestone.timeframe}
                            onChange={(e) => handleMilestoneTextChange(milestone.id, 'timeframe', e.target.value)}
                            placeholder="e.g. Month 2"
                            className="bg-black/30 px-2.5 py-1.5 rounded-lg border border-white/5 text-slate-300 placeholder-slate-500 font-mono text-center outline-none focus:border-cyan-400/40"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {milestones.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="w-full py-2 rounded-xl border border-dashed border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Additional Milestone (Up to 4)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: DAO TOKENOMICS & BACKER TIERS                                    */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              {/* DAO Token Settings */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Dedicated DAO Governance Token</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30">
                    ERC-20 + Quadratic Voting
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">Token Name *</label>
                    <input
                      type="text"
                      required
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      placeholder="e.g. Helix Governance Token"
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">Token Symbol *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                      placeholder="e.g. HELIX"
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">Total Supply</label>
                    <input
                      type="text"
                      value={tokenSupply}
                      onChange={(e) => setTokenSupply(e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">Reward Rate (Tokens / 1 ETH)</label>
                    <input
                      type="text"
                      value={tokensPerEth}
                      onChange={(e) => setTokensPerEth(e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Backer Reward Tiers */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Coins className="w-4 h-4 text-cyan-400" />
                    <span>Backer Reward Tiers & Perks</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Pre-configured pledge tiers</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {tiers.map((tier, idx) => (
                    <div
                      key={tier.id}
                      className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                          <span>{tier.title}</span>
                          <span className="text-cyan-300 font-mono">${tier.priceUsd}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight">
                          {tier.description}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10 space-y-1">
                        {tier.perks.slice(0, 2).map((p, i) => (
                          <div key={i} className="text-[9.5px] text-slate-300 flex items-center gap-1 truncate">
                            <span className="text-emerald-400 font-bold">✓</span> {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 4: LIVE SHOWROOM PREVIEW & DEPLOY                                    */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              
              {/* Showroom Bento-Grid Card Live Preview */}
              <div>
                <span className="text-xs font-bold text-slate-300 mb-2 block">
                  Showroom Live Preview (How Backers Will See Your Project):
                </span>
                
                <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-slate-900/90 shadow-2xl p-4 space-y-3">
                  <div className="relative h-32 rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={activeCoverImage}
                      alt={title || 'Preview'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-cyan-300">
                      {category === 'Other / Custom' ? (customCategoryText || 'Custom Initiative') : category}
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 text-[10px] font-bold text-emerald-300">
                      Active Funding
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white truncate">
                      {title || 'Untitled Innovation'}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Escrow Milestone Progress Bar Preview */}
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Milestone Escrow Vaults:</span>
                      <span className="font-mono text-cyan-300 font-bold">{milestones.length} Tranches</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {milestones.map((m, i) => (
                        <div key={m.id} className="h-1.5 rounded-full bg-cyan-500/30 overflow-hidden">
                          <div className="h-full bg-cyan-400" style={{ width: `${m.stagePercent}%` }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                      <span>Soft Cap: {softCapNum} ETH</span>
                      <span className="text-white font-bold">Hard Cap: {hardCapNum} ETH</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Protocol Security Audit Notice */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5 text-[11px] text-slate-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white">ERC-4337 Account Abstraction Milestone Escrow</div>
                  <div className="text-slate-400 text-[10.5px] leading-relaxed">
                    By deploying, you instantiate an OpenZeppelin-audited smart contract escrow vault on Ethereum.
                    All initial pledges remain locked in decentralized escrow and are released tranche-by-tranche based on backer quadratic votes.
                    100% sponsored gasless transaction via FundIt Paymaster.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Footer Controls */}
          {/* Wizard Footer Controls */}
          <div className="pt-3 border-t border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="w-full sm:w-28 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div className="hidden sm:block" />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full sm:w-auto px-6 h-10 rounded-xl liquid-btn-primary text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.35)]"
              >
                <span>Continue to {currentStep === 1 ? 'Escrow Vault' : currentStep === 2 ? 'DAO Tokenomics' : 'Preview'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-7 h-10 rounded-xl liquid-btn-primary text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.45)] disabled:opacity-50"
              >
                {isSubmitting
                  ? (deployStageText || 'Deploying Smart Contract...')
                  : 'Deploy Escrow Campaign & Mint DAO Token'}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
