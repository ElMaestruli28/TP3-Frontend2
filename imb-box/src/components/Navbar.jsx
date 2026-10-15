// src/components/Navbar.jsx
export default function Navbar({
  view,
  setView,
  searchQuery,
  setSearchQuery,
  onSearch,
  ratedCount,
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

      <form className="ep-search-bar" onSubmit={onSearch}>
        <input
          type="text"
          placeholder="Buscar serie (ej. Black Clover, Dark, Arcane)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>
    </header>
  );
}