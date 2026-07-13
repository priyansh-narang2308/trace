import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TRACE | Real-Time Project Checkpoints on Monad",
  description:
    "Decentralized, real-time proof-of-contribution and micro-checkpointing platform built on Monad Testnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={` ${inter.className} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          {children}

          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
