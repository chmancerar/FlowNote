import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Global styles
import Providers from './providers';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    template: '%s | FlowNote',
    default: 'FlowNote',
  },
  description: 'A fast, intuitive, and clean block-based workspace.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-neutral-900 text-white antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <Providers>
            {children}
            <Toaster theme="dark" />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
