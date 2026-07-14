import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    const checkpoints = await prisma.checkpoint.findMany({
      skip: offset,
      take: limit,
      orderBy: { timestamp: "desc" },
      include: {
        project: {
          select: { name: true, projectId: true },
        },
      },
    });

    const total = await prisma.checkpoint.count();

    const feed = checkpoints.map((cp) => ({
      id: cp.id,
      projectId: cp.project.projectId,
      projectName: cp.project.name,
      checkpointHash: cp.checkpointHash,
      description: cp.description,
      checkpointType: cp.checkpointType,
      creatorAddress: cp.creatorAddress,
      timestamp: cp.timestamp.toISOString(),
      txHash: cp.txHash || null,
      likes: 0,
    }));

    return NextResponse.json({ feed, total, offset, limit }, { status: 200 });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
