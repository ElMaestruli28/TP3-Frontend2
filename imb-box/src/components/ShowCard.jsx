// src/components/ShowCard.jsx
import { getScoreMeta, calculateEpisodeAverage } from "../utilidades/scoreHelpers";

export default function ShowCard({
  show,
  showRating,
  onSelect,
  rankNumber = null,
  ribbonText = null,
  friendActivity = null, // { friendName, friendAvatar, friendScore }
}) {
  const general = showRating?.generalScore;
  const avg = calculateEpisodeAverage(showRating);
  const userScore = general || avg;

  const apiScore = show.rating?.average
    ? Math.round(show.rating.average * 10)
    : null;

  const badgeMeta = getScoreMeta(userScore);

  const totalFixedEpisodes = show._embedded?.episodes?.length;
  const finalRibbonText =
    ribbonText === "Mini-serie" && totalFixedEpisodes
      ? `Mini-serie • ${totalFixedEpisodes} caps`
      : ribbonText;

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

        {rankNumber && (
          <span
            className={`ep-rank-badge ${
              rankNumber <= 10 ? "ep-rank-top10" : ""
            }`}
          >
            {rankNumber <= 10 ? `TOP ${rankNumber}` : `#${rankNumber}`}
          </span>
        )}

        {userScore ? (
          <span className={`ep-floating-badge ${badgeMeta.className}`}>
            {userScore}/100
          </span>
        ) : (
          apiScore && (
            <span className="ep-floating-badge ep-api-badge">
              ★ {apiScore}
            </span>
          )
        )}

        {finalRibbonText && (
          <span className="ep-bottom-ribbon">{finalRibbonText}</span>
        )}

        {/* Avatar y miniatura de actividad de amigo en la esquina inferior izquierda */}
        {friendActivity && (
          <div className="ep-friend-avatar-badge" title={`Calificado por ${friendActivity.friendName}`}>
            <img src={friendActivity.friendAvatar} alt={friendActivity.friendName} />
          </div>
        )}
      </div>

      <div className="ep-poster-meta">
        <div className="ep-poster-title">{show.name || show.showName}</div>
        
        {friendActivity ? (
          <div className="ep-friend-meta-row">
            <span className="ep-friend-name">{friendActivity.friendName}</span>
            <span className="ep-friend-stars">
              {"★".repeat(Math.round(friendActivity.friendScore / 20))}
              <span style={{ opacity: 0.3 }}>
                {"★".repeat(5 - Math.round(friendActivity.friendScore / 20))}
              </span>
            </span>
          </div>
        ) : (
          <div className="ep-poster-sub">
            <span>GRAL: {general ?? "—"}</span>
            <span>CAPS: {avg ?? "—"}</span>
          </div>
        )}
      </div>
    </article>
  );
}