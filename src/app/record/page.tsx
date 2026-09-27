import type { Metadata } from "next";
import CaseLog from "@/components/CaseLog";
import { AccessPanel, Credentials, Profile } from "@/components/chapters";
import { RecordScenes } from "@/components/world/PageScenes";

export const metadata: Metadata = {
  title: "Record — Adhrit Verma",
  description: "Profile, toolkit, employment record and credentials for Adhrit Verma, AI Software Engineer.",
};

export default function Page() {
  return (
    <div className="pt-12">
      <RecordScenes />
      <h1 className="sr-only">Subject record — Adhrit Verma</h1>
      <Profile />
      <AccessPanel />
      <CaseLog />
      <Credentials />
    </div>
  );
}
