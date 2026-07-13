import { type PublicClient, type Hex, encodePacked, toHex } from "viem";

export const MONAD_P256_PRECOMPILE_ADDRESS =
  "0x0000000000000000000000000000000000000100" as const;

export interface P256Signature {
  r: Hex;
  s: Hex;
}

export interface P256PublicKey {
  x: Hex;
  y: Hex;
}

export function parseDERSignature(
  derSig: ArrayBuffer | Uint8Array,
): P256Signature {
  const buf = derSig instanceof Uint8Array ? derSig : new Uint8Array(derSig);

  if (buf[0] !== 0x30) {
    throw new Error("Invalid DER signature sequence header");
  }

  let offset = 2; // Skip 0x30 and sequence length
  if (buf[1] & 0x80) {
    offset += buf[1] & 0x7f;
  }

  // Parse integer r
  if (buf[offset] !== 0x02) throw new Error("Invalid r integer header");
  const rLen = buf[offset + 1];
  offset += 2;
  let rBytes = buf.slice(offset, offset + rLen);
  // Remove leading zero padding if 33 bytes (positive integer indicator)
  if (rBytes.length > 32 && rBytes[0] === 0x00) {
    rBytes = rBytes.slice(1);
  }
  offset += rLen;

  // Parse integer s
  if (buf[offset] !== 0x02) throw new Error("Invalid s integer header");
  const sLen = buf[offset + 1];
  offset += 2;
  let sBytes = buf.slice(offset, offset + sLen);
  if (sBytes.length > 32 && sBytes[0] === 0x00) {
    sBytes = sBytes.slice(1);
  }

  const pad32 = (b: Uint8Array): Hex => {
    const padded = new Uint8Array(32);
    padded.set(b, 32 - b.length);
    return toHex(padded);
  };

  return {
    r: pad32(rBytes),
    s: pad32(sBytes),
  };
}

/**
 * Extracts raw 32-byte x and y P-256 public key coordinates from a WebAuthn public key ArrayBuffer (COSE / SPKI).
 */
export function extractP256Coordinates(
  rawPublicKey: ArrayBuffer | Uint8Array,
): P256PublicKey {
  const buf =
    rawPublicKey instanceof Uint8Array
      ? rawPublicKey
      : new Uint8Array(rawPublicKey);

  // If uncompressed EC point (0x04 || X (32 bytes) || Y (32 bytes))
  if (buf.length === 65 && buf[0] === 0x04) {
    return {
      x: toHex(buf.slice(1, 33)),
      y: toHex(buf.slice(33, 65)),
    };
  }

  // If SPKI wrapped (standard 91 bytes for P-256), the last 65 bytes are the uncompressed point
  if (buf.length >= 65) {
    const uncompressed = buf.slice(buf.length - 65);
    if (uncompressed[0] === 0x04) {
      return {
        x: toHex(uncompressed.slice(1, 33)),
        y: toHex(uncompressed.slice(33, 65)),
      };
    }
  }

  throw new Error(
    `Unsupported raw P-256 public key format of length ${buf.length}`,
  );
}

/**
 * Calls Monad Testnet's native secp256r1 (P-256) precompile (0x0100) to verify a signature.
 * The precompile expects exactly 128 bytes: hash (32) || r (32) || s (32) || x (32) || y (32).
 * Returns true if valid (precompile returns 0x000...01), false otherwise.
 */
export async function verifyOnchainP256Signature(
  publicClient: PublicClient,
  messageHash: Hex,
  sig: P256Signature,
  pubKey: P256PublicKey,
): Promise<boolean> {
  try {
    const payload = encodePacked(
      ["bytes32", "bytes32", "bytes32", "bytes32", "bytes32"],
      [messageHash, sig.r, sig.s, pubKey.x, pubKey.y],
    );

    const result = await publicClient.call({
      to: MONAD_P256_PRECOMPILE_ADDRESS,
      data: payload,
    });

    if (!result.data) return false;

    // Check if the output equals 1 (32-byte word formatted: 0x0000...0001)
    const resultBigInt = BigInt(result.data);
    return resultBigInt === BigInt(1);
  } catch (error) {
    console.error("Monad P-256 precompile verification error:", error);
    return false;
  }
}
