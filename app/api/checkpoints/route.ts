import { NextRequest, NextResponse } from "next/server";
import { recoverMessageAddress } from "viem";
import { prisma } from "@/lib/prisma";
import { uploadToBlob } from "@/lib/blob";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const projectId = formData.get("projectId") as string;
    const hash = formData.get("hash") as string;
    const description = formData.get("description") as string;
    const checkpointType = formData.get("checkpointType") as string;
    const creatorAddress = formData.get("creatorAddress") as string;
    const txHash = (formData.get("txHash") as string) || "0x";
    const file = formData.get("file") as File | null;
    const collaborators = formData.get("collaborators") as string | null;
    const signature = formData.get("signature") as string | null;

    if (!projectId || !hash || !description || !checkpointType || !creatorAddress) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, hash, description, checkpointType, creatorAddress" },
        { status: 400 }
      );
    }

    // Verify EIP-191 signature if provided
    if (signature) {
      try {
        const recoveredAddress = await recoverMessageAddress({
          message: `TRACE Checkpoint Anchor\nProject: ${projectId}\nHash: ${hash}\nTime: ${Date.now()}`,
          signature: signature as `0x${string}`,
        });
        if (recoveredAddress.toLowerCase() !== creatorAddress.toLowerCase()) {
          return NextResponse.json(
            { error: "Signature does not match creator address" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid signature format" },
          { status: 400 }
        );
      }
    }

    const project = await prisma.project.findUnique({
      where: { projectId },
      include: { collaborators: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const isOwner = project.ownerAddress.toLowerCase() === creatorAddress.toLowerCase();
    const isCollaborator = project.collaborators.some(
      (c) => c.address.toLowerCase() === creatorAddress.toLowerCase()
    );

    if (!isOwner && !isCollaborator) {
      return NextResponse.json(
        { error: "Not authorized to create checkpoints on this project" },
        { status: 403 }
      );
    }

    let screenshotUrl: string | null = null;
    if (file && file.size > 0) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "File size exceeds 10MB limit" },
          { status: 400 }
        );
      }

      const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Allowed: PNG, JPEG, WebP, GIF" },
          { status: 400 }
        );
      }

      const filename = `${projectId}-${Date.now()}-${file.name}`;
      const uploadResult = await uploadToBlob(file, filename);
      screenshotUrl = uploadResult.url;
    }

    let collaboratorAddresses: string[] = [];
    if (collaborators) {
      try {
        collaboratorAddresses = JSON.parse(collaborators);
      } catch {
        collaboratorAddresses = [];
      }
    }

    const existingHash = await prisma.checkpoint.findUnique({
      where: { checkpointHash: hash },
    });

    if (existingHash) {
      return NextResponse.json(
        { error: "A checkpoint with this hash already exists" },
        { status: 409 }
      );
    }

    const checkpoint = await prisma.checkpoint.create({
      data: {
        projectId,
        checkpointHash: hash,
        description,
        checkpointType,
        creatorAddress: creatorAddress.toLowerCase(),
        screenshotUrl,
        collaborators: collaboratorAddresses,
        txHash,
      },
    });

    return NextResponse.json(
      {
        success: true,
        checkpoint,
        message: "Checkpoint anchored successfully on Monad Testnet",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating checkpoint:", error);
    return NextResponse.json(
      { error: "Failed to create checkpoint" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId query parameter is required" },
        { status: 400 }
      );
    }

    const checkpoints = await prisma.checkpoint.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ checkpoints });
  } catch (error) {
    console.error("Error fetching checkpoints:", error);
    return NextResponse.json(
      { error: "Failed to fetch checkpoints" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkpointHash, txHash, gasUsed } = body;

    if (!checkpointHash || !txHash) {
      return NextResponse.json(
        { error: "checkpointHash and txHash are required" },
        { status: 400 }
      );
    }

    const checkpoint = await prisma.checkpoint.update({
      where: { checkpointHash },
      data: { txHash },
    });

    return NextResponse.json({
      success: true,
      checkpoint,
      gasUsed: gasUsed || null,
      message: "Checkpoint transaction hash updated successfully",
    });
  } catch (error) {
    console.error("Error updating checkpoint txHash:", error);
    return NextResponse.json(
      { error: "Failed to update checkpoint transaction" },
      { status: 500 }
    );
  }
}
