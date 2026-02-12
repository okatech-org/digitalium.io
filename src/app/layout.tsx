import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DIGITALIUM.IO — Archivage Intelligent & Gestion Documentaire",
  description:
    "Plateforme d'archivage intelligent et de gestion documentaire pour le Gabon. Créez, archivez et signez vos documents en toute sécurité.",
  keywords: [
    "archivage",
    "gestion documentaire",
    "signature électronique",
    "Gabon",
    "DIGITALIUM",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="bottom-left"
          theme="dark"
          toastOptions={{
            className: "glass-card border border-white/10",
          }}
        />
      </body>
    </html>
  );
}
