/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { WalletConnect } from "@/components/wallet-connect";
import { CollaboratorManager } from "@/components/projects/collaborator-manager";
import { CloneProjectModal } from "@/components/projects/clone-project-modal";
import { PasskeyAuth } from "@/components/passkey-auth";
import { MicroCheckpointBar } from "@/components/checkpoints/micro-checkpoint-bar";
import { RealtimeTimeline } from "@/components/checkpoints/realtime-timeline";
import { LiveCollaborationIndicators } from "@/components/projects/live-collaboration-indicators";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ProjectFollowButton } from "@/components/projects/project-follow-button";
import { InstantSearchModal } from "@/components/search/instant-search-modal";
import { AICheckpointAssistant } from "@/components/ai/ai-checkpoint-assistant";
import { LiveEvolutionView } from "@/components/projects/live-evolution-view";
import { ExportPanel } from "@/components/projects/export-panel";
import { ProjectComparison } from "@/components/projects/project-comparison";
import { ErrorBoundary } from "@/components/ui/error-handling";
import { ProjectSkeleton } from "@/components/ui/loading-states";
import { CheckpointCreationForm } from "@/components/checkpoints/checkpoint-creation-form";
import { TxConfirmation } from "@/components/checkpoints/tx-confirmation";
import { useMonadCheckpointTx } from "@/hooks/use-monad-checkpoint-tx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  GitFork,
  Fingerprint,
  Plus,
  X,
  LayoutDashboard,
  Layers,
  GitCompare,
  Terminal,
  MoreHorizontal,
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
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showPasskeyPanel, setShowPasskeyPanel] = useState(false);
  const [showCheckpointForm, setShowCheckpointForm] = useState(false);
  const { txResult, submitCheckpoint, resetTx } = useMonadCheckpointTx();
  const [activeTab, setActiveTab] = useState<
    "overview" | "evolution" | "anchor" | "timeline" | "team" | "comparison"
  >("overview");

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    isPublic: true,
  });

  const fetchProjectDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const viewerParam = address
        ? `?viewerAddress=${encodeURIComponent(address)}`
        : "";
      const response = await fetch(`/api/projects/${projectId}${viewerParam}`);
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
  }, [projectId, address, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjectDetail();
  }, [fetchProjectDetail]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          requesterAddress: address,
        }),
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
    if (!address) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}?requesterAddress=${encodeURIComponent(address)}`,
        { method: "DELETE" },
      );

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
      <div className="min-h-screen flex items-center justify-center bg-void-black text-[#ffffff] font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-coral-pulse" />
          <span className="text-[13px] font-mono text-[#9c9c9d]">
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
    <div className="min-h-screen bg-void-black text-pure-white font-sans selection:bg-coral-pulse/30 selection:text-pure-white pb-24">
      <header className="sticky top-0 z-50 border-b border-border bg-void-black/80 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer gap-2 font-medium text-ash hover:text-pure-white hover:bg-obsidian"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="font-mono text-[13px] text-ash hidden sm:block truncate max-w-xs">
              `{project.projectId}`
            </span>
          </div>
          <div className="flex items-center gap-3">
            <InstantSearchModal />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasskeyPanel(!showPasskeyPanel)}
              className="cursor-pointer bg-coral-pulse hover:bg-coral-pulse/90 text-white border-transparent text-[12px] font-semibold h-9 px-4 gap-2 rounded-lg shadow-md transition-all"
            >
              <Fingerprint className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Biometric Key</span>
            </Button>
            <NotificationBell />
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
        {showPasskeyPanel && (
          <div className="animate-fade-in">
            <PasskeyAuth onAuthenticated={() => setShowPasskeyPanel(false)} />
          </div>
        )}

        {showCloneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-void-black/80 backdrop-blur-md p-4 animate-fade-in">
            <CloneProjectModal
              projectId={project.projectId}
              originalName={project.name}
              onClose={() => setShowCloneModal(false)}
            />
          </div>
        )}

        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent className="bg-ink border border-border text-pure-white shadow-2xl rounded-2xl max-w-md p-6 animate-in fade-in-0 zoom-in-95">
            <AlertDialogHeader className="space-y-3 sm:text-left text-left">
              <div className="h-10 w-10 rounded-xl bg-coral-pulse/15 border border-coral-pulse/30 flex items-center justify-center text-coral-pulse">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <AlertDialogTitle className="text-[18px] font-semibold text-pure-white font-sans">
                  Delete Enclave Project?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[14px] text-ash mt-1.5 leading-relaxed">
                  This action cannot be undone. This will permanently remove{" "}
                  <span className="text-pure-white font-mono font-medium bg-graphite/80 px-1.5 py-0.5 rounded border border-border/60">
                    {project.name}
                  </span>{" "}
                  and all of its cryptographic checkpoint records from the
                  verification matrix.
                </AlertDialogDescription>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-2.5 border-t border-border/60 pt-4 bg-transparent -mx-6 -mb-6 px-6 pb-6">
              <AlertDialogCancel
                disabled={isDeleting}
                className="cursor-pointer bg-graphite hover:bg-slate text-pure-white border-border h-9 px-4 text-[13px] font-medium rounded-xl transition-colors"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteProject();
                }}
                disabled={isDeleting}
                className="cursor-pointer bg-coral-pulse hover:bg-coral-pulse/80 text-pure-white h-9 px-4 text-[13px] font-medium rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                <span>Yes, Delete Project</span>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 p-6 rounded-[16px] bg-ink border border-border shadow-key">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[32px] font-medium tracking-tight text-pure-white font-sans">
                {project.name}
              </h1>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-mono font-medium bg-graphite border border-border">
                {project.isPublic ? (
                  <>
                    <Globe className="h-3.5 w-3.5 text-emerald-verify" />
                    <span className="text-emerald-verify">
                      Public Repository
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-coral-pulse" />
                    <span className="text-coral-pulse">Private Project</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-ash text-[16px] leading-[1.6] max-w-3xl font-normal">
              {project.description}
            </p>

            <div className="flex items-center gap-6 pt-3 text-[13px] font-mono text-ash flex-wrap">
              <div>
                Owner:{" "}
                <span className="text-pure-white font-medium">
                  {project.ownerAddress.slice(0, 6)}...
                  {project.ownerAddress.slice(-4)}
                </span>
              </div>
              <div>
                Created:{" "}
                <span className="text-pure-white font-medium">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1 text-electric-sky">
                <ShieldCheck className="h-4 w-4" />
                <span>Monad Chain ID 10143</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap w-full sm:w-auto justify-end">
            <ProjectFollowButton projectId={project.projectId} />

            <Popover>
              <PopoverTrigger
                className="cursor-pointer bg-graphite hover:bg-slate text-pure-white border border-border h-9 w-9 rounded-xl shadow-sm flex items-center justify-center transition-all hover:border-border/80 hover:shadow-md shrink-0 outline-none"
                title="More Enclave Actions"
              >
                <MoreHorizontal className="h-4 w-4 text-mist" />
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-64 bg-obsidian/95 backdrop-blur-xl border border-border/80 p-2 rounded-xl shadow-2xl space-y-1 z-50 text-pure-white animate-in fade-in-0 zoom-in-95"
              >
                <div className="px-2.5 py-1.5 border-b border-border/50 mb-1">
                  <p className="text-[11px] font-mono text-mist uppercase tracking-wider font-semibold">
                    Enclave Actions
                  </p>
                </div>

                <button
                  onClick={() => setShowCloneModal(true)}
                  className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-graphite text-left transition-all group cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-lg bg-graphite/80 group-hover:bg-graphite flex items-center justify-center border border-border/50 group-hover:border-coral-pulse/50 transition-colors shrink-0">
                    <GitFork className="h-4 w-4 text-coral-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-pure-white group-hover:text-coral-pulse transition-colors">
                      Fork Project
                    </p>
                    <p className="text-[11px] text-ash truncate">
                      Create a clone on your account
                    </p>
                  </div>
                </button>

                {isOwner && (
                  <>
                    <div className="h-px bg-border/50 my-1" />
                    <div className="px-2.5 py-1">
                      <p className="text-[10px] font-mono text-ash uppercase tracking-wider font-semibold">
                        Owner Controls
                      </p>
                    </div>

                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-graphite text-left transition-all group cursor-pointer"
                    >
                      <div className="h-8 w-8 rounded-lg bg-graphite/80 group-hover:bg-graphite flex items-center justify-center border border-border/50 group-hover:border-electric-sky/50 transition-colors shrink-0">
                        <Edit2 className="h-4 w-4 text-mist group-hover:text-electric-sky transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-pure-white group-hover:text-electric-sky transition-colors">
                          {isEditing ? "Cancel Edit" : "Edit Metadata"}
                        </p>
                        <p className="text-[11px] text-ash truncate">
                          Update title & description
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-coral-pulse/10 text-left transition-all group cursor-pointer"
                    >
                      <div className="h-8 w-8 rounded-lg bg-graphite/80 group-hover:bg-coral-pulse/20 flex items-center justify-center border border-border/50 group-hover:border-coral-pulse/50 transition-colors shrink-0">
                        <Trash2 className="h-4 w-4 text-ash group-hover:text-coral-pulse transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-pure-white group-hover:text-coral-pulse transition-colors">
                          Delete Project
                        </p>
                        <p className="text-[11px] text-ash truncate">
                          Remove enclave forever
                        </p>
                      </div>
                    </button>
                  </>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {isEditing && (
          <Card className="bg-[#07080a] border border-[#ff6363] shadow-key animate-fade-in">
            <CardHeader className="border-b border-[#363739] pb-3">
              <CardTitle className="text-[18px] text-[#ffffff] font-medium">
                Update Project Metadata & Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-name"
                    className="text-[13px] text-[#ffffff]"
                  >
                    Project Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    disabled={isSaving}
                    className="bg-obsidian border-border text-pure-white text-[14px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-desc"
                    className="text-[13px] text-pure-white"
                  >
                    Description
                  </Label>
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
                    className="bg-obsidian border-border text-pure-white text-[14px]"
                  />
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-obsidian/60">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="edit-public"
                      className="text-[13px] font-medium text-pure-white cursor-pointer"
                    >
                      Public Visibility (`isPublic`)
                    </Label>
                    <p className="text-[12px] text-ash">
                      When toggled off, only you and added teammates can access
                      or submit checkpoints.
                    </p>
                  </div>
                  <Switch
                    id="edit-public"
                    checked={editForm.isPublic}
                    onCheckedChange={(checked) =>
                      setEditForm((prev) => ({ ...prev, isPublic: checked }))
                    }
                    disabled={isSaving}
                    className="cursor-pointer"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="cursor-pointer bg-obsidian hover:bg-graphite text-mist border-border text-[13px] h-9 px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="cursor-pointer bg-mist hover:bg-pure-white text-obsidian font-medium text-[13px] h-9 px-5 rounded-lg shadow-sm"
                  >
                    {isSaving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <span>Save Changes</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Floating Side Dock Navigation System */}
        <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 p-2.5 rounded-2xl bg-ink/90 border border-border shadow-2xl backdrop-blur-xl transition-all hover:border-coral-pulse/40">
          {[
            {
              id: "overview",
              label: "Overview Dashboard",
              icon: LayoutDashboard,
            },
            { id: "evolution", label: "Evolution Replay", icon: Layers },
            { id: "anchor", label: "Anchor Checkpoint", icon: Terminal },
            { id: "timeline", label: "Timeline Ledger", icon: Clock },
            { id: "team", label: "Teammates Access", icon: Users },
            { id: "comparison", label: "Enclave Comparison", icon: GitCompare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div key={tab.id} className="relative group flex items-center">
                <div className="absolute right-14 bg-ink border border-border text-pure-white text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none origin-right border-l-2 border-l-coral-pulse">
                  {tab.label}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    toast.info(`Swapped to ${tab.label}`);
                  }}
                  className={`cursor-pointer h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-coral-pulse text-void-black font-bold shadow-[0_0_15px_rgba(255,42,42,0.4)] scale-110"
                      : "bg-obsidian text-ash hover:text-pure-white hover:bg-graphite"
                  }`}
                  aria-label={tab.label}
                >
                  <Icon className="h-4.5 w-4.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Tabbed Content Areas */}
        <div className="min-h-[450px] transition-all duration-300">
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-ink border border-border shadow-key">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <div className="text-[12px] font-mono text-ash uppercase">
                        Total Checkpoints
                      </div>
                      <div className="text-[32px] font-medium text-pure-white mt-1">
                        {project.checkpoints.length}
                      </div>
                    </div>
                    <Clock className="h-8 w-8 text-coral-pulse opacity-80" />
                  </CardContent>
                </Card>

                <Card className="bg-ink border border-border shadow-key">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <div className="text-[12px] font-mono text-ash uppercase">
                        Team Collaborators
                      </div>
                      <div className="text-[32px] font-medium text-pure-white mt-1">
                        {project.collaborators.length}
                      </div>
                    </div>
                    <Users className="h-8 w-8 text-electric-sky opacity-80" />
                  </CardContent>
                </Card>

                <Card className="bg-ink border border-border shadow-key">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <div className="text-[12px] font-mono text-ash uppercase">
                        Finality Tier
                      </div>
                      <div className="text-[32px] font-medium text-emerald-verify mt-1">
                        1-Sec
                      </div>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-emerald-verify opacity-80" />
                  </CardContent>
                </Card>
              </div>

              <LiveCollaborationIndicators
                projectId={project.projectId}
                collaborators={project.collaborators.map((c) => c.address)}
                ownerAddress={project.ownerAddress}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-ink border border-border shadow-key">
                    <CardHeader className="pb-3 border-b border-border">
                      <CardTitle className="text-[15px] font-medium text-pure-white font-sans">
                        Project Meta Objectives
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 text-[14px] text-ash leading-relaxed font-sans">
                      {project.description}
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-6">
                  <ErrorBoundary fallbackMessage="Failed to load export panel">
                    <ExportPanel
                      projectData={{
                        projectId: project.projectId,
                        projectName: project.name,
                        checkpoints: project.checkpoints.map((cp) => ({
                          checkpointHash: cp.checkpointHash || "",
                          description: cp.description || "",
                          checkpointType: cp.checkpointType || "MILESTONE",
                          creatorAddress: cp.creatorAddress || "",
                          timestamp: cp.timestamp || new Date().toISOString(),
                          txHash: cp.txHash || null,
                        })),
                        collaborators: project.collaborators.map((c) => ({
                          address: c.address || "",
                          addedAt: new Date().toISOString(),
                        })),
                      }}
                    />
                  </ErrorBoundary>
                  <Card className="bg-ink border border-border shadow-key">
                    <CardHeader className="pb-3 border-b border-border">
                      <CardTitle className="text-[14px] font-medium flex items-center gap-2 text-pure-white">
                        <AlertTriangle className="h-4 w-4 text-coral-pulse" />
                        <span>Monad Security Protocol</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 text-[13px] text-ash leading-[1.6] space-y-2 font-mono">
                      <p>
                        Only owner (`{project.ownerAddress.slice(0, 6)}...`) or
                        authorized co-signers can anchor checkpoints to this
                        ledger.
                      </p>
                      <p>
                        Verified on Monad Testnet (`Chain ID 10143`) with
                        sub-second finality.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === "evolution" && (
            <div className="space-y-6 animate-fade-in">
              <LiveEvolutionView
                projectId={project.projectId}
                checkpoints={project.checkpoints}
              />
            </div>
          )}

          {activeTab === "anchor" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-[20px] font-medium tracking-tight text-pure-white">
                  Monad Enclave AI & Checkpoint Console
                </h3>
                {isOwner && (
                  <Button
                    onClick={() => {
                      setShowCheckpointForm(!showCheckpointForm);
                      if (!showCheckpointForm) resetTx();
                    }}
                    className="cursor-pointer bg-mist hover:bg-pure-white text-obsidian font-medium text-[13px] h-8 px-3.5 rounded-lg shadow-sm gap-2"
                  >
                    {showCheckpointForm ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {showCheckpointForm ? "Close Form" : "New Checkpoint"}
                    </span>
                  </Button>
                )}
              </div>

              {showCheckpointForm && (
                <div className="space-y-4 animate-fade-in">
                  <CheckpointCreationForm
                    projectId={project.projectId}
                    collaborators={project.collaborators}
                    onSuccess={async (checkpoint) => {
                      const cp = checkpoint as Record<string, string>;
                      if (cp.checkpointHash) {
                        await submitCheckpoint(
                          project.projectId,
                          cp.description || "",
                          cp.checkpointHash,
                        );
                      }
                      fetchProjectDetail();
                      setShowCheckpointForm(false);
                    }}
                    onCancel={() => setShowCheckpointForm(false)}
                  />
                  <TxConfirmation txResult={txResult} />
                </div>
              )}

              {txResult.status !== "IDLE" && !showCheckpointForm && (
                <TxConfirmation txResult={txResult} />
              )}

              {isOwner && !showCheckpointForm && (
                <div className="space-y-6">
                  <AICheckpointAssistant
                    projectId={project.projectId}
                    onApplySuggestion={(s) => {
                      setShowCheckpointForm(true);
                    }}
                  />
                  <MicroCheckpointBar
                    projectId={project.projectId}
                    onSuccess={() => fetchProjectDetail()}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-[20px] font-medium tracking-tight text-pure-white">
                  Cryptographic Checkpoint Ledger
                </h3>
                <span className="text-[12px] font-mono text-ash bg-graphite border border-border px-3 py-1 rounded-full">
                  Monad Testnet Stream
                </span>
              </div>
              <RealtimeTimeline projectId={project.projectId} />
            </div>
          )}

          {activeTab === "team" && (
            <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
              <ErrorBoundary fallbackMessage="Failed to load collaborator manager">
                <CollaboratorManager
                  projectId={project.projectId}
                  onCollaboratorChange={fetchProjectDetail}
                />
              </ErrorBoundary>
            </div>
          )}

          {activeTab === "comparison" && (
            <div className="space-y-6 animate-fade-in">
              <ErrorBoundary fallbackMessage="Failed to load project comparison">
                <ProjectComparison currentProjectId={project.projectId} />
              </ErrorBoundary>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
