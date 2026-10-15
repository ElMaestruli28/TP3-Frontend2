// src/components/ShowGrid.jsx
import ShowCard from "./ShowCard";

export default function ShowGrid({ shows, ratings, onSelectShow }) {
  return (
    <div className="ep-poster-grid">
      {shows.map((show) => (
        <ShowCard
          key={show.id}
          show={show}
          showRating={ratings[show.id]}
          onSelect={onSelectShow}
        />
      ))}
    </div>
  );
}