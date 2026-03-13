import type { Metadata } from 'next';
import { Arvo, Geist_Mono, Radio_Canada } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/features/auth/auth-provider';
import './globals.css';

const radioCanada = Radio_Canada({
  variable: '--font-radio-canada',
  subsets: ['latin'],
  weight: ['400'],
});

const arvo = Arvo({
  variable: '--font-arvo',
  subsets: ['latin'],
  weight: ['700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SalesTrack Academy',
  description: 'Internal training platform for sales teams',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${radioCanada.variable} ${arvo.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
