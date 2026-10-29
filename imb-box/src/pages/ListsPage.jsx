// src/pages/ListsPage.jsx
import { useState, useEffect } from "react";
import ListStackCard from "../components/ListStackCard";
import ShowCard from "../components/ShowCard";

export default function ListsPage({
  popularLists = [],
  userLists = [],
  ratings = {},
  initialSelectedList = null,
  startInCreateMode = false,
  onCreateList,
  onDeleteList,
  onRemoveShowFromList,
  onToggleLikeList,
  onSelectShow,
}) {
  const [activeList, setActiveList] = useState(initialSelectedList);
  const [isCreating, setIsCreating] = useState(startInCreateMode);

  // Estados del formulario para crear una nueva lista
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("Tiago");
  const [draftShows, setDraftShows] = useState([]);

  // Buscador de series dentro del creador de listas
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    setActiveList(initialSelectedList);
  }, [initialSelectedList]);

  useEffect(() => {
    setIsCreating(startInCreateMode);
  }, [startInCreateMode]);

  // Sincronizar activeList cuando cambian userLists o popularLists
  useEffect(() => {
    if (!activeList) return;
    const all = [...userLists, ...popularLists];
    const updated = all.find((l) => l.id === activeList.id);
    if (updated) setActiveList(updated);
  }, [userLists, popularLists]);

  // Buscador en vivo de series para agregar a la lista
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(trimmed)}`
        );
        const data = await res.json();
        setSearchResults(data.map((i) => i.show).slice(0, 6));
      } catch (err) {
        console.error(err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAddDraftShow = (show) => {
    if (draftShows.some((s) => s.id === show.id)) return;
    setDraftShows((prev) => [...prev, show]);
    setQuery("");
    setSearchResults([]);
  };

  const handleRemoveDraftShow = (showId) => {
    setDraftShows((prev) => prev.filter((s) => s.id !== showId));
  };

  const handleSubmitNewList = (e) => {
    e.preventDefault();
    if (!title.trim() || draftShows.length === 0) return;

    const newList = {
      id: `user_list_${Date.now()}`,
      title: title.trim(),
      description:
        description.trim() || "Colección personalizada de series en EPISODIA.",
      author: author.trim() || "Usuario",
      avatarColor: "linear-gradient(135deg, var(--crimson), var(--gold))",
      shows: draftShows.map((s) => ({
        id: s.id,
        name: s.name,
        image: s.image || null,
        rating: s.rating || null,
        genres: s.genres || [],
        premiered: s.premiered || "",
      })),
      totalCount: draftShows.length,
      likes: 1,
      comments: 0,
      isCustom: true,
    };

    onCreateList(newList);
    setTitle("");
    setDescription("");
    setDraftShows([]);
    setIsCreating(false);
    setActiveList(newList);
  };

  /* ========================================================================
     MODO 1: DETALLE INTERNO DE UNA LISTA SELECCIONADA
     ======================================================================== */
  if (activeList && !isCreating) {
    return (
      <section className="ep-lists-page">
        <button
          type="button"
          className="ep-nav-btn"
          style={{ marginBottom: "20px" }}
          onClick={() => setActiveList(null)}
        >
          ← Volver a todas las listas
        </button>

        <div className="ep-list-detail-hero">
          <div>
            <div className="ep-list-author" style={{ marginBottom: "8px" }}>
              <span
                className="ep-list-avatar"
                style={{ background: activeList.avatarColor || "var(--crimson)" }}
              >
                {activeList.author?.[0]?.toUpperCase() || "E"}
              </span>
              <span className="ep-list-author-name">
                Lista por <strong>{activeList.author}</strong>
              </span>
            </div>

            <h1 className="ep-section-title">{activeList.title}</h1>
            <p className="ep-list-detail-desc">{activeList.description}</p>
          </div>

          <div className="ep-list-detail-actions">
            <button
              type="button"
              className={`ep-btn-secondary-glass ${
                activeList.likedByMe ? "liked-border" : ""
              }`}
              onClick={() => onToggleLikeList(activeList.id)}
            >
              ♥ {activeList.likesLabel || activeList.likes || 0} Likes
            </button>

            {activeList.isCustom && (
              <button
                type="button"
                className="ep-list-delete-btn"
                onClick={() => {
                  onDeleteList(activeList.id);
                  setActiveList(null);
                }}
              >
                Eliminar lista
              </button>
            )}
          </div>
        </div>

        <div className="ep-poster-grid">
          {(activeList.shows || []).map((show, index) => (
            <div key={show.id} style={{ position: "relative" }}>
              <ShowCard
                show={show}
                showRating={ratings[show.id]}
                onSelect={onSelectShow}
                rankNumber={index + 1}
              />
              {activeList.isCustom && (
                <button
                  type="button"
                  className="ep-remove-from-list-btn"
                  title="Quitar de la lista"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveShowFromList(activeList.id, show.id);
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ========================================================================
     MODO 2: EXPLORADOR GENERAL DE LISTAS + FORMULARIO CREADOR
     ======================================================================== */
  return (
    <section className="ep-lists-page">
      <div className="ep-lists-page-header">
        <div>
          <h1 className="ep-section-title">Listas de Series</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            Explora colecciones temáticas de la comunidad o arma tus propios rankings y listas.
          </p>
        </div>

        <button
          type="button"
          className="ep-btn-primary-light"
          onClick={() => setIsCreating((prev) => !prev)}
        >
          {isCreating ? "✕ Cerrar creador" : "+ Crear nueva lista"}
        </button>
      </div>

      {/* PANEL CREADOR DE LISTAS */}
      {isCreating && (
        <form className="ep-create-list-box" onSubmit={handleSubmitNewList}>
          <h3 className="ep-carousel-title" style={{ marginBottom: "14px" }}>
            Crear nueva lista de series
          </h3>

          <div className="ep-create-list-grid">
            <div className="ep-create-list-fields">
              <label className="ep-field-label">Nombre de la lista *</label>
              <input
                type="text"
                className="ep-text-input"
                placeholder="Ej: Mis thrillers psicológicos favoritos, Joyas de 1 temporada..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <label className="ep-field-label">Tu nombre / Usuario</label>
              <input
                type="text"
                className="ep-text-input"
                placeholder="Ej: Tiago"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />

              <label className="ep-field-label">Descripción</label>
              <textarea
                className="ep-text-input ep-textarea"
                placeholder="¿De qué trata esta lista o bajo qué criterio elegiste las series?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="ep-create-list-picker">
              <label className="ep-field-label">
                Buscar y agregar series a la lista ({draftShows.length} seleccionadas)
              </label>
              <input
                type="text"
                className="ep-text-input"
                placeholder="Escribe el nombre de una serie para añadirla..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              {/* Resultados rápidos para añadir */}
              {searchResults.length > 0 && (
                <div className="ep-picker-results">
                  {searchResults.map((s) => (
                    <div
                      key={s.id}
                      className="ep-picker-result-item"
                      onClick={() => handleAddDraftShow(s)}
                    >
                      <img
                        src={
                          s.image?.medium ||
                          "https://via.placeholder.com/60x90/12141c/9499ad?text=+"
                        }
                        alt={s.name}
                      />
                      <div>
                        <strong>{s.name}</strong>
                        <span>
                          {s.premiered ? s.premiered.slice(0, 4) : "Serie"}
                        </span>
                      </div>
                      <span className="ep-picker-add-tag">+ Añadir</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pósters ya añadidos al borrador */}
              <div className="ep-draft-chips">
                {draftShows.map((s, idx) => (
                  <div key={s.id} className="ep-draft-chip">
                    <span className="ep-draft-num">#{idx + 1}</span>
                    <img src={s.image?.medium} alt={s.name} />
                    <span className="ep-draft-name">{s.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDraftShow(s.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ep-create-list-footer">
            <button
              type="submit"
              className="ep-btn-primary-light"
              disabled={!title.trim() || draftShows.length === 0}
            >
              Guardar y publicar lista ({draftShows.length} series)
            </button>
          </div>
        </form>
      )}

      {/* SECCIÓN 1: MIS LISTAS PERSONALIZADAS */}
      <div className="ep-lists-block">
        <div className="ep-pop-lists-topbar">
          <span className="ep-pop-lists-kicker">
            MIS LISTAS CREADAS ({userLists.length})
          </span>
        </div>

        {userLists.length === 0 ? (
          <p className="ep-empty-lists-msg">
            Aún no creaste ninguna lista personalizada. Usa el botón{" "}
            <strong>&ldquo;+ Crear nueva lista&rdquo;</strong> o agrega series
            directamente desde su tarjeta rápida.
          </p>
        ) : (
          <div className="ep-pop-lists-grid">
            {userLists.map((list) => (
              <ListStackCard
                key={list.id}
                list={list}
                onSelectList={setActiveList}
                onToggleLikeList={onToggleLikeList}
              />
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: POPULAR LISTS DE LA COMUNIDAD */}
      <div className="ep-lists-block" style={{ marginTop: "40px" }}>
        <div className="ep-pop-lists-topbar">
          <span className="ep-pop-lists-kicker">POPULAR LISTS</span>
          <span className="ep-pop-lists-more">COMUNIDAD EPISODIA</span>
        </div>

        <div className="ep-pop-lists-grid">
          {popularLists.map((list) => (
            <ListStackCard
              key={list.id}
              list={list}
              onSelectList={setActiveList}
              onToggleLikeList={onToggleLikeList}
            />
          ))}
        </div>
      </div>
    </section>
  );
}