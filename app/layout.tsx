import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

// Font pairing: a warm display serif for headings + a clean sans for body.
// Exposed as CSS variables so globals.css can reference them everywhere.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DiwaliDrops · AICoE",
  description:
    "Scan a Diwali drop and unwrap a little surprise — a wish, a fun task, a riddle, or a playful dare. Lit by AICoE · i-Source Infosystems. 🪔",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a0b1e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <main className="page">{children}</main>
      </body>
    </html>
  );
}
