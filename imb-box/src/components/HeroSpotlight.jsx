// src/components/HeroSpotlight.jsx
import { useState, useEffect } from "react";
import { stripHtml, getScoreMeta } from "../utilidades/scoreHelpers";

export default function HeroSpotlight({
  show,
  userRating,
  episodeAverage,
  onOpenDetail,
  onScrollToCatalog,
}) {
  const [scrollRatio, setScrollRatio] = useState(0);
  const [backdropUrl, setBackdropUrl] = useState("");

  // Escucha el scroll de la ventana para desvanecer el Hero progresivamente
  useEffect(() => {
    const handleScroll = () => {
      // Se desvanece por completo al scrollear 480px hacia abajo
      const ratio = Math.min(1, Math.max(0, window.scrollY / 480));
      setScrollRatio(ratio);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Busca una imagen horizontal (background) en la API de TVMaze para la serie destacada
  useEffect(() => {
    if (!show?.id) return;
    setBackdropUrl(show.image?.original || show.image?.medium || "");

    fetch(`https://api.tvmaze.com/shows/${show.id}/images`)
      .then((res) => res.json())
      .then((images) => {
        const bg = images.find((img) => img.type === "background");
        if (bg?.resolutions?.original?.url) {
          setBackdropUrl(bg.resolutions.original.url);
        }
      })
      .catch(() => {});
  }, [show]);

  if (!show) return null;

  const year = show.premiered ? show.premiered.slice(0, 4) : "Serie";
  const synopsis = stripHtml(show.summary).slice(0, 175) + "...";
  const activeScore = userRating || episodeAverage;
  const scoreMeta = getScoreMeta(activeScore);

  // Estilos dinámicos calculados según el desplazamiento vertical
  const fadeStyle = {
    opacity: Math.max(0, 1 - scrollRatio * 1.15),
    transform: `scale(${1 - scrollRatio * 0.06}) translateY(${scrollRatio * 40}px)`,
    filter: `blur(${scrollRatio * 6}px)`,
    pointerEvents: scrollRatio > 0.8 ? "none" : "auto",
  };

  return (
    <section className="ep-hero-wrapper" style={fadeStyle}>
      <div
        className="ep-hero-frame"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="ep-hero-vignette" />

        <div className="ep-hero-content">
          <div className="ep-hero-left">
            <span className="ep-hero-kicker">SERIE RECOMENDADA DE HOY</span>
            <h1 className="ep-hero-title">{show.name}</h1>

            <div className="ep-hero-metadata">
              <span>Serie</span>
              <span>•</span>
              <span>{show.genres?.slice(0, 2).join(" / ") || "Drama"}</span>
              <span>•</span>
              <span>{year}</span>
              <span>•</span>
              <span>API Rating: {show.rating?.average ? `${Math.round(show.rating.average * 10)}/100` : "88/100"}</span>
              {activeScore && (
                <>
                  <span>•</span>
                  <span className={`ep-inline-pill ${scoreMeta.className}`}>
                    Tu Nota: {activeScore}/100
                  </span>
                </>
              )}
            </div>

            <p className="ep-hero-synopsis">{synopsis}</p>

            <div className="ep-hero-actions">
              <button
                className="ep-btn-primary-light"
                onClick={() => onOpenDetail(show)}
              >
                ★ Puntuar Serie y Capítulos
              </button>
              <button
                className="ep-btn-secondary-glass"
                onClick={onScrollToCatalog}
              >
                Explorar Catálogo ↓
              </button>
            </div>
          </div>

          <div className="ep-hero-right-note">
            <span>
              🎬 Escala centesimal <strong>1–100</strong> por episodio • Sincronizado con{" "}
              <strong>{show.network?.name || show.webChannel?.name || "TVMaze API"}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="ep-scroll-hint" onClick={onScrollToCatalog}>
        <span>Desliza hacia abajo para abrir el evaluador de series</span>
        <div className="ep-scroll-chevron">⌄</div>
      </div>
    </section>
  );
}