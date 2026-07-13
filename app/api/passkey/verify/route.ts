import { NextResponse } from "next/server";
import { createPublicClient, http, type Hex } from "viem";
import { monadTestnet } from "@/lib/wagmi";
import { prisma } from "@/lib/prisma";
import { verifyOnchainP256Signature } from "@/lib/monad-p256";

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http("https://testnet-rpc.monad.xyz"),
});

export async function POST(request: Request) {
  try {
    const { address, signatureR, signatureS, messageHash } =
      await request.json();

    if (!address || !signatureR || !signatureS || !messageHash) {
      return NextResponse.json(
        { error: "Missing signature verification parameters" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
    });

    if (!user || !user.passkeyPublicKeyX || !user.passkeyPublicKeyY) {
      return NextResponse.json(
        { error: "No registered P-256 passkey found for this wallet address" },
        { status: 404 },
      );
    }

    const isValidOnchain = await verifyOnchainP256Signature(
      publicClient,
      messageHash as Hex,
      { r: signatureR as Hex, s: signatureS as Hex },
      { x: user.passkeyPublicKeyX as Hex, y: user.passkeyPublicKeyY as Hex },
    );

    return NextResponse.json({
      success: true,
      verified: isValidOnchain,
      precompileAddress: "0x0000000000000000000000000000000000000100",
      chainId: monadTestnet.id,
    });
  } catch (error) {
    console.error("Monad passkey verification API error:", error);
    return NextResponse.json(
      { error: "Failed to verify P-256 signature on Monad Testnet" },
      { status: 500 },
    );
  }
}
