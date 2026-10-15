// src/App.jsx - VERSIÓN 2 (CON MEJORAS)
import { useState, useEffect, useMemo } from "react";
import { saveShowRatingToFirebase, fetchUserRatingsFromFirebase } from "./firebase";
import "./App.css";

const DEMO_USER_ID = "usuario_episodia_01";

export default function App() {
  const [shows, setShows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [activeSeason, setActiveSeason] = useState(1);
  const [ratings, setRatings] = useState(() => {
    const saved = localStorage.getItem("episodia_v2_ratings");
    return saved ? JSON.parse(saved) : {};
  });

  // Cargar catálogo inicial y sincronizar con Firebase
  useEffect(() => {
    fetch("https://api.tvmaze.com/shows?page=0")
      .then((res) => res.json())
      .then((data) => setShows(data.slice(0, 20)));

    fetchUserRatingsFromFirebase(DEMO_USER_ID).then((cloudData) => {
      if (cloudData && Object.keys(cloudData).length > 0) {
        setRatings((prev) => ({ ...prev, ...cloudData }));
      }
    });
  }, []);

  // Guardar en LocalStorage cada vez que cambian las notas
  useEffect(() => {
    localStorage.setItem("episodia_v2_ratings", JSON.stringify(ratings));
  }, [ratings]);

  // Buscar series en la API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const res = await fetch(
      `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(searchQuery)}`
    );
    const data = await res.json();
    setShows(data.map((item) => item.show));
    setSelectedShow(null);
  };

  // Abrir detalle de serie
  const openShow = async (show) => {
    setSelectedShow(show);
    setActiveSeason(1);
    const res = await fetch(`https://api.tvmaze.com/shows/${show.id}/episodes`);
    const epData = await res.json();
    setEpisodes(epData);
  };

  // Puntuar serie general (1-100) y persistir en Firebase
  const updateGeneralRating = (show, value) => {
    const score = Math.min(100, Math.max(1, Number(value)));
    const updatedShowData = {
      ...(ratings[show.id] || {}),
      showName: show.name,
      poster: show.image?.medium || "",
      generalScore: score,
      episodes: ratings[show.id]?.episodes || {},
    };
    setRatings((prev) => ({ ...prev, [show.id]: updatedShowData }));
    saveShowRatingToFirebase(DEMO_USER_ID, show.id, updatedShowData);
  };

  // Puntuar episodio individual (1-100) y persistir en Firebase
  const updateEpisodeRating = (show, epId, value) => {
    const score = Math.min(100, Math.max(1, Number(value)));
    const updatedShowData = {
      ...(ratings[show.id] || {}),
      showName: show.name,
      poster: show.image?.medium || "",
      generalScore: ratings[show.id]?.generalScore || null,
      episodes: {
        ...(ratings[show.id]?.episodes || {}),
        [epId]: score,
      },
    };
    setRatings((prev) => ({ ...prev, [show.id]: updatedShowData }));
    saveShowRatingToFirebase(DEMO_USER_ID, show.id, updatedShowData);
  };

  // Obtener lista de temporadas únicas
  const seasons = useMemo(() => {
    const set = new Set(episodes.map((e) => e.season));
    return Array.from(set).sort((a, b) => a - b);
  }, [episodes]);

  // Calcular promedio de capítulos puntuados de una serie
  const getEpisodeAverage = (showId) => {
    const epScores = Object.values(ratings[showId]?.episodes || {});
    if (epScores.length === 0) return null;
    const sum = epScores.reduce((acc, n) => acc + Number(n), 0);
    return Math.round(sum / epScores.length);
  };

  return (
    <div>
      <nav className="v2-navbar">
        <h2 onClick={() => setSelectedShow(null)} style={{ cursor: "pointer" }}>
          IMB-BOX <span style={{ color: "#ff3366", fontSize: "14px" }}>v2</span>
        </h2>

        <form className="v2-search-form" onSubmit={handleSearch}>
          <input
            className="v2-input"
            type="text"
            placeholder="Buscar serie (ej: Breaking Bad, Dark, Succession)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="v2-btn" type="submit">
            Buscar
          </button>
        </form>
      </nav>

      <main className="v2-main">
        {!selectedShow ? (
          <div className="v2-grid">
            {shows.map((show) => {
              const gen = ratings[show.id]?.generalScore;
              const avg = getEpisodeAverage(show.id);
              return (
                <div key={show.id} className="v2-card" onClick={() => openShow(show)}>
                  <img
                    src={
                      show.image?.medium ||
                      "https://via.placeholder.com/210x295?text=Sin+Poster"
                    }
                    alt={show.name}
                  />
                  <div className="v2-card-body">
                    <h4>{show.name}</h4>
                    <div className="v2-card-scores">
                      <span>General: {gen ? `${gen}/100` : "—"}</span>
                      <span>Prom. Caps: {avg ? `${avg}/100` : "—"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <button
              className="v2-btn"
              style={{ marginBottom: "20px", background: "#262b38" }}
              onClick={() => setSelectedShow(null)}
            >
              ← Volver al catálogo
            </button>

            <div className="v2-hero">
              <img src={selectedShow.image?.original || selectedShow.image?.medium} alt={selectedShow.name} />
              <div>
                <h1>{selectedShow.name}</h1>
                <p style={{ color: "#9ca3af", marginTop: "6px" }}>
                  {selectedShow.genres?.join(" • ")} | Estreno: {selectedShow.premiered}
                </p>

                <div className="v2-metrics-row">
                  <div className="v2-metric-card">
                    <span>Tu Puntaje General (1-100)</span>
                    <div className="v2-big-number">
                      {ratings[selectedShow.id]?.generalScore || "—"}{" "}
                      <small style={{ fontSize: "14px", color: "#9ca3af" }}>/ 100</small>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={ratings[selectedShow.id]?.generalScore || 50}
                      onChange={(e) =>
                        updateGeneralRating(selectedShow, e.target.value)
                      }
                      style={{ width: "100%", marginTop: "10px" }}
                    />
                  </div>

                  <div className="v2-metric-card">
                    <span>Promedio Automático de Capítulos</span>
                    <div className="v2-big-number" style={{ color: "#ffb800" }}>
                      {getEpisodeAverage(selectedShow.id) || "—"}{" "}
                      <small style={{ fontSize: "14px", color: "#9ca3af" }}>/ 100</small>
                    </div>
                    <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>
                      Calculado sobre{" "}
                      {Object.keys(ratings[selectedShow.id]?.episodes || {}).length}{" "}
                      capítulos puntuados
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pestañas de Temporadas */}
            <div className="v2-season-tabs">
              {seasons.map((s) => (
                <button
                  key={s}
                  className={`v2-tab ${activeSeason === s ? "active" : ""}`}
                  onClick={() => setActiveSeason(s)}
                >
                  Temporada {s}
                </button>
              ))}
            </div>

            {/* Lista de Capítulos de la Temporada Activa */}
            <div>
              {episodes
                .filter((ep) => ep.season === activeSeason)
                .map((ep) => {
                  const epScore = ratings[selectedShow.id]?.episodes?.[ep.id] || "";
                  return (
                    <div key={ep.id} className="v2-ep-row">
                      <div>
                        <strong>
                          E{String(ep.number).padStart(2, "0")} — {ep.name}
                        </strong>
                        <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                          Emisión: {ep.airdate || "N/A"}
                        </div>
                      </div>

                      <div className="v2-slider-wrap">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={epScore || 50}
                          onChange={(e) =>
                            updateEpisodeRating(selectedShow, ep.id, e.target.value)
                          }
                        />
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="—"
                          value={epScore}
                          onChange={(e) =>
                            updateEpisodeRating(selectedShow, ep.id, e.target.value)
                          }
                          style={{
                            width: "64px",
                            padding: "6px",
                            background: "#0f1117",
                            color: "white",
                            border: "1px solid #2e3446",
                            borderRadius: "6px",
                            textAlign: "center",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}