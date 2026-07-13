import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { monad } from "@/lib/wagmi";
import { createWalletClient, http, parseUnits } from "viem";

const CONTRACT_ADDRESS =
  "0xaD1B8719a89D008db117ce3371F57432934EC3e5" as `0x${string}`;

const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "projectId", type: "string" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "bool", name: "isPublic", type: "bool" },
    ],
    name: "createProject",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, name, description, isPublic, ownerAddress } = body;

    if (!projectId || !name || !description || !ownerAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if project already exists in database
    const existingProject = await prisma.project.findUnique({
      where: { projectId },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Project already exists" },
        { status: 400 },
      );
    }

    // Create wallet client for Monad testnet
    const walletClient = createWalletClient({
      chain: monad,
      transport: http(),
    });

    // Call smart contract to create project
    // Note: This requires the user to sign the transaction from their wallet
    // For now, we'll save to database and the transaction will be signed from frontend
    const hash = "0x"; // This will come from the frontend wallet transaction

    // Save project to database
    const project = await prisma.project.create({
      data: {
        projectId,
        name,
        description,
        isPublic,
        ownerAddress,
      },
    });

    return NextResponse.json(
      {
        success: true,
        project,
        message:
          "Project created successfully. Please sign the transaction in your wallet.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerAddress = searchParams.get("ownerAddress");

    if (ownerAddress) {
      const projects = await prisma.project.findMany({
        where: { ownerAddress },
        include: {
          checkpoints: true,
          collaborators: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ projects });
    }

    // Get all public projects
    const projects = await prisma.project.findMany({
      where: { isPublic: true },
      include: {
        checkpoints: true,
        collaborators: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}
