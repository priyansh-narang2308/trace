-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "ownerAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "checkpointHash" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "screenshotUrl" TEXT,
    "description" TEXT NOT NULL,
    "creatorAddress" TEXT NOT NULL,
    "collaborators" TEXT[],
    "checkpointType" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collaborator" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "passkeyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectId_key" ON "Project"("projectId");

-- CreateIndex
CREATE INDEX "Project_ownerAddress_idx" ON "Project"("ownerAddress");

-- CreateIndex
CREATE INDEX "Project_projectId_idx" ON "Project"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Checkpoint_checkpointHash_key" ON "Checkpoint"("checkpointHash");

-- CreateIndex
CREATE INDEX "Checkpoint_projectId_idx" ON "Checkpoint"("projectId");

-- CreateIndex
CREATE INDEX "Checkpoint_checkpointHash_idx" ON "Checkpoint"("checkpointHash");

-- CreateIndex
CREATE INDEX "Checkpoint_creatorAddress_idx" ON "Checkpoint"("creatorAddress");

-- CreateIndex
CREATE INDEX "Collaborator_address_idx" ON "Collaborator"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Collaborator_projectId_address_key" ON "Collaborator"("projectId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- AddForeignKey
ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;
