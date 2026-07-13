import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const filter = searchParams.get("filter") || "ALL";

    if (!query.trim()) {
      return NextResponse.json({ projects: [], checkpoints: [] }, { status: 200 });
    }

    const projects =
      filter === "ALL" || filter === "PROJECTS"
        ? await prisma.project.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { id: { contains: query, mode: "insensitive" } },
              ],
            },
            take: 6,
            orderBy: { updatedAt: "desc" },
          })
        : [];

    const checkpoints =
      filter === "ALL" || filter === "CHECKPOINTS"
        ? await prisma.checkpoint.findMany({
            where: {
              OR: [
                { description: { contains: query, mode: "insensitive" } },
                { checkpointHash: { contains: query, mode: "insensitive" } },
                { creatorAddress: { contains: query, mode: "insensitive" } },
              ],
            },
            take: 8,
            include: {
              project: {
                select: { name: true, id: true },
              },
            },
            orderBy: { timestamp: "desc" },
          })
        : [];

    return NextResponse.json({ projects, checkpoints }, { status: 200 });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to perform instant search query" },
      { status: 500 }
    );
  }
}
