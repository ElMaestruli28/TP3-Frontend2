// src/components/EpisodeHeatmap.jsx
import { getScoreMeta } from "../utilidades/scoreHelpers";

export default function EpisodeHeatmap({
  seasons,
  episodes,
  showRatings,
  onSelectSeason,
}) {
  return (
    <section className="ep-heatmap-box">
      <div className="ep-heatmap-header">
        <h3>Mapa de Calor por Episodio (Escala 1–100)</h3>
        <span className="ep-heatmap-sub">
          Haz clic en cualquier celda para saltar a esa temporada
        </span>
      </div>

      {seasons.map((seasonNum) => (
        <div key={seasonNum} className="ep-heatmap-row">
          <span className="ep-heatmap-season-label">TEMP {seasonNum}</span>
          {episodes
            .filter((ep) => ep.season === seasonNum)
            .map((ep) => {
              const sc = showRatings?.episodes?.[ep.id]?.score;
              const meta = getScoreMeta(sc);
              return (
                <div
                  key={ep.id}
                  className={`ep-heat-cell ${meta.className}`}
                  title={`T${ep.season}E${ep.number}: ${ep.name} (${
                    sc ? sc + "/100" : "Sin calificar"
                  })`}
                  onClick={() => onSelectSeason(seasonNum)}
                >
                  {sc || "·"}
                </div>
              );
            })}
        </div>
      ))}
    </section>
  );
}