"use client";

import { useState, useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { encodeFunctionData, keccak256, toBytes, parseGwei } from "viem";
import { monadTestnet } from "@/lib/wagmi";

const CONTRACT_ADDRESS = "0xaD1B8719a89D008db117ce3371F57432934EC3e5" as `0x${string}`;

const CHECKPOINT_ABI = [
  {
    name: "createCheckpoint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "projectId", type: "string" },
      { name: "checkpointHash", type: "bytes32" },
      { name: "description", type: "string" },
    ],
    outputs: [],
  },
] as const;

export type TxStatus = "IDLE" | "PREPARING" | "SIGNING" | "PENDING" | "CONFIRMED" | "FAILED";

export interface TxResult {
  status: TxStatus;
  txHash: string | null;
  gasUsed: string | null;
  blockNumber: string | null;
  error: string | null;
}

export function useMonadCheckpointTx() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: monadTestnet.id });
  const { data: walletClient } = useWalletClient({ chainId: monadTestnet.id });

  const [txResult, setTxResult] = useState<TxResult>({
    status: "IDLE",
    txHash: null,
    gasUsed: null,
    blockNumber: null,
    error: null,
  });

  const resetTx = useCallback(() => {
    setTxResult({
      status: "IDLE",
      txHash: null,
      gasUsed: null,
      blockNumber: null,
      error: null,
    });
  }, []);

  const submitCheckpoint = useCallback(
    async (projectId: string, description: string, checkpointHash: string) => {
      if (!address || !walletClient || !publicClient) {
        setTxResult((prev) => ({
          ...prev,
          status: "FAILED",
          error: "Wallet not connected or Monad client unavailable",
        }));
        return null;
      }

      setTxResult({
        status: "PREPARING",
        txHash: null,
        gasUsed: null,
        blockNumber: null,
        error: null,
      });

      try {
        const hashBytes = keccak256(toBytes(checkpointHash));

        const txData = encodeFunctionData({
          abi: CHECKPOINT_ABI,
          functionName: "createCheckpoint",
          args: [projectId, hashBytes, description],
        });

        setTxResult((prev) => ({ ...prev, status: "SIGNING" }));

        const txHash = await walletClient.sendTransaction({
          to: CONTRACT_ADDRESS,
          data: txData,
          chain: monadTestnet,
          account: address,
          maxFeePerGas: parseGwei("50"),
          maxPriorityFeePerGas: parseGwei("2"),
        });

        setTxResult((prev) => ({
          ...prev,
          status: "PENDING",
          txHash,
        }));

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 1,
          timeout: 30_000,
        });

        const gasUsed = receipt.gasUsed.toString();
        const blockNumber = receipt.blockNumber.toString();

        setTxResult({
          status: "CONFIRMED",
          txHash,
          gasUsed,
          blockNumber,
          error: null,
        });

        await fetch("/api/checkpoints", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            checkpointHash,
            txHash,
            gasUsed,
          }),
        });

        return txHash;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Transaction failed";
        setTxResult((prev) => ({
          ...prev,
          status: "FAILED",
          error: msg,
        }));
        return null;
      }
    },
    [address, walletClient, publicClient]
  );

  return { txResult, submitCheckpoint, resetTx };
}
