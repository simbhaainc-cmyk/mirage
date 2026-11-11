// ─── Creative presets: styles, camera motions, aspect ratios ────────────────

export interface StylePreset {
  id: string;
  name: string;
  suffix: string; // appended to prompt for the model
  swatch: string; // gradient preview
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "none",
    name: "Raw",
    suffix: "",
    swatch: "linear-gradient(135deg,#3f3f46,#18181b)",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    suffix:
      ", cinematic film still, anamorphic lens, dramatic volumetric lighting, teal and orange grade, 35mm",
    swatch: "linear-gradient(135deg,#f97316,#7c2d12)",
  },
  {
    id: "neon-noir",
    name: "Neon Noir",
    suffix:
      ", cyberpunk neon noir, rain-soaked streets, pink and cyan neon glow, moody fog, high contrast",
    swatch: "linear-gradient(135deg,#ec4899,#06b6d4)",
  },
  {
    id: "ethereal",
    name: "Ethereal",
    suffix:
      ", ethereal dreamlike atmosphere, soft pastel haze, floating particles, delicate light leaks, fine art",
    swatch: "linear-gradient(135deg,#c4b5fd,#fbcfe8)",
  },
  {
    id: "hyperreal",
    name: "Hyperreal",
    suffix:
      ", ultra photorealistic, 8k detail, natural skin texture, sharp focus, professional photography",
    swatch: "linear-gradient(135deg,#e2e8f0,#475569)",
  },
  {
    id: "analog",
    name: "Analog '78",
    suffix:
      ", vintage 1970s analog film photo, kodachrome grain, faded warm tones, retro nostalgia, light leaks",
    swatch: "linear-gradient(135deg,#fbbf24,#b45309)",
  },
  {
    id: "liquid-chrome",
    name: "Liquid Chrome",
    suffix:
      ", liquid chrome metal, iridescent oil-slick reflections, molten mercury, studio lighting on black",
    swatch: "linear-gradient(135deg,#a5b4fc,#312e81)",
  },
  {
    id: "ukiyoe",
    name: "Neo Ukiyo-e",
    suffix:
      ", modern ukiyo-e woodblock print style, bold outlines, flat color fields, japanese art reimagined",
    swatch: "linear-gradient(135deg,#f87171,#1e3a8a)",
  },
];

export interface MotionPreset {
  id: string;
  name: string;
  desc: string;
  icon: string; // lucide icon key resolved in UI
}

export const MOTION_PRESETS: MotionPreset[] = [
  { id: "dolly-in", name: "Dolly In", desc: "Slow push toward subject", icon: "ZoomIn" },
  { id: "dolly-out", name: "Dolly Out", desc: "Pull back to reveal", icon: "ZoomOut" },
  { id: "pan-right", name: "Pan Right", desc: "Lateral trucking shot", icon: "MoveRight" },
  { id: "tilt-up", name: "Tilt Up", desc: "Vertical crane reveal", icon: "MoveUp" },
  { id: "orbit", name: "Orbit", desc: "Sweeping rotation", icon: "Orbit" },
  { id: "parallax", name: "Parallax Drift", desc: "Layered depth float", icon: "Layers" },
  { id: "shake", name: "Handheld", desc: "Organic documentary shake", icon: "Vibration" },
  { id: "pulse", name: "Heartbeat", desc: "Rhythmic zoom pulse", icon: "Activity" },
];

export interface Aspect {
  id: string;
  name: string;
  w: number;
  h: number;
  ratioClass: string;
}

export const ASPECTS: Aspect[] = [
  { id: "16:9", name: "Widescreen", w: 1344, h: 768, ratioClass: "aspect-video" },
  { id: "9:16", name: "Vertical", w: 768, h: 1344, ratioClass: "aspect-[9/16]" },
  { id: "1:1", name: "Square", w: 1024, h: 1024, ratioClass: "aspect-square" },
  { id: "4:3", name: "Classic", w: 1152, h: 864, ratioClass: "aspect-[4/3]" },
  { id: "3:4", name: "Portrait", w: 864, h: 1152, ratioClass: "aspect-[3/4]" },
];

export function getAspect(id: string): Aspect {
  return ASPECTS.find((a) => a.id === id) ?? ASPECTS[0];
}

export function getStyle(id: string): StylePreset {
  return STYLE_PRESETS.find((s) => s.id === id) ?? STYLE_PRESETS[0];
}

export const PROMPT_IDEAS = [
  "A chrome astronaut meditating inside a cathedral of fog, volumetric god rays",
  "Bioluminescent jellyfish drifting through a submerged neon city",
  "Portrait of an android weeping liquid mercury, studio lighting",
  "A lone lighthouse on a floating island above a sea of clouds at dusk",
  "Macro of a mechanical hummingbird with clockwork wings in flight",
  "Ancient monolith carved with glowing runes in a violet desert storm",
  "Ballerina made of smoke and embers mid-pirouette on a dark stage",
  "Retro-futuristic diner on Mars, 1970s kodachrome film aesthetic",
];
