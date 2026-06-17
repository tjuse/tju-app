import type { Metadata, Viewport } from "next";
import { Archivo, Spline_Sans_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

// UI + display grotesque — a precise, technical grotesk used at heavy weights
// for headings and at regular for body. One confident family, drafting-clean.
const archivo = Archivo({
  variable: "--font-sans-latin",
  subsets: ["latin"],
  display: "swap",
});

// Data mono — coordinate labels, times, figures, codes.
const splineMono = Spline_Sans_Mono({
  variable: "--font-mono-latin",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "tju.app — 天津大学校园助手",
    template: "%s · tju.app",
  },
  description:
    "美观、可交互的天津大学校园 Dashboard：课程表、校历、校园卡、电费、常用链接，一站式融合。",
  applicationName: "tju.app",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "tju.app",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c0d10" },
    { media: "(prefers-color-scheme: light)", color: "#f6f6f7" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${archivo.variable} ${splineMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
