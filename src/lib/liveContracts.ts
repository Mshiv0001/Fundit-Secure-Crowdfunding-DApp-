import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import deployedContracts from '@/contracts/deployedContracts.json';
import { BackerTier, Campaign, CampaignState, MilestoneProposal } from '@/types';

declare global {
  interface Window { ethereum?: unknown; }
}

const configuredFactory = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || deployedContracts.factoryAddress;
const configuredChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || deployedContracts.chainId);
const stateNames: CampaignState[] = ['Active', 'GoalReached', 'Failed', 'Failed'];
const tierNames: BackerTier[] = ['None', 'Supporter', 'Patron', 'Guardian'];

function ethereumProvider() {
  if (!window.ethereum) throw new Error('Install MetaMask or another EVM wallet first.');
  return new BrowserProvider(window.ethereum as any);
}

async function signerAndFactory() {
  if (!configuredFactory || configuredFactory === '0xYourDeployedFactoryAddress') {
    throw new Error('Fundit is not configured with a deployed factory address yet.');
  }
  const provider = ethereumProvider();
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== configuredChainId) {
    throw new Error(`Switch MetaMask to chain ID ${configuredChainId} before continuing.`);
  }
  const signer = await provider.getSigner();
  return { signer, factory: new Contract(configuredFactory, deployedContracts.CrowdfundingFactoryAbi, signer) };
}

export async function connectLiveWallet() {
  const provider = ethereumProvider();
  await provider.send('eth_requestAccounts', []);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== configuredChainId) {
    throw new Error(`Switch MetaMask to Sepolia (chain ID ${configuredChainId}).`);
  }
  const signer = await provider.getSigner();
  return { address: await signer.getAddress(), balance: formatEther(await provider.getBalance(await signer.getAddress())) };
}

export async function loadLiveCampaigns(account?: string): Promise<Campaign[]> {
  const { signer, factory } = await signerAndFactory();
  const owner = account || await signer.getAddress();
  const records = await factory.getAllCampaigns();
  return Promise.all(records.map(async (record: any) => {
    const address = record.campaignAddress;
    const campaign = new Contract(address, deployedContracts.SecureCrowdfundingDAOAbi, signer);
    const token = new Contract(record.tokenAddress, deployedContracts.CrowdfundTokenAbi, signer);
    const summary = await campaign.getCampaignSummary();
    const proposalCount = Number(summary[10]);
    const proposals: MilestoneProposal[] = await Promise.all(Array.from({ length: proposalCount }, async (_, index) => {
      const p = await campaign.proposals(index + 1);
      return {
        id: Number(p.id), title: p.title, description: p.description, proofUrl: p.proofUrl,
        requestedAmount: formatEther(p.requestedAmount), votingDeadline: Number(p.votingDeadline),
        forVotesSqrt: Number(p.forVotesSqrt), againstVotesSqrt: Number(p.againstVotesSqrt),
        voterCount: Number(p.voterCount), executed: p.executed, passed: p.passed,
        userVoted: await campaign.hasVotedOnProposal(index + 1, owner)
      };
    }));
    const backer = await campaign.backers(owner);
    const tokenBalance = await token.balanceOf(owner);
    return {
      id: address, address, tokenAddress: record.tokenAddress, title: summary[0], description: await campaign.description(),
      category: await campaign.category(), imageUrl: await campaign.imageUrl(), creator: summary[1],
      creatorName: `${String(summary[1]).slice(0, 6)}...${String(summary[1]).slice(-4)}`, creatorHandle: '@onchain', isVerified: true,
      goalAmount: formatEther(summary[2]), hardCapAmount: formatEther(summary[3]), totalRaised: formatEther(summary[4]),
      fundsReleased: formatEther(summary[5]), escrowBalance: formatEther(summary[6]), deadline: Number(summary[7]),
      state: stateNames[Number(summary[8])] || 'Failed', backerCount: Number(summary[9]), tokenName: await token.name(), tokenSymbol: await token.symbol(), proposals,
      userContribution: {
        amount: formatEther(backer.totalContributed), tier: tierNames[Number(backer.tier)] || 'None', tokenBalance: Number(formatEther(tokenBalance)),
        quadraticPower: Math.floor(Math.sqrt(Number(formatEther(tokenBalance)))), refunded: backer.refunded
      }
    };
  }));
}

export async function pledgeLive(address: string, amount: string) { const { signer } = await signerAndFactory(); const tx = await new Contract(address, deployedContracts.SecureCrowdfundingDAOAbi, signer).pledge({ value: parseEther(amount) }); await tx.wait(); }
export async function refundLive(address: string) { const { signer } = await signerAndFactory(); const tx = await new Contract(address, deployedContracts.SecureCrowdfundingDAOAbi, signer).claimRefund(); await tx.wait(); }
export async function proposeLive(address: string, title: string, description: string, proofUrl: string, amount: string) { const { signer } = await signerAndFactory(); const tx = await new Contract(address, deployedContracts.SecureCrowdfundingDAOAbi, signer).proposeMilestone(title, description, proofUrl, parseEther(amount)); await tx.wait(); }
export async function voteLive(address: string, proposalId: number, support: boolean) { const { signer } = await signerAndFactory(); const tx = await new Contract(address, deployedContracts.SecureCrowdfundingDAOAbi, signer).castVote(proposalId, support); await tx.wait(); }
export async function executeLive(address: string, proposalId: number) { const { signer } = await signerAndFactory(); const tx = await new Contract(address, deployedContracts.SecureCrowdfundingDAOAbi, signer).executeMilestone(proposalId); await tx.wait(); }
export async function createLiveCampaign(data: { title: string; description: string; category: string; imageUrl: string; goalAmount: string; hardCapAmount: string; durationDays: number; tokenName: string; tokenSymbol: string }) {
  const { factory } = await signerAndFactory();
  const tx = await factory.createCampaign({ ...data, goalAmount: parseEther(data.goalAmount), hardCapAmount: parseEther(data.hardCapAmount), durationSeconds: BigInt(Math.max(1, data.durationDays) * 86400) });
  await tx.wait();
}
