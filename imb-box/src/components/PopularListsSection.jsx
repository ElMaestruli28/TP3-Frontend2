// src/components/PopularListsSection.jsx
import ListStackCard from "./ListStackCard";

export default function PopularListsSection({
  lists = [],
  onOpenList,
  onGoToListsPage,
  onCreateListClick,
  onToggleLikeList,
}) {
  if (!lists || lists.length === 0) return null;

  return (
    <section className="ep-popular-lists-home">
      <div className="ep-pop-lists-topbar">
        <span className="ep-pop-lists-kicker">POPULAR LISTS</span>
        <div className="ep-pop-lists-actions">
          <button
            type="button"
            className="ep-pop-lists-create-link"
            onClick={onCreateListClick}
          >
            + Crear lista
          </button>
          <button
            type="button"
            className="ep-pop-lists-more"
            onClick={onGoToListsPage}
          >
            MORE →
          </button>
        </div>
      </div>

      <div className="ep-pop-lists-grid">
        {lists.slice(0, 3).map((list) => (
          <ListStackCard
            key={list.id}
            list={list}
            onSelectList={onOpenList}
            onToggleLikeList={onToggleLikeList}
          />
        ))}
      </div>
    </section>
  );
}