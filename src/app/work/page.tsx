import type { Metadata } from "next";
import WorkIndex from "@/components/WorkIndex";

export const metadata: Metadata = {
  title: "Files — Adhrit Verma",
  description: "Every project on file: Jimmy, Contrast, ClauseGuard, TableFox, Gradient Dense Code and a self-extending agent system.",
};

export default function Page() {
  return <WorkIndex />;
}
