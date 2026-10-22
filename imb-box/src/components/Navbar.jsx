// src/components/Navbar.jsx
import SearchBar from "./SearchBar";

export default function Navbar({
  view,
  setView,
  searchQuery,
  setSearchQuery,
  ratedCount,
  trendingShows,
  ratings,
  onSelectShow,
  onLiveResultsChange,
}) {
  return (
    <header className="ep-navbar">
      <div className="ep-nav-left">
        <div className="ep-brand" onClick={() => setView("catalog")}>
          <div className="ep-logo-mark">100</div>
          <span className="ep-brand-title">IMB-BOX</span>
        </div>

        <nav className="ep-nav-links">
          <button
            className={`ep-nav-btn ${view === "catalog" ? "active" : ""}`}
            onClick={() => setView("catalog")}
          >
            Inicio
          </button>
          <button
            className={`ep-nav-btn ${view === "diary" ? "active" : ""}`}
            onClick={() => setView("diary")}
          >
            Mi Bitácora ({ratedCount})
          </button>
        </nav>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        trendingShows={trendingShows}
        ratings={ratings}
        onSelectShow={onSelectShow}
        onLiveResultsChange={onLiveResultsChange}
      />
    </header>
  );
}