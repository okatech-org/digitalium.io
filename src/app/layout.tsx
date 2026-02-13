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
    "conformité OHADA",
    "iDocument",
    "iArchive",
    "iSignature",
    "Mobile Money",
    "Afrique centrale",
  ],
  authors: [{ name: "DIGITALIUM.IO" }],
  creator: "DIGITALIUM.IO",
  publisher: "DIGITALIUM.IO",
  metadataBase: new URL("https://digitalium.io"),
  openGraph: {
    type: "website",
    locale: "fr_GA",
    url: "https://digitalium.io",
    siteName: "DIGITALIUM.IO",
    title: "DIGITALIUM.IO — Archivage Intelligent & Gestion Documentaire",
    description:
      "Plateforme SaaS de gestion documentaire, d'archivage certifié et de signature électronique pour les entreprises gabonaises.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DIGITALIUM.IO — Plateforme d'archivage intelligent",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DIGITALIUM.IO — Archivage Intelligent",
    description: "Gestion documentaire et signature électronique pour le Gabon.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
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
