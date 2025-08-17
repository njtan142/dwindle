import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Slack Clone - Modern Chat Platform",
  description: "A modern Slack clone built with Next.js, TypeScript, and Tailwind CSS",
  keywords: ["Slack", "Next.js", "TypeScript", "Tailwind CSS", "Chat", "Real-time"],
  authors: [{ name: "Slack Clone Team" }],
  openGraph: {
    title: "Slack Clone",
    description: "Modern chat platform built with Next.js",
    url: "https://slack-clone.z.ai",
    siteName: "Slack Clone",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Slack Clone",
    description: "Modern chat platform built with Next.js",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
