import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ checkpointHash: string }> }
) {
  try {
    const { checkpointHash } = await params;
    if (!checkpointHash) {
      return NextResponse.json(
        { error: "checkpointHash parameter is required" },
        { status: 400 }
      );
    }

    const checkpoint = await prisma.checkpoint.findUnique({
      where: { checkpointHash },
      include: {
        project: {
          include: {
            collaborators: true,
          },
        },
      },
    });

    if (!checkpoint) {
      return NextResponse.json(
        { error: "Checkpoint not found in ledger" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      checkpoint,
    });
  } catch (error) {
    console.error("Error fetching checkpoint detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch checkpoint detail" },
      { status: 500 }
    );
  }
}
