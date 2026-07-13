/* eslint-disable react-hooks/purity */
"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Copy,
  Loader2,
  GitFork,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface CloneProjectModalProps {
  projectId: string;
  originalName: string;
  onClose?: () => void;
}

export function CloneProjectModal({
  projectId,
  originalName,
  onClose,
}: CloneProjectModalProps) {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    newName: `Copy of ${originalName}`,
    newProjectId: `${projectId}-fork-${Math.floor(Math.random() * 9000 + 1000)}`,
    copyCollaborators: false,
  });

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !isConnected) {
      setError("Please connect your wallet to fork this project.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newOwnerAddress: address,
          newName: formData.newName,
          newProjectId: formData.newProjectId,
          copyCollaborators: formData.copyCollaborators,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to clone project");
      }

      setSuccess(`Project successfully forked as ${data.project.projectId}`);
      setTimeout(() => {
        router.push(`/projects/${data.project.projectId}`);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error cloning project";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#07080a] border border-[#363739] shadow-key max-w-lg w-full mx-auto animate-fade-in">
      <CardHeader className="pb-4 border-b border-[#363739]">
        <CardTitle className="flex items-center justify-between text-[#ffffff] text-[18px] font-medium font-sans">
          <div className="flex items-center gap-2">
            <GitFork className="h-5 w-5 text-[#ff6363]" />
            <span>Fork & Clone Project</span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer text-[#9c9c9d] hover:text-[#ffffff] text-[13px] font-mono"
            >
              [esc]
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        {error && (
          <div className="p-3.5 rounded-lg bg-[#1b1c1e] border border-[#ff6363]/40 text-[#ff6363] text-[13px] font-mono flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-lg bg-[#1b1c1e] border border-[#59d499]/40 text-[#59d499] text-[13px] font-mono flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleClone} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="newName"
              className="text-[13px] font-medium text-[#ffffff]"
            >
              Forked Project Name
            </Label>
            <Input
              id="newName"
              value={formData.newName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, newName: e.target.value }))
              }
              required
              disabled={isLoading}
              className="bg-[#111214] border-[#363739] text-[#ffffff] font-sans text-[14px] focus:border-[#ff6363]"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="newProjectId"
              className="text-[13px] font-medium text-[#ffffff]"
            >
              Onchain Target Identifier (`projectId`)
            </Label>
            <Input
              id="newProjectId"
              value={formData.newProjectId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  newProjectId: e.target.value,
                }))
              }
              required
              disabled={isLoading}
              className="bg-[#111214] border-[#363739] text-[#e6e6e6] font-mono text-[13px] focus:border-[#ff6363]"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#363739] bg-[#111214]/60">
            <div className="space-y-0.5">
              <Label
                htmlFor="copyCollaborators"
                className="text-[13px] font-medium text-[#ffffff] cursor-pointer"
              >
                Clone Team Access List
              </Label>
              <p className="text-[12px] text-[#9c9c9d]">
                Copy all authorized co-signers to the new forked repository.
              </p>
            </div>
            <Switch
              id="copyCollaborators"
              checked={formData.copyCollaborators}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, copyCollaborators: checked }))
              }
              disabled={isLoading}
              className="cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="cursor-pointer bg-[#111214] hover:bg-[#1b1c1e] text-[#e6e6e6] border-[#363739] text-[13px] h-9"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !isConnected}
              className="cursor-pointer bg-[#e6e6e6] hover:bg-[#ffffff] text-[#111214] font-medium text-[13px] h-9 px-5 rounded-lg shadow-sm gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span>Deploy Cloned Project</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
