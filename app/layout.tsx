import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pedisk.com.br"),
  title: {
    default: "Pedisk — Seu delivery. Sua marca. Seus clientes.",
    template: "%s | Pedisk",
  },
  description:
    "Crie sua loja online, receba pedidos e gerencie seu delivery em um só lugar. Simples, profissional e feito para o seu negócio.",
  applicationName: "Pedisk",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pedisk",
  },
  keywords: [
    "Pedisk",
    "delivery",
    "cardápio digital",
    "loja online",
    "pedidos online",
    "sistema para delivery",
    "cardápio online",
    "gestão de pedidos",
    "sistema para restaurante",
    "sistema para hamburgueria",
    "sistema para pizzaria",
  ],
  authors: [{ name: "Pedisk" }],
  creator: "Pedisk",
  publisher: "Pedisk",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: "/pedisk-icon.png", type: "image/png" }],
    shortcut: "/pedisk-icon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://pedisk.com.br",
    siteName: "Pedisk",
    title: "Pedisk — Seu delivery. Sua marca. Seus clientes.",
    description:
      "Crie sua loja online, receba pedidos e gerencie seu delivery em um só lugar. Simples, profissional e feito para o seu negócio.",
    images: [
      {
        url: "/pedisk-og.png",
        width: 1200,
        height: 630,
        alt: "Pedisk — Seu delivery. Sua marca. Seus clientes.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pedisk — Seu delivery. Sua marca. Seus clientes.",
    description:
      "Crie sua loja online, receba pedidos e gerencie seu delivery em um só lugar.",
    images: ["/pedisk-og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}