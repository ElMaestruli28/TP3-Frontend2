// src/components/ShowGrid.jsx
import ShowCard from "./ShowCard";

export default function ShowGrid({ shows = [], ratings = {}, onSelectShow }) {
  if (!shows || shows.length === 0) {
    return (
      <p className="ep-empty-state">
        No se encontraron series con ese nombre.
      </p>
    );
  }

  return (
    <div className="ep-shows-grid">
      {shows.map((show) => (
        <ShowCard
          key={show.id}
          show={show}
          showRating={ratings[show.id]}
          onSelect={(selectedShow) => onSelectShow(selectedShow, shows)}
        />
      ))}
    </div>
  );
}