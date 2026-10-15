// src/components/EpisodeRow.jsx
import { getScoreMeta } from "../utilidades/scoreHelpers";

export default function EpisodeRow({ episode, epData = {}, onUpdateEpisode }) {
  const meta = getScoreMeta(epData.score);

  return (
    <div className="ep-episode-card">
      <div>
        <div className="ep-episode-title-line">
          <span className="ep-episode-code">
            E{String(episode.number).padStart(2, "0")}
          </span>
          <h4>{episode.name}</h4>
          {epData.score && (
            <span
              className={`ep-floating-badge ${meta.className}`}
              style={{ position: "static", fontSize: "11px" }}
            >
              {epData.score}/100 • {meta.label}
            </span>
          )}
        </div>

        <input
          className="ep-note-input"
          type="text"
          placeholder="Escribe una reseña o nota rápida de este capítulo..."
          value={epData.note || ""}
          onChange={(e) => onUpdateEpisode(episode, "note", e.target.value)}
        />
      </div>

      <div className="ep-episode-controls">
        <input
          className="ep-range-slider"
          type="range"
          min="1"
          max="100"
          value={epData.score || 50}
          onChange={(e) => onUpdateEpisode(episode, "score", e.target.value)}
        />
        <input
          className="ep-number-input"
          type="number"
          min="1"
          max="100"
          placeholder="1-100"
          value={epData.score || ""}
          onChange={(e) => onUpdateEpisode(episode, "score", e.target.value)}
        />
      </div>
    </div>
  );
}