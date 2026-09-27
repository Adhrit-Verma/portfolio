import type { Metadata, Viewport } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import CtosCursor from "@/components/CtosCursor";
import Nav from "@/components/Nav";
import SmoothScroll from "@/components/SmoothScroll";
import WorldMount from "@/components/world/WorldMount";
import { AnimationGate } from "@/components/pop";
import { Footer } from "@/components/chapters";
import "./globals.css";

// Pairing rationale lives in design-system.md §2.
// Poster face for the giant kinetic type — condensed street-poster weight.
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
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
  // Netlify sets URL at build time; OG images need it to resolve absolutely.
  metadataBase: new URL(process.env.URL ?? "http://localhost:3000"),
  title: "Adhrit Verma — AI Software Engineer",
  description:
    "ctOS-style dossier for Adhrit Verma: AI software engineer building LangGraph multi-agent pipelines, RAG retrieval, and MCP servers — Jimmy, Contrast, ClauseGuard and TableFox.",
  openGraph: {
    title: "Adhrit Verma — AI Software Engineer",
    description:
      "Python · LLMs · RAG · MCP · React. Three production AI systems, on file.",
    type: "profile",
    images: ["/og/home.jpg"],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#0E0C0B",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${jbmono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SmoothScroll />
        <WorldMount />
        <AnimationGate />
        <CtosCursor />
        <Nav />
        <main id="main" tabIndex={-1} className="relative z-10 outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
