import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const viewerAddress = searchParams.get("viewerAddress")?.toLowerCase();

    const project = await prisma.project.findUnique({
      where: { projectId },
      include: {
        checkpoints: {
          orderBy: { timestamp: "desc" },
        },
        collaborators: {
          orderBy: { addedAt: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (!project.isPublic) {
      const isOwner = viewerAddress && viewerAddress === project.ownerAddress.toLowerCase();
      const isCollaborator = viewerAddress && project.collaborators.some(
        (c) => c.address.toLowerCase() === viewerAddress
      );

      if (!isOwner && !isCollaborator) {
        return NextResponse.json(
          { error: "Access denied. This project is private." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { name, description, isPublic, requesterAddress } = body;

    const existingProject = await prisma.project.findUnique({
      where: { projectId },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (requesterAddress && requesterAddress.toLowerCase() !== existingProject.ownerAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Only the project owner can update visibility and metadata" },
        { status: 403 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { projectId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
      },
      include: {
        checkpoints: true,
        collaborators: true,
      },
    });

    return NextResponse.json({
      success: true,
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
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
    const requesterAddress = searchParams.get("requesterAddress")?.toLowerCase();

    const existingProject = await prisma.project.findUnique({
      where: { projectId },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (requesterAddress && requesterAddress !== existingProject.ownerAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Only the project owner can delete this project" },
        { status: 403 }
      );
    }

    await prisma.checkpoint.deleteMany({
      where: { projectId },
    });

    await prisma.collaborator.deleteMany({
      where: { projectId },
    });

    await prisma.project.delete({
      where: { projectId },
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
