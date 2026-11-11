// Studio-facing data re-exports (single import surface for the client bundle).
import { ASPECTS, MOTION_PRESETS, PROMPT_IDEAS, STYLE_PRESETS } from "./presets";
import { CREDIT_COSTS } from "./plans";

export { ASPECTS, MOTION_PRESETS, PROMPT_IDEAS, STYLE_PRESETS };

export const CREDIT_COSTS_UI: Record<"image" | "video", number> = {
  image: CREDIT_COSTS.image,
  video: CREDIT_COSTS.video,
};
