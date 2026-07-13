"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, ShieldCheck, AlertTriangle } from "lucide-react";

const MONAD_TESTNET_ID = 10143;

export function WalletConnect() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isWrongChain = isConnected && chainId !== MONAD_TESTNET_ID;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {isWrongChain && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => switchChain?.({ chainId: MONAD_TESTNET_ID })}
            className="cursor-pointer bg-[#ff6363] hover:bg-[#ff6363]/80 text-[#ffffff] font-medium text-[12px] h-8 px-3 gap-1.5 rounded-lg shadow-sm"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Switch to Monad</span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer bg-[#111214] hover:bg-[#1b1c1e] text-[#ffffff] border border-[#363739] font-mono text-[13px] h-8 px-3.5 rounded-lg shadow-sm flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-[#ff6363]">
            <div className="h-2 w-2 rounded-full bg-[#59d499] animate-pulse" />
            <span>
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[#07080a] border border-[#363739] text-[#ffffff] shadow-key rounded-xl p-1 w-48"
          >
            <div className="px-3 py-2 text-[11px] font-mono text-[#9c9c9d] border-b border-[#363739] mb-1">
              Connected to Monad (`10143`)
            </div>
            <DropdownMenuItem
              onClick={() => disconnect()}
              className="cursor-pointer flex items-center gap-2 px-3 py-2 text-[13px] text-[#ff6363] hover:bg-[#1b1c1e] rounded-lg transition-colors focus:bg-[#1b1c1e] focus:text-[#ff6363]"
            >
              <LogOut className="h-4 w-4" />
              <span>Disconnect Wallet</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          size="sm"
          className="cursor-pointer bg-[#e6e6e6] hover:bg-[#ffffff] text-[#111214] font-medium text-[13px] h-8 px-4 rounded-lg shadow-sm gap-2 transition-all"
        >
          <Wallet className="h-3.5 w-3.5 text-[#ff6363]" />
          <span>Connect Monad</span>
        </Button>
      ))}
    </div>
  );
}
