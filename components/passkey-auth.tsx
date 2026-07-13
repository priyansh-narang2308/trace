'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Fingerprint, Loader2 } from 'lucide-react'

interface PasskeyAuthProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAuthSuccess?: (credential: any) => void
  mode?: 'register' | 'authenticate'
}

export function PasskeyAuth({ onAuthSuccess, mode = 'authenticate' }: PasskeyAuthProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registerPasskey = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Create a new passkey credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: 'TRACE',
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16),
            name: 'trace-user',
            displayName: 'TRACE User',
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }], // ES256
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
          },
        },
      })

      if (credential) {
        onAuthSuccess?.(credential)
      }
    } catch (err) {
      setError('Failed to register passkey')
      console.error('Passkey registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const authenticateWithPasskey = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Authenticate with existing passkey
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          userVerification: 'preferred',
          allowCredentials: [], // Will be populated with registered credentials
        },
      })

      if (credential) {
        onAuthSuccess?.(credential)
      }
    } catch (err) {
      setError('Failed to authenticate with passkey')
      console.error('Passkey authentication error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = () => {
    if (mode === 'register') {
      registerPasskey()
    } else {
      authenticateWithPasskey()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant={mode === 'register' ? 'outline' : 'default'}
        size="sm"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Fingerprint className="mr-2 h-4 w-4" />
        )}
        {mode === 'register' ? 'Register Passkey' : 'Sign with Passkey'}
      </Button>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
