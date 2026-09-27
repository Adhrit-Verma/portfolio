import Link from "next/link";
import { NotFoundScenes } from "@/components/world/PageScenes";

export default function NotFound() {
  return (
    <section id="nf" className="mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col items-start justify-end px-5 pb-24 pt-20 sm:px-8">
      <NotFoundScenes />
      <p className="chrome text-hot">ERR 404 // SIGNAL LOST</p>
      <h1 className="poster riso mt-4 max-w-[12ch] text-[clamp(3.4rem,11vw,9rem)] text-ink">
        No file at this address
      </h1>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-dim">
        The link is dead or the file was never on record. Everything that exists is in the index.
      </p>
      <Link
        href="/work"
        className="chrome mt-9 inline-flex items-center gap-2 bg-signal px-5 py-3.5 font-bold text-void hover:bg-signal-soft"
      >
        Open the file index <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
