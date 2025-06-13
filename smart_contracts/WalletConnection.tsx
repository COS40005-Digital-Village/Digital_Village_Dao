// src/components/WalletConnection.tsx
import { useState } from 'react';
import { useSDK } from '@metamask/sdk-react';

export const WalletConnection = () => {
  const { sdk, connected, account, chainId, connect, disconnect } = useSDK();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  return (
    <div>
      {!connected ? (
        <button onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div>
          <p>Connected account: {account}</p>
          <p>Connected chain: {chainId}</p>
          <button onClick={handleDisconnect}>Disconnect Wallet</button>
        </div>
      )}
    </div>
  );
};
