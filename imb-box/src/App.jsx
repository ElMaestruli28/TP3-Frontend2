// src/App.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import {
  saveShowRatingToFirebase,
  fetchUserRatingsFromFirebase,
} from "./servicios/firebase";
import {
  calculateEpisodeAverage,
  isVerifiedMiniseries,
} from "./utilidades/scoreHelpers";
import Navbar from "./components/Navbar";
import HeroSpotlight from "./components/HeroSpotlight";
import CategoryCarousel from "./components/CategoryCarousel";
import ShowGrid from "./components/ShowGrid";
import ShowDetail from "./pages/ShowDetail";
import DiaryView from "./components/DiaryView";
import "./App.css";

const USER_ID = "episodia_member_01";

const ALL_TIME_PRIORITY_TITLES = [
  "Breaking Bad",
  "Game of Thrones",
  "Chernobyl",
  "The Sopranos",
  "Band of Brothers",
  "The Wire",
  "Better Call Saul",
  "Stranger Things",
  "Sherlock",
  "Peaky Blinders",
  "The Twilight Zone",
  "Fleabag",
  "Fargo",
  "House",
  "Friends",
  "Dark",
  "The Office",
  "Succession",
  "Battlestar Galactica",
  "Freaks and Geeks",
  "Mad Men",
  "Narcos",
  "Mindhunter",
  "Mr. Robot",
  "Black Mirror",
  "Heartstopper",
  "Severance",
  "It's Always Sunny in Philadelphia",
  "The Boys",
  "Seinfeld",
  "The Last of Us",
  "When They See Us",
  "The Mandalorian",
  "Lost",
  "Deadwood",
  "Mare of Easttown",
  "Hannibal",
  "The Bear",
  "Boardwalk Empire",
  "Atlanta",
  "Vikings",
  "Twin Peaks",
  "The Shield",
  "True Detective",
  "The Haunting of Hill House",
  "The Americans",
  "Justified",
];

// Candidatas a Miniseries que serán verificadas con sus episodios reales
const MINISERIES_CANDIDATES = [
  "Chernobyl",
  "Band of Brothers",
  "Mare of Easttown",
  "When They See Us",
  "The Queen's Gambit",
  "The Pacific",
  "Sharp Objects",
  "Unbelievable",
  "Watchmen",
  "WandaVision",
  "The Night Of",
  "11.22.63",
  "Station Eleven",
  "Godless",
  "Maid",
  "Bodyguard",
  "Unorthodox",
  "Generation Kill",
  "Normal People",
  "Dopesick",
];

export default function App() {
  const [view, setView] = useState("catalog");
  const [allShows, setAllShows] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
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

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const [page0, page1] = await Promise.all([
          fetch("https://api.tvmaze.com/shows?page=0").then((r) => r.json()),
          fetch("https://api.tvmaze.com/shows?page=1").then((r) => r.json()),
        ]);

        const combinedMap = new Map();
        [...page0, ...page1].forEach((s) => combinedMap.set(s.id, s));

        // 1. Detectar candidatas a miniserie dentro de page0 y page1 (finalizadas en <= 150 días)
        const catalogMiniCandidates = [...page0, ...page1].filter((s) => {
          if (s.status !== "Ended" || !s.premiered || !s.ended) return false;
          const days =
            (new Date(s.ended) - new Date(s.premiered)) / (1000 * 60 * 60 * 24);
          return days >= 0 && days <= 150;
        });

        // Cargar episodios de esas candidatas del catálogo para verificar si tienen 1 temporada y <=12 caps
        await Promise.all(
          catalogMiniCandidates.slice(0, 15).map(async (s) => {
            try {
              const eps = await fetch(
                `https://api.tvmaze.com/shows/${s.id}/episodes`
              ).then((r) => r.json());
              combinedMap.set(s.id, { ...s, _embedded: { episodes: eps } });
            } catch {
              // Ignorar si falla la red en una serie individual
            }
          })
        );

        // 2. Cargar nuestras miniseries y series clave con &embed=episodes para verificar capítulos fijos
        const extraQueries = [
          "Black Clover",
          "The Sopranos",
          "Succession",
          "Dark",
          "Severance",
          "The Last of Us",
          "The Bear",
          "Mindhunter",
          "Hunter x Hunter",
          ...MINISERIES_CANDIDATES,
        ];

        const extraResults = await Promise.all(
          extraQueries.map((q) =>
            fetch(
              `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(
                q
              )}&embed=episodes`
            )
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        );

        extraResults.forEach((item) => {
          if (item && item.id) {
            combinedMap.set(item.id, item);
            if (item.name.toLowerCase().includes("black clover") && isMounted) {
              setFeaturedShow(item);
            }
          }
        });

        if (isMounted) {
          setAllShows(Array.from(combinedMap.values()));
        }
      } catch (err) {
        console.error("Error cargando catálogo:", err);
      }
    }

    loadCatalog();

    fetchUserRatingsFromFirebase(USER_ID).then((cloudData) => {
      if (cloudData && Object.keys(cloudData).length > 0 && isMounted) {
        setRatings((prev) => ({ ...prev, ...cloudData }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("episodia_v3_data", JSON.stringify(ratings));
  }, [ratings]);

  // Armar las categorías verificadas
  const categories = useMemo(() => {
    if (allShows.length === 0) {
      return {
        top100: [],
        miniSeries: [],
        trending: [],
        horror: [],
        comedy: [],
        drama: [],
        scifi: [],
        crime: [],
        anime: [],
      };
    }

    // 1. Las 100 mejores series de la historia
    const priorityMap = new Map(
      ALL_TIME_PRIORITY_TITLES.map((title, idx) => [title.toLowerCase(), idx])
    );

    const top100 = [...allShows]
      .filter(
        (s) =>
          s.rating?.average >= 7.8 ||
          priorityMap.has(s.name?.toLowerCase())
      )
      .sort((a, b) => {
        const aRank = priorityMap.has(a.name?.toLowerCase())
          ? priorityMap.get(a.name.toLowerCase())
          : 999;
        const bRank = priorityMap.has(b.name?.toLowerCase())
          ? priorityMap.get(b.name.toLowerCase())
          : 999;

        if (aRank !== bRank) return aRank - bRank;
        return (b.rating?.average || 0) - (a.rating?.average || 0);
      })
      .slice(0, 100);

    // 2. MINI-SERIES VERIFICADAS (Solo 1 temporada, estado "Ended" y entre 2 y 12 episodios fijos)
    const miniSeries = allShows
      .filter((s) => isVerifiedMiniseries(s))
      .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));

    // 3. Series Trending
    const trending = [...allShows]
      .sort((a, b) => (b.weight || 0) - (a.weight || 0))
      .slice(0, 25);

    // 4. Por Géneros
    const byGenre = (genreNames) =>
      allShows
        .filter((s) => s.genres?.some((g) => genreNames.includes(g)))
        .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
        .slice(0, 25);

    return {
      top100,
      miniSeries,
      trending,
      horror: byGenre(["Horror", "Supernatural"]),
      comedy: byGenre(["Comedy"]),
      drama: byGenre(["Drama"]),
      scifi: byGenre(["Science-Fiction", "Fantasy"]),
      crime: byGenre(["Crime", "Thriller", "Mystery"]),
      anime: allShows
        .filter(
          (s) => s.genres?.includes("Anime") || s.type === "Animation"
        )
        .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
        .slice(0, 25),
    };
  }, [allShows]);

  const scrollToCatalog = () => {
    catalogSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openShowDetail = async (show) => {
    setSelectedShow(show);
    setActiveSeason(1);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Si la serie ya trae sus episodios verificados en _embedded, los usamos al instante
    if (show._embedded?.episodes) {
      setEpisodes(show._embedded.episodes);
      return;
    }

    try {
      const res = await fetch(`https://api.tvmaze.com/shows/${show.id}/episodes`);
      const epData = await res.json();
      setEpisodes(epData);
    } catch (err) {
      console.error("Error cargando episodios:", err);
      setEpisodes([]);
    }
  };

  const openSavedShowById = async (showId) => {
    try {
      const res = await fetch(`https://api.tvmaze.com/shows/${showId}`);
      const showData = await res.json();
      openShowDetail(showData);
    } catch (err) {
      console.error("No se pudo abrir la serie guardada:", err);
    }
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
        ratedCount={Object.keys(ratings).length}
        trendingShows={categories.trending.slice(0, 3)}
        ratings={ratings}
        onSelectShow={openShowDetail}
        onLiveResultsChange={(liveShows) => {
          setSearchResults(liveShows);
          setView("catalog");
        }}
      />

      {view === "catalog" && searchQuery.trim() === "" && (
        <HeroSpotlight
          show={featuredShow || categories.trending[0]}
          userRating={ratings[featuredShow?.id]?.generalScore}
          episodeAverage={calculateEpisodeAverage(ratings[featuredShow?.id])}
          onOpenDetail={openShowDetail}
          onScrollToCatalog={scrollToCatalog}
        />
      )}

      <main className="ep-container" ref={catalogSectionRef}>
        {view === "catalog" && (
          <>
            {searchQuery.trim() !== "" ? (
              <>
                <div className="ep-section-header">
                  <h2 className="ep-section-title">
                    Resultados para &ldquo;{searchQuery}&rdquo;
                  </h2>
                </div>
                <ShowGrid
                  shows={searchResults}
                  ratings={ratings}
                  onSelectShow={openShowDetail}
                />
              </>
            ) : (
              <div className="ep-carousels-stack">
                <CategoryCarousel
                  title="Las 100 mejores series de la historia"
                  subtitle="Ranking histórico de excelencia televisiva • Desliza para ver las 100"
                  shows={categories.top100}
                  ratings={ratings}
                  onSelectShow={openShowDetail}
                  showRank={true}
                />

                <CategoryCarousel
                  title="Mini-series (1 temporada • Capítulos fijos)"
                  subtitle="Producciones cerradas verificadas de entre 2 y 12 episodios"
                  shows={categories.miniSeries}
                  ratings={ratings}
                  onSelectShow={openShowDetail}
                  ribbonText="Mini-serie"
                />

                <CategoryCarousel
                  title="Series Trending hoy"
                  subtitle="Las series más vistas y comentadas del momento"
                  shows={categories.trending}
                  ratings={ratings}
                  onSelectShow={openShowDetail}
                  ribbonText="En tendencia"
                />

                <CategoryCarousel
                  title="Terror y misterio sobrenatural"
                  shows={categories.horror}
                  ratings={ratings}
                  onSelectShow={openShowDetail}
                />

                <CategoryCarousel
                  title="Series de comedia imprescindibles"
                  shows={categories.comedy}
                  ratings={ratings}
                  onSelectShow={openShowDetail}
                />

                <CategoryCarousel
                  title="Animes y animación de culto"
                  shows={categories.anime}
                  ratings={ratings}
                  onSelectShow={openShowDetail}
                />

                <CategoryCarousel
                  title="Ciencia ficción y mundos fantásticos"
                  shows={categories.scifi}
                  ratings={ratings}
                  onSelectShow={openShowDetail}
                />

                <CategoryCarousel
                  title="Crimen, suspenso e investigación"
                  shows={categories.crime}
                  ratings={ratings}
                  onSelectShow={openShowDetail}
                />

                <CategoryCarousel
                  title="Dramas aclamados"
                  shows={categories.drama}
                  ratings={ratings}
                  onSelectShow={openShowDetail}
                />
              </div>
            )}
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