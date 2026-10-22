// src/components/SearchBar.jsx
import { useState, useEffect, useRef } from "react";
import { getScoreMeta, calculateEpisodeAverage } from "../utilidades/scoreHelpers";

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  trendingShows = [],
  ratings = {},
  onSelectShow,
  onLiveResultsChange,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [liveResults, setLiveResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Cerrar el desplegable si el usuario hace clic fuera del buscador
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Búsqueda en tiempo real con Debounce (250ms) mientras el usuario escribe
  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setLiveResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(trimmed)}`
        );
        const data = await res.json();
        const mappedShows = data.map((item) => item.show);
        setLiveResults(mappedShows.slice(0, 6));
        // También actualiza la grilla de pósters principal si deseas ver todos los resultados
        if (onLiveResultsChange) {
          onLiveResultsChange(mappedShows);
        }
      } catch (err) {
        console.error("Error en búsqueda en vivo:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleClear = () => {
    setSearchQuery("");
    setLiveResults([]);
    inputRef.current?.focus();
  };

  const handleCancel = () => {
    setSearchQuery("");
    setIsFocused(false);
  };

  const handlePickShow = (show) => {
    setIsFocused(false);
    onSelectShow(show);
  };

  return (
    <div className="ep-search-container" ref={wrapperRef}>
      <div className="ep-search-input-row">
        <div className={`ep-search-bar ${isFocused ? "focused" : ""}`}>
          <span className="ep-search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar series..."
            value={searchQuery}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="ep-search-clear-btn"
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {isFocused && (
          <button
            type="button"
            className="ep-search-cancel-btn"
            onClick={handleCancel}
          >
            Cancelar
          </button>
        )}
      </div>

      {/* PANEL DESPLEGABLE (PREVIA DE 3 TENDENCIAS O RESULTADOS EN VIVO) */}
      {isFocused && (
        <div className="ep-search-dropdown">
          {searchQuery.trim() === "" ? (
            /* ESTADO 1: INPUT VACÍO -> 3 SERIES EN TENDENCIA */
            <div className="ep-search-section">
              <h4 className="ep-search-heading">Series en tendencia</h4>
              <div className="ep-trending-list">
                {trendingShows.slice(0, 3).map((show, idx) => {
                  const userScore =
                    ratings[show.id]?.generalScore ||
                    calculateEpisodeAverage(ratings[show.id]);

                  return (
                    <div
                      key={show.id}
                      className="ep-trending-item"
                      onClick={() => handlePickShow(show)}
                    >
                      <div className="ep-trending-thumb-wrap">
                        <img
                          src={
                            show.image?.medium ||
                            "https://via.placeholder.com/160x90/12141c/9499ad?text=EPISODIA"
                          }
                          alt={show.name}
                        />
                        <span className="ep-top-badge">TOP {idx + 1}</span>
                        <span className="ep-trending-tag">Tendencia</span>
                      </div>

                      <div className="ep-trending-info">
                        <span className="ep-trending-title">{show.name}</span>
                        <span className="ep-trending-meta">
                          {show.genres?.slice(0, 2).join(" • ") || "Serie"}
                          {userScore ? ` • Tu nota: ${userScore}/100` : ""}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="ep-trending-play-btn"
                        aria-label={`Abrir ${show.name}`}
                      >
                        ▶
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ESTADO 2: ESCRIBIENDO -> RESULTADOS EN TIEMPO REAL */
            <div className="ep-search-section">
              <div className="ep-search-heading-row">
                <h4 className="ep-search-heading">Resultados de la búsqueda</h4>
                {isLoading && (
                  <span className="ep-search-loading">Buscando...</span>
                )}
              </div>

              {liveResults.length === 0 && !isLoading ? (
                <p className="ep-search-empty">
                  No se encontraron series para &ldquo;{searchQuery}&rdquo;
                </p>
              ) : (
                <div className="ep-live-results-list">
                  {liveResults.map((show) => {
                    const showRating = ratings[show.id];
                    const score =
                      showRating?.generalScore ||
                      calculateEpisodeAverage(showRating);
                    const scoreMeta = getScoreMeta(score);
                    const apiScore = show.rating?.average
                      ? Math.round(show.rating.average * 10)
                      : null;

                    return (
                      <div
                        key={show.id}
                        className="ep-live-result-card"
                        onClick={() => handlePickShow(show)}
                      >
                        <div className="ep-live-result-thumb">
                          <img
                            src={
                              show.image?.medium ||
                              "https://via.placeholder.com/160x90/12141c/9499ad?text=Sin+Imagen"
                            }
                            alt={show.name}
                          />
                        </div>

                        <div className="ep-live-result-body">
                          <div className="ep-live-result-title">{show.name}</div>
                          <div className="ep-live-result-sub">
                            <span>
                              {show.premiered
                                ? show.premiered.slice(0, 4)
                                : "Serie"}
                            </span>
                            <span>•</span>
                            <span>
                              {show.genres?.slice(0, 2).join(", ") || "General"}
                            </span>
                            {apiScore && (
                              <>
                                <span>•</span>
                                <span style={{ color: "var(--gold)" }}>
                                  API {apiScore}/100
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {score && (
                          <span
                            className={`ep-inline-pill ${scoreMeta.className}`}
                          >
                            {score}/100
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}