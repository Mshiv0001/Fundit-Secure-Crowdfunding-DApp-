'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Campaign, SimulatedAccount, BackerTier, MilestoneProposal, RewardTier } from '@/types';
import confetti from 'canvas-confetti';
import { connectLiveWallet, createLiveCampaign, executeLive, loadLiveCampaigns, pledgeLive, proposeLive, refundLive, voteLive } from '@/lib/liveContracts';

interface Web3ContextType {
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  currentAddress: string;
  ethBalance: string;
  simulatedAccounts: SimulatedAccount[];
  activeAccount: SimulatedAccount;
  setActiveAccount: (acc: SimulatedAccount) => void;
  campaigns: Campaign[];
  connectMetaMask: () => Promise<void>;
  disconnectWallet: () => void;
  pledge: (campaignId: string, ethAmount: string) => Promise<{ success: boolean; message: string }>;
  claimRefund: (campaignId: string) => Promise<{ success: boolean; message: string }>;
  proposeMilestone: (
    campaignId: string,
    title: string,
    description: string,
    proofUrl: string,
    requestedEth: string
  ) => Promise<{ success: boolean; message: string }>;
  castVote: (
    campaignId: string,
    proposalId: number,
    support: boolean
  ) => Promise<{ success: boolean; message: string }>;
  executeMilestone: (
    campaignId: string,
    proposalId: number
  ) => Promise<{ success: boolean; message: string }>;
  createNewCampaign: (data: {
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    videoPitchUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
    goalAmount: string;
    hardCapAmount: string;
    durationDays: number;
    tokenName: string;
    tokenSymbol: string;
    tokenSupply?: string;
    milestones?: {
      id: number;
      title: string;
      description: string;
      stagePercent: number;
      timeframe: string;
      amountEth: string;
    }[];
    rewardTiers?: RewardTier[];
  }) => Promise<{ success: boolean; message: string }>;
  isAuthenticated: boolean;
  logout: () => void;
  registerPasskeyWithWebAuthn: (account: { name: string; email?: string; handle?: string }) => Promise<boolean>;
  loginWithSocial: (data: {
    provider: 'google' | 'apple' | 'email' | 'phone';
    email: string;
    name: string;
    avatar?: string;
    handle?: string;
    phone?: string;
  }) => { success: boolean; account: SimulatedAccount };
}

const SIMULATED_ACCOUNTS: SimulatedAccount[] = [
  {
    name: 'Devin Vance',
    handle: '@devin_vance',
    phone: '+1 (555) 012-8821',
    address: '0x71C...8821',
    role: 'Project Founder',
    roleType: 'creator',
    roleDescription: 'Can launch campaigns & submit milestone proofs',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    ethBalance: '14.50',
    passkeyEnabled: true,
    authProvider: 'passkey',
    permissions: {
      canCreateCampaign: true,
      canAuditMilestone: false,
      canVoteGovernance: true,
      canRefundPledge: false,
      canManagePaymaster: false,
      quadraticPowerMultiplier: 1
    }
  },
  {
    name: 'Alice Wright',
    handle: '@alice_backer',
    phone: '+1 (555) 019-4982',
    address: '0xAPL7f2a...441e',
    role: 'Quadratic Backer',
    roleType: 'backer',
    roleDescription: 'Backs projects with quadratic milestone voting',
    email: 'alice.wright@privaterelay.appleid.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    ethBalance: '8.25',
    passkeyEnabled: true,
    authProvider: 'apple',
    permissions: {
      canCreateCampaign: false,
      canAuditMilestone: false,
      canVoteGovernance: true,
      canRefundPledge: true,
      canManagePaymaster: false,
      quadraticPowerMultiplier: 1.5
    }
  },
  {
    name: 'Dr. Aris Thorne',
    handle: '@dr_thorne',
    phone: '+1 (555) 441-2809',
    address: '0x32A...4982',
    role: 'Escrow Arbiter',
    roleType: 'arbiter',
    roleDescription: 'Audits technical proofs & certifies tranche release',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    ethBalance: '24.50',
    passkeyEnabled: true,
    authProvider: 'passkey',
    permissions: {
      canCreateCampaign: false,
      canAuditMilestone: true,
      canVoteGovernance: true,
      canRefundPledge: false,
      canManagePaymaster: false,
      quadraticPowerMultiplier: 2
    }
  },
  {
    name: 'Sarah Jenkins',
    handle: '@sarah_gov',
    phone: '+1 (555) 302-8819',
    address: '0xDAO9b12...8831',
    role: 'DAO Governor',
    roleType: 'governor',
    roleDescription: 'Votes on emergency policies & treasury matching',
    email: 'sarah.jenkins@dao.protocol',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    ethBalance: '31.00',
    passkeyEnabled: true,
    authProvider: 'passkey',
    permissions: {
      canCreateCampaign: false,
      canAuditMilestone: true,
      canVoteGovernance: true,
      canRefundPledge: true,
      canManagePaymaster: false,
      quadraticPowerMultiplier: 3
    }
  },
  {
    name: 'Charlie Stark',
    handle: '@charlie_stark',
    phone: '+44 7911 123456',
    address: '0x99F...1104',
    role: 'Guardian Whale',
    roleType: 'whale',
    roleDescription: 'Lead patron with 4x quadratic voting weight',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    ethBalance: '42.00',
    passkeyEnabled: true,
    authProvider: 'passkey',
    permissions: {
      canCreateCampaign: false,
      canAuditMilestone: false,
      canVoteGovernance: true,
      canRefundPledge: true,
      canManagePaymaster: false,
      quadraticPowerMultiplier: 4,
      badgeTitle: 'Guardian Whale (4x)'
    }
  },
  {
    name: 'Lucas Chen',
    handle: '@lucas_sponsor',
    phone: '+1 (555) 912-4022',
    address: '0xSPN884...772B',
    role: 'Matching Pool Sponsor',
    roleType: 'sponsor',
    roleDescription: 'Supplies liquidity grants to quadratic matching pools',
    email: 'lucas.chen@arbitrum-grants.io',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    ethBalance: '65.00',
    passkeyEnabled: true,
    authProvider: 'google',
    permissions: {
      canCreateCampaign: false,
      canAuditMilestone: false,
      canVoteGovernance: true,
      canRefundPledge: false,
      canManagePaymaster: true,
      canSponsorPool: true,
      quadraticPowerMultiplier: 3.5,
      badgeTitle: 'Grant Sponsor'
    }
  },
  {
    name: 'Marcus Kane',
    handle: '@marcus_admin',
    phone: '+1 (555) 774-2910',
    address: '0xADM0011...991A',
    role: 'Platform Admin',
    roleType: 'admin',
    roleDescription: 'Oversees Paymaster gas limits & creator badges',
    email: 'admin@fundit.protocol',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    ethBalance: '50.00',
    passkeyEnabled: true,
    authProvider: 'passkey',
    permissions: {
      canCreateCampaign: true,
      canAuditMilestone: true,
      canVoteGovernance: true,
      canRefundPledge: true,
      canManagePaymaster: true,
      quadraticPowerMultiplier: 1
    }
  },
  {
    name: 'Elena Rostova',
    handle: '@elena_curator',
    phone: '+44 20 7946 0991',
    address: '0x10C...0D26',
    role: 'Ecosystem Curator',
    roleType: 'curator',
    roleDescription: 'Vets innovations for matching pool grants',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    ethBalance: '12.80',
    passkeyEnabled: false,
    authProvider: 'metamask',
    permissions: {
      canCreateCampaign: true,
      canAuditMilestone: true,
      canVoteGovernance: true,
      canRefundPledge: false,
      canManagePaymaster: false,
      quadraticPowerMultiplier: 2
    }
  },
  {
    name: 'Maya Lin',
    handle: '@maya_new',
    phone: '+1 (555) 890-1123',
    address: '0x55E...3321',
    role: 'First-Time User',
    roleType: 'new_user',
    roleDescription: 'Clean-slate account testing 1st pledge flow',
    email: 'maya.lin@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    ethBalance: '0.50',
    passkeyEnabled: true,
    authProvider: 'google',
    permissions: {
      canCreateCampaign: false,
      canAuditMilestone: false,
      canVoteGovernance: false,
      canRefundPledge: false,
      canManagePaymaster: false,
      quadraticPowerMultiplier: 1
    }
  }
];

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    address: '0xB7A5bd0345EF1Cc5E66bf61BdeC17D2461fBd968',
    tokenAddress: '0xa16E02E87b7454126E5E10d957A927A7F5B5d2be',
    title: 'NeuroMesh: Decentralized AI Compute Grid',
    description: 'An open peer-to-peer compute layer that turns consumer and datacenter GPUs into an anti-censorship AI training supercluster with zero-knowledge verification.',
    category: 'AI & Infrastructure',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    videoPitchUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-motherboard-with-glowing-circuits-40893-large.mp4',
    creator: '0x71C...8821',
    creatorName: 'Devin Vance',
    creatorHandle: '@devin_vance',
    isVerified: true,
    goalAmount: '8.0',
    hardCapAmount: '15.0',
    totalRaised: '4.8',
    fundsReleased: '0.0',
    escrowBalance: '4.8',
    deadline: Math.floor(Date.now() / 1000) + 12 * 86400,
    state: 'Active',
    backerCount: 34,
    tokenName: 'NeuroMesh Governance Token',
    tokenSymbol: 'NMESH',
    rewardTiers: [
      {
        id: 'tier-1',
        title: 'Early Pioneer Pass',
        priceUsd: 25,
        priceInr: 2100,
        ethAmount: '0.007',
        description: 'First access to testnet nodes, discord patron role, and voting rights on milestone releases.',
        perks: ['Discord VIP Role', 'Early Node Client Beta', 'Quadratic Voting Power'],
        estimatedDelivery: 'Nov 2026',
        backerCount: 18
      },
      {
        id: 'tier-2',
        title: 'GPU Contributor Bundle',
        priceUsd: 100,
        priceInr: 8300,
        ethAmount: '0.028',
        description: 'High-bandwidth subnet priority, 1,000 NMESH governance tokens, and direct line with core devs.',
        perks: ['1,000 NMESH Tokens', 'Priority Compute Access', 'Quarterly Dev Roundtable'],
        estimatedDelivery: 'Dec 2026',
        backerCount: 12,
        popular: true
      },
      {
        id: 'tier-3',
        title: 'Cluster Validator Patron',
        priceUsd: 500,
        priceInr: 41500,
        ethAmount: '0.142',
        description: 'Dedicated GPU cluster slice, permanent recognition on protocol genesis block, and 4x quadratic voting weight.',
        perks: ['Genesis Block Engraving', 'Dedicated Compute Slice', '4x Quadratic Voting Weight'],
        estimatedDelivery: 'Jan 2027',
        backerCount: 4
      }
    ],
    releaseHistory: [],
    proposals: [
      {
        id: 1,
        title: 'Tranche 1: Cluster Testnet & Micro-benchmarking',
        description: 'Deploying initial 64-node cluster across decentralized nodes and releasing latency benchmarks on GitHub.',
        proofUrl: 'https://github.com/neuromesh/testnet-alpha',
        requestedAmount: '2.0',
        votingDeadline: Math.floor(Date.now() / 1000) + 4 * 86400,
        forVotesSqrt: 48,
        againstVotesSqrt: 6,
        voterCount: 22,
        executed: false,
        passed: false,
        userVoted: false
      }
    ],
    userContribution: {
      amount: '0.2',
      tier: 'Patron',
      tokenBalance: 250,
      quadraticPower: 15,
      refunded: false
    }
  },
  {
    id: 'camp-2',
    address: '0x10C6E9530F1C1AF873a391030a1D9E8ed0630D26',
    tokenAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    title: 'CipherOS: Hardware-Enforced ZK Mobile Platform',
    description: 'An open-source RISC-V mobile phone OS providing hardware-level cryptographic isolation, automated wallet security, and decentralized identity by default.',
    category: 'Privacy & Hardware',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    videoPitchUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-a-green-screen-41532-large.mp4',
    creator: '0x71C...8821',
    creatorName: 'Elena Rostova',
    creatorHandle: '@elena_zk',
    isVerified: true,
    goalAmount: '3.0',
    hardCapAmount: '6.0',
    totalRaised: '4.2',
    fundsReleased: '0.0',
    escrowBalance: '4.2',
    deadline: Math.floor(Date.now() / 1000) + 18 * 86400,
    state: 'GoalReached',
    backerCount: 58,
    tokenName: 'CipherOS DAO',
    tokenSymbol: 'CIPHER',
    rewardTiers: [
      {
        id: 'tier-c1',
        title: 'CipherOS Community Edition',
        priceUsd: 35,
        priceInr: 2900,
        ethAmount: '0.01',
        description: 'Full source flashable image for Pixel & PinePhone with lifetime OTA security updates.',
        perks: ['Full Source Image', 'Zero-Knowledge OTA Updates', 'Hardware Keypair Tooling'],
        estimatedDelivery: 'Oct 2026',
        backerCount: 34
      },
      {
        id: 'tier-c2',
        title: 'Developer Edition Handset',
        priceUsd: 350,
        priceInr: 29000,
        ethAmount: '0.10',
        description: 'Physical RISC-V development handset with hardware kill-switches and preloaded CipherOS image.',
        perks: ['Physical Hardware Handset', 'Hardware Kill Switches', '1-on-1 Dev Support'],
        estimatedDelivery: 'Jan 2027',
        backerCount: 24,
        popular: true
      }
    ],
    releaseHistory: [],
    proposals: [
      {
        id: 1,
        title: 'Milestone 1: Kernel Hardening & ZK Proof Verification',
        description: 'Completed memory-safe microkernel integration and audited cryptographic primitives. Formal verification report attached on IPFS.',
        proofUrl: 'https://ipfs.io/ipfs/QmZtmD2VDWhYMRB1Xy5mGM1w57cWKhSj4d3C2W4',
        requestedAmount: '1.2',
        votingDeadline: Math.floor(Date.now() / 1000) + 2 * 86400,
        forVotesSqrt: 84,
        againstVotesSqrt: 12,
        voterCount: 39,
        executed: false,
        passed: false,
        userVoted: false
      }
    ],
    userContribution: {
      amount: '1.0',
      tier: 'Guardian',
      tokenBalance: 1500,
      quadraticPower: 38,
      refunded: false
    }
  },
  {
    id: 'camp-3',
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    tokenAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    title: 'SolarDAO: Peer-to-Peer Clean Energy Microgrid',
    description: 'Decentralized local solar generation and battery storage with automated smart contract settlement across 120 residential households.',
    category: 'Climate & Energy',
    imageUrl: '/solar-microgrid-cover.svg',
    creator: '0x48B...3390',
    creatorName: 'Rajiv Mehta',
    creatorHandle: '@rajiv_solar',
    isVerified: true,
    goalAmount: '5.0',
    hardCapAmount: '10.0',
    totalRaised: '1.4',
    fundsReleased: '0.0',
    escrowBalance: '1.4',
    deadline: Math.floor(Date.now() / 1000) - 86400, // Deadline passed (unmet goal)
    state: 'Failed',
    backerCount: 12,
    tokenName: 'SolarDAO Energy Share',
    tokenSymbol: 'SOLAR',
    rewardTiers: [],
    releaseHistory: [],
    proposals: [],
    userContribution: {
      amount: '0.5',
      tier: 'Guardian',
      tokenBalance: 750,
      quadraticPower: 27,
      refunded: false
    }
  },
  {
    id: 'camp-4',
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
    tokenAddress: '0x976EA74026E72CD55542b0409F3A412217e92B03',
    title: 'BioSynth: Open Distributed Protein Folding AI',
    description: 'Crowdfunded therapeutic drug discovery pipeline democratizing target synthesis for rare and neglected genetic diseases.',
    category: 'Biotech & Science',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    creator: '0x32A...4982',
    creatorName: 'Dr. Aris Thorne',
    creatorHandle: '@dr_thorne',
    isVerified: true,
    goalAmount: '10.0',
    hardCapAmount: '20.0',
    totalRaised: '9.4',
    fundsReleased: '3.0',
    escrowBalance: '6.4',
    deadline: Math.floor(Date.now() / 1000) + 8 * 86400,
    state: 'Active',
    backerCount: 88,
    tokenName: 'BioSynth Discovery',
    tokenSymbol: 'BIOS',
    rewardTiers: [
      {
        id: 'tier-b1',
        title: 'Open Science Supporter',
        priceUsd: 50,
        priceInr: 4150,
        ethAmount: '0.014',
        description: 'Name listed on open publication acknowledgments + real-time access to folding visualizer.',
        perks: ['Publication Credit', 'Real-time Folding Visualizer', 'Discord Research Channel'],
        estimatedDelivery: 'Immediate',
        backerCount: 42
      },
      {
        id: 'tier-b2',
        title: 'Target Naming Right',
        priceUsd: 250,
        priceInr: 20750,
        ethAmount: '0.071',
        description: 'Sponsor the computational run for a specific target disease and receive the raw molecular simulation dataset.',
        perks: ['Target Designation', 'Raw Simulation Dataset', 'Virtual Lab Tour with Dr. Thorne'],
        estimatedDelivery: 'Dec 2026',
        backerCount: 16,
        popular: true
      }
    ],
    releaseHistory: [
      {
        id: 'rel-1',
        timestamp: Math.floor(Date.now() / 1000) - 2 * 86400,
        milestoneTitle: 'Phase 1: In-silico Target Screening & Wet Lab Validation',
        amountEth: '3.0',
        stagePercent: 30,
        txReceiptId: 'RCPT-BIOS-883921',
        verifiedProofs: ['https://github.com/biosynth/screening-v1', 'IPFS #QmTargetScreening']
      }
    ],
    proposals: [
      {
        id: 1,
        title: 'Phase 1 Target Screening & Wet Lab Validation',
        description: 'Completed in-silico screening of 1.2M candidate molecules against kinase targets.',
        proofUrl: 'https://github.com/biosynth/screening-v1',
        requestedAmount: '3.0',
        votingDeadline: Math.floor(Date.now() / 1000) - 10000,
        forVotesSqrt: 120,
        againstVotesSqrt: 8,
        voterCount: 65,
        executed: true,
        passed: true,
        userVoted: true
      }
    ]
  }
];

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [simulatedAccounts, setSimulatedAccounts] = useState<SimulatedAccount[]>(SIMULATED_ACCOUNTS);
  const [activeAccount, setActiveAccount] = useState<SimulatedAccount>(SIMULATED_ACCOUNTS[1]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [realAccount, setRealAccount] = useState<string>('');
  const [realBalance, setRealBalance] = useState<string>('0.00');
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [isStorageLoaded, setIsStorageLoaded] = useState<boolean>(false);

  // Restore saved campaigns (including newly deployed user campaigns) from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fundit_persistent_campaigns_v2');
        if (saved) {
          const parsed: Campaign[] = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Keep user-created campaigns and merge missing default campaigns
            const existingIds = new Set(parsed.map(c => c.id));
            const missingDefaults = INITIAL_CAMPAIGNS.filter(c => !existingIds.has(c.id));
            setCampaigns([...parsed, ...missingDefaults]);
          }
        }
      } catch (e) {
        console.warn('Failed to load campaigns from localStorage', e);
      } finally {
        setIsStorageLoaded(true);
      }
    }
  }, []);

  // Persist any campaign changes (new campaigns, pledges, votes) to localStorage
  useEffect(() => {
    if (isStorageLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem('fundit_persistent_campaigns_v2', JSON.stringify(campaigns));
      } catch (e) {
        console.warn('Failed to sync campaigns to localStorage', e);
      }
    }
  }, [campaigns, isStorageLoaded]);

  // Restore saved session if user logged in with Apple or Google
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fundit_active_account');
        if (saved) {
          const parsed: SimulatedAccount = JSON.parse(saved);
          if (parsed && parsed.name && parsed.address) {
            setActiveAccount(parsed);
            setIsAuthenticated(true);
            setSimulatedAccounts((prev) => {
              if (!prev.some((a) => a.address === parsed.address)) {
                return [parsed, ...prev];
              }
              return prev;
            });
          }
        }
      } catch (e) {
        console.warn('Failed to parse saved account', e);
      }
    }
  }, []);

  const logout = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('fundit_active_account');
      } catch (e) {
        console.warn('Failed to clear saved account', e);
      }
    }
    setIsAuthenticated(false);
    setActiveAccount({
      name: 'Guest Backer',
      handle: '@guest',
      phone: '',
      address: '0x000...0000',
      role: 'Guest Explorer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      ethBalance: '0.00',
      passkeyEnabled: false
    });
  };

  const registerPasskeyWithWebAuthn = async (account: { name: string; email?: string; handle?: string }): Promise<boolean> => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const userId = new TextEncoder().encode(account.email || account.name || 'user');

        const credential = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: 'Fund It Protocol' },
            user: {
              id: userId,
              name: account.email || `${account.handle || 'user'}@fundit.protocol`,
              displayName: account.name,
            },
            pubKeyCredParams: [
              { type: 'public-key', alg: -7 },   // ES256
              { type: 'public-key', alg: -257 }  // RS256
            ],
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              userVerification: 'preferred'
            },
            timeout: 45000,
            attestation: 'none'
          }
        });
        return !!credential;
      } catch (err: any) {
        console.warn('WebAuthn biometric hardware registration info:', err);
        return false;
      }
    }
    return false;
  };

  const loginWithSocial = (data: {
    provider: 'google' | 'apple' | 'email' | 'phone';
    email: string;
    name: string;
    avatar?: string;
    handle?: string;
    phone?: string;
  }) => {
    let hash = 0;
    for (let i = 0; i < data.email.length; i++) {
      hash = (hash << 5) - hash + data.email.charCodeAt(i);
      hash |= 0;
    }
    const hexSlice = Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
    const prefix = data.provider === 'apple' ? 'APL' : data.provider === 'email' ? 'EML' : data.provider === 'phone' ? 'PHN' : 'GGL';
    const suffix = data.provider === 'apple' ? '441e' : data.provider === 'email' ? '68Fa' : data.provider === 'phone' ? '77C2' : '9B2a';
    const address = `0x${prefix}${hexSlice}...${suffix}`;
    const handle = data.handle || `@${data.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const avatar = data.avatar || (data.provider === 'google'
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      : data.provider === 'apple'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80');

    const newAccount: SimulatedAccount = {
      name: data.name,
      handle,
      email: data.email,
      phone: data.phone || (data.provider === 'apple' ? '+1 (555) 019-4982' : data.provider === 'phone' ? '+1 (555) 302-8819' : '+91 98201 33901'),
      address,
      role: data.provider === 'apple'
        ? 'Verified Patron (Apple ID)'
        : data.provider === 'email'
          ? 'Verified Patron (Email Smart Account)'
          : data.provider === 'phone'
            ? 'Verified Patron (Phone OTP)'
            : 'Verified Backer (Google)',
      avatar,
      ethBalance: '15.50',
      passkeyEnabled: true,
      authProvider: data.provider
    };

    setActiveAccount(newAccount);
    setIsAuthenticated(true);
    setIsDemoMode(true);

    setSimulatedAccounts((prev) => {
      const filtered = prev.filter((a) => a.address !== newAccount.address && a.email !== newAccount.email && a.name !== newAccount.name);
      return [newAccount, ...filtered];
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fundit_active_account', JSON.stringify(newAccount));
      } catch (e) {
        console.warn('localStorage save failed', e);
      }
    }

    return { success: true, account: newAccount };
  };

  const handleSetActiveAccount = (acc: SimulatedAccount) => {
    setActiveAccount(acc);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fundit_active_account', JSON.stringify(acc));
      } catch (e) { }
    }
  };

  const currentAddress = isDemoMode ? activeAccount.address : (realAccount || '0x000...0000');
  const ethBalance = isDemoMode ? activeAccount.ethBalance : realBalance;

  const refreshLiveCampaigns = async (account?: string) => {
    const onChainCampaigns = await loadLiveCampaigns(account || realAccount || undefined);
    setCampaigns(onChainCampaigns);
  };

  // Connect MetaMask and load campaigns from the configured contract factory.
  const connectMetaMask = async () => {
    try {
      const wallet = await connectLiveWallet();
      setRealAccount(wallet.address);
      setRealBalance(Number(wallet.balance).toFixed(4));
      setIsDemoMode(false);
      await refreshLiveCampaigns(wallet.address);
    } catch (err: any) {
      console.error('MetaMask connection error:', err);
      alert(err?.message || 'Unable to connect to MetaMask.');
    }
  };

  const disconnectWallet = () => {
    setRealAccount('');
    setIsDemoMode(true);
  };

  // Pledge function with tier calculation & quadratic tokens
  const pledge = async (campaignId: string, ethAmount: string) => {
    const val = parseFloat(ethAmount);
    if (isNaN(val) || val <= 0) {
      return { success: false, message: 'Please enter a valid ETH amount.' };
    }
    if (val < 0.01) {
      return { success: false, message: 'Minimum pledge is 0.01 ETH for Supporter Tier.' };
    }

    if (!isDemoMode) {
      try { await pledgeLive(campaignId, ethAmount); await refreshLiveCampaigns(); return { success: true, message: 'Pledge confirmed on Sepolia.' }; }
      catch (err: any) { return { success: false, message: err?.shortMessage || err?.message || 'Pledge failed.' }; }
    }

    // Determine tier & bonus
    let tier: BackerTier = 'Supporter';
    let bonus = 1.0;
    if (val >= 0.5) {
      tier = 'Guardian';
      bonus = 1.5;
    } else if (val >= 0.1) {
      tier = 'Patron';
      bonus = 1.25;
    }

    const tokensToMint = Math.floor(val * 1000 * bonus);
    const quadPower = Math.floor(Math.sqrt(tokensToMint));

    setCampaigns(prev =>
      prev.map(c => {
        if (c.id === campaignId) {
          const newRaised = (parseFloat(c.totalRaised) + val).toFixed(2);
          const newEscrow = (parseFloat(c.escrowBalance) + val).toFixed(2);
          const reachedGoal = parseFloat(newRaised) >= parseFloat(c.goalAmount);
          const updatedState = reachedGoal ? 'GoalReached' : c.state;

          const existingContribution = c.userContribution;
          const totalVal = existingContribution ? parseFloat(existingContribution.amount) + val : val;
          const totalTokens = existingContribution ? existingContribution.tokenBalance + tokensToMint : tokensToMint;

          return {
            ...c,
            totalRaised: newRaised,
            escrowBalance: newEscrow,
            state: updatedState,
            backerCount: c.backerCount + 1,
            userContribution: {
              amount: totalVal.toFixed(2),
              tier,
              tokenBalance: totalTokens,
              quadraticPower: Math.floor(Math.sqrt(totalTokens)),
              refunded: false
            }
          };
        }
        return c;
      })
    );

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch { }

    return {
      success: true,
      message: `Successfully pledged ${ethAmount} ETH as ${tier}! Minted ${tokensToMint} DAO tokens (Quadratic Voting Weight: ${quadPower}).`
    };
  };

  // Claim trustless pull refund
  const claimRefund = async (campaignId: string) => {
    if (!isDemoMode) {
      try { await refundLive(campaignId); await refreshLiveCampaigns(); return { success: true, message: 'Refund confirmed on Sepolia.' }; }
      catch (err: any) { return { success: false, message: err?.shortMessage || err?.message || 'Refund failed.' }; }
    }
    let refundAmount = '0.00';
    setCampaigns(prev =>
      prev.map(c => {
        if (c.id === campaignId && c.userContribution && !c.userContribution.refunded) {
          refundAmount = c.userContribution.amount;
          return {
            ...c,
            escrowBalance: (parseFloat(c.escrowBalance) - parseFloat(refundAmount)).toFixed(2),
            userContribution: {
              ...c.userContribution,
              amount: '0.00',
              tokenBalance: 0,
              quadraticPower: 0,
              refunded: true
            }
          };
        }
        return c;
      })
    );

    if (parseFloat(refundAmount) > 0) {
      return {
        success: true,
        message: `Pull-Refund of ${refundAmount} ETH successfully processed and returned to your wallet address via Checks-Effects-Interactions!`
      };
    }
    return { success: false, message: 'No eligible contribution found to refund.' };
  };

  // Submit milestone proposal
  const proposeMilestone = async (
    campaignId: string,
    title: string,
    description: string,
    proofUrl: string,
    requestedEth: string
  ) => {
    if (!isDemoMode) {
      try { await proposeLive(campaignId, title, description, proofUrl, requestedEth); await refreshLiveCampaigns(); return { success: true, message: 'Milestone proposal confirmed on Sepolia.' }; }
      catch (err: any) { return { success: false, message: err?.shortMessage || err?.message || 'Proposal failed.' }; }
    }

    const amountNum = parseFloat(requestedEth);
    if (!title || !description || isNaN(amountNum) || amountNum <= 0) {
      return { success: false, message: 'Please provide valid milestone details and ETH request.' };
    }

    let createdId = 1;
    setCampaigns(prev =>
      prev.map(c => {
        if (c.id === campaignId) {
          createdId = c.proposals.length + 1;
          const newProposal: MilestoneProposal = {
            id: createdId,
            title,
            description,
            proofUrl: proofUrl || 'https://github.com/milestones/proof',
            requestedAmount: amountNum.toFixed(2),
            votingDeadline: Math.floor(Date.now() / 1000) + 3 * 86400,
            forVotesSqrt: 0,
            againstVotesSqrt: 0,
            voterCount: 0,
            executed: false,
            passed: false,
            userVoted: false
          };
          return {
            ...c,
            proposals: [newProposal, ...c.proposals]
          };
        }
        return c;
      })
    );

    return {
      success: true,
      message: `Milestone Proposal #${createdId} published to DAO. Backers can now cast quadratic votes!`
    };
  };

  // Cast quadratic vote on proposal
  const castVote = async (campaignId: string, proposalId: number, support: boolean) => {
    if (!isDemoMode) {
      try { await voteLive(campaignId, proposalId, support); await refreshLiveCampaigns(); return { success: true, message: 'Vote confirmed on Sepolia.' }; }
      catch (err: any) { return { success: false, message: err?.shortMessage || err?.message || 'Vote failed.' }; }
    }
    const powerMultiplier = activeAccount.permissions?.quadraticPowerMultiplier || 1;
    let votePower = Math.round(10 * powerMultiplier);
    setCampaigns(prev =>
      prev.map(c => {
        if (c.id === campaignId) {
          const basePower = c.userContribution?.quadraticPower || 12;
          const backerPower = Math.round(basePower * powerMultiplier);
          votePower = backerPower;
          const updatedProposals = c.proposals.map(p => {
            if (p.id === proposalId && !p.userVoted) {
              return {
                ...p,
                voterCount: p.voterCount + 1,
                forVotesSqrt: support ? p.forVotesSqrt + backerPower : p.forVotesSqrt,
                againstVotesSqrt: !support ? p.againstVotesSqrt + backerPower : p.againstVotesSqrt,
                userVoted: true
              };
            }
            return p;
          });
          return { ...c, proposals: updatedProposals };
        }
        return c;
      })
    );

    return {
      success: true,
      message: `Cast quadratic vote ${support ? 'FOR' : 'AGAINST'} with ${votePower} quadratic voting power (sqrt(tokens))!`
    };
  };

  // Execute milestone disbursement
  const executeMilestone = async (campaignId: string, proposalId: number) => {
    if (!isDemoMode) {
      try { await executeLive(campaignId, proposalId); await refreshLiveCampaigns(); return { success: true, message: 'Milestone execution confirmed on Sepolia.' }; }
      catch (err: any) { return { success: false, message: err?.shortMessage || err?.message || 'Execution failed.' }; }
    }
    let releasedAmount = '0.0';
    setCampaigns(prev =>
      prev.map(c => {
        if (c.id === campaignId) {
          const updatedProposals = c.proposals.map(p => {
            if (p.id === proposalId && !p.executed) {
              releasedAmount = p.requestedAmount;
              return {
                ...p,
                executed: true,
                passed: true
              };
            }
            return p;
          });
          const newEscrow = (parseFloat(c.escrowBalance) - parseFloat(releasedAmount)).toFixed(2);
          const newReleased = (parseFloat(c.fundsReleased) + parseFloat(releasedAmount)).toFixed(2);
          return {
            ...c,
            escrowBalance: newEscrow,
            fundsReleased: newReleased,
            proposals: updatedProposals
          };
        }
        return c;
      })
    );

    return {
      success: true,
      message: `Milestone executed! ${releasedAmount} ETH released from escrow to campaign creator address.`
    };
  };

  // Create new campaign
  const createNewCampaign = async (data: {
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    videoPitchUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
    goalAmount: string;
    hardCapAmount: string;
    durationDays: number;
    tokenName: string;
    tokenSymbol: string;
    tokenSupply?: string;
    milestones?: {
      id: number;
      title: string;
      description: string;
      stagePercent: number;
      timeframe: string;
      amountEth: string;
    }[];
    rewardTiers?: RewardTier[];
  }) => {
    if (!isDemoMode) {
      try { await createLiveCampaign(data); await refreshLiveCampaigns(); return { success: true, message: 'Campaign deployed on Sepolia.' }; }
      catch (err: any) { return { success: false, message: err?.shortMessage || err?.message || 'Campaign deployment failed.' }; }
    }

    const goalNum = parseFloat(data.goalAmount) || 5.0;

    const initialProposals: MilestoneProposal[] = data.milestones && data.milestones.length > 0
      ? data.milestones.map((m, idx) => ({
          id: m.id || idx + 1,
          title: m.title,
          description: m.description,
          proofUrl: data.githubUrl || 'https://github.com/fundit-protocol/proofs',
          requestedAmount: m.amountEth || (goalNum * (m.stagePercent / 100)).toFixed(2),
          votingDeadline: Math.floor(Date.now() / 1000) + (idx + 1) * 30 * 86400,
          forVotesSqrt: 0,
          againstVotesSqrt: 0,
          voterCount: 0,
          executed: false,
          passed: false
        }))
      : [
          {
            id: 1,
            title: 'Phase 1: Architecture & Smart Contract Audit',
            description: 'Complete formal verification and OpenZeppelin security audit.',
            proofUrl: data.githubUrl || 'https://github.com/fundit-protocol',
            requestedAmount: (goalNum * 0.4).toFixed(2),
            votingDeadline: Math.floor(Date.now() / 1000) + 30 * 86400,
            forVotesSqrt: 0,
            againstVotesSqrt: 0,
            voterCount: 0,
            executed: false,
            passed: false
          },
          {
            id: 2,
            title: 'Phase 2: Alpha Testnet & Backer Testing',
            description: 'Deploy MVP testnet contract and enable private tester sandbox.',
            proofUrl: data.githubUrl || 'https://github.com/fundit-protocol',
            requestedAmount: (goalNum * 0.3).toFixed(2),
            votingDeadline: Math.floor(Date.now() / 1000) + 60 * 86400,
            forVotesSqrt: 0,
            againstVotesSqrt: 0,
            voterCount: 0,
            executed: false,
            passed: false
          },
          {
            id: 3,
            title: 'Phase 3: Production Mainnet & Public Launch',
            description: 'Mainnet contract deployment with liquidity pools and full governance.',
            proofUrl: data.githubUrl || 'https://github.com/fundit-protocol',
            requestedAmount: (goalNum * 0.3).toFixed(2),
            votingDeadline: Math.floor(Date.now() / 1000) + 90 * 86400,
            forVotesSqrt: 0,
            againstVotesSqrt: 0,
            voterCount: 0,
            executed: false,
            passed: false
          }
        ];

    const finalRewardTiers: RewardTier[] = data.rewardTiers && data.rewardTiers.length > 0
      ? data.rewardTiers
      : [
          {
            id: `tier-${Date.now()}-1`,
            title: 'Early Supporter',
            priceUsd: 25,
            priceInr: 2100,
            ethAmount: (goalNum * 0.005).toFixed(3),
            description: 'Project Discord role, newsletter, and voting rights in Milestone Vaults.',
            perks: ['Supporter Badge', 'Milestone Voting Rights', 'Private Community Access'],
            estimatedDelivery: 'Q1 2027',
            backerCount: 0
          },
          {
            id: `tier-${Date.now()}-2`,
            title: 'Protocol Patron',
            priceUsd: 100,
            priceInr: 8400,
            ethAmount: (goalNum * 0.02).toFixed(3),
            description: '1.25x Quadratic voting power, early beta access, and commemorative NFT.',
            perks: ['1.25x QF Voting Power', 'Early Alpha Access', 'Commemorative Backer NFT'],
            estimatedDelivery: 'Q2 2027',
            popular: true,
            backerCount: 0
          },
          {
            id: `tier-${Date.now()}-3`,
            title: "Founder's Circle",
            priceUsd: 500,
            priceInr: 42000,
            ethAmount: (goalNum * 0.1).toFixed(3),
            description: '1.5x Quadratic voting power, quarterly AMA with founders, and VIP governance role.',
            perks: ['1.5x QF Voting Power', 'Quarterly Founder AMA', 'VIP Governance Tag'],
            estimatedDelivery: 'Q3 2027',
            backerCount: 0
          }
        ];

    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      address: `0x${Math.random().toString(16).substring(2, 42).padEnd(40, '0')}`,
      tokenAddress: `0x${Math.random().toString(16).substring(2, 42).padEnd(40, '0')}`,
      title: data.title,
      description: data.description,
      category: data.category,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      videoPitchUrl: data.videoPitchUrl,
      githubUrl: data.githubUrl,
      websiteUrl: data.websiteUrl,
      creator: currentAddress,
      creatorName: activeAccount.name,
      creatorHandle: activeAccount.handle || '@creator',
      isVerified: true,
      goalAmount: data.goalAmount,
      hardCapAmount: data.hardCapAmount,
      totalRaised: '0.00',
      fundsReleased: '0.00',
      escrowBalance: '0.00',
      deadline: Math.floor(Date.now() / 1000) + data.durationDays * 86400,
      state: 'Active',
      backerCount: 0,
      tokenName: data.tokenName,
      tokenSymbol: data.tokenSymbol,
      rewardTiers: finalRewardTiers,
      releaseHistory: [],
      proposals: initialProposals
    };

    setCampaigns(prev => {
      const updated = [newCamp, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('fundit_persistent_campaigns_v2', JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to immediately save new campaign', e);
        }
      }
      return updated;
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti optional
    }

    return {
      success: true,
      message: `Campaign "${data.title}" deployed! DAO token ${data.tokenSymbol} created.`
    };
  };

  return (
    <Web3Context.Provider
      value={{
        isDemoMode,
        setIsDemoMode,
        currentAddress,
        ethBalance,
        simulatedAccounts,
        activeAccount,
        setActiveAccount: handleSetActiveAccount,
        isAuthenticated,
        logout,
        registerPasskeyWithWebAuthn,
        campaigns,
        connectMetaMask,
        disconnectWallet,
        pledge,
        claimRefund,
        proposeMilestone,
        castVote,
        executeMilestone,
        createNewCampaign,
        loginWithSocial
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
