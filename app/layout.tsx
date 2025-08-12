import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Truck Repair Assistant | AI-Powered Truck Diagnostics",
  description: "AI-powered truck diagnostics with Azure AI Foundry Agent, deployed on Vercel. Get instant repair guidance for Peterbilt, Kenworth, Freightliner, and more.",
  keywords: "truck repair, AI diagnostics, truck maintenance, Peterbilt, Kenworth, Freightliner, Azure AI",
  authors: [{ name: "Truck Repair Assistant Team" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
