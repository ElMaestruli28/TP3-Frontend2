// src/utils/streamingHelpers.js

export const REGIONS = [
  { code: "LATAM", label: "Latinoamérica", flag: "🌎" },
  { code: "US", label: "Estados Unidos", flag: "🇺🇸" },
  { code: "ES", label: "España", flag: "🇪🇸" },
];

// Detecta automáticamente la región inicial según el idioma/zona horaria del navegador
export function detectUserRegion() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const lang = navigator.language || "";

    if (tz.includes("Europe/Madrid") || lang === "es-ES") return "ES";
    if (tz.includes("America/New_York") || tz.includes("America/Los_Angeles") || lang.startsWith("en")) {
      return "US";
    }
    return "LATAM";
  } catch {
    return "LATAM";
  }
}

// Catálogo maestro de plataformas de streaming
export const PLATFORMS = {
  netflix: {
    id: "netflix",
    name: "Netflix",
    color: "#E50914",
    bg: "rgba(229, 9, 20, 0.14)",
    border: "rgba(229, 9, 20, 0.45)",
    getSearchUrl: (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
  },
  max: {
    id: "max",
    name: "Max",
    color: "#002BE7",
    bg: "rgba(37, 99, 235, 0.18)",
    border: "rgba(59, 130, 246, 0.5)",
    getSearchUrl: (title) => `https://www.max.com/search?q=${encodeURIComponent(title)}`,
  },
  prime: {
    id: "prime",
    name: "Prime Video",
    color: "#00A8E1",
    bg: "rgba(0, 168, 225, 0.14)",
    border: "rgba(0, 168, 225, 0.45)",
    getSearchUrl: (title) => `https://www.primevideo.com/search?phrase=${encodeURIComponent(title)}`,
  },
  disney: {
    id: "disney",
    name: "Disney+",
    color: "#0063E5",
    bg: "rgba(0, 99, 229, 0.16)",
    border: "rgba(56, 189, 248, 0.45)",
    getSearchUrl: (title) => `https://www.disneyplus.com/`,
  },
  apple: {
    id: "apple",
    name: "Apple TV+",
    color: "#F5F5F7",
    bg: "rgba(255, 255, 255, 0.12)",
    border: "rgba(255, 255, 255, 0.35)",
    getSearchUrl: (title) => `https://tv.apple.com/search?term=${encodeURIComponent(title)}`,
  },
  crunchyroll: {
    id: "crunchyroll",
    name: "Crunchyroll",
    color: "#F47521",
    bg: "rgba(244, 117, 33, 0.15)",
    border: "rgba(244, 117, 33, 0.45)",
    getSearchUrl: (title) => `https://www.crunchyroll.com/search?q=${encodeURIComponent(title)}`,
  },
  hulu: {
    id: "hulu",
    name: "Hulu",
    color: "#1CE783",
    bg: "rgba(28, 231, 131, 0.14)",
    border: "rgba(28, 231, 131, 0.45)",
    getSearchUrl: (title) => `https://www.hulu.com/`,
  },
  paramount: {
    id: "paramount",
    name: "Paramount+",
    color: "#0064FF",
    bg: "rgba(0, 100, 255, 0.15)",
    border: "rgba(0, 100, 255, 0.45)",
    getSearchUrl: (title) => `https://www.paramountplus.com/`,
  },
  movistar: {
    id: "movistar",
    name: "Movistar Plus+",
    color: "#019DF4",
    bg: "rgba(1, 157, 244, 0.15)",
    border: "rgba(1, 157, 244, 0.45)",
    getSearchUrl: () => `https://ver.movistarplus.es/`,
  },
};

/**
 * Devuelve la lista de plataformas de streaming disponibles para una serie
 * dependiendo de la región seleccionada ("LATAM" | "US" | "ES")
 */
export function getStreamingPlatforms(show, region = "LATAM") {
  if (!show) return [];

  const results = new Set();
  const rawSource = (
    show.webChannel?.name ||
    show.network?.name ||
    ""
  ).toLowerCase();
  const title = (show.name || "").toLowerCase();
  const isAnime =
    show.genres?.includes("Anime") ||
    show.network?.country?.code === "JP" ||
    show.webChannel?.country?.code === "JP";

  // 1. Plataformas globales directas
  if (rawSource.includes("netflix")) results.add("netflix");
  if (rawSource.includes("hbo") || rawSource.includes("max")) results.add("max");
  if (rawSource.includes("amazon") || rawSource.includes("prime")) results.add("prime");
  if (rawSource.includes("apple")) results.add("apple");
  if (rawSource.includes("disney")) results.add("disney");
  if (rawSource.includes("paramount") || rawSource.includes("cbs") || rawSource.includes("showtime")) {
    results.add("paramount");
    if (region === "ES") results.add("movistar");
  }

  // 2. Equivalencias regionales para cadenas de EE. UU. (FX, Hulu, ABC, FOX, AMC, NBC)
  if (
    rawSource.includes("fx") ||
    rawSource.includes("hulu") ||
    rawSource.includes("abc") ||
    rawSource.includes("fox")
  ) {
    if (region === "US") {
      results.add("hulu");
    } else {
      // En Latinoamérica y España el catálogo de FX / Hulu / Star está integrado en Disney+
      results.add("disney");
    }
  }

  // 3. Series de AMC / Sony / NBC (Breaking Bad, Better Call Saul, The Office, House, etc.)
  if (rawSource.includes("amc")) {
    results.add("netflix");
    if (region === "US" || region === "LATAM") results.add("prime");
  }

  if (rawSource.includes("nbc") || rawSource.includes("usa network")) {
    if (region === "LATAM") {
      results.add("prime");
      results.add("max");
    } else if (region === "ES") {
      results.add("prime");
      results.add("movistar");
    } else {
      results.add("prime");
    }
  }

  // 4. Series británicas (BBC / ITV / Channel 4: Peaky Blinders, Sherlock, Fleabag, Black Mirror)
  if (rawSource.includes("bbc") || rawSource.includes("itv") || rawSource.includes("channel 4")) {
    if (title.includes("fleabag")) {
      results.add("prime");
    } else if (title.includes("peaky blinders") || title.includes("black mirror")) {
      results.add("netflix");
    } else {
      results.add("prime");
      results.add("netflix");
    }
  }

  // 5. Animes (TV Tokyo, MBS, Fuji TV, etc.)
  if (isAnime) {
    results.add("crunchyroll");
    results.add("netflix");
  }

  // 6. Respaldo si es una cadena específica sin mapeo previo
  if (results.size === 0) {
    if (region === "LATAM") {
      results.add("netflix");
      results.add("prime");
    } else if (region === "ES") {
      results.add("netflix");
      results.add("movistar");
    } else {
      results.add("prime");
      results.add("hulu");
    }
  }

  return Array.from(results)
    .map((key) => PLATFORMS[key])
    .filter(Boolean);
}