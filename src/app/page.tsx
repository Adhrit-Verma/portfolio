import Boot from "@/components/Boot";
import CaseLog from "@/components/CaseLog";
import HackedFiles from "@/components/HackedFiles";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import SmoothScroll from "@/components/SmoothScroll";
import { AccessPanel, Connect, Credentials, Profile } from "@/components/chapters";

/**
 * One scroll narrative: access → profile → toolkit → files → record → creds → channel.
 * Everything below renders at full opacity without JS; the animations only take
 * it away and hand it back.
 */
export default function Page() {
  return (
    <>
      <SmoothScroll />
      <Boot />
      <Nav />
      <main>
        <Hero />
        <Profile />
        <AccessPanel />
        <HackedFiles />
        <CaseLog />
        <Credentials />
        <Connect />
      </main>
    </>
  );
}
