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
  user,          // <-- Recibimos el usuario
  onLoginClick,  // <-- Función para abrir el modal de login
  onLogout,      // <-- Función para cerrar sesión
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

      {/* BOTÓN DE USUARIO / LOGIN EN EL NAVBAR */}
      <div className="ep-nav-auth-section">
        {user ? (
          <div className="ep-nav-user-info">
            <span className="ep-nav-username">👤 {user.email?.split("@")[0] || "Usuario"}</span>
            <button className="ep-nav-btn logout" onClick={onLogout}>Salir</button>
          </div>
        ) : (
          <button className="ep-btn-primary-light" onClick={onLoginClick}>
            Iniciar Sesión
          </button>
        )}
      </div>
    </header>
  );
}