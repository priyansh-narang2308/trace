"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Trash2, Copy, Check, Loader2, ShieldCheck } from "lucide-react";

interface Collaborator {
  id: string;
  projectId: string;
  address: string;
  addedAt: string;
}

interface CollaboratorManagerProps {
  projectId: string;
  onCollaboratorChange?: () => void;
}

export function CollaboratorManager({ projectId, onCollaboratorChange }: CollaboratorManagerProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCollaborators = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`);
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators || []);
      }
    } catch (err) {
      console.error("Failed to load collaborators:", err);
    } finally {
      setIsFetching(false);
    }
  }, [projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCollaborators();
  }, [fetchCollaborators]);

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress || !newAddress.startsWith("0x") || newAddress.length !== 42) {
      setError("Please enter a valid 42-character Ethereum/Monad address (0x...)");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: newAddress }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add collaborator");
      }

      setNewAddress("");
      await fetchCollaborators();
      onCollaboratorChange?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error adding collaborator";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (address: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborators?address=${encodeURIComponent(address)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to remove collaborator");
      }

      await fetchCollaborators();
      onCollaboratorChange?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error removing collaborator";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="bg-[#07080a] border border-[#363739] shadow-key">
      <CardHeader className="pb-3 border-b border-[#363739]">
        <CardTitle className="flex items-center gap-2 text-[18px] font-medium text-[#ffffff] font-sans">
          <Users className="h-5 w-5 text-[#ff6363]" />
          <span>Team & Collaborator Access</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        <form onSubmit={handleAddCollaborator} className="flex flex-col sm:flex-row gap-2.5">
          <Input
            placeholder="Enter Monad wallet address (0x...)"
            value={newAddress}
            onChange={(e) => {
              setNewAddress(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
            className="bg-[#111214] border-[#363739] text-[#ffffff] font-mono text-[13px] flex-1 focus:border-[#ff6363]"
          />
          <Button
            type="submit"
            disabled={isLoading || !newAddress}
            className="cursor-pointer bg-[#e6e6e6] hover:bg-[#ffffff] text-[#111214] font-medium text-[13px] shrink-0 gap-2 h-10 px-4 rounded-lg shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            <span>Add Co-Signer</span>
          </Button>
        </form>

        {error && (
          <div className="p-3 rounded-md bg-[#1b1c1e] border border-[#ff6363]/40 text-[#ff6363] text-[12px] font-mono">
            {error}
          </div>
        )}

        <div className="space-y-3 pt-2 border-t border-[#363739]">
          <div className="flex items-center justify-between text-[11px] font-mono font-medium text-[#9c9c9d] uppercase tracking-wider">
            <span>Authorized Checkpoint Signers</span>
            <span>`{collaborators.length}` Total</span>
          </div>

          {isFetching ? (
            <div className="flex items-center justify-center py-8 text-[#9c9c9d]">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-[#63a1ff]" />
              <span className="text-[13px] font-mono">Syncing access list...</span>
            </div>
          ) : collaborators.length === 0 ? (
            <div className="p-6 rounded-lg bg-[#111214]/60 border border-[#363739] text-center">
              <ShieldCheck className="h-7 w-7 text-[#9c9c9d]/60 mx-auto mb-2" />
              <p className="text-[13px] font-medium text-[#ffffff]">No co-signers added yet</p>
              <p className="text-[12px] text-[#9c9c9d] mt-1">
                Add teammate wallet addresses to permit them to submit cryptographically verified checkpoints on your project.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#363739] bg-[#111214] hover:border-[#6a6b6c] transition-colors group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 rounded-full bg-[#1b1c1e] border border-[#363739] flex items-center justify-center text-[#ff6363] font-mono text-[12px] shrink-0">
                      0x
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-mono text-[13px] font-medium text-[#ffffff] truncate">
                        {collab.address}
                      </div>
                      <div className="text-[11px] font-mono text-[#9c9c9d]">
                        Added `{new Date(collab.addedAt).toLocaleDateString()}`
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(collab.address, collab.id)}
                      title="Copy Address"
                      className="cursor-pointer h-8 w-8 text-[#9c9c9d] hover:text-[#ffffff] hover:bg-[#1b1c1e]"
                    >
                      {copiedId === collab.id ? (
                        <Check className="h-3.5 w-3.5 text-[#59d499]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCollaborator(collab.address)}
                      title="Remove Collaborator"
                      disabled={isLoading}
                      className="cursor-pointer h-8 w-8 text-[#ff6363] hover:bg-[#1b1c1e]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
