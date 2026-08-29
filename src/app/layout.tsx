import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Pairing rationale lives in design-system.md §2.
const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-chakra",
  display: "swap",
});

const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adhrit Verma — Backend / Full-Stack Software Engineer",
  description:
    "ctOS-style dossier for Adhrit Verma: backend-focused software engineer building airline operations, HR platforms, and RAG systems with Node.js, PostgreSQL and Redis.",
  openGraph: {
    title: "Adhrit Verma — Backend / Full-Stack Software Engineer",
    description:
      "Node.js · PostgreSQL · Redis · RAG. Three years of production systems, on file.",
    type: "profile",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0D10",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${chakra.variable} ${jbmono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
