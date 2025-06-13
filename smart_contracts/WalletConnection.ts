// smart_contracts/WalletConnection.ts
import { useState } from 'react';
import { useSDK } from '@metamask/sdk-react';

export const useWallet = () => {
  const { sdk, connected, account, chainId } = useSDK();
  const [isConnecting, setIsConnecting] = useState(false);

  // Guard against sdk being undefined
  const connectWallet = async () => {
    if (!sdk) return;
    setIsConnecting(true);
    try {
      // connect() lives on the sdk instance, not on the SDKState
      await sdk.connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (!sdk) return;
    await sdk.disconnect();
  };

  return {
    connected,
    account,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };
};
