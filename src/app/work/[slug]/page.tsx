import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Dossier from "@/components/Dossier";
import { getProject, projects } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return {};
  return {
    title: `${p.name} — Adhrit Verma`,
    description: `${p.kind}. ${p.hook}`,
    openGraph: { title: p.name, description: p.hook, images: [`/og/${p.slug}.jpg`] },
    twitter: { card: "summary_large_image", images: [`/og/${p.slug}.jpg`] },
  };
}

export default async function Page({ params }: PageProps<"/work/[slug]">) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  return <Dossier p={p} />;
}
