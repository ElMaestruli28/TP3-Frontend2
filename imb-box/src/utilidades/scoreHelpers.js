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

/**
 * Verifica estrictamente si una serie es una Miniserie real:
 * - Estado "Ended" (historia cerrada / cantidad fija)
 * - Exactamente 1 temporada
 * - Entre 2 y 12 episodios en total
 * - Ciclo de emisión corto (máximo 150 días entre estreno y desenlace)
 */
export function isVerifiedMiniseries(show) {
  if (!show || show.status !== "Ended") return false;

  // 1. Verificar ventana de emisión (entre estreno y final)
  if (show.premiered && show.ended) {
    const start = new Date(show.premiered);
    const end = new Date(show.ended);
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);
    // Si duró más de 150 días en emisión o es inválido, no es miniserie de 1 entrega
    if (diffDays < 0 || diffDays > 150) return false;
  } else {
    return false;
  }

  // 2. Verificar lista real de episodios y temporadas
  const episodes = show._embedded?.episodes;
  if (!Array.isArray(episodes) || episodes.length === 0) return false;

  const uniqueSeasons = new Set(episodes.map((ep) => ep.season)).size;
  const totalEpisodes = episodes.length;

  return (
    uniqueSeasons === 1 &&
    totalEpisodes >= 2 &&
    totalEpisodes <= 12
  );
}