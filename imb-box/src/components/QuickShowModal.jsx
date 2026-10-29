// src/components/QuickShowModal.jsx
import { useState, useRef, useMemo } from "react";
import {
  getScoreMeta,
  calculateEpisodeAverage,
  getShowLikesCount,
  buildRecommendedDeck,
} from "../utilidades/scoreHelpers";

export default function QuickShowModal({
  initialShow,
  allShows,
  ratings,
  onClose,
  onToggleFlag,
  onSetGeneralScore,
  onOpenFullDetail,
}) {
  // Construimos el mazo deslizable una sola vez al abrir la tarjeta
  const deck = useMemo(
    () => buildRecommendedDeck(initialShow, allShows, ratings),
    [initialShow, allShows]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [showRateSlider, setShowRateSlider] = useState(false);
  const trackRef = useRef(null);

  if (!initialShow || deck.length === 0) return null;

  const currentShow = deck[activeIndex] || initialShow;
  const currentRating = ratings[currentShow.id] || {};

  const isWatched = Boolean(currentRating.watched);
  const isLiked = Boolean(currentRating.liked);
  const isInWatchlist = Boolean(currentRating.watchlist);
  const generalScore = currentRating.generalScore;
  const epAverage = calculateEpisodeAverage(currentRating);
  const scoreMeta = getScoreMeta(generalScore);

  const totalLikes = getShowLikesCount(currentShow, currentRating);
  const year = currentShow.premiered
    ? currentShow.premiered.slice(0, 4)
    : "Serie";
  const posterUrl =
    currentShow.image?.original ||
    currentShow.image?.medium ||
    "https://via.placeholder.com/400x600/12141c/9499ad?text=EPISODIA";

  // Detecta qué póster está centrado cuando el usuario desliza con el dedo
  const handleTrackScroll = () => {
    const container = trackRef.current;
    if (!container) return;

    const centerPosition = container.scrollLeft + container.clientWidth / 2;
    const cards = Array.from(container.children);

    let closestIdx = 0;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(centerPosition - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = index;
      }
    });

    if (closestIdx !== activeIndex) {
      setActiveIndex(closestIdx);
    }
  };

  // Permite deslizar haciendo clic en el póster que asoma a la derecha o con flechas en PC
  const scrollToCard = (index) => {
    const container = trackRef.current;
    if (!container || !container.children[index]) return;
    container.children[index].scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  return (
    <div className="ep-qmodal-overlay" onClick={onClose}>
      {/* Fondo ambiental difuminado con los colores del póster actual */}
      <div
        className="ep-qmodal-ambient"
        style={{ backgroundImage: `url(${posterUrl})` }}
      />

      <div
        className="ep-qmodal-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABECERA SUPERIOR: Título centrado, Año y botón X */}
        <header className="ep-qmodal-header">
          <div className="ep-qmodal-header-spacer" />
          <div className="ep-qmodal-title-group">
            <h2 className="ep-qmodal-title">{currentShow.name}</h2>
            <div className="ep-qmodal-subtitle">
              <span>{year}</span>
              <span>•</span>
              <span className="ep-qmodal-likes-count">
                ♥ {totalLikes.toLocaleString()} likes
              </span>
              {activeIndex > 0 && (
                <span className="ep-qmodal-rec-pill">Recomendada por likes</span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="ep-qmodal-close-btn"
            onClick={onClose}
            aria-label="Cerrar tarjeta"
          >
            ✕
          </button>
        </header>

        {/* CARRUSEL HORIZONTAL DESLIZABLE DE PÓSTERS (Con el siguiente asomando a la derecha) */}
        <div className="ep-qmodal-carousel-wrap">
          {activeIndex > 0 && (
            <button
              type="button"
              className="ep-qmodal-nav-arrow left"
              onClick={() => scrollToCard(activeIndex - 1)}
              aria-label="Serie anterior"
            >
              ‹
            </button>
          )}

          <div
            className="ep-qmodal-poster-track"
            ref={trackRef}
            onScroll={handleTrackScroll}
          >
            {deck.map((item, idx) => {
              const itemPoster =
                item.image?.original ||
                item.image?.medium ||
                "https://via.placeholder.com/400x600/12141c/9499ad?text=EPISODIA";
              const isCurrent = idx === activeIndex;

              return (
                <div
                  key={item.id}
                  className={`ep-qmodal-poster-slide ${
                    isCurrent ? "active" : "peeking"
                  }`}
                  onClick={() => {
                    if (!isCurrent) scrollToCard(idx);
                  }}
                >
                  <img
                    src={itemPoster}
                    alt={item.name}
                    draggable="false"
                  />
                </div>
              );
            })}
          </div>

          {activeIndex < deck.length - 1 && (
            <button
              type="button"
              className="ep-qmodal-nav-arrow right"
              onClick={() => scrollToCard(activeIndex + 1)}
              aria-label="Siguiente serie recomendada"
            >
              ›
            </button>
          )}
        </div>

        {/* CONTROL DESPLEGABLE DE PUNTEO RÁPIDO (1 al 100) */}
        {showRateSlider && (
          <div className="ep-qmodal-rate-drawer">
            <div className="ep-qmodal-rate-top">
              <span className="ep-qmodal-rate-label">
                Punteo rápido de la serie:
              </span>
              <div className="ep-qmodal-rate-value">
                <strong>{generalScore ?? "—"}</strong>
                <small>/100</small>
                {generalScore && (
                  <span className={`ep-inline-pill ${scoreMeta.className}`}>
                    {scoreMeta.label}
                  </span>
                )}
              </div>
            </div>

            <div className="ep-qmodal-rate-controls">
              <input
                type="range"
                min="1"
                max="100"
                className="ep-range-slider"
                value={generalScore || 75}
                onChange={(e) => onSetGeneralScore(currentShow, e.target.value)}
              />
              <input
                type="number"
                min="1"
                max="100"
                placeholder="1-100"
                className="ep-number-input"
                value={generalScore || ""}
                onChange={(e) => onSetGeneralScore(currentShow, e.target.value)}
              />
            </div>
          </div>
        )}

        {/* BARRA INFERIOR DE 4 ACCIONES (WATCH, LIKE, RATE, WATCHLIST) */}
        <div className="ep-qmodal-actions-bar">
          {/* 1. WATCH (Serie Vista) */}
          <button
            type="button"
            className={`ep-qmodal-action-item ${isWatched ? "active-watch" : ""}`}
            onClick={() => onToggleFlag(currentShow, "watched")}
          >
            <svg viewBox="0 0 24 24" className="ep-qmodal-svg">
              <path d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12z" />
              <circle cx="12" cy="12" r="3.2" />
            </svg>
            <span>{isWatched ? "Vista" : "Watch"}</span>
          </button>

          {/* 2. LIKE (Me gusta) */}
          <button
            type="button"
            className={`ep-qmodal-action-item ${isLiked ? "active-like" : ""}`}
            onClick={() => onToggleFlag(currentShow, "liked")}
          >
            <svg viewBox="0 0 24 24" className="ep-qmodal-svg">
              <path d="M12 20.5s-7.5-4.6-9.5-9C1.1 8.2 3.1 4.5 6.8 4.5c2.1 0 3.9 1.2 5.2 2.8 1.3-1.6 3.1-2.8 5.2-2.8 3.7 0 5.7 3.7 4.3 7-2 4.4-9.5 9-9.5 9z" />
            </svg>
            <span>{isLiked ? "Liked" : "Like"}</span>
          </button>

          {/* 3. RATE (Punteo rápido 1-100) */}
          <button
            type="button"
            className={`ep-qmodal-action-item ${
              generalScore || showRateSlider ? "active-rate" : ""
            }`}
            onClick={() => setShowRateSlider((prev) => !prev)}
          >
            <svg viewBox="0 0 24 24" className="ep-qmodal-svg">
              <polygon points="12,2.5 14.9,8.6 21.6,9.5 16.7,14.2 17.9,20.9 12,17.7 6.1,20.9 7.3,14.2 2.4,9.5 9.1,8.6" />
            </svg>
            <span>{generalScore ? `${generalScore}/100` : "Rate"}</span>
          </button>

          {/* 4. WATCHLIST (Agregar a lista por ver) */}
          <button
            type="button"
            className={`ep-qmodal-action-item ${
              isInWatchlist ? "active-watchlist" : ""
            }`}
            onClick={() => onToggleFlag(currentShow, "watchlist")}
          >
            <svg viewBox="0 0 24 24" className="ep-qmodal-svg">
              <path d="M20 12a8 8 0 1 0-8 8" />
              <polyline points="12,7.5 12,12 15,13.5" />
              <circle cx="18.5" cy="18.5" r="4" className="ep-qmodal-svg-badge" />
              <line x1="18.5" y1="16.5" x2="18.5" y2="20.5" />
              <line x1="16.5" y1="18.5" x2="20.5" y2="18.5" />
            </svg>
            <span>{isInWatchlist ? "En lista" : "Watchlist"}</span>
          </button>
        </div>

        {/* BOTÓN PARA IR A PUNTUAR CADA CAPÍTULO POR SEPARADO */}
        <div className="ep-qmodal-footer">
          <button
            type="button"
            className="ep-qmodal-episodes-btn"
            onClick={() => onOpenFullDetail(currentShow)}
          >
            <span>Puntuar cada capítulo por temporada</span>
            <span className="ep-qmodal-ep-badge">
              {epAverage ? `Prom. Caps: ${epAverage}/100 →` : "Escala 1–100 →"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}