// src/App.jsx
import { useState, useEffect, useRef } from "react";
import {
  saveShowRatingToFirebase,
  fetchUserRatingsFromFirebase,
} from "./servicios/firebase";
import { calculateEpisodeAverage } from "./utilidades/scoreHelpers";
import Navbar from "./components/Navbar";
import HeroSpotlight from "./components/HeroSpotlight";
import ShowGrid from "./components/ShowGrid";
import ShowDetail from "./pages/ShowDetail";
import DiaryView from "./components/DiaryView";
import "./App.css";

const USER_ID = "episodia_member_01";

export default function App() {
  const [view, setView] = useState("catalog");
  const [shows, setShows] = useState([]);
  const [featuredShow, setFeaturedShow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [activeSeason, setActiveSeason] = useState(1);

  const catalogSectionRef = useRef(null);

  const [ratings, setRatings] = useState(() => {
    const local = localStorage.getItem("episodia_v3_data");
    return local ? JSON.parse(local) : {};
  });

  // Cargar catálogo y buscar "Black Clover" (o serie destacada) para el Hero Spotlight
  useEffect(() => {
    fetch("https://api.tvmaze.com/shows?page=0")
      .then((res) => res.json())
      .then((data) => {
        const topShows = data.slice(0, 24);
        setShows(topShows);
        if (topShows.length > 0) setFeaturedShow(topShows[0]);
      });

    // Cargamos Black Clover como serie recomendada del Hero para que coincida con tu referencia
    fetch("https://api.tvmaze.com/singlesearch/shows?q=black+clover")
      .then((res) => (res.ok ? res.json() : null))
      .then((bcShow) => {
        if (bcShow) setFeaturedShow(bcShow);
      })
      .catch(() => {});

    fetchUserRatingsFromFirebase(USER_ID).then((cloud) => {
      if (cloud && Object.keys(cloud).length > 0) {
        setRatings((prev) => ({ ...prev, ...cloud }));
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("episodia_v3_data", JSON.stringify(ratings));
  }, [ratings]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const res = await fetch(
      `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(searchQuery)}`
    );
    const data = await res.json();
    setShows(data.map((i) => i.show));
    setView("catalog");
    scrollToCatalog();
  };

  const scrollToCatalog = () => {
    catalogSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openShowDetail = async (show) => {
    setSelectedShow(show);
    setActiveSeason(1);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });

    const res = await fetch(`https://api.tvmaze.com/shows/${show.id}/episodes`);
    const epData = await res.json();
    setEpisodes(epData);
  };

  const openSavedShowById = async (showId) => {
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}`);
    const showData = await res.json();
    openShowDetail(showData);
  };

  const handleSetGeneralScore = (show, rawValue) => {
    const score = Math.min(100, Math.max(1, Number(rawValue)));
    const entry = {
      ...(ratings[show.id] || {}),
      showId: show.id,
      showName: show.name,
      poster: show.image?.medium || "",
      generalScore: score,
      episodes: ratings[show.id]?.episodes || {},
    };
    setRatings((prev) => ({ ...prev, [show.id]: entry }));
    saveShowRatingToFirebase(USER_ID, show.id, entry);
  };

  const handleSetEpisodeData = (show, ep, field, value) => {
    const currentEp = ratings[show.id]?.episodes?.[ep.id] || {};
    const updatedEp = {
      ...currentEp,
      code: `S${String(ep.season).padStart(2, "0")}E${String(
        ep.number
      ).padStart(2, "0")}`,
      name: ep.name,
      [field]:
        field === "score"
          ? value === ""
            ? null
            : Math.min(100, Math.max(1, Number(value)))
          : value,
    };

    const entry = {
      ...(ratings[show.id] || {}),
      showId: show.id,
      showName: show.name,
      poster: show.image?.medium || "",
      generalScore: ratings[show.id]?.generalScore || null,
      episodes: {
        ...(ratings[show.id]?.episodes || {}),
        [ep.id]: updatedEp,
      },
    };
    setRatings((prev) => ({ ...prev, [show.id]: entry }));
    saveShowRatingToFirebase(USER_ID, show.id, entry);
  };

  return (
    <div>
      <Navbar
        view={view}
        setView={setView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        ratedCount={Object.keys(ratings).length}
      />

      {view === "catalog" && (
        <HeroSpotlight
          show={featuredShow}
          userRating={ratings[featuredShow?.id]?.generalScore}
          episodeAverage={calculateEpisodeAverage(ratings[featuredShow?.id])}
          onOpenDetail={openShowDetail}
          onScrollToCatalog={scrollToCatalog}
        />
      )}

      <main className="ep-container" ref={catalogSectionRef}>
        {view === "catalog" && (
          <>
            <div className="ep-section-header">
              <div>
                <h2 className="ep-section-title">
                  Explorar y Puntuar Series (Escala 1–100)
                </h2>
                <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                  Selecciona cualquier serie para calificarla en general o
                  desglosar cada capítulo por temporada.
                </p>
              </div>
            </div>

            <ShowGrid
              shows={shows}
              ratings={ratings}
              onSelectShow={openShowDetail}
            />
          </>
        )}

        {view === "detail" && selectedShow && (
          <ShowDetail
            show={selectedShow}
            episodes={episodes}
            activeSeason={activeSeason}
            setActiveSeason={setActiveSeason}
            showRatings={ratings[selectedShow.id]}
            onBack={() => setView("catalog")}
            onSetGeneralScore={handleSetGeneralScore}
            onSetEpisodeData={handleSetEpisodeData}
          />
        )}

        {view === "diary" && (
          <DiaryView
            ratings={ratings}
            onOpenSavedShow={openSavedShowById}
          />
        )}
      </main>
    </div>
  );
}