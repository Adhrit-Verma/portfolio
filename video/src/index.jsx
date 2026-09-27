import { Composition, registerRoot } from "remotion";
import { Card } from "./Card.jsx";

// OpenGraph share cards, rendered per project (and "home") by render.mjs.
registerRoot(() => (
  <Composition id="Card" component={Card} fps={30} width={1200} height={630} durationInFrames={1} defaultProps={{ slug: "home" }} />
));
