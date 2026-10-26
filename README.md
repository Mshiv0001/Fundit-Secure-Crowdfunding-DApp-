# Fund It — Secure Quadratic Crowdfunding & Escrow DApp

An enterprise-grade, secure crowdfunding platform featuring **Multi-Tier Contributions**, **Quadratic DAO Governance**, **Milestone-based Escrow Tranches**, and **Trustless Pull-Refunds**. Built with Solidity, OpenZeppelin v5, Hardhat, Next.js 14 App Router, and Tailwind CSS.

---

## Key Security Features

1. **Checks-Effects-Interactions & OpenZeppelin ReentrancyGuard**  
   All state updates (such as zeroing balances) occur before external ETH transfers. Protected against recursive reentrancy exploits.

2. **Milestone-Based Escrow Tranches (Anti-Rug Mechanism)**  
   Creators cannot withdraw campaign proceeds in a single transaction. Funds are released only through verifiable milestone proposals voted on by backers.

3. **Quadratic Democracy Math ($\lfloor\sqrt{\text{Tokens}}\rfloor$)**  
   Prevents whale dominance. Voting weight scales with the square root of governance tokens:
   $$\text{Weight} = \lfloor\sqrt{\text{Tokens}}\rfloor$$
   A whale holding 10,000 tokens has 100 votes, while 50 community backers holding 100 tokens each command 500 votes ($50 \times 10$), ensuring community consensus prevails.

4. **Trustless Pull-over-Push Refunds**  
   If a campaign fails to reach its soft-cap target before the deadline, contributors can call `claimRefund()` to pull 100% of their ETH back. No loops over backer arrays, preventing Denial-of-Service (DoS) gas exhaustion.

5. **Multi-Sig Guardian Circuit Breaker**  
   Emergency `pause()` and `unpause()` functions allow designated multi-sig guardians to halt contributions in the event of an external exploit.

---

## Multi-Tier Backer Perks

| Tier | Contribution | Token Multiplier | Special Perks |
| :--- | :--- | :--- | :--- |
| **Tier 1: Supporter** | 0.01 – 0.09 ETH | **1.0x** (1,000 tokens / ETH) | Standard Quadratic Voting, Pull-Refund Guarantee |
| **Tier 2: Patron** | 0.10 – 0.49 ETH | **1.25x** (+25% bonus) | Patron Discord / Forum Role, Priority Testing |
| **Tier 3: Guardian** | ≥ 0.50 ETH | **1.50x** (+50% bonus) | Milestone Proposal Creation, DAO Council Seat |

---

## Project Structure

```
blockchain project/
├── contracts/
│   ├── SecureCrowdfundingDAO.sol    # Escrow, quadratic voting, pull refund & tiers
│   ├── CrowdfundToken.sol           # Mintable ERC20 governance token
│   └── CrowdfundingFactory.sol      # Factory registry deploying campaign pairs
├── test/
│   └── SecureCrowdfunding.test.js   # 12 automated unit & security test cases
├── scripts/
│   └── deploy.js                    # Deployment & ABI export script
├── src/
│   ├── app/
│   │   ├── globals.css              # Glassmorphic design tokens & animations
│   │   ├── layout.tsx               # Root layout & Web3 provider
│   │   └── page.tsx                 # Main dashboard, explorer & modals
│   ├── components/
│   │   ├── Navbar.tsx               # Top navigation & test persona switcher
│   │   ├── HeroSection.tsx          # Protocol statistics & security highlights
│   │   ├── CampaignCard.tsx         # Campaign cards with progress bars
│   │   ├── CampaignDetailModal.tsx  # Pledging, voting, refunds, and security specs
│   │   ├── CreateCampaignModal.tsx  # Wizard for launching new campaigns
│   │   ├── QuadraticCalculatorModal.tsx # Interactive slider simulation
│   │   ├── SecurityAuditModal.tsx   # Formal verification & audit checklist
│   │   └── Footer.tsx               # Protocol status and links
│   ├── context/
│   │   └── Web3Context.tsx          # Dual real MetaMask & Sandbox Simulator
│   ├── contracts/
│   │   └── deployedContracts.json   # Exported contract ABIs & addresses
│   └── types/
│       └── index.ts                 # Full TypeScript interfaces
├── hardhat.config.js                # Hardhat 0.8.26 with viaIR optimizer
└── package.json
```

---

## Getting Started

### 1. Run Automated Test Suite
```bash
npm run test
```
Executes all 12 smart contract security tests covering factory deployment, multi-tier minting, quadratic calculations, milestone disbursements, pull refunds, and circuit breaker pauses.

### 2. Compile Smart Contracts
```bash
npm run compile
```

### 3. Deploy to Localhost / Testnet
```bash
npx hardhat run scripts/deploy.js
```

### 4. Start the Full-Stack Web3 Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Dual Web3 Operation Modes

- **Sandbox Simulation Mode (Instant Zero-Gas Demo)**:  
  Pre-loaded with 4 test personas:
  - *Devin Vance* (Project Lead / Creator)
  - *Alice Wright* (Patron Backer — 0.2 ETH)
  - *Charlie Stark* (Guardian Whale — 1.5 ETH)
  - *Bob Chen* (Community Supporter — 0.05 ETH)  
  Switch accounts using the persona selector in the navbar to test milestone creation, voting, and refunds without needing testnet ETH or MetaMask.

- **Live MetaMask Mode**:  
  Click the **MetaMask** button in the navbar to connect any real EVM browser wallet (Localhost 8545, Sepolia, or Mainnet).
