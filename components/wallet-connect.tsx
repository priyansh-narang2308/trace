"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, AlertTriangle } from "lucide-react";

const MONAD_TESTNET_ID = 10143;

export function WalletConnect() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isWrongChain = isConnected && chainId !== MONAD_TESTNET_ID;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {isWrongChain && (
          <Button
            onClick={() =>
              switchChain?.({
                chainId: MONAD_TESTNET_ID,
              })
            }
            className="
              cursor-pointer
              bg-[#ff6363]
              hover:bg-[#ff6363]/90
              text-white
              font-semibold
              text-[13px]
              h-11
              px-5
              rounded-xl
              shadow-lg
              gap-2
              transition-all
              hover:scale-[1.02]
            "
          >
            <AlertTriangle className="h-4 w-4" />
            Switch Monad
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            className="
              cursor-pointer
              bg-[#111214]
              hover:bg-[#1b1c1e]
              text-white
              border
              border-[#363739]
              font-mono
              text-[14px]
              h-11
              px-5
              rounded-xl
              shadow-lg
              flex
              items-center
              gap-3
              transition-all
              hover:border-[#ff6363]/50
              focus:outline-none
              focus:ring-2
              focus:ring-[#ff6363]/30
            "
          >
            <div className="h-2.5 w-2.5 rounded-full bg-[#59d499] animate-pulse" />

            <span>
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="
              bg-[#07080a]
              border
              border-[#363739]
              text-white
              shadow-xl
              rounded-xl
              p-1
              w-56
            "
          >
            <div
              className="
                px-3
                py-3
                text-[11px]
                font-mono
                text-[#9c9c9d]
                border-b
                border-[#363739]
                mb-1
              "
            >
              Connected to Monad Testnet
              <br />
              Chain ID: 10143
            </div>

            <DropdownMenuItem
              onClick={() => disconnect()}
              className="
                cursor-pointer
                flex
                items-center
                gap-3
                px-3
                py-3
                text-[14px]
                text-[#ff6363]
                hover:bg-[#1b1c1e]
                rounded-lg
                transition-colors
                focus:bg-[#1b1c1e]
                focus:text-[#ff6363]
              "
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
    <div className="flex items-center gap-3">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() =>
            connect({
              connector,
            })
          }
          disabled={isPending}
          className="
            group
            relative
            overflow-hidden
            cursor-pointer
            bg-white
            hover:bg-white/90
            text-[#111214]
            font-semibold
            text-[14px]
            h-11
            px-6
            rounded-xl
            shadow-lg
            gap-3
            transition-all
            duration-300
            hover:scale-[1.02]
          "
        >
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-transparent
              via-[#ff6363]/20
              to-transparent
              translate-x-[-120%]
              group-hover:translate-x-[120%]
              transition-transform
              duration-700
            "
          />

          <Wallet className="relative h-5 w-5 text-[#ff6363]" />

          <span className="relative">
            {isPending ? "Connecting..." : "Connect Wallet"}
          </span>
        </Button>
      ))}
    </div>
  );
}
