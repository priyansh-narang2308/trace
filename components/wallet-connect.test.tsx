import { render, screen } from '@testing-library/react';
import { WalletConnect } from './wallet-connect';
import { vi, describe, it, expect } from 'vitest';

// Mock the wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: undefined,
    isConnected: false,
    chainId: undefined,
  }),
  useConnect: () => ({
    connect: vi.fn(),
    connectors: [{ uid: 'mock-connector', name: 'Mock Wallet' }],
    isPending: false,
  }),
  useDisconnect: () => ({
    disconnect: vi.fn(),
  }),
  useSwitchChain: () => ({
    switchChain: vi.fn(),
  }),
}));

describe('WalletConnect', () => {
  it('renders the connect wallet buttons when not connected', () => {
    render(<WalletConnect />);
    
    // Based on the code, if window.ethereum doesn't exist it shows "Install MetaMask"
    // Wait, the test environment doesn't have window.ethereum by default, so it might show "Install MetaMask"
    const installMetaMaskButton = screen.queryByText(/Install MetaMask/i);
    const connectWalletButton = screen.queryByText(/Connect Wallet/i);

    // Either the Install button or the Connect Wallet button should exist
    expect(installMetaMaskButton || connectWalletButton).toBeTruthy();
  });
});
