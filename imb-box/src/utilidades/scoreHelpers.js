// src/utils/scoreHelpers.js
export function getScoreMeta(score) {
  const n = Number(score);
  if (!n) return { className: "tier-empty", label: "Sin calificar" };
  if (n >= 90) return { className: "tier-master", label: "Obra Maestra" };
  if (n >= 75) return { className: "tier-excellent", label: "Excelente" };
  if (n >= 50) return { className: "tier-good", label: "Sólida" };
  return { className: "tier-low", label: "Floja" };
}

export function calculateEpisodeAverage(showRatings) {
  const epMap = showRatings?.episodes || {};
  const validScores = Object.values(epMap)
    .map((e) => Number(e.score))
    .filter((n) => n >= 1 && n <= 100);

  if (validScores.length === 0) return null;
  const total = validScores.reduce((acc, curr) => acc + curr, 0);
  return Math.round(total / validScores.length);
}

export function stripHtml(html = "") {
  return html.replace(/<[^>]*>?/gm, "");
}