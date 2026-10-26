export type CampaignState = 'Active' | 'GoalReached' | 'Failed' | 'Paused';
export type BackerTier = 'None' | 'Supporter' | 'Patron' | 'Guardian';

export interface MilestoneProposal {
  id: number;
  title: string;
  description: string;
  proofUrl: string;
  requestedAmount: string; // in ETH
  votingDeadline: number;   // timestamp in seconds
  forVotesSqrt: number;
  againstVotesSqrt: number;
  voterCount: number;
  executed: boolean;
  passed: boolean;
  userVoted?: boolean;
}

export interface UserPledgeInfo {
  amount: string;          // in ETH
  tier: BackerTier;
  tokenBalance: number;
  quadraticPower: number;  // Math.floor(Math.sqrt(tokenBalance))
  refunded: boolean;
}

export interface RewardTier {
  id: string;
  title: string;
  priceUsd: number;
  priceInr: number;
  ethAmount: string;
  description: string;
  perks: string[];
  estimatedDelivery: string;
  backerCount: number;
  popular?: boolean;
}

export interface EscrowReleaseEvent {
  id: string;
  timestamp: number;
  milestoneTitle: string;
  amountEth: string;
  stagePercent: number;
  txReceiptId: string;
  verifiedProofs: string[];
}

export interface Campaign {
  id: string;
  address: string;
  tokenAddress: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  videoPitchUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  creator: string;
  creatorName: string;
  creatorHandle: string;
  isVerified: boolean;
  goalAmount: string;      // in ETH
  hardCapAmount: string;  // in ETH
  totalRaised: string;     // in ETH
  fundsReleased: string;   // in ETH
  escrowBalance: string;   // in ETH
  deadline: number;        // timestamp in seconds
  state: CampaignState;
  backerCount: number;
  tokenSymbol: string;
  tokenName: string;
  proposals: MilestoneProposal[];
  rewardTiers?: RewardTier[];
  releaseHistory?: EscrowReleaseEvent[];
  userContribution?: UserPledgeInfo;
}

export type PlatformRole = 
  | 'creator'       // Project Founder / Campaign Creator
  | 'backer'        // Verified Patron / Quadratic Backer
  | 'arbiter'       // Milestone Arbiter / Escrow Dispute Verifier
  | 'governor'      // DAO Governance Council Member
  | 'whale'         // Guardian Whale / Angel Patron
  | 'sponsor'       // Matching Pool Grant Sponsor / Foundation
  | 'admin'         // Platform Admin / Security Steward
  | 'curator'       // Ecosystem Curator / Discovery Scout
  | 'new_user';     // New First-Time Backer (Clean Slate)

export interface SimulatedAccount {
  name: string;
  handle: string;
  phone: string;
  address: string;
  role: string;
  roleType?: PlatformRole;
  roleDescription?: string;
  avatar: string;
  ethBalance: string;
  passkeyEnabled: boolean;
  email?: string;
  authProvider?: 'google' | 'apple' | 'phone' | 'email' | 'metamask' | 'passkey';
  permissions?: {
    canCreateCampaign?: boolean;
    canAuditMilestone?: boolean;
    canVoteGovernance?: boolean;
    canRefundPledge?: boolean;
    canManagePaymaster?: boolean;
    canSponsorPool?: boolean;
    canCurateGrants?: boolean;
    quadraticPowerMultiplier?: number;
    badgeTitle?: string;
  };
}
