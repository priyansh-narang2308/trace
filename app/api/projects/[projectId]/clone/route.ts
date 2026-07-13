import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { newOwnerAddress, newName, newProjectId, copyCollaborators } = body;

    if (!newOwnerAddress) {
      return NextResponse.json(
        { error: "New owner wallet address is required" },
        { status: 400 }
      );
    }

    const originalProject = await prisma.project.findUnique({
      where: { projectId },
      include: {
        checkpoints: true,
        collaborators: true,
      },
    });

    if (!originalProject) {
      return NextResponse.json(
        { error: "Original project not found" },
        { status: 404 }
      );
    }

    if (!originalProject.isPublic) {
      const isOwner = originalProject.ownerAddress.toLowerCase() === newOwnerAddress.toLowerCase();
      const isCollaborator = originalProject.collaborators.some(
        (c) => c.address.toLowerCase() === newOwnerAddress.toLowerCase()
      );

      if (!isOwner && !isCollaborator) {
        return NextResponse.json(
          { error: "Access denied. Cannot clone a private project without authorization." },
          { status: 403 }
        );
      }
    }

    const targetProjectId = newProjectId || `${originalProject.projectId}-copy-${Date.now()}`;
    const targetName = newName || `Copy of ${originalProject.name}`;

    const existingTarget = await prisma.project.findUnique({
      where: { projectId: targetProjectId },
    });

    if (existingTarget) {
      return NextResponse.json(
        { error: "Target Project ID already exists. Please pick a unique identifier." },
        { status: 400 }
      );
    }

    const clonedProject = await prisma.project.create({
      data: {
        projectId: targetProjectId,
        name: targetName,
        description: `[Cloned from ${originalProject.name}] ${originalProject.description}`,
        isPublic: originalProject.isPublic,
        ownerAddress: newOwnerAddress.toLowerCase(),
      },
    });

    for (const cp of originalProject.checkpoints) {
      const cloneHash = `${cp.checkpointHash}-clone-${clonedProject.projectId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await prisma.checkpoint.create({
        data: {
          projectId: clonedProject.projectId,
          checkpointHash: cloneHash,
          txHash: cp.txHash,
          screenshotUrl: cp.screenshotUrl,
          description: `[Forked from @${cp.creatorAddress.slice(0, 6)}] ${cp.description}`,
          creatorAddress: cp.creatorAddress,
          collaborators: cp.collaborators,
          checkpointType: cp.checkpointType,
          timestamp: cp.timestamp,
        },
      });
    }

    if (copyCollaborators && originalProject.collaborators.length > 0) {
      for (const col of originalProject.collaborators) {
        if (col.address.toLowerCase() !== newOwnerAddress.toLowerCase()) {
          await prisma.collaborator.create({
            data: {
              projectId: clonedProject.projectId,
              address: col.address.toLowerCase(),
            },
          });
        }
      }
    }

    const fullClonedProject = await prisma.project.findUnique({
      where: { projectId: clonedProject.projectId },
      include: {
        checkpoints: true,
        collaborators: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        project: fullClonedProject,
        message: `Successfully cloned project and ${originalProject.checkpoints.length} checkpoints.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error cloning project:", error);
    return NextResponse.json(
      { error: "Failed to clone project" },
      { status: 500 }
    );
  }
}
