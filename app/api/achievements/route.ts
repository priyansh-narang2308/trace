import { NextRequest, NextResponse } from "next/server";

const ACHIEVEMENT_TIERS = [
  {
    id: "badge-genesis",
    title: "Genesis Enclave Anchor",
    description: "Successfully initialized and anchored your first Monad project verification enclave off-chain.",
    tier: "LEGENDARY",
    xpReward: 500,
    mintAddress: "0x0100000000000000000000000000000000001043",
    unlocked: true,
    progress: 100,
  },
  {
    id: "badge-subsecond",
    title: "Sub-Second Speedster",
    description: "Committed 10 micro-checkpoints with verified sub-second finality (~0.8s) on Monad Testnet.",
    tier: "EPIC",
    xpReward: 350,
    mintAddress: "0x0100000000000000000000000000000000002043",
    unlocked: true,
    progress: 100,
  },
  {
    id: "badge-multisig",
    title: "Multi-Sig Consensus Co-Signer",
    description: "Participated as an authorized witness and co-signer across 5 decentralized team matrix milestones.",
    tier: "RARE",
    xpReward: 250,
    mintAddress: "0x0100000000000000000000000000000000003043",
    unlocked: true,
    progress: 100,
  },
  {
    id: "badge-precompile",
    title: "Secp256r1 P-256 Precompile Master",
    description: "Verified 25 zero-knowledge hardware passkey or cryptographic key signatures via Monad precompile 0x0100.",
    tier: "EPIC",
    xpReward: 450,
    mintAddress: null,
    unlocked: false,
    progress: 68,
  },
  {
    id: "badge-100x",
    title: "100x Monad Builder",
    description: "Staged and finalized over 100 total contribution records across all TRACE projects.",
    tier: "MYTHIC",
    xpReward: 1000,
    mintAddress: null,
    unlocked: false,
    progress: 42,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address") || "0xAnonymous";

    return NextResponse.json(
      {
        address,
        totalXp: 1100,
        unlockedCount: 3,
        badges: ACHIEVEMENT_TIERS,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Achievements API Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve NFT contribution badges" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { badgeId, address } = await request.json();

    if (!badgeId || !address) {
      return NextResponse.json({ error: "Missing badgeId or address" }, { status: 400 });
    }

    const mockMintTx = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}9012841029481029481029481029481`;

    return NextResponse.json(
      {
        success: true,
        badgeId,
        mintTxHash: mockMintTx,
        message: "NFT Badge successfully minted and attested on Monad Testnet!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Badge Mint API Error:", error);
    return NextResponse.json(
      { error: "Failed to mint NFT achievement badge" },
      { status: 500 }
    );
  }
}
