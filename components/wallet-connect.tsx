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
      <div className="flex items-center gap-2 shrink-0">
        {isWrongChain && (
          <Button
            onClick={() =>
              switchChain?.({
                chainId: MONAD_TESTNET_ID,
              })
            }
            className="
              cursor-pointer
              bg-coral-pulse
              hover:bg-coral-pulse/90
              text-white
              font-semibold
              text-[12px]
              sm:text-[13px]
              h-9
              sm:h-10
              px-3
              sm:px-3.5
              rounded-xl
              shadow-[0_0_15px_rgba(255,42,42,0.5)]
              flex
              items-center
              gap-1.5
              transition-all
              hover:scale-[1.02]
              shrink-0
              animate-pulse
            "
            title="Switch your wallet to Monad Testnet (Chain ID 10143)"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Switch Monad</span>
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
              text-[11px]
              sm:text-[13px]
              h-8
              sm:h-10
              px-2.5
              sm:px-3.5
              rounded-xl
              shadow-lg
              flex
              items-center
              gap-1.5
              sm:gap-2
              transition-all
              hover:border-[#ff6363]/50
              focus:outline-none
              focus:ring-2
              focus:ring-[#ff6363]/30
              shrink-0
            "
          >
            <div
              className={`h-2 w-2 rounded-full ${
                isWrongChain
                  ? "bg-coral-pulse shadow-[0_0_8px_rgba(255,42,42,0.8)]"
                  : "bg-[#59d499] shadow-[0_0_8px_rgba(89,212,153,0.8)]"
              } animate-pulse shrink-0`}
              title={
                isWrongChain
                  ? `Wrong Chain (${chainId})`
                  : "Connected to Monad Testnet (10143)"
              }
            />

            <span className="truncate">
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
              z-50
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
              {isWrongChain ? (
                <>
                  <div className="text-coral-pulse font-bold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Wrong Chain ({chainId || "Unknown"})</span>
                  </div>
                  <span>Target: Monad Testnet (10143)</span>
                </>
              ) : (
                <>
                  <div className="text-[#59d499] font-bold flex items-center gap-1.5 mb-1">
                    <div className="h-2 w-2 rounded-full bg-[#59d499]" />
                    <span>Monad Testnet Active</span>
                  </div>
                  <span>Chain ID: 10143</span>
                </>
              )}
            </div>

            {isWrongChain && (
              <DropdownMenuItem
                onClick={() =>
                  switchChain?.({
                    chainId: MONAD_TESTNET_ID,
                  })
                }
                className="
                  cursor-pointer
                  flex
                  items-center
                  gap-2
                  px-3
                  py-2
                  text-[13px]
                  rounded-lg
                  text-coral-pulse
                  hover:bg-coral-pulse/15
                  font-semibold
                  mb-1
                "
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Switch to Monad (10143)</span>
              </DropdownMenuItem>
            )}

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
      {connectors.length === 0 ? (
        <Button
          onClick={() =>
            window.open(
              "https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
              "_blank",
            )
          }
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
          <Wallet className="relative h-5 w-5 text-[#ff6363]" />
          <span className="relative">Install MetaMask</span>
        </Button>
      ) : (
        connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (typeof window !== "undefined" && !(window as any).ethereum) {
                window.open(
                  "https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
                  "_blank",
                );
                return;
              }
              connect({
                connector,
              });
            }}
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
        ))
      )}
    </div>
  );
}
