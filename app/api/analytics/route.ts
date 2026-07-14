import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [projects, checkpoints, collaborators] = await Promise.all([
      prisma.project.findMany({
        include: {
          _count: { select: { checkpoints: true, collaborators: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.checkpoint.findMany({
        orderBy: { timestamp: "desc" },
        take: 50,
        include: {
          project: { select: { name: true } },
        },
      }),
      prisma.collaborator.findMany(),
    ]);

    const totalProjects = projects.length;
    const totalCheckpoints = checkpoints.length;
    const totalCollaborators = new Set(collaborators.map((c) => c.address)).size;
    const verifiedAnchors = checkpoints.filter(
      (cp) => cp.txHash && cp.txHash !== "0x"
    ).length;
    const verificationRate =
      totalCheckpoints > 0
        ? Math.round((verifiedAnchors / totalCheckpoints) * 1000) / 10
        : 0;
    const avgCheckpointsPerProject =
      totalProjects > 0
        ? Math.round((totalCheckpoints / totalProjects) * 10) / 10
        : 0;

    const typeCounts: Record<string, number> = {};
    for (const cp of checkpoints) {
      typeCounts[cp.checkpointType] = (typeCounts[cp.checkpointType] || 0) + 1;
    }

    const typeColors: Record<string, string> = {
      MILESTONE: "bg-coral-pulse",
      GIT_COMMIT: "bg-electric-sky",
      DEPLOYMENT: "bg-emerald-verify",
      SCREENSHOT: "bg-purple-400",
      COLLABORATION: "bg-yellow-400",
      MANUAL: "bg-gray-400",
    };

    const recentActivity = checkpoints.slice(0, 10).map((cp) => ({
      id: cp.id,
      type: cp.checkpointType,
      description: cp.description,
      timestamp: cp.timestamp.toISOString(),
      projectName: cp.project?.name || "Unknown",
    }));

    const checkpointsByType = Object.entries(typeCounts).map(
      ([type, count]) => ({
        type,
        count,
        color: typeColors[type] || "bg-coral-pulse",
      })
    );

    const now = Date.now();
    const weeklyTrend: number[] = [0, 0, 0, 0, 0, 0, 0];
    for (const cp of checkpoints) {
      const diffDays = Math.floor(
        (now - new Date(cp.timestamp).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays < 7) {
        weeklyTrend[6 - diffDays]++;
      }
    }

    return NextResponse.json(
      {
        totalProjects,
        totalCheckpoints,
        totalCollaborators,
        verifiedAnchors,
        verificationRate,
        avgCheckpointsPerProject,
        recentActivity,
        checkpointsByType,
        weeklyTrend,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
