// src/pages/ShowDetail.jsx
import { useMemo } from "react";
import { getScoreMeta, calculateEpisodeAverage } from "../utilidades/scoreHelpers";
import EpisodeHeatmap from "../components/EpisodeHeatmap";
import SeasonTabs from "../components/SeasonTabs";
import EpisodeRow from "../components/EpisodeRow";

export default function ShowDetail({
  show,
  episodes,
  activeSeason,
  setActiveSeason,
  showRatings,
  onBack,
  onSetGeneralScore,
  onSetEpisodeData,
}) {
  const seasons = useMemo(() => {
    return Array.from(new Set(episodes.map((e) => e.season))).sort(
      (a, b) => a - b
    );
  }, [episodes]);

  const generalScore = showRatings?.generalScore;
  const generalMeta = getScoreMeta(generalScore);
  const episodeAvg = calculateEpisodeAverage(showRatings);
  const ratedEpisodesCount = Object.values(showRatings?.episodes || {}).filter(
    (e) => e.score
  ).length;

  return (
    <div className="ep-detail-view">
      <button
        className="ep-nav-btn"
        style={{ marginBottom: "20px" }}
        onClick={onBack}
      >
        ← Volver al inicio
      </button>

      <section className="ep-detail-banner">
        <img
          className="ep-detail-poster"
          src={show.image?.original || show.image?.medium}
          alt={show.name}
        />

        <div>
          <h1 className="ep-section-title" style={{ fontSize: "36px" }}>
            {show.name}
          </h1>
          <p className="ep-detail-sub">
            {show.genres?.join(" • ")} — {show.premiered?.slice(0, 4)}
          </p>
          <div
            className="ep-detail-summary"
            dangerouslySetInnerHTML={{ __html: show.summary }}
          />

          <div className="ep-Scoreboard">
            <div className="ep-score-panel">
              <span className="ep-score-label">
                Puntaje General de la Serie (1–100)
              </span>
              <div className="ep-score-giant">
                <span>{generalScore ?? "—"}</span>
                <span
                  className={`ep-floating-badge ${generalMeta.className}`}
                  style={{ position: "static" }}
                >
                  {generalMeta.label}
                </span>
              </div>
              <input
                className="ep-range-slider"
                type="range"
                min="1"
                max="100"
                value={generalScore || 50}
                onChange={(e) => onSetGeneralScore(show, e.target.value)}
              />
            </div>

            <div className="ep-score-panel">
              <span className="ep-score-label">
                Promedio Automático de Capítulos
              </span>
              <div className="ep-score-giant" style={{ color: "var(--gold)" }}>
                <span>{episodeAvg ?? "—"}</span>
                <small style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  / 100
                </small>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Calculado sobre {ratedEpisodesCount} de {episodes.length} episodios
                calificados.
              </p>
            </div>
          </div>
        </div>
      </section>

      <EpisodeHeatmap
        seasons={seasons}
        episodes={episodes}
        showRatings={showRatings}
        onSelectSeason={setActiveSeason}
      />

      <SeasonTabs
        seasons={seasons}
        activeSeason={activeSeason}
        onSelectSeason={setActiveSeason}
      />

      <section>
        {episodes
          .filter((ep) => ep.season === activeSeason)
          .map((ep) => (
            <EpisodeRow
              key={ep.id}
              episode={ep}
              epData={showRatings?.episodes?.[ep.id]}
              onUpdateEpisode={(episode, field, val) =>
                onSetEpisodeData(show, episode, field, val)
              }
            />
          ))}
      </section>
    </div>
  );
}