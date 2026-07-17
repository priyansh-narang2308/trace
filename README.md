# TRACE — On-Chain Proof of Contribution

TRACE is a developer tool that lets hackathon teams and remote collaborators anchor their project milestones directly on the Monad blockchain. Every checkpoint — whether it's a code commit, a deployment, or a team review — gets hashed and stored immutably on-chain, creating a trustless record of who did what and when.

## The Problem

In hackathons and open-source projects, contribution disputes are real. "Who actually wrote that feature?" "Was the deployment done before or after the deadline?" Centralized tools like GitHub can be edited, rebased, or force-pushed. There's no tamper-proof way to prove contribution timelines.

## The Solution

TRACE gives every team member a simple interface to:
- **Create projects** with on-chain registration
- **Anchor checkpoints** (milestones, commits, deployments) as Keccak256 hashes on Monad Testnet
- **Add collaborators** with wallet-based attribution
- **Verify contributions** — anyone can look up the on-chain record and confirm exactly when a checkpoint was submitted

Monad's sub-second finality means anchoring a checkpoint feels instant — no waiting 12+ seconds like on Ethereum L1. This makes it practical to use TRACE as part of your actual development workflow, not just as an afterthought.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| Blockchain | Solidity (Foundry), Viem, Wagmi v3, Monad Testnet (Chain ID 10143) |
| Backend | Next.js API Routes, Prisma ORM v7, PostgreSQL |
| Storage | Vercel Blob (screenshots), Upstash Redis (caching) |
| Auth | MetaMask wallet connect, WebAuthn passkeys |

## Smart Contract

The `TraceCheckpoint.sol` contract handles:
- Project creation and ownership
- Checkpoint anchoring with Keccak256 hashes
- Collaborator management with access control
- On-chain event emission for indexing

**Deployed on Monad Testnet:** `0x1b1886b5800e7b51ca81adf6c6f72c1d84b01f6c`

## Features

- **Checkpoint Dashboard** — Create, browse, and manage project checkpoints with real-time status
- **On-Chain Transactions** — Every checkpoint triggers a real Monad Testnet transaction via MetaMask
- **Collaborator Management** — Add team members by wallet address with on-chain verification
- **AI Suggestions** — Get context-aware checkpoint descriptions based on your project activity
- **Analytics** — Track checkpoint velocity, contribution patterns, and project health
- **Live Feed** — See real-time checkpoint activity across all public projects
- **Export** — Download your checkpoint history as JSON or formatted reports for audits
- **Command-K Search** — Quick-search across projects, hashes, and addresses

## Local Development

```bash
# Clone and install
git clone https://github.com/your-username/trace.git
cd trace
npm install

# Set up environment
cp .env.example .env
# Fill in DATABASE_URL, NEXT_PUBLIC_CONTRACT_ADDRESS, etc.

# Initialize database
npx prisma generate
npx prisma db push

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use TRACE.

## Testing

```bash
# Frontend tests
npm test

# Smart contract tests (requires Foundry)
cd contracts/trace-contract
forge test
```

## Deployment

TRACE is configured for Vercel deployment:

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables: `DATABASE_URL`, `NEXT_PUBLIC_CONTRACT_ADDRESS`
4. Deploy — Vercel auto-detects the Next.js config

## License

MIT
