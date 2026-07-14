"use client";

import { useState, useRef, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Terminal,
  GitCommit,
  Rocket,
  Camera,
  Users,
  FileText,
} from "lucide-react";

const CHECKPOINT_TYPES = [
  { value: "MANUAL", label: "Manual Entry", icon: FileText, color: "#e6e6e6" },
  { value: "GIT_COMMIT", label: "Git Commit", icon: GitCommit, color: "#63a1ff" },
  { value: "DEPLOYMENT", label: "Deployment", icon: Rocket, color: "#59d499" },
  { value: "SCREENSHOT", label: "Screenshot", icon: Camera, color: "#ff6363" },
  { value: "COLLABORATION", label: "Collaboration", icon: Users, color: "#63a1ff" },
];

interface CheckpointFormProps {
  projectId: string;
  collaborators?: { address: string }[];
  onSuccess?: (checkpoint: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export function CheckpointCreationForm({
  projectId,
  collaborators = [],
  onSuccess,
  onCancel,
}: CheckpointFormProps) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  const [checkpointType, setCheckpointType] = useState("MANUAL");
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "UPLOADING" | "HASHING" | "SUBMITTING" | "SUCCESS" | "ERROR">("IDLE");
  const [statusMessage, setStatusMessage] = useState("");

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const maxSize = 10 * 1024 * 1024;
    if (selected.size > maxSize) {
      setStatus("ERROR");
      setStatusMessage("File exceeds 10MB limit.");
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(selected.type)) {
      setStatus("ERROR");
      setStatusMessage("Invalid file type. Allowed: PNG, JPEG, WebP, GIF.");
      return;
    }

    setFile(selected);
    setStatus("IDLE");
    setStatusMessage("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFilePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(selected);
  }, []);

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleCollaborator = (addr: string) => {
    setSelectedCollaborators((prev) =>
      prev.includes(addr) ? prev.filter((a) => a !== addr) : [...prev, addr]
    );
  };

  const generateCheckpointHash = (desc: string, type: string, creator: string): string => {
    const payload = `${projectId}:${desc}:${type}:${creator}:${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, "0");
    return `0x${hex}${hex}${hex}${hex}${hex}${hex}${hex}${hex}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !description.trim()) return;

    setIsSubmitting(true);
    setStatus("HASHING");
    setStatusMessage("Generating checkpoint hash from metadata...");

    try {
      const checkpointHash = generateCheckpointHash(description, checkpointType, address);

      const signingTimestamp = Date.now();

      let signature = "";
      if (walletClient) {
        try {
          const message = `TRACE Checkpoint Anchor\nProject: ${projectId}\nHash: ${checkpointHash}\nTime: ${signingTimestamp}`;
          signature = await walletClient.signMessage({
            message,
            account: address as `0x${string}`,
          });
        } catch {
          toast.error("Signature rejected – checkpoint will be saved off-chain without cryptographic proof");
        }
      }

      setStatus("UPLOADING");
      setStatusMessage("Uploading checkpoint to Monad Testnet...");
      setUploadProgress(30);

      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("hash", checkpointHash);
      formData.append("description", description.trim());
      formData.append("checkpointType", checkpointType);
      formData.append("creatorAddress", address);
      formData.append("signingTimestamp", String(signingTimestamp));

      if (file) {
        formData.append("file", file);
      }

      if (selectedCollaborators.length > 0) {
        formData.append("collaborators", JSON.stringify(selectedCollaborators));
      }

      if (signature) {
        formData.append("signature", signature);
      }

      setUploadProgress(60);

      const response = await fetch("/api/checkpoints", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkpoint");
      }

      setUploadProgress(100);
      setStatus("SUCCESS");
      setStatusMessage(`Checkpoint ${checkpointHash.slice(0, 10)}... anchored to Monad Testnet`);

      setTimeout(() => {
        onSuccess?.(data.checkpoint);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Checkpoint creation failed";
      setStatus("ERROR");
      setStatusMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-[#07080a] border border-[#363739] shadow-key">
      <CardHeader className="pb-4 border-b border-[#363739]">
        <CardTitle className="flex items-center gap-2 text-[18px] font-medium text-[#ffffff] font-sans">
          <Terminal className="h-5 w-5 text-[#ff6363]" />
          <span>Create Cryptographic Checkpoint</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-[13px] font-medium text-[#ffffff]">
              Checkpoint Type
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CHECKPOINT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = checkpointType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setCheckpointType(type.value)}
                    disabled={isSubmitting}
                    className={`cursor-pointer flex flex-col items-center gap-1.5 p-3 rounded-lg border text-[12px] font-mono font-medium transition-all ${
                      isSelected
                        ? "bg-[#1b1c1e] border-[#ff6363] text-[#ffffff]"
                        : "bg-[#111214] border-[#363739] text-[#9c9c9d] hover:border-[#6a6b6c] hover:text-[#e6e6e6]"
                    }`}
                  >
                    <Icon className="h-4 w-4" style={{ color: isSelected ? type.color : "#9c9c9d" }} />
                    <span className="text-center leading-tight">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-description" className="text-[13px] font-medium text-[#ffffff]">
              Milestone Description
            </Label>
            <Textarea
              id="cp-description"
              placeholder="Describe what was accomplished in this checkpoint..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              disabled={isSubmitting}
              className="bg-[#111214] border-[#363739] text-[#ffffff] font-sans text-[14px] focus:border-[#ff6363] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-[#ffffff]">
              Screenshot / Evidence Upload
            </Label>
            <div className="relative">
              {filePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-[#363739] bg-[#111214]">
                  <img
                    src={filePreview}
                    alt="Checkpoint evidence preview"
                    className="w-full max-h-48 object-contain bg-[#040506]"
                  />
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={isSubmitting}
                    className="cursor-pointer absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full bg-[#040506]/80 text-[#ff6363] border border-[#363739] hover:bg-[#1b1c1e] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="px-3 py-2 bg-[#111214] border-t border-[#363739] flex items-center justify-between text-[12px] font-mono text-[#9c9c9d]">
                    <span className="truncate">{file?.name}</span>
                    <span>{file ? `${(file.size / 1024).toFixed(1)} KB` : ""}</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="cursor-pointer w-full flex flex-col items-center gap-2 p-6 rounded-lg border border-dashed border-[#363739] bg-[#111214]/40 text-[#9c9c9d] hover:border-[#6a6b6c] hover:text-[#e6e6e6] transition-all"
                >
                  <Upload className="h-6 w-6 text-[#ff6363]" />
                  <span className="text-[13px] font-medium">Click to upload evidence</span>
                  <span className="text-[11px] font-mono text-[#6a6b6c]">PNG, JPEG, WebP, GIF · Max 10MB</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {collaborators.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-[#ffffff]">
                Co-sign with Team Members
              </Label>
              <div className="flex flex-wrap gap-2">
                {collaborators.map((c) => {
                  const isSelected = selectedCollaborators.includes(c.address);
                  return (
                    <button
                      key={c.address}
                      type="button"
                      onClick={() => toggleCollaborator(c.address)}
                      disabled={isSubmitting}
                      className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-mono border transition-all ${
                        isSelected
                          ? "bg-[#1b1c1e] border-[#63a1ff] text-[#63a1ff]"
                          : "bg-[#111214] border-[#363739] text-[#9c9c9d] hover:border-[#6a6b6c]"
                      }`}
                    >
                      <Users className="h-3 w-3" />
                      <span>{c.address.slice(0, 6)}...{c.address.slice(-4)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {status !== "IDLE" && (
            <div
              className={`p-3.5 rounded-lg border text-[13px] font-mono flex items-start gap-2.5 ${
                status === "SUCCESS"
                  ? "bg-[#1b1c1e] border-[#59d499]/40 text-[#59d499]"
                  : status === "ERROR"
                  ? "bg-[#1b1c1e] border-[#ff6363]/40 text-[#ff6363]"
                  : "bg-[#111214] border-[#363739] text-[#e6e6e6]"
              }`}
            >
              {status === "SUCCESS" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#59d499]" />
              ) : status === "ERROR" ? (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#ff6363]" />
              ) : (
                <Loader2 className="h-4 w-4 shrink-0 mt-0.5 animate-spin text-[#63a1ff]" />
              )}
              <span className="leading-[1.5]">{statusMessage}</span>
            </div>
          )}

          {(status === "UPLOADING" || status === "HASHING" || status === "SUBMITTING") && (
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-[#111214] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#ff6363] transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-right text-[11px] font-mono text-[#6a6b6c]">
                {uploadProgress}%
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-3 border-t border-[#363739]">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="cursor-pointer bg-[#111214] hover:bg-[#1b1c1e] text-[#e6e6e6] border-[#363739] text-[13px] h-9 px-4"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || !description.trim() || !address}
              className="cursor-pointer bg-[#e6e6e6] hover:bg-[#ffffff] text-[#111214] font-medium text-[13px] h-9 px-5 rounded-lg shadow-sm gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Anchor Checkpoint</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
