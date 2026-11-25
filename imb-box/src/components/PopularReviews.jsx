// src/components/PopularReviews.jsx
import { useState, useMemo } from "react";

const SEED_REVIEWS = [
  {
    id: "rev_1",
    username: "Alucard",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces",
    showQuery: "Severance",
    fallbackTitle: "Severance",
    fallbackYear: "2022",
    score: 92,
    stars: "★★★★½",
    hasHeart: false,
    commentsCount: 0,
    text: "Cada plano simétrico en los pasillos de Lumon te genera una claustrofobia hipnótica. El final de temporada es televisión en estado puro.",
    likesCount: 27007,
  },
  {
    id: "rev_2",
    username: "zoë rose bryant",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces",
    showQuery: "Succession",
    fallbackTitle: "Succession",
    fallbackYear: "2018",
    score: 100,
    stars: "★★★★★",
    hasHeart: true,
    commentsCount: 142,
    text: "Hubo al menos seis momentos distintos en los que sentí que una simple reunión de directorio tenía más tensión que cualquier thriller de acción.",
    likesCount: 37535,
  },
  {
    id: "rev_3",
    username: "-ˏˋ mak ˊˎ-",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces",
    showQuery: "Arcane",
    fallbackTitle: "Arcane",
    fallbackYear: "2021",
    score: 94,
    stars: "★★★★½",
    hasHeart: false,
    commentsCount: 0,
    text: "La mayor carta de amor a la animación artesanal y al diseño visual cuadro por cuadro de todos los tiempos.",
    likesCount: 17703,
  },
  {
    id: "rev_4",
    username: "lauren",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces",
    showQuery: "The Bear",
    fallbackTitle: "The Bear",
    fallbackYear: "2022",
    score: 98,
    stars: "★★★★★",
    hasHeart: true,
    commentsCount: 101,
    text: "El episodio del plano secuencia en la cocina me dejó con las pulsaciones a mil; hace mucho no sentía semejante nivel de adrenalina frente a la pantalla.",
    likesCount: 17914,
  },
];

// Convierte un puntaje de escala 1-100 a estrellas estilo Letterboxd (★ y ½)
function scoreToGreenStars(score = 90) {
  const fiveScale = Math.max(0.5, Math.min(5, Math.round((score / 20) * 2) / 2));
  const full = Math.floor(fiveScale);
  const half = fiveScale % 1 !== 0;
  return "★".repeat(full) + (half ? "½" : "");
}

export default function PopularReviews({
  allShows = [],
  ratings = {},
  currentUser = null,
  onSelectShow,
}) {
  const [likedIds, setLikedIds] = useState({});

  // Combina las reseñas escritas por el usuario en Firebase/LocalStorage con las populares de la semana
  const reviewsList = useMemo(() => {
    const userReviews = Object.values(ratings)
      .filter((entry) => entry.review && entry.review.trim() !== "")
      .map((entry) => {
        const matchedShow = allShows.find(
          (s) => String(s.id) === String(entry.showId)
        );
        const numericScore = Number(entry.generalScore) || 90;

        return {
          id: `user_rev_${entry.showId}`,
          username: currentUser?.email?.split("@")[0] || "tu_reseña",
          avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
          show: matchedShow || {
            id: entry.showId,
            name: entry.showName,
            image: { medium: entry.poster },
            premiered: "2024",
          },
          title: entry.showName,
          year: matchedShow?.premiered ? matchedShow.premiered.slice(0, 4) : "2024",
          poster:
            matchedShow?.image?.medium ||
            entry.poster ||
            "https://via.placeholder.com/160x240/12141c/9499ad?text=IMB-BOX",
          score: numericScore,
          stars: scoreToGreenStars(numericScore),
          hasHeart: Boolean(entry.liked),
          commentsCount: 12,
          text: entry.review,
          likesCount: 1420,
        };
      });

    const mappedSeed = SEED_REVIEWS.map((item, idx) => {
      const found =
        allShows.find((s) =>
          s.name?.toLowerCase().includes(item.showQuery.toLowerCase())
        ) || allShows[idx];

      return {
        ...item,
        show: found || null,
        title: found?.name || item.fallbackTitle,
        year: found?.premiered ? found.premiered.slice(0, 4) : item.fallbackYear,
        poster:
          found?.image?.medium ||
          "https://via.placeholder.com/160x240/12141c/9499ad?text=IMB-BOX",
      };
    });

    return [...userReviews, ...mappedSeed].slice(0, 4);
  }, [allShows, ratings, currentUser]);

  const toggleReviewLike = (id) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="ep-pop-reviews-section">
      {/* Encabezado estilo Letterboxd con línea divisoria */}
      <div className="ep-pop-reviews-header">
        <span className="ep-pop-reviews-kicker">POPULAR REVIEWS THIS WEEK</span>
        <span className="ep-pop-reviews-more">MORE</span>
      </div>

      {/* Grilla de 2 columnas en PC y 1 columna en móvil */}
      <div className="ep-pop-reviews-grid">
        {reviewsList.map((rev) => {
          const isLiked = Boolean(likedIds[rev.id]);
          const totalLikes = rev.likesCount + (isLiked ? 1 : 0);

          return (
            <article key={rev.id} className="ep-pop-review-card">
              <div className="ep-pop-review-top">
                {/* Póster miniatura a la izquierda */}
                <div
                  className="ep-pop-review-poster"
                  onClick={() => rev.show && onSelectShow(rev.show)}
                >
                  <img src={rev.poster} alt={rev.title} loading="lazy" />
                </div>

                {/* Metadatos a la derecha del póster */}
                <div className="ep-pop-review-meta">
                  <div className="ep-pop-review-author">
                    <img
                      src={rev.avatar}
                      alt={rev.username}
                      className="ep-pop-review-avatar"
                    />
                    <span className="ep-pop-review-username">{rev.username}</span>
                  </div>

                  <div
                    className="ep-pop-review-title-line"
                    onClick={() => rev.show && onSelectShow(rev.show)}
                  >
                    <h4 className="ep-pop-review-show-title">{rev.title}</h4>
                    <span className="ep-pop-review-year">{rev.year}</span>
                  </div>

                  <div className="ep-pop-review-rating-row">
                    <span className="ep-pop-green-stars">{rev.stars}</span>
                    <span className="ep-pop-numeric-pill">{rev.score}/100</span>

                    {rev.hasHeart && (
                      <span className="ep-pop-orange-heart" title="Liked show">
                        ♥
                      </span>
                    )}

                    {rev.commentsCount > 0 && (
                      <span className="ep-pop-comments-count">
                        <svg viewBox="0 0 24 24" className="ep-pop-comment-svg">
                          <path
                            fill="currentColor"
                            d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z"
                          />
                        </svg>
                        {rev.commentsCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cuerpo de la reseña */}
              <p className="ep-pop-review-body">{rev.text}</p>

              {/* Botón Like review + contador */}
              <div className="ep-pop-review-footer">
                <button
                  type="button"
                  className={`ep-pop-like-btn ${isLiked ? "liked" : ""}`}
                  onClick={() => toggleReviewLike(rev.id)}
                >
                  <span className="ep-pop-like-heart">♥</span>
                  <span className="ep-pop-like-label">
                    {isLiked ? "Liked" : "Like review"}
                  </span>
                </button>
                <span className="ep-pop-like-count">
                  {totalLikes.toLocaleString()} likes
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}