import "@/lib/storage-polyfill";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibe - AI-Powered Website Builder",
  description: "Build amazing websites with AI assistance",
  icons: {
    icon: '/logo.svg',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported but less common
  // interactiveWidget: 'resizes-visual',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <TRPCReactProvider>
        <html lang="en" suppressHydrationWarning={true}>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
              <Analytics />
              <ThemeProvider attribute={"class"} defaultTheme="system" enableSystem disableTransitionOnChange>
                <Toaster/>
                {children}
              </ThemeProvider>
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
