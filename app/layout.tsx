import type { Metadata } from "next";
import "./globals.css";
import { Sora, Instrument_Sans } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "XYZ Travellers",
  description: "Travel booking site clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${instrumentSans.variable}`}>
      <body className="font-instrument-sans bg-background text-text-primary">{children}</body>
    </html>
  );
}
