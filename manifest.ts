import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MIRAGE — AI Video & Image Studio",
    short_name: "MIRAGE",
    description: "Turn words into cinema. AI image & video generation studio.",
    start_url: "/studio",
    display: "standalone",
    background_color: "#050508",
    theme_color: "#050508",
    icons: [
      { src: "/img/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
