import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    const collaborators = await prisma.collaborator.findMany({
      where: { projectId },
      orderBy: { addedAt: "desc" },
    });

    return NextResponse.json({ collaborators });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborators" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Collaborator wallet address is required" },
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

    const existingCollaborator = await prisma.collaborator.findUnique({
      where: {
        projectId_address: {
          projectId,
          address: address.toLowerCase(),
        },
      },
    });

    if (existingCollaborator) {
      return NextResponse.json(
        { error: "Address is already a collaborator on this project" },
        { status: 400 }
      );
    }

    const collaborator = await prisma.collaborator.create({
      data: {
        projectId,
        address: address.toLowerCase(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        collaborator,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding collaborator:", error);
    return NextResponse.json(
      { error: "Failed to add collaborator" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Collaborator address is required" },
        { status: 400 }
      );
    }

    await prisma.collaborator.deleteMany({
      where: {
        projectId,
        address: address.toLowerCase(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Collaborator removed successfully",
    });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json(
      { error: "Failed to remove collaborator" },
      { status: 500 }
    );
  }
}
