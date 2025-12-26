export type ThemeId = "sunset" | "tropical" | "candy" | "aurora";

export const THEMES: Array<{
  id: ThemeId;
  label: string;
  swatches: [string, string, string];
  note?: string;
}> = [
  // Deeper, more premium accents (still colorful, less "neon")
  { id: "sunset", label: "Sunset", swatches: ["#e11d48", "#6d28d9", "#0891b2"] },
  { id: "tropical", label: "Tropical", swatches: ["#15803d", "#0e7490", "#c2410c"] },
  { id: "candy", label: "Candy", swatches: ["#be123c", "#6d28d9", "#166534"] },
  { id: "aurora", label: "Aurora", swatches: ["#0f766e", "#166534", "#b45309"] },
];

export const THEME_KEY = "readrover_theme";
