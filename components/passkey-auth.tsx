'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Fingerprint, Loader2, ShieldCheck, KeyRound } from 'lucide-react';
import { extractP256Coordinates, parseDERSignature, MONAD_P256_PRECOMPILE_ADDRESS } from '@/lib/monad-p256';
import { keccak256, stringToHex, type Hex } from 'viem';

interface PasskeyAuthProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAuthSuccess?: (result: any) => void;
  mode?: 'register' | 'authenticate';
  customChallenge?: string;
}

export function PasskeyAuth({ onAuthSuccess, mode = 'authenticate', customChallenge = 'TRACE Monad Checkpoint' }: PasskeyAuthProps) {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const registerPasskey = async () => {
    if (!isConnected || !address) {
      setError('Please connect your Monad wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Create random 32-byte challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'TRACE Monad Protocol',
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(address),
            name: address,
            displayName: `TRACE Wallet (${address.slice(0, 6)}...${address.slice(-4)})`,
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }], // ES256 / P-256 curve
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
            requireResidentKey: false,
          },
        },
      })) as PublicKeyCredential;

      if (!credential || !credential.response) {
        throw new Error('No credential generated');
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      let pubKeyCoords = { x: '0x0' as Hex, y: '0x0' as Hex };

      if (response.getPublicKey) {
        const rawKey = response.getPublicKey();
        if (rawKey) {
          pubKeyCoords = extractP256Coordinates(rawKey);
        }
      }

      // Register with backend / database
      const res = await fetch('/api/passkey/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          passkeyId: credential.id,
          publicKeyX: pubKeyCoords.x,
          publicKeyY: pubKeyCoords.y,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Registration API failed');
      }

      const data = await res.json();
      setSuccessMsg('P-256 Passkey registered & linked to Monad X/Y coordinates!');
      onAuthSuccess?.(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register passkey';
      setError(msg);
      console.error('Passkey registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithPasskey = async () => {
    if (!isConnected || !address) {
      setError('Please connect your Monad wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const challengeBytes = new TextEncoder().encode(customChallenge);
      const messageHash = keccak256(stringToHex(customChallenge));

      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge: challengeBytes,
          userVerification: 'preferred',
        },
      })) as PublicKeyCredential;

      if (!credential || !credential.response) {
        throw new Error('No assertion response returned');
      }

      const response = credential.response as AuthenticatorAssertionResponse;
      const parsedSig = parseDERSignature(response.signature);

      const res = await fetch('/api/passkey/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          signatureR: parsedSig.r,
          signatureS: parsedSig.s,
          messageHash,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Monad onchain precompile verification failed');
      }

      const data = await res.json();
      if (data.verified) {
        setSuccessMsg(`Verified onchain via Monad precompile (${MONAD_P256_PRECOMPILE_ADDRESS.slice(0, 10)}...)`);
        onAuthSuccess?.(data);
      } else {
        throw new Error('Onchain verification returned false');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Passkey authentication failed';
      setError(msg);
      console.error('Passkey authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (mode === 'register') {
      registerPasskey();
    } else {
      authenticateWithPasskey();
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <Button
        onClick={handleClick}
        disabled={isLoading || !isConnected}
        variant={mode === 'register' ? 'outline' : 'default'}
        size="sm"
        className="w-full font-mono gap-2 border-indigo-500/30 hover:border-indigo-500/60 shadow-xs"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : mode === 'register' ? (
          <KeyRound className="h-4 w-4 text-indigo-400" />
        ) : (
          <Fingerprint className="h-4 w-4 text-primary" />
        )}
        <span>{mode === 'register' ? 'Register P-256 Passkey' : 'Verify via Monad Precompile'}</span>
      </Button>

      {successMsg && (
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <p className="text-xs font-mono text-destructive bg-destructive/10 border border-destructive/20 p-2 rounded-md">
          {error}
        </p>
      )}
    </div>
  );
}
