import type { Metadata, Viewport } from "next";
import { Syne, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://mirage.studio"),
  title: {
    default: "MIRAGE — AI Video & Image Studio",
    template: "%s · MIRAGE",
  },
  description:
    "Turn words into cinema. MIRAGE is an AI studio that generates stunning images and cinematic videos from text prompts — with camera choreography, style DNA and one-click exports.",
  icons: [{ rel: "icon", url: "/img/icon.png" }],
  openGraph: {
    title: "MIRAGE — AI Video & Image Studio",
    description: "Turn words into cinema. Generate images & videos with AI.",
    images: ["/img/hero-poster.jpg"],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#050508",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${inter.variable} ${jetbrains.variable} grain bg-[#050508] text-[#ececf4] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
