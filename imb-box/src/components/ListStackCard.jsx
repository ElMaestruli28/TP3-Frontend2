// src/components/ListStackCard.jsx
export default function ListStackCard({ list, onSelectList, onToggleLikeList }) {
  // Tomamos los primeros 5 pósters de la lista para el collage horizontal
  const previewShows = (list.shows || []).slice(0, 5);
  // Si la lista tiene menos de 5 series, completamos con espacios vacíos
  const slots = [...previewShows];
  while (slots.length < 5) {
    slots.push(null);
  }

  return (
    <article
      className="ep-list-card"
      onClick={() => onSelectList(list)}
    >
      {/* CONTENEDOR DE 5 PÓSTERS SOLAPADOS HORIZONTALMENTE */}
      <div className="ep-list-poster-stack">
        {slots.map((show, idx) => (
          <div
            key={show ? `${list.id}-${show.id}` : `${list.id}-empty-${idx}`}
            className="ep-list-stack-slice"
            style={{ zIndex: 10 - idx }}
          >
            {show ? (
              <img
                src={
                  show.image?.medium ||
                  show.poster ||
                  "https://via.placeholder.com/240x360/12141c/9499ad?text=EPISODIA"
                }
                alt={show.name || show.showName}
                loading="lazy"
              />
            ) : (
              <div className="ep-list-empty-slice">+</div>
            )}
          </div>
        ))}
      </div>

      {/* TÍTULO DE LA LISTA */}
      <h4 className="ep-list-card-title">{list.title}</h4>

      {/* FILA DE AUTOR + CANTIDAD DE SERIES + LIKES + COMENTARIOS */}
      <div className="ep-list-card-meta">
        <div className="ep-list-author">
          <span
            className="ep-list-avatar"
            style={{ background: list.avatarColor || "var(--crimson)" }}
          >
            {list.author?.[0]?.toUpperCase() || "E"}
          </span>
          <span className="ep-list-author-name">{list.author}</span>
        </div>

        <div className="ep-list-stats">
          <span>{list.totalCount || list.shows?.length || 0} series</span>

          <button
            type="button"
            className={`ep-list-like-pill ${list.likedByMe ? "liked" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleLikeList) onToggleLikeList(list.id);
            }}
          >
            ♥ {list.likesLabel || list.likes || 0}
          </button>

          <span>💬 {list.commentsLabel || list.comments || 0}</span>
        </div>
      </div>
    </article>
  );
}