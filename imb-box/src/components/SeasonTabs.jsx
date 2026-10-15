// src/components/SeasonTabs.jsx
export default function SeasonTabs({ seasons, activeSeason, onSelectSeason }) {
  return (
    <div className="ep-tabs">
      {seasons.map((s) => (
        <button
          key={s}
          className={`ep-tab-btn ${activeSeason === s ? "active" : ""}`}
          onClick={() => onSelectSeason(s)}
        >
          Temporada {s}
        </button>
      ))}
    </div>
  );
}