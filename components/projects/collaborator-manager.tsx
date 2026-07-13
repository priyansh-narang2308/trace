/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserPlus,
  Trash2,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
} from "lucide-react";

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

export function CollaboratorManager({
  projectId,
  onCollaboratorChange,
}: CollaboratorManagerProps) {
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
    fetchCollaborators();
  }, [fetchCollaborators]);

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newAddress ||
      !newAddress.startsWith("0x") ||
      newAddress.length !== 42
    ) {
      setError(
        "Please enter a valid 42-character Ethereum/Monad address (0x...)",
      );
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
      const msg =
        err instanceof Error ? err.message : "Error adding collaborator";
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
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error("Failed to remove collaborator");
      }

      await fetchCollaborators();
      onCollaboratorChange?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error removing collaborator";
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
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Users className="h-5 w-5 text-indigo-400" />
          <span>Team & Collaborator Access</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          onSubmit={handleAddCollaborator}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Input
            placeholder="Enter Monad wallet address (0x...)"
            value={newAddress}
            onChange={(e) => {
              setNewAddress(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
            className="font-mono text-sm flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !newAddress}
            className="shrink-0 gap-2 font-semibold"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            <span>Add Collaborator</span>
          </Button>
        </form>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
            {error}
          </div>
        )}

        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Authorized Checkpoint Signers</span>
            <span>`{collaborators.length}` Total</span>
          </div>

          {isFetching ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Syncing access list...</span>
            </div>
          ) : collaborators.length === 0 ? (
            <div className="p-6 rounded-lg bg-muted/30 border border-dashed text-center">
              <ShieldCheck className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                No co-signers added yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add teammate wallet addresses to permit them to submit
                cryptographically verified checkpoints on your project.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card/60 hover:bg-card transition-colors group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-xs shrink-0">
                      0x
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-mono text-sm font-medium truncate">
                        {collab.address}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
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
                      className="h-8 w-8"
                    >
                      {copiedId === collab.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCollaborator(collab.address)}
                      title="Remove Collaborator"
                      disabled={isLoading}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
