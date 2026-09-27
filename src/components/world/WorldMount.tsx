"use client";

import dynamic from "next/dynamic";

// three.js stays out of the first paint: the page is readable before the world loads.
const World = dynamic(() => import("./World"), { ssr: false });

export default function WorldMount() {
  return <World />;
}
