import type { Metadata } from "next";
import { Playfair_Display, Fraunces, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-body",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Divyaanshu Tonk — Software Engineer & Builder",
  description:
    "Divyaanshu Tonk. CS undergraduate engineering production-grade, cloud-backed software — LLM observability, real-time distributed systems, ML-driven applications.",
  keywords: [
    "Divyaanshu Tonk",
    "LLM Observability",
    "LLMTap",
    "Raksetu",
    "React",
    "TypeScript",
    "Node.js",
    "Generative AI",
    "Distributed Systems",
  ],
  authors: [{ name: "Divyaanshu Tonk" }],
  openGraph: {
    title: "Divyaanshu Tonk — Software Engineer & Builder",
    description:
      "CS undergraduate building production-grade software — LLM observability, distributed systems, ML-driven apps.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${fraunces.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased overflow-x-hidden`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
