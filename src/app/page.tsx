import Boot from "@/components/Boot";
import { Archive, Channels, Connect, Dive, HomeScenes, Intro, Stack, Stats } from "@/components/home";

/** Home is one broadcast: the host, the dive, the numbers, the channels, the loadout, the call. */
export default function Page() {
  return (
    <>
      <Boot />
      <HomeScenes />
      <Intro />
      <Dive />
      <Stats />
      <Channels />
      <Archive />
      <Stack />
      <Connect />
    </>
  );
}
