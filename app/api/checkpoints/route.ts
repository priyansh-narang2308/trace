import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadToBlob } from '@/lib/blob'
import redis from '@/lib/redis'

const CONTRACT_ADDRESS = '0xaD1B8719a89D008db117ce3371F57432934EC3e5' as `0x${string}`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const projectId = formData.get('projectId') as string
    const hash = formData.get('hash') as string
    const description = formData.get('description') as string
    const checkpointType = formData.get('checkpointType') as string
    const creatorAddress = formData.get('creatorAddress') as string
    const file = formData.get('file') as File | null
    const collaborators = formData.get('collaborators') as string | null

    if (!projectId || !hash || !description || !checkpointType || !creatorAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify project exists and user has access
    const project = await prisma.project.findUnique({
      where: { projectId },
      include: { collaborators: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const isOwner = project.ownerAddress === creatorAddress
    const isCollaborator = project.collaborators.some(
      (c) => c.address === creatorAddress
    )

    if (!isOwner && !isCollaborator) {
      return NextResponse.json(
        { error: 'Not authorized to create checkpoints' },
        { status: 403 }
      )
    }

    // Upload file to Vercel Blob if provided
    let attachmentUrl: string | null = null
    if (file && file.size > 0) {
      const filename = `${projectId}-${Date.now()}-${file.name}`
      const uploadResult = await uploadToBlob(file, filename)
      attachmentUrl = uploadResult.url
    }

    // Parse collaborators
    let collaboratorAddresses: string[] = []
    if (collaborators) {
      try {
        collaboratorAddresses = JSON.parse(collaborators)
      } catch {
        collaboratorAddresses = []
      }
    }

    // Save checkpoint to database
    const checkpoint = await prisma.checkpoint.create({
      data: {
        projectId,
        checkpointHash: hash,
        description,
        checkpointType,
        creatorAddress,
        screenshotUrl: attachmentUrl,
        collaborators: collaboratorAddresses,
        txHash: '0x', // Will be updated after blockchain transaction
      },
    })

    // Invalidate cache for this project
    await redis.del(`project:${projectId}:checkpoints`)

    return NextResponse.json(
      {
        success: true,
        checkpoint,
        message: 'Checkpoint created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating checkpoint:', error)
    return NextResponse.json(
      { error: 'Failed to create checkpoint' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      )
    }

    // Try to get from cache first
    const cacheKey = `project:${projectId}:checkpoints`
    const cached = await redis.get(cacheKey)
    
    if (cached) {
      return NextResponse.json({ checkpoints: JSON.parse(cached) })
    }

    // Fetch from database
    const checkpoints = await prisma.checkpoint.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(checkpoints))

    return NextResponse.json({ checkpoints })
  } catch (error) {
    console.error('Error fetching checkpoints:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checkpoints' },
      { status: 500 }
    )
  }
}
