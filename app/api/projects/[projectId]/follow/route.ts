import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { address, action } = body;

    if (!projectId || !address) {
      return NextResponse.json(
        { error: "projectId and address required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      following: action === "FOLLOW",
      projectId,
      address,
    });
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json(
      { error: "Failed to toggle follow status" },
      { status: 500 }
    );
  }
}
