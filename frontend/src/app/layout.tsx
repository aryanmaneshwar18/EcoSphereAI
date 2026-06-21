import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0A0F1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "EcoSphere AI — Intelligent Personal Sustainability Platform",
  description:
    "Track, predict, and reduce your environmental impact through AI-driven insights and behavior change. Powered by IPCC, DEFRA, and EPA scientific data.",
  keywords: [
    "carbon footprint",
    "sustainability",
    "carbon tracker",
    "emissions calculator",
    "climate action",
    "AI coach",
    "eco-friendly",
  ],
  authors: [{ name: "EcoSphere AI" }],
  openGraph: {
    title: "EcoSphere AI — Intelligent Personal Sustainability Platform",
    description:
      "The world's most intelligent personal sustainability platform.",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    title: "EcoSphere",
    statusBarStyle: "black-translucent",
  },
};

import { ClerkProvider } from "@clerk/nextjs";
import { ClientLayout } from "@/components/layout/ClientLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <ClerkProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ClerkProvider>
      </body>
    </html>
  );
}
