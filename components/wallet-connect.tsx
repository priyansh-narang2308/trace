"use client";

import { useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wallet,
  LogOut,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { monadTestnet } from "@/lib/wagmi";

export function WalletConnect() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isWrongNetwork = isConnected && chainId !== monadTestnet.id;

  if (isConnecting || isReconnecting || isPending) {
    return (
      <Button variant="outline" size="sm" disabled className="animate-pulse">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
        Connecting...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="default"
              size="sm"
              className="shadow-xs hover:shadow-md transition-all"
            />
          }
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Select Wallet
          </div>
          <DropdownMenuSeparator />
          {connectors.map((connector) => (
            <DropdownMenuItem
              key={connector.id}
              onClick={() => connect({ connector })}
              className="cursor-pointer font-medium py-2"
            >
              <Wallet className="mr-2 h-4 w-4 text-primary" />
              {connector.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isWrongNetwork) {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => switchChain({ chainId: monadTestnet.id })}
        className="animate-bounce"
      >
        <AlertCircle className="mr-2 h-4 w-4" />
        Switch to Monad Testnet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        Monad Testnet
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="border-primary/20 hover:border-primary/50 font-mono"
            />
          }
        >
          <Wallet className="mr-2 h-4 w-4 text-primary" />
          {address && formatAddress(address)}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-2 py-1.5 text-xs text-muted-foreground font-mono">
            Connected to Monad (`{chainId}`)
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Address Copied!" : "Copy Address"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => disconnect()}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export { WalletConnect as ConnectWallet };
