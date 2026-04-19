'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { PointsProvider } from '@/contexts/PointsContext';

const MANIFEST_URL = 'https://omniswap-three.vercel.app/tonconnect-manifest.json';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // @ts-ignore — analytics is an internal option not in public types
    <TonConnectUIProvider manifestUrl={MANIFEST_URL} analytics={{ mode: 'off' }}>
      <PointsProvider>
        {children}
      </PointsProvider>
    </TonConnectUIProvider>
  );
}
