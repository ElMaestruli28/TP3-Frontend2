// src/components/TopTenWeekly.jsx
import { useMemo } from "react";
import { getShowLikesCount, calculateEpisodeAverage } from "../utilidades/scoreHelpers";

// Limpia etiquetas HTML de la sinopsis de TVMaze (<p>, <b>, etc.)
function stripHtml(html = "") {
  return html.replace(/<[^>]*>?/gm, "").trim();
}

export default function TopTenWeekly({
  allShows = [],
  ratings = {},
  onSelectShow,
  onToggleFlag,
}) {
  // Ordena las series por popularidad/likes reales y toma el Top 10
  const topTen = useMemo(() => {
    if (!allShows || allShows.length === 0) return [];

    return [...allShows]
      .sort((a, b) => {
        const likesA = getShowLikesCount(a, ratings[a.id]);
        const likesB = getShowLikesCount(b, ratings[b.id]);
        return likesB - likesA;
      })
      .slice(0, 10);
  }, [allShows, ratings]);

  if (topTen.length === 0) return null;

  const podiumShows = topTen.slice(0, 3); // #1, #2, #3
  const restShows = topTen.slice(3, 10);  // #4 al #10

  return (
    <section className="ep-top10-section">
      {/* Encabezado con barra amarilla/dorada a la izquierda */}
      <div className="ep-top10-header">
        <div className="ep-top10-title-wrap">
          <span className="ep-top10-bar" aria-hidden="true" />
          <h2 className="ep-top10-title">
            Top 10 en IMB-BOX de esta semana{" "}
            <span className="ep-top10-chevron">›</span>
          </h2>
        </div>
      </div>

      {/* FILA 1: PODIO DESTACADO (#1, #2, #3) */}
      <div className="ep-top10-podium-grid">
        {podiumShows.map((show, idx) => {
          const rank = idx + 1;
          const userEntry = ratings[show.id];
          const isWatched = Boolean(userEntry?.watched);
          const isWatchlist = Boolean(userEntry?.watchlist);

          const userScore =
            userEntry?.generalScore || calculateEpisodeAverage(userEntry);
          const apiScore = show.rating?.average
            ? Math.round(show.rating.average * 10)
            : 84;
          const displayScore = userScore || apiScore;

          const totalLikes = getShowLikesCount(show, userEntry);
          const likesLabel =
            totalLikes >= 1000
              ? `${Math.round(totalLikes / 1000)} mil`
              : totalLikes;

          const year = show.premiered ? `${show.premiered.slice(0, 4)}–` : "Serie";
          const runtime = show.averageRuntime ? `${show.averageRuntime}m` : "Serie de TV";
          const mainGenre = show.genres?.[0] || "Drama";
          const cleanSummary =
            stripHtml(show.summary) ||
            "Una de las series más vistas y comentadas de la semana en la comunidad.";

          return (
            <article
              key={show.id}
              className="ep-top10-featured-card"
              onClick={() => onSelectShow(show, topTen)}
            >
              <div className="ep-top10-featured-top">
                {/* Póster con Ribbon + para Watchlist */}
                <div className="ep-top10-featured-poster">
                  <button
                    type="button"
                    className={`ep-top10-ribbon-btn ${isWatchlist ? "added" : ""}`}
                    title={
                      isWatchlist ? "En tu Watchlist" : "Agregar a Watchlist"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFlag(show, "watchlist");
                    }}
                  >
                    {isWatchlist ? "✓" : "+"}
                  </button>
                  <img
                    src={
                      show.image?.medium ||
                      "https://via.placeholder.com/210x310/12141c/9499ad?text=IMB-BOX"
                    }
                    alt={show.name}
                    loading="lazy"
                  />
                </div>

                {/* Columna de metadatos y acciones rápidas */}
                <div className="ep-top10-featured-info">
                  <span className="ep-top10-rank-tag">#{rank}</span>

                  <h3 className="ep-top10-featured-name">{show.name}</h3>

                  <div className="ep-top10-meta-line">
                    <span>{runtime}</span>
                    <span>{year}</span>
                    <span>{mainGenre}</span>
                  </div>

                  <div className="ep-top10-score-line">
                    <span className="ep-top10-star-gold">★</span>
                    <span className="ep-top10-score-num">
                      {displayScore}/100{" "}
                      <span className="ep-top10-likes-sub">({likesLabel})</span>
                    </span>
                    <button
                      type="button"
                      className="ep-top10-inline-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectShow(show, topTen);
                      }}
                    >
                      ☆ Puntuar
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`ep-top10-watched-btn ${isWatched ? "watched" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFlag(show, "watched");
                    }}
                  >
                    <span>{isWatched ? "✓" : "👁"}</span>
                    <span>{isWatched ? "Vista" : "Marcar como visto"}</span>
                  </button>
                </div>
              </div>

              {/* Sinopsis inferior */}
              <p className="ep-top10-synopsis">{cleanSummary}</p>
            </article>
          );
        })}
      </div>

      {/* FILA 2: PUESTOS #4 AL #10 */}
      {restShows.length > 0 && (
        <div className="ep-top10-rest-grid">
          {restShows.map((show, idx) => {
            const rank = idx + 4;
            return (
              <div
                key={show.id}
                className="ep-top10-mini-card"
                onClick={() => onSelectShow(show, topTen)}
              >
                <div className="ep-top10-mini-poster">
                  <span className="ep-top10-rank-tag mini">#{rank}</span>
                  <img
                    src={
                      show.image?.medium ||
                      "https://via.placeholder.com/180x270/12141c/9499ad?text=IMB-BOX"
                    }
                    alt={show.name}
                    loading="lazy"
                  />
                </div>
                <p className="ep-top10-mini-title">{show.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}