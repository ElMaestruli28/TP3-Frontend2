// src/App.jsx - VERSIÓN 1 (BASE)
import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  // Estructura: { [showId]: { general: 85, episodes: { [epId]: 90 } } }
  const [ratings, setRatings] = useState({});

  // Cargar primeras series de la API de TVMaze
  useEffect(() => {
    fetch("https://api.tvmaze.com/shows?page=0")
      .then((res) => res.json())
      .then((data) => setShows(data.slice(0, 18)));
  }, []);

  // Abrir una serie y pedir sus capítulos a la API
  const openShow = async (show) => {
    setSelectedShow(show);
    const res = await fetch(`https://api.tvmaze.com/shows/${show.id}/episodes`);
    const epData = await res.json();
    setEpisodes(epData);
  };

  // Guardar puntaje general de la serie (1 al 100)
  const handleGeneralScore = (showId, value) => {
    const score = Math.min(100, Math.max(1, Number(value)));
    setRatings((prev) => ({
      ...prev,
      [showId]: {
        ...prev[showId],
        general: score,
        episodes: prev[showId]?.episodes || {},
      },
    }));
  };

  // Guardar puntaje individual de un capítulo (1 al 100)
  const handleEpisodeScore = (showId, epId, value) => {
    const score = Math.min(100, Math.max(1, Number(value)));
    setRatings((prev) => ({
      ...prev,
      [showId]: {
        ...prev[showId],
        episodes: {
          ...(prev[showId]?.episodes || {}),
          [epId]: score,
        },
      },
    }));
  };

  return (
    <div className="v1-container">
      <header className="v1-header">
        <h1>Episodia (Versión 1 - Base)</h1>
        {selectedShow && (
          <button className="v1-btn" onClick={() => setSelectedShow(null)}>
            ← Volver al listado
          </button>
        )}
      </header>

      {!selectedShow ? (
        <div className="v1-grid">
          {shows.map((show) => {
            const userScore = ratings[show.id]?.general;
            return (
              <div key={show.id} className="v1-card" onClick={() => openShow(show)}>
                <img src={show.image?.medium} alt={show.name} />
                <h3>{show.name}</h3>
                <span className="v1-score-tag">
                  {userScore ? `Puntaje: ${userScore}/100` : "Sin puntuar"}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="v1-detail-box">
            <h2>{selectedShow.name}</h2>
            <div
              dangerouslySetInnerHTML={{ __html: selectedShow.summary }}
              style={{ marginTop: "8px", color: "#ccc" }}
            />

            <div className="v1-general-rating">
              <label>
                <strong>Puntuación General de la Serie (1 - 100): </strong>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={ratings[selectedShow.id]?.general || ""}
                onChange={(e) => handleGeneralScore(selectedShow.id, e.target.value)}
                placeholder="Ej: 88"
              />
            </div>
          </div>

          <h3>Capítulos ({episodes.length})</h3>
          <div className="v1-episode-list" style={{ marginTop: "12px" }}>
            {episodes.map((ep) => {
              const epScore = ratings[selectedShow.id]?.episodes?.[ep.id] || "";
              return (
                <div key={ep.id} className="v1-episode-item">
                  <div>
                    <strong>
                      T{ep.season} E{ep.number}:
                    </strong>{" "}
                    {ep.name}
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="1-100"
                      value={epScore}
                      onChange={(e) =>
                        handleEpisodeScore(selectedShow.id, ep.id, e.target.value)
                      }
                    />
                    <span> / 100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}