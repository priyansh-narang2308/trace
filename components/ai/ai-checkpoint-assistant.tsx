"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Terminal,
  ShieldCheck,
  Loader2,
  Check,
  Copy,
  Zap,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";

interface AICheckpointAssistantProps {
  projectId: string;
  onApplySuggestion?: (suggestion: {
    description: string;
    checkpointType: string;
  }) => void;
}

const QUICK_PROMPTS = [
  "Integrated Monad 1-second finality AMM swap router",
  "Fixed multi-sig P-256 precompile signature verification race condition",
  "Refactored zero-knowledge state commitment storage engine",
];

export function AICheckpointAssistant({
  projectId,
  onApplySuggestion,
}: AICheckpointAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedType, setSelectedType] = useState("MILESTONE");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    title: string;
    description: string;
    checkpointType: string;
    confidenceScore: number;
  } | null>(null);

  const generateAIProof = async (inputText: string = prompt) => {
    if (!inputText.trim() || isLoading) {
      if (!inputText.trim())
        toast.error("Enter rough commit notes for AI analysis");
      return;
    }

    setIsLoading(true);
    toast.info("Synthesizing cryptographic proof with TRACE AI...");

    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: inputText,
          projectId,
          checkpointType: selectedType,
        }),
      });

      if (!res.ok)
        throw new Error("Failed to generate AI checkpoint suggestion");

      const data = await res.json();
      setSuggestion(data.suggestion);
      toast.success("AI Cryptographic Milestone Attestation synthesized!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI Synthesizer error";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const applyToCockpit = () => {
    if (!suggestion) return;
    onApplySuggestion?.({
      description: suggestion.description,
      checkpointType: suggestion.checkpointType,
    });
    toast.success("AI verification proof staged directly into Anchor Cockpit!");
  };

  const copyToClipboard = () => {
    if (!suggestion) return;
    navigator.clipboard.writeText(suggestion.description);
    toast.success("AI milestone proof copied to clipboard!");
  };

  return (
    <Card className="bg-ink border border-border shadow-key overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-coral-pulse/5 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="text-[16px] font-medium text-pure-white flex items-center gap-2 font-sans">
          <BrainCircuit className="h-5 w-5 text-coral-pulse animate-pulse" />
          <span>TRACE AI Checkpoint Proof Assistant</span>
        </CardTitle>
        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-graphite text-coral-pulse border border-border flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          <span>Monad Enclave AI</span>
        </span>
      </CardHeader>

      <CardContent className="pt-5 space-y-5 font-mono text-[13px]">
        <div className="space-y-2">
          <div className="text-[11px] text-ash uppercase font-bold tracking-wider">
            Raw Commit Notes or Contribution Description
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. Optimized Monad P-256 precompile gas usage by 40%..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              className="w-full bg-obsidian border border-border rounded-lg px-3.5 py-2.5 text-pure-white placeholder:text-ash focus:border-coral-pulse outline-none text-[13px]"
            />
            <Button
              type="button"
              onClick={() => generateAIProof()}
              disabled={isLoading || !prompt.trim()}
              className="cursor-pointer bg-coral-pulse hover:bg-coral-pulse/90 text-void-black font-bold px-5 h-10 rounded-lg shrink-0 gap-2 shadow-sm transition-all"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>Synthesize Proof</span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] text-ash uppercase font-bold tracking-wider">
            Quick Analysis Templates
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(qp);
                  generateAIProof(qp);
                }}
                disabled={isLoading}
                className="cursor-pointer px-3 py-1.5 rounded-lg bg-obsidian hover:bg-graphite border border-border text-ash hover:text-pure-white transition-all text-[12px] truncate max-w-sm flex items-center gap-1.5"
              >
                <Zap className="h-3 w-3 text-electric-sky shrink-0" />
                <span className="truncate">{qp}</span>
              </button>
            ))}
          </div>
        </div>

        {suggestion && (
          <div className="p-4 rounded-xl bg-obsidian border border-border space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-verify" />
                <span className="font-bold text-pure-white">
                  {suggestion.title}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-graphite text-emerald-verify text-[11px] font-bold">
                Confidence: `{suggestion.confidenceScore}%`
              </span>
            </div>

            <div className="p-3 rounded-lg bg-void-black border border-border text-mist font-mono text-[12px] whitespace-pre-wrap leading-relaxed">
              {suggestion.description}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-ash flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-electric-sky" />
                <span>
                  Format: `{suggestion.checkpointType}` Anchor Protocol
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="cursor-pointer bg-graphite hover:bg-slate border-border text-pure-white font-mono text-[12px] gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Proof</span>
                </Button>

                {onApplySuggestion && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={applyToCockpit}
                    className="cursor-pointer bg-emerald-verify hover:bg-emerald-verify/90 text-void-black font-bold font-mono text-[12px] gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Stage into Cockpit</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
