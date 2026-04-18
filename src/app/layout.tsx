import type { Metadata } from 'next';
import { Instrument_Sans } from 'next/font/google';
import Providers from './providers';
import Header from '@/components/layout/Header';
// import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OmniSwap — Best rates on TON',
  description: 'Swap tokens across STON.fi, DeDust, and TONCO with best-rate optimization via Omniston.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={instrumentSans.variable}>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
