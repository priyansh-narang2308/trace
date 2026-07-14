"use client";

import { useState, useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { encodeFunctionData, keccak256, toBytes, parseGwei, zeroAddress } from "viem";
import { monadTestnet } from "@/lib/wagmi";

const CONTRACT_ADDRESS = "0xaD1B8719a89D008db117ce3371F57432934EC3e5" as `0x${string}`;

const PROJECT_ABI = [
  {
    name: "createProject",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "projectId", type: "string" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "isPublic", type: "bool" },
    ],
    outputs: [],
  },
  {
    name: "getProject",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "projectId", type: "string" }],
    outputs: [
      { name: "owner", type: "address" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "createdAt", type: "uint256" },
      { name: "isPublic", type: "bool" },
      { name: "collaborators", type: "address[]" },
    ],
  },
] as const;

const CHECKPOINT_ABI = [
  {
    name: "createCheckpoint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "hash", type: "bytes32" },
      { name: "projectId", type: "string" },
      { name: "description", type: "string" },
      { name: "collaborators", type: "address[]" },
      { name: "checkpointType", type: "uint8" },
    ],
    outputs: [],
  },
] as const;

export type TxStatus = "IDLE" | "PREPARING" | "SIGNING" | "PENDING" | "CONFIRMED" | "FAILED" | "INIT_PROJECT";

export interface TxResult {
  status: TxStatus;
  txHash: string | null;
  gasUsed: string | null;
  blockNumber: string | null;
  error: string | null;
}

function parseEVMError(err: unknown): string {
  if (!(err instanceof Error)) return "Transaction failed";
  const msg = err.message;

  if (msg.includes("UserRejectedRequestError") || msg.includes("rejected the request") || msg.includes("user rejected")) {
    return "Transaction cancelled in wallet";
  }
  if (msg.includes("ContractFunctionRevertedError")) {
    const reasonMatch = msg.match(/reason:\s*"([^"]+)"/);
    if (reasonMatch) return `Contract reverted: ${reasonMatch[1]}`;
    const argsMatch = msg.match(/args:\s*\[([^\]]+)\]/);
    if (argsMatch) return `Contract reverted with args: ${argsMatch[1]}`;
    return "Smart contract call reverted. Check that the project is initialized on-chain and you are a collaborator.";
  }
  if (msg.includes("InsufficientFundsError") || msg.includes("insufficient funds") || msg.includes("not enough funds")) {
    return "Insufficient MON balance for transaction gas";
  }
  if (msg.includes("estimateGas") || msg.includes("execution reverted")) {
    return "Transaction would revert. Ensure the project is initialized on-chain and you are an authorized signer.";
  }
  if (msg.includes("timeout") || msg.includes("timed out") || msg.includes("TIMEOUT")) {
    return "Transaction timed out. Monad Testnet may be congested; please retry.";
  }
  if (msg.includes("nonce") || msg.includes("Nonce")) {
    return "Nonce error. Please reset your wallet or try a different account.";
  }
  if (msg.includes("NetworkError") || msg.includes("network") || msg.includes("Network")) {
    return "Network error. Check your RPC connection to Monad Testnet.";
  }

  if (msg.length > 120) {
    return msg.slice(0, 120) + "...";
  }
  return msg;
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
    async (
      projectId: string,
      description: string,
      checkpointHash: string,
      projectName?: string,
      projectDescription?: string,
      isPublic?: boolean,
      collaboratorAddrs?: string[],
      checkpointType?: number,
    ) => {
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
        const cols = (collaboratorAddrs || []) as `0x${string}`[];
        const cpType = checkpointType ?? 0;

        setTxResult((prev) => ({ ...prev, status: "PREPARING" }));

        const projectData = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: PROJECT_ABI,
          functionName: "getProject",
          args: [projectId],
        });

        const projectOwner = (projectData as readonly [`0x${string}`, ...unknown[]])[0] || zeroAddress;

        if (projectOwner === zeroAddress) {
          setTxResult((prev) => ({ ...prev, status: "INIT_PROJECT" }));

          const initTxData = encodeFunctionData({
            abi: PROJECT_ABI,
            functionName: "createProject",
            args: [
              projectId,
              projectName || projectId,
              projectDescription || description,
              isPublic ?? true,
            ],
          });

          const initTxHash = await walletClient.sendTransaction({
            to: CONTRACT_ADDRESS,
            data: initTxData,
            chain: monadTestnet,
            account: address,
            maxFeePerGas: parseGwei("50"),
            maxPriorityFeePerGas: parseGwei("2"),
          });

          await publicClient.waitForTransactionReceipt({
            hash: initTxHash,
            confirmations: 1,
            timeout: 30_000,
          });
        }

        setTxResult((prev) => ({ ...prev, status: "SIGNING" }));

        const txData = encodeFunctionData({
          abi: CHECKPOINT_ABI,
          functionName: "createCheckpoint",
          args: [hashBytes, projectId, description, cols, cpType],
        });

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
        const msg = parseEVMError(err);
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
