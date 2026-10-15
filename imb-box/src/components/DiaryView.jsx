// src/components/DiaryView.jsx
import { getScoreMeta, calculateEpisodeAverage } from "../utilidades/scoreHelpers";

export default function DiaryView({ ratings, onOpenSavedShow }) {
  const entries = Object.values(ratings);

  return (
    <section>
      <h1 className="ep-section-title" style={{ marginBottom: "20px" }}>
        Mi Bitácora Personal
      </h1>

      {entries.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>
          Todavía no has calificado ninguna serie o capítulo.
        </p>
      ) : (
        <div className="ep-poster-grid">
          {entries.map((item) => {
            const avg = calculateEpisodeAverage(item);
            const score = item.generalScore || avg;
            const meta = getScoreMeta(score);

            return (
              <div
                key={item.showId}
                className="ep-poster-card"
                onClick={() => onOpenSavedShow(item.showId)}
              >
                <div className="ep-poster-img-wrap">
                  <img src={item.poster} alt={item.showName} />
                  <span className={`ep-floating-badge ${meta.className}`}>
                    {score || "—"}/100
                  </span>
                </div>
                <div className="ep-poster-meta">
                  <div className="ep-poster-title">{item.showName}</div>
                  <div className="ep-poster-sub">
                    <span>General: {item.generalScore ?? "—"}</span>
                    <span>Prom: {avg ?? "—"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}