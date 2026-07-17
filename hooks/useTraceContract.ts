import { useReadContract, useWriteContract } from "wagmi";
import { TraceCheckpointABI } from "@/lib/abi";

// We get the contract address from environment variables
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export function useTraceContract() {
  const { writeContract, writeContractAsync, isPending, isSuccess, error } = useWriteContract();

  const createProject = async (
    projectId: string,
    name: string,
    description: string,
    isPublic: boolean
  ) => {
    if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
    
    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: TraceCheckpointABI,
      functionName: "createProject",
      args: [projectId, name, description, isPublic],
    });
  };

  const createCheckpoint = async (
    hash: `0x${string}`,
    projectId: string,
    description: string,
    collaborators: `0x${string}`[],
    checkpointType: number // 0=MANUAL, 1=GIT_COMMIT, 2=DEPLOYMENT, etc.
  ) => {
    if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");

    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: TraceCheckpointABI,
      functionName: "createCheckpoint",
      args: [hash, projectId, description, collaborators, checkpointType],
    });
  };

  const addCollaborator = async (projectId: string, collaborator: `0x${string}`) => {
    if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");

    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: TraceCheckpointABI,
      functionName: "addCollaborator",
      args: [projectId, collaborator],
    });
  };

  return {
    createProject,
    createCheckpoint,
    addCollaborator,
    isPending,
    isSuccess,
    error,
    contractAddress: CONTRACT_ADDRESS
  };
}

export function useProject(projectId: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TraceCheckpointABI,
    functionName: "getProject",
    args: [projectId],
    query: {
      enabled: !!projectId && !!CONTRACT_ADDRESS,
    }
  });
}

export function useProjectCheckpoints(projectId: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TraceCheckpointABI,
    functionName: "getProjectCheckpoints",
    args: [projectId],
    query: {
      enabled: !!projectId && !!CONTRACT_ADDRESS,
    }
  });
}

export function useUserProjects(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TraceCheckpointABI,
    functionName: "getUserProjects",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!CONTRACT_ADDRESS,
    }
  });
}
