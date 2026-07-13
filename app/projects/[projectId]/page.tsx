"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WalletConnect } from "@/components/wallet-connect";
import { CollaboratorManager } from "@/components/projects/collaborator-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Globe,
  Lock,
  Edit2,
  Trash2,
  Users,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface Checkpoint {
  id: string;
  checkpointHash: string;
  txHash: string;
  description: string;
  creatorAddress: string;
  checkpointType: string;
  timestamp: string;
}

interface ProjectDetail {
  id: string;
  projectId: string;
  name: string;
  description: string;
  isPublic: boolean;
  ownerAddress: string;
  createdAt: string;
  checkpoints: Checkpoint[];
  collaborators: { address: string }[];
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const unwrappedParams = use(params);
  const { projectId } = unwrappedParams;
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    isPublic: true,
  });

  const fetchProjectDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setEditForm({
          name: data.project.name,
          description: data.project.description,
          isPublic: data.project.isPublic,
        });
      } else {
        router.push("/projects");
      }
    } catch (error) {
      console.error("Failed to load project details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    fetchProjectDetail();
  }, [fetchProjectDetail]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setProject((prev) => (prev ? { ...prev, ...data.project } : null));
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/projects");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      setIsDeleting(false);
    }
  };

  const isOwner =
    isConnected &&
    address &&
    project &&
    address.toLowerCase() === project.ownerAddress.toLowerCase();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted/20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm font-mono text-muted-foreground">
            Loading project verification matrix...
          </span>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background/98 to-muted/20 pb-20">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="gap-2 font-medium">
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="font-mono text-xs text-muted-foreground hidden sm:block truncate max-w-xs">
              `{project.projectId}`
            </span>
          </div>
          <div className="flex items-center gap-3">
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 p-6 rounded-2xl border bg-card/90 shadow-lg backdrop-blur-xs">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-3xl font-extrabold tracking-tight">
                {project.name}
              </h1>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted border">
                {project.isPublic ? (
                  <>
                    <Globe className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Public Entry</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Private Project</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-muted-foreground text-base leading-relaxed max-w-3xl font-normal">
              {project.description}
            </p>

            <div className="flex items-center gap-6 pt-3 text-xs font-mono text-muted-foreground flex-wrap">
              <div>
                Owner:{" "}
                <span className="text-foreground font-semibold">
                  {project.ownerAddress.slice(0, 6)}...
                  {project.ownerAddress.slice(-4)}
                </span>
              </div>
              <div>
                Created:{" "}
                <span className="text-foreground font-semibold">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Monad Chain ID 10143</span>
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="gap-2"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>{isEditing ? "Cancel Edit" : "Edit Metadata"}</span>
              </Button>
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>
              ) : (
                <div className="flex items-center gap-2 p-1 rounded-md bg-destructive/10 border border-destructive/30">
                  <span className="text-xs font-mono text-destructive px-2">
                    Sure?
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteProject}
                    disabled={isDeleting}
                    className="h-8"
                  >
                    {isDeleting && (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    )}
                    Confirm
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-8 text-xs"
                  >
                    No
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing && (
          <Card className="border-indigo-500/40 shadow-md animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Update Project Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Project Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-desc">Description</Label>
                  <Textarea
                    id="edit-desc"
                    rows={3}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    required
                    disabled={isSaving}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="edit-public"
                    checked={editForm.isPublic}
                    onCheckedChange={(checked) =>
                      setEditForm((prev) => ({ ...prev, isPublic: checked }))
                    }
                    disabled={isSaving}
                  />
                  <Label htmlFor="edit-public">Public Visibility</Label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/60">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-muted-foreground uppercase">
                  Total Checkpoints
                </div>
                <div className="text-3xl font-extrabold mt-1">
                  {project.checkpoints.length}
                </div>
              </div>
              <Clock className="h-8 w-8 text-purple-400 opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-card/60">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-muted-foreground uppercase">
                  Team Collaborators
                </div>
                <div className="text-3xl font-extrabold mt-1">
                  {project.collaborators.length}
                </div>
              </div>
              <Users className="h-8 w-8 text-indigo-400 opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-card/60">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-muted-foreground uppercase">
                  Finality Tier
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                  1-Sec
                </div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-80" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight">
                Cryptographic Checkpoint Ledger
              </h3>
              <span className="text-xs font-mono text-muted-foreground">
                Monad Testnet Anchors
              </span>
            </div>

            {project.checkpoints.length === 0 ? (
              <Card className="border-dashed bg-card/40">
                <CardContent className="py-16 text-center space-y-3">
                  <Clock className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                  <h4 className="text-lg font-bold">No milestones recorded yet</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Record commits, screenshots, or deploy checkpoints directly to Monad Testnet to build undeniable proof of creation.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {project.checkpoints.map((cp) => (
                  <Card key={cp.id} className="border-border/60 hover:border-primary/40 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {cp.checkpointType}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {new Date(cp.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm font-normal leading-relaxed">
                        {cp.description}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs font-mono text-muted-foreground flex-wrap gap-2">
                        <div>
                          Signer: `{cp.creatorAddress.slice(0, 6)}...{cp.creatorAddress.slice(-4)}`
                        </div>
                        {cp.txHash && cp.txHash !== "0x" && (
                          <a
                            href={`https://testnet.monadexplorer.com/tx/${cp.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline font-semibold"
                          >
                            <span>MonadTx</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <CollaboratorManager
              projectId={project.projectId}
              onCollaboratorChange={fetchProjectDetail}
            />

            <Card className="border-border/40 bg-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Monad Security Rules</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2 font-mono">
                <p>
                  Only the project owner (`{project.ownerAddress.slice(0, 6)}...`) or authorized co-signers can submit checkpoints to this ledger.
                </p>
                <p>
                  All transactions are verified against Monad Testnet (`Chain ID 10143`).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
