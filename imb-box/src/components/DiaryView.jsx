// src/components/DiaryView.jsx
import { useState } from "react";
import { getScoreMeta, calculateEpisodeAverage } from "../utilidades/scoreHelpers";

export default function DiaryView({ ratings, onOpenSavedShow }) {
  const [filter, setFilter] = useState("all"); // "all" | "watched" | "liked" | "watchlist"
  const allEntries = Object.values(ratings);

  const filteredEntries = allEntries.filter((item) => {
    if (filter === "watched") return item.watched || item.generalScore;
    if (filter === "liked") return item.liked;
    if (filter === "watchlist") return item.watchlist;
    return true;
  });

  return (
    <section>
      <div className="ep-diary-header">
        <h1 className="ep-section-title">Mi Bitácora Personal</h1>

        <div className="ep-tabs">
          <button
            className={`ep-tab-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Todas ({allEntries.length})
          </button>
          <button
            className={`ep-tab-btn ${filter === "watched" ? "active" : ""}`}
            onClick={() => setFilter("watched")}
          >
            👁 Vistas ({allEntries.filter((i) => i.watched || i.generalScore).length})
          </button>
          <button
            className={`ep-tab-btn ${filter === "liked" ? "active" : ""}`}
            onClick={() => setFilter("liked")}
          >
            ♥ Mis Likes ({allEntries.filter((i) => i.liked).length})
          </button>
          <button
            className={`ep-tab-btn ${filter === "watchlist" ? "active" : ""}`}
            onClick={() => setFilter("watchlist")}
          >
            🕒 Watchlist ({allEntries.filter((i) => i.watchlist).length})
          </button>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", marginTop: "12px" }}>
          Todavía no tienes series en esta sección. Toca cualquier serie del catálogo para marcarla.
        </p>
      ) : (
        <div className="ep-poster-grid">
          {filteredEntries.map((item) => {
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
                  {score && (
                    <span className={`ep-floating-badge ${meta.className}`}>
                      {score}/100
                    </span>
                  )}
                </div>
                <div className="ep-poster-meta">
                  <div className="ep-poster-title">{item.showName}</div>
                  <div className="ep-poster-sub">
                    <span>
                      {item.liked ? "♥ " : ""}
                      {item.watched ? "👁 " : ""}
                      {item.watchlist ? "🕒 " : ""}
                      GRAL: {item.generalScore ?? "—"}
                    </span>
                    <span>CAPS: {avg ?? "—"}</span>
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