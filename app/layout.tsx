import type { Metadata, Viewport } from "next";
import { Poppins, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "IT Photobooth — FEU Roosevelt",
  description:
    "Snap a photostrip at the Information Technology booth and scan the QR code to send it straight to your phone.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0E6B34",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
