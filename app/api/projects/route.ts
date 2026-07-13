import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const existingProject = await prisma.project.findUnique({
      where: { projectId },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Project already exists" },
        { status: 400 },
      );
    }

    const project = await prisma.project.create({
      data: {
        projectId,
        name,
        description,
        isPublic: Boolean(isPublic),
        ownerAddress: ownerAddress.toLowerCase(),
      },
      include: {
        _count: {
          select: {
            checkpoints: true,
            collaborators: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        project,
        message: "Project created successfully on Monad Testnet.",
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
        where: { ownerAddress: ownerAddress.toLowerCase() },
        include: {
          _count: {
            select: {
              checkpoints: true,
              collaborators: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ projects });
    }

    const projects = await prisma.project.findMany({
      where: { isPublic: true },
      include: {
        _count: {
          select: {
            checkpoints: true,
            collaborators: true,
          },
        },
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
