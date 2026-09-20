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
  title: "Adhrit Verma — AI Software Engineer",
  description:
    "ctOS-style dossier for Adhrit Verma: AI software engineer building LangGraph multi-agent pipelines, RAG retrieval, and MCP servers — Contrast, ClauseGuard and TableFox.",
  openGraph: {
    title: "Adhrit Verma — AI Software Engineer",
    description:
      "Python · LLMs · RAG · MCP · React. Three production AI systems, on file.",
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
