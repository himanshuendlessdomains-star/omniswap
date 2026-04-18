'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';

const MANIFEST_URL = 'https://purifier-astound-gruffly.ngrok-free.app/tonconnect-manifest.json';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // @ts-ignore — analytics is an internal option not in public types
    <TonConnectUIProvider manifestUrl={MANIFEST_URL} analytics={{ mode: 'off' }}>
      {children}
    </TonConnectUIProvider>
  );
}
