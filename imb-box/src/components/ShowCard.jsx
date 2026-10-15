// src/components/ShowCard.jsx
import { getScoreMeta, calculateEpisodeAverage } from "../utilidades/scoreHelpers";

export default function ShowCard({ show, showRating, onSelect }) {
  const general = showRating?.generalScore;
  const avg = calculateEpisodeAverage(showRating);
  const displayScore = general || avg;
  const badgeMeta = getScoreMeta(displayScore);

  return (
    <article className="ep-poster-card" onClick={() => onSelect(show)}>
      <div className="ep-poster-img-wrap">
        <img
          src={
            show.image?.medium ||
            show.poster ||
            "https://via.placeholder.com/240x360/12141c/9499ad?text=EPISODIA"
          }
          alt={show.name || show.showName}
          loading="lazy"
        />
        {displayScore && (
          <span className={`ep-floating-badge ${badgeMeta.className}`}>
            {displayScore}/100
          </span>
        )}
      </div>

      <div className="ep-poster-meta">
        <div className="ep-poster-title">{show.name || show.showName}</div>
        <div className="ep-poster-sub">
          <span>GRAL: {general ?? "—"}</span>
          <span>CAPS: {avg ?? "—"}</span>
        </div>
      </div>
    </article>
  );
}