import { PixelWipe } from "@/components/pixel";

/** Remounts on every navigation — which is exactly when the dither cut should play. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PixelWipe />
      {children}
    </>
  );
}
