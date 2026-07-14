"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Fingerprint,
  KeyRound,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { WalletConnect } from "@/components/wallet-connect";
import {
  extractP256Coordinates,
  parseDERSignature,
} from "@/lib/monad-p256";

interface PasskeyAuthProps {
  onAuthenticated?: () => void;
}

export function PasskeyAuth({ onAuthenticated }: PasskeyAuthProps) {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<
    "IDLE" | "REGISTERING" | "VERIFYING" | "SUCCESS" | "ERROR"
  >("IDLE");
  const [message, setMessage] = useState<string>("");
  const [passkeyStatus, setPasskeyStatus] = useState<{
    isRegistered: boolean;
    passkeyId?: string;
  }>({
    isRegistered: false,
  });

  const checkPasskeyRegistration = useCallback(async () => {
    if (!address) return;
    try {
      const response = await fetch(
        `/api/passkey/register?address=${encodeURIComponent(address)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setPasskeyStatus({
          isRegistered: Boolean(data.passkeyId),
          passkeyId: data.passkeyId,
        });
      }
    } catch (err) {
      console.error("Error checking passkey status:", err);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      checkPasskeyRegistration();
    }
  }, [isConnected, address, checkPasskeyRegistration]);

  const handleRegisterPasskey = async () => {
    if (!address) {
      setMessage("Please connect your wallet first.");
      setStatus("ERROR");
      return;
    }

    setIsLoading(true);
    setStatus("REGISTERING");
    setMessage("Initiating WebAuthn ES256 credential creation...");

    try {
      const challengeBuffer = new Uint8Array(32);
      window.crypto.getRandomValues(challengeBuffer);

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: challengeBuffer,
          rp: {
            name: "TRACE Monad Testnet Platform",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(address),
            name: address,
            displayName: `TRACE Builder (${address.slice(0, 6)}...${address.slice(-4)})`,
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "preferred",
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error("Passkey registration was cancelled or failed.");
      }

      const rawIdBytes = new Uint8Array(credential.rawId);
      const rawId = btoa(String.fromCharCode(...rawIdBytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      const response = credential.response as AuthenticatorAttestationResponse;
      const publicKeyBytes = response.getPublicKey();
      if (!publicKeyBytes) {
        throw new Error("Could not extract public key from WebAuthn credential");
      }
      const { x, y } = extractP256Coordinates(publicKeyBytes);

      const saveRes = await fetch("/api/passkey/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          passkeyId: rawId,
          publicKeyX: x,
          publicKeyY: y,
        }),
      });

      if (!saveRes.ok) {
        throw new Error(
          "Failed to save P-256 precompile coordinates to server.",
        );
      }

      setPasskeyStatus({ isRegistered: true, passkeyId: rawId });
      setStatus("SUCCESS");
      setMessage(
        "Passkey P-256 coordinates anchored successfully to Monad Testnet profile.",
      );
      onAuthenticated?.();
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Passkey registration error";
      setStatus("ERROR");
      setMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    if (!address) {
      setMessage("Connect wallet first.");
      setStatus("ERROR");
      return;
    }

    setIsLoading(true);
    setStatus("VERIFYING");
    setMessage("Requesting biometric passkey signature...");

    try {
      const challengeBuffer = new Uint8Array(32);
      window.crypto.getRandomValues(challengeBuffer);

      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge: challengeBuffer,
          rpId: window.location.hostname,
          userVerification: "required",
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (!assertion) {
        throw new Error("Authentication cancelled or failed.");
      }

      const response = assertion.response as AuthenticatorAssertionResponse;

      const authData = new Uint8Array(response.authenticatorData);
      const clientDataJSON = new Uint8Array(response.clientDataJSON);

      const clientDataHash = await crypto.subtle.digest("SHA-256", clientDataJSON);
      const signedData = new Uint8Array(authData.length + clientDataHash.byteLength);
      signedData.set(authData);
      signedData.set(new Uint8Array(clientDataHash), authData.length);

      const messageHashBytes = await crypto.subtle.digest("SHA-256", signedData);
      const messageHash =
        "0x" + Array.from(new Uint8Array(messageHashBytes))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

      const sig = parseDERSignature(response.signature);

      const verifyRes = await fetch("/api/passkey/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          messageHash,
          signatureR: sig.r,
          signatureS: sig.s,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.verified) {
        throw new Error(
          verifyData.error ||
            "Onchain P-256 precompile (0x0100) signature verification failed.",
        );
      }

      setStatus("SUCCESS");
      setMessage(
        "Biometric signature verified via Monad 0x0100 P-256 precompile!",
      );
      onAuthenticated?.();
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Passkey verification error";
      setStatus("ERROR");
      setMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected || !address) {
    return (
      <Card className="bg-[#07080a] border border-[#363739] shadow-key">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-[#ffffff] text-[18px] font-medium font-sans">
            <KeyRound className="h-5 w-5 text-[#ff6363]" />
            <span>Monad P-256 Biometric Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center py-6">
          <p className="text-[14px] text-[#9c9c9d] leading-[1.6]">
            Connect your Monad Testnet wallet (`Chain ID 10143`) to register
            hardware passkeys or sign checkpoints via hardware secure enclaves.
          </p>
          <div className="flex justify-center pt-2">
            <WalletConnect />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#07080a] border border-[#363739] shadow-key">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#ffffff] text-[18px] font-medium font-sans">
            <Fingerprint className="h-5 w-5 text-[#ff6363]" />
            <span>Hardware Passkey Verification</span>
          </CardTitle>
          {passkeyStatus.isRegistered ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#1b1c1e] text-[#59d499] border border-[#363739] flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-[#59d499]" />
              <span>P-256 Registered</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#1b1c1e] text-[#9c9c9d] border border-[#363739]">
              Not Registered
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="p-3.5 rounded-lg bg-[#111214] border border-[#363739] flex items-center justify-between text-[13px] font-mono text-[#9c9c9d]">
          <div className="flex items-center gap-2 overflow-hidden">
            <ShieldCheck className="h-4 w-4 text-[#63a1ff] shrink-0" />
            <span className="truncate">
              Wallet: `{address.slice(0, 8)}...{address.slice(-6)}`
            </span>
          </div>
          <span className="text-[11px] uppercase px-2 py-0.5 rounded bg-[#07080a] text-[#e6e6e6] border border-[#363739]">
            Precompile `0x0100`
          </span>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-lg border text-[13px] font-mono flex items-start gap-2.5 ${
              status === "SUCCESS"
                ? "bg-[#1b1c1e] border-[#59d499]/40 text-[#59d499]"
                : status === "ERROR"
                  ? "bg-[#1b1c1e] border-[#ff6363]/40 text-[#ff6363]"
                  : "bg-[#111214] border-[#363739] text-[#e6e6e6]"
            }`}
          >
            {status === "SUCCESS" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#59d499]" />
            ) : status === "ERROR" ? (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#ff6363]" />
            ) : (
              <Loader2 className="h-4 w-4 shrink-0 mt-0.5 animate-spin text-[#63a1ff]" />
            )}
            <span className="leading-[1.5]">{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            onClick={handleRegisterPasskey}
            disabled={isLoading || passkeyStatus.isRegistered}
            className="cursor-pointer bg-[#1b1c1e] hover:bg-[#2f3031] text-[#ffffff] border border-[#363739] text-[13px] font-medium h-10 rounded-lg shadow-sm gap-2 transition-all"
          >
            {isLoading && status === "REGISTERING" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4 text-[#ff6363]" />
            )}
            <span>
              {passkeyStatus.isRegistered
                ? "Passkey Enclave Active"
                : "Register P-256 Key"}
            </span>
          </Button>

          <Button
            type="button"
            onClick={handleAuthenticate}
            disabled={isLoading || !passkeyStatus.isRegistered}
            className="cursor-pointer bg-[#e6e6e6] hover:bg-[#ffffff] text-[#111214] font-medium text-[13px] h-10 rounded-lg shadow-sm gap-2 transition-all"
          >
            {isLoading && status === "VERIFYING" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Fingerprint className="h-4 w-4" />
            )}
            <span>Verify & Sign Milestone</span>
          </Button>
        </div>

        <div className="pt-3 border-t border-[#363739] flex items-center justify-between text-[11px] font-mono text-[#6a6b6c]">
          <span>Hardware enclave (WebAuthn ES256)</span>
          <span>Monad secp256r1 precompile</span>
        </div>
      </CardContent>
    </Card>
  );
}
