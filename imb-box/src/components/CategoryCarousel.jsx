// src/components/CategoryCarousel.jsx
import { useRef } from "react";
import ShowCard from "./ShowCard";

export default function CategoryCarousel({
  title,
  subtitle,
  shows = [],
  ratings = {},
  onSelectShow,
  showRank = false,
  ribbonText = null,
}) {
  const trackRef = useRef(null);

  if (!shows || shows.length === 0) return null;

  const handleScroll = (direction) => {
    if (!trackRef.current) return;
    const scrollAmount = trackRef.current.clientWidth * 0.78;
    trackRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="ep-carousel-section">
      <div className="ep-carousel-header">
        <div>
          <h3 className="ep-carousel-title">{title}</h3>
          {subtitle && <p className="ep-carousel-subtitle">{subtitle}</p>}
        </div>

        <div className="ep-carousel-arrows">
          <button
            type="button"
            className="ep-carousel-arrow-btn"
            onClick={() => handleScroll("left")}
            aria-label={`Deslizar ${title} a la izquierda`}
          >
            ‹
          </button>
          <button
            type="button"
            className="ep-carousel-arrow-btn"
            onClick={() => handleScroll("right")}
            aria-label={`Deslizar ${title} a la derecha`}
          >
            ›
          </button>
        </div>
      </div>

      <div className="ep-carousel-track" ref={trackRef}>
        {shows.map((show, idx) => (
          <div key={show.id} className="ep-carousel-item">
            <ShowCard
              show={show}
              showRating={ratings[show.id]}
              onSelect={onSelectShow}
              rankNumber={showRank ? idx + 1 : null}
              ribbonText={ribbonText}
            />
          </div>
        ))}
      </div>
    </section>
  );
}