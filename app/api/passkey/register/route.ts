import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { address, passkeyId, publicKeyX, publicKeyY } = await request.json();

    if (!address || !passkeyId || !publicKeyX || !publicKeyY) {
      return NextResponse.json(
        { error: "Missing required passkey registration fields" },
        { status: 400 },
      );
    }

    const user = await prisma.user.upsert({
      where: { address: address.toLowerCase() },
      update: {
        passkeyId,
        passkeyPublicKeyX: publicKeyX,
        passkeyPublicKeyY: publicKeyY,
      },
      create: {
        address: address.toLowerCase(),
        passkeyId,
        passkeyPublicKeyX: publicKeyX,
        passkeyPublicKeyY: publicKeyY,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        address: user.address,
        passkeyId: user.passkeyId,
        publicKeyX: user.passkeyPublicKeyX,
        publicKeyY: user.passkeyPublicKeyY,
      },
    });
  } catch (error) {
    console.error("Passkey registration error:", error);
    return NextResponse.json(
      { error: "Failed to save passkey credentials to database" },
      { status: 500 },
    );
  }
}
