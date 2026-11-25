// src/components/HeroSpotlight.jsx
import { useState, useMemo, useEffect } from "react";
import { getShowLikesCount, calculateEpisodeAverage } from "../utilidades/scoreHelpers";

export default function HeroSpotlight({
  shows = [],
  ratings = {},
  onOpenDetail,
  onToggleFlag,
  onExploreCatalog,
}) {
  const featuredList = useMemo(() => {
    if (!shows || shows.length === 0) return [];
    return shows.slice(0, 8);
  }, [shows]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [likedHero, setLikedHero] = useState({});
  const [hypeHero, setHypeHero] = useState({});

  useEffect(() => {
    if (activeIndex >= featuredList.length) {
      setActiveIndex(0);
    }
  }, [featuredList.length, activeIndex]);

  if (featuredList.length === 0) return null;

  const currentShow = featuredList[activeIndex];
  const currentRating = ratings[currentShow.id];
  const isInWatchlist = Boolean(currentRating?.watchlist);

  const userScore =
    currentRating?.generalScore || calculateEpisodeAverage(currentRating);
  const displayScore =
    userScore ||
    (currentShow.rating?.average ? Math.round(currentShow.rating.average * 10) : 88);

  const baseLikes = getShowLikesCount(currentShow, currentRating);
  const extraLike = likedHero[currentShow.id] ? 1 : 0;
  const extraHype = hypeHero[currentShow.id] ? 1 : 0;
  const totalLikes = baseLikes + extraLike;
  const totalHype = Math.max(24, Math.round(baseLikes * 0.55)) + extraHype;

  // Las siguientes 3 series para la columna derecha "Clasicos"
  const upcomingItems = Array.from({ length: Math.min(3, featuredList.length - 1) }, (_, i) => {
    const idx = (activeIndex + 1 + i) % featuredList.length;
    return { show: featuredList[idx], idx };
  });

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? featuredList.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % featuredList.length);
  };

  const backdropUrl =
    currentShow.image?.original ||
    currentShow.image?.medium ||
    "https://via.placeholder.com/1200x600/12141c/9499ad?text=IMB-BOX";

  const posterUrl =
    currentShow.image?.medium ||
    currentShow.image?.original ||
    "https://via.placeholder.com/300x450/12141c/9499ad?text=IMB-BOX";

  const year = currentShow.premiered ? currentShow.premiered.slice(0, 4) : "Serie";
  const genresLabel = currentShow.genres?.slice(0, 2).join(" • ") || "Drama";

  return (
    <section className="ep-hero-wrapper" aria-label="Destacados de la semana">
      <div className="ep-hero-split-layout">
        {/* PANEL IZQUIERDO: ESCENA PRINCIPAL + PÓSTER + TÍTULO + CONTADORES */}
        <div
          className="ep-hero-stage"
          onClick={() => onOpenDetail && onOpenDetail(currentShow)}
        >
          <img
            src={backdropUrl}
            alt={currentShow.name}
            className="ep-hero-stage-img"
          />
          <div className="ep-hero-stage-vignette" />

          {/* Flechas izquierda y derecha para cambiar de serie */}
          {featuredList.length > 1 && (
            <>
              <button
                type="button"
                className="ep-hero-arrow left"
                aria-label="Serie anterior"
                onClick={handlePrev}
              >
                ‹
              </button>
              <button
                type="button"
                className="ep-hero-arrow right"
                aria-label="Siguiente serie"
                onClick={handleNext}
              >
                ›
              </button>
            </>
          )}

          {/* Barra inferior del escenario (Póster a la izquierda + Título y métricas al lado) */}
          <div className="ep-hero-stage-bottom">
            <div
              className="ep-hero-mini-poster"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail && onOpenDetail(currentShow);
              }}
            >
              <button
                type="button"
                className={`ep-hero-ribbon-btn ${isInWatchlist ? "added" : ""}`}
                title={isInWatchlist ? "En tu Watchlist" : "Agregar a Watchlist"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFlag && onToggleFlag(currentShow, "watchlist");
                }}
              >
                {isInWatchlist ? "✓" : "+"}
              </button>
              <img src={posterUrl} alt={`Póster de ${currentShow.name}`} />
            </div>

            <div className="ep-hero-stage-meta">
              <div className="ep-hero-stage-kicker">
                SERIE DESTACADA • {year} • {genresLabel} •{" "}
                <span className="ep-hero-score-accent">★ {displayScore}/100</span>
              </div>

              <h1 className="ep-hero-stage-title">{currentShow.name}</h1>

              <div className="ep-hero-stage-reactions">
                <button
                  type="button"
                  className={`ep-hero-reaction-btn ${likedHero[currentShow.id] ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLikedHero((prev) => ({
                      ...prev,
                      [currentShow.id]: !prev[currentShow.id],
                    }));
                  }}
                >
                  <span>👍</span>
                  <span>{totalLikes.toLocaleString()}</span>
                </button>

                <button
                  type="button"
                  className={`ep-hero-reaction-btn ${hypeHero[currentShow.id] ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setHypeHero((prev) => ({
                      ...prev,
                      [currentShow.id]: !prev[currentShow.id],
                    }));
                  }}
                >
                  <span>❤️👏</span>
                  <span>{totalHype.toLocaleString()}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: "Clasicos" + ENLACE INFERIOR */}
        <aside className="ep-hero-upnext-col">
          <h2 className="ep-hero-upnext-heading">Clasicos</h2>

          <div className="ep-hero-upnext-list">
            {upcomingItems.map(({ show, idx }) => {
              const epCount = show.runtime ? `${show.runtime}m` : "Serie";
              const itemLikes = getShowLikesCount(show, ratings[show.id]);
              const itemHype = Math.max(12, Math.round(itemLikes * 0.45));

              return (
                <div
                  key={show.id}
                  className="ep-hero-upnext-card"
                  onClick={() => setActiveIndex(idx)}
                >
                  <div className="ep-hero-upnext-poster">
                    <img
                      src={
                        show.image?.medium ||
                        "https://via.placeholder.com/120x180/12141c/9499ad?text=IMB-BOX"
                      }
                      alt={show.name}
                      loading="lazy"
                    />
                  </div>

                  <div className="ep-hero-upnext-info">
                    <div className="ep-hero-upnext-subline">
                      <span className="ep-hero-upnext-badge">{epCount}</span>
                      <span>{show.genres?.[0] || "Destacada"}</span>
                    </div>

                    <div className="ep-hero-upnext-title">{show.name}</div>
                    <div className="ep-hero-upnext-desc">
                      Ver ficha y puntuar en IMB-BOX
                    </div>

                    <div className="ep-hero-upnext-stats">
                      <span>👍 {itemLikes.toLocaleString()}</span>
                      <span>❤️👏 {itemHype.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="ep-hero-browse-link"
            onClick={() => onExploreCatalog && onExploreCatalog()}
          >
            Explorar catálogo <span aria-hidden="true">›</span>
          </button>
        </aside>
      </div>
    </section>
  );
}