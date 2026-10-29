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

/**
 * Calcula la cantidad de "Likes" de una serie combinando su popularidad
 + el Like propio del usuario en tiempo real.
 */
export function getShowLikesCount(show, showRating) {
  if (!show) return 0;
  const weightBase = (show.weight || 70) * 142;
  const ratingBonus = Math.round((show.rating?.average || 7.5) * 410);
  const idVariance = (show.id % 97) * 19;
  const userLikeBonus = showRating?.liked ? 1 : 0;

  return weightBase + ratingBonus + idVariance + userLikeBonus;
}

/**
 * Construye el mazo deslizable:
 * - Posición 0: La serie que el usuario acaba de tocar.
 * - Siguientes posiciones: Series recomendadas según géneros afines (de la serie actual
 *   y de las series a las que el usuario dio "Like"), ordenadas de mayor a menor cantidad de Likes.
 */
export function buildRecommendedDeck(initialShow, allShows = [], ratings = {}) {
  if (!initialShow) return [];

  // Recolectar géneros favoritos (de la serie abierta + series con Like del usuario)
  const preferredGenres = new Set(initialShow.genres || []);
  Object.values(ratings).forEach((entry) => {
    if (entry.liked && Array.isArray(entry.genres)) {
      entry.genres.forEach((g) => preferredGenres.add(g));
    }
  });

  const others = allShows.filter((s) => s.id !== initialShow.id);

  const scoredCandidates = others.map((candidate) => {
    const likes = getShowLikesCount(candidate, ratings[candidate.id]);
    const matchingGenres = (candidate.genres || []).filter((g) =>
      preferredGenres.has(g)
    ).length;

    return {
      show: candidate,
      likes,
      matchingGenres,
    };
  });

  // Ordenar: primero las que comparten género con tus gustos y luego por mayor cantidad de Likes
  scoredCandidates.sort((a, b) => {
    if (b.matchingGenres > 0 && a.matchingGenres === 0) return 1;
    if (a.matchingGenres > 0 && b.matchingGenres === 0) return -1;
    return b.likes - a.likes;
  });

  return [
    initialShow,
    ...scoredCandidates.slice(0, 18).map((item) => item.show),
  ];
}