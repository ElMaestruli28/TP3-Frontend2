// src/App.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import {
  auth,
  saveShowRatingToFirebase,
  fetchUserRatingsFromFirebase,
  logoutUser,
} from "./servicios/firebase";
import { onAuthStateChanged } from "firebase/auth";
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
import QuickShowModal from "./components/QuickShowModal";
import AuthModal from "./components/AuthModal";
import Footer from "./components/Footer";
import "./App.css";

// Ranking histórico de referencia ("Ranking The Best TV Shows of All Time")
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

// Actividad de amigos simulada para el carrusel "New from friends"
const FRIENDS_ACTIVITY_POOL = [
  { friendName: "malena", friendAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces", friendScore: 95 },
  { friendName: "malena", friendAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces", friendScore: 90 },
  { friendName: "malena", friendAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces", friendScore: 98 },
  { friendName: "malena", friendAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces", friendScore: 88 },
  { friendName: "malena", friendAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces", friendScore: 92 },
  { friendName: "malena", friendAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces", friendScore: 96 },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [view, setView] = useState("catalog"); // "catalog" | "detail" | "diary"
  const [allShows, setAllShows] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [featuredShow, setFeaturedShow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [quickModalShow, setQuickModalShow] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [activeSeason, setActiveSeason] = useState(1);

  const catalogSectionRef = useRef(null);

  const [ratings, setRatings] = useState(() => {
    const local = localStorage.getItem("episodia_v3_data");
    return local ? JSON.parse(local) : {};
  });

  // 1. Escuchar estado de autenticación en Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const cloudData = await fetchUserRatingsFromFirebase(currentUser.uid);
        if (cloudData && Object.keys(cloudData).length > 0) {
          setRatings(cloudData);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const currentUserId = user ? user.uid : "invitado_local";

  // 2. Cargar catálogo de TVMaze y series clave con sus episodios
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

        const catalogMiniCandidates = [...page0, ...page1].filter((s) => {
          if (s.status !== "Ended" || !s.premiered || !s.ended) return false;
          const days =
            (new Date(s.ended) - new Date(s.premiered)) / (1000 * 60 * 60 * 24);
          return days >= 0 && days <= 150;
        });

        await Promise.all(
          catalogMiniCandidates.slice(0, 15).map(async (s) => {
            try {
              const eps = await fetch(
                `https://api.tvmaze.com/shows/${s.id}/episodes`
              ).then((r) => r.json());
              combinedMap.set(s.id, { ...s, _embedded: { episodes: eps } });
            } catch {}
          })
        );

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

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("episodia_v3_data", JSON.stringify(ratings));
  }, [ratings]);

  // 3. Categorías y carruseles organizados
  const categories = useMemo(() => {
    if (allShows.length === 0) {
      return {
        top100: [],
        miniSeries: [],
        trending: [],
        friendsShows: [],
        friendsMap: {},
        horror: [],
        comedy: [],
        drama: [],
        scifi: [],
        crime: [],
        anime: [],
      };
    }

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

    const miniSeries = allShows
      .filter((s) => isVerifiedMiniseries(s))
      .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));

    const trending = [...allShows]
      .sort((a, b) => (b.weight || 0) - (a.weight || 0))
      .slice(0, 25);

    const friendsShows = [...allShows]
      .filter((s) => s.rating?.average >= 8.2)
      .slice(0, 12);

    const friendsMap = {};
    friendsShows.forEach((show, idx) => {
      friendsMap[show.id] = FRIENDS_ACTIVITY_POOL[idx % FRIENDS_ACTIVITY_POOL.length];
    });

    const byGenre = (genreNames) =>
      allShows
        .filter((s) => s.genres?.some((g) => genreNames.includes(g)))
        .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
        .slice(0, 25);

    return {
      top100,
      miniSeries,
      trending,
      friendsShows,
      friendsMap,
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

  const openQuickCard = (show) => {
    setQuickModalShow(show);
  };

  const openShowDetail = async (show) => {
    setQuickModalShow(null);
    setSelectedShow(show);
    setActiveSeason(1);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });

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
    const foundLocal = allShows.find((s) => String(s.id) === String(showId));
    if (foundLocal) {
      openQuickCard(foundLocal);
      return;
    }
    try {
      const res = await fetch(`https://api.tvmaze.com/shows/${showId}`);
      const showData = await res.json();
      openQuickCard(showData);
    } catch (err) {
      console.error("No se pudo abrir la serie guardada:", err);
    }
  };

  // Guardar estados rápidos (Watched, Like, Watchlist)
  const handleToggleShowFlag = (show, flag) => {
    const current = ratings[show.id] || {};
    const nextValue = !current[flag];

    const entry = {
      ...current,
      showId: show.id,
      showName: show.name,
      poster: show.image?.medium || "",
      genres: show.genres || [],
      episodes: current.episodes || {},
      [flag]: nextValue,
    };

    setRatings((prev) => ({ ...prev, [show.id]: entry }));
    saveShowRatingToFirebase(currentUserId, show.id, entry);
  };

  // Guardar Puntuación General (1-100)
  const handleSetGeneralScore = (show, rawValue) => {
    const score = Math.min(100, Math.max(1, Number(rawValue)));
    const current = ratings[show.id] || {};
    const entry = {
      ...current,
      showId: show.id,
      showName: show.name,
      poster: show.image?.medium || "",
      genres: show.genres || [],
      generalScore: score,
      watched: true,
      episodes: current.episodes || {},
    };

    setRatings((prev) => ({ ...prev, [show.id]: entry }));
    saveShowRatingToFirebase(currentUserId, show.id, entry);
  };

  // Guardar Reseña y Puntuación General desde la vista de detalle
  const handleSaveReviewAndScore = (show, reviewText) => {
    const current = ratings[show.id] || {};
    const entry = {
      ...current,
      showId: show.id,
      showName: show.name,
      poster: show.image?.medium || "",
      genres: show.genres || [],
      review: reviewText,
      generalScore: current.generalScore || null,
      watched: true,
      episodes: current.episodes || {},
    };

    setRatings((prev) => ({ ...prev, [show.id]: entry }));
    saveShowRatingToFirebase(currentUserId, show.id, entry);
  };

  // Guardar puntaje de capítulo individual (1-100)
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
      genres: show.genres || [],
      generalScore: ratings[show.id]?.generalScore || null,
      episodes: {
        ...(ratings[show.id]?.episodes || {}),
        [ep.id]: updatedEp,
      },
    };

    setRatings((prev) => ({ ...prev, [show.id]: entry }));
    saveShowRatingToFirebase(currentUserId, show.id, entry);
  };

  return (
    <div>
      {/* BARRA SUPERIOR + BOTÓN DE LOGIN / PERFIL */}
      <Navbar
        view={view}
        setView={setView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        ratedCount={Object.keys(ratings).length}
        trendingShows={categories.trending.slice(0, 3)}
        ratings={ratings}
        onSelectShow={openQuickCard}
        onLiveResultsChange={(liveShows) => {
          setSearchResults(liveShows);
          setView("catalog");
        }}
        user={user}                                    // <-- Pasamos el usuario
        onLoginClick={() => setShowAuthModal(true)}    // <-- Abrimos el modal de Auth
        onLogout={() => logoutUser()}                  // <-- Cerramos sesión en Firebase
      />

      {view === "catalog" && searchQuery.trim() === "" && (
        <HeroSpotlight
          show={featuredShow || categories.trending[0]}
          userRating={ratings[featuredShow?.id]?.generalScore}
          episodeAverage={calculateEpisodeAverage(ratings[featuredShow?.id])}
          onOpenDetail={openQuickCard}
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
                  onSelectShow={openQuickCard}
                />
              </>
            ) : (
              <div className="ep-carousels-stack">
                <CategoryCarousel
                  title="Las 100 mejores series de la historia"
                  subtitle="Ranking histórico de excelencia televisiva • Desliza para ver las 100"
                  shows={categories.top100}
                  ratings={ratings}
                  onSelectShow={openQuickCard}
                  showRank={true}
                />

                <CategoryCarousel
                  title="New from friends"
                  subtitle="Series recientes vistas por tus amigos con valoraciones altas"
                  shows={categories.friendsShows}
                  ratings={ratings}
                  onSelectShow={openQuickCard}
                  friendsMap={categories.friendsMap}
                />

                <CategoryCarousel
                  title="Mini-series (1 temporada • Capítulos fijos)"
                  subtitle="Producciones cerradas verificadas de entre 2 y 12 episodios"
                  shows={categories.miniSeries}
                  ratings={ratings}
                  onSelectShow={openQuickCard}
                  ribbonText="Mini-serie"
                />

                <CategoryCarousel
                  title="Series Trending hoy"
                  subtitle="Las series más vistas y comentadas del momento"
                  shows={categories.trending}
                  ratings={ratings}
                  onSelectShow={openQuickCard}
                  ribbonText="En tendencia"
                />

                <CategoryCarousel
                  title="Terror y misterio sobrenatural"
                  shows={categories.horror}
                  ratings={ratings}
                  onSelectShow={openQuickCard}
                />

                <CategoryCarousel
                  title="Series de comedia imprescindibles"
                  shows={categories.comedy}
                  ratings={ratings}
                  onSelectShow={openQuickCard}
                />

                <CategoryCarousel
                  title="Animes y animación de culto"
                  shows={categories.anime}
                  ratings={ratings}
                  onSelectShow={openQuickCard}
                />

                <CategoryCarousel
                  title="Ciencia ficción y mundos fantásticos"
                  shows={categories.scifi}
                  ratings={ratings}
                  onSelectShow={openQuickCard}
                />

                <CategoryCarousel
                  title="Crimen, suspenso e investigación"
                  shows={categories.crime}
                  ratings={ratings}
                  onSelectShow={openQuickCard}
                />

                <CategoryCarousel
                  title="Dramas aclamados"
                  shows={categories.drama}
                  ratings={ratings}
                  onSelectShow={openQuickCard}
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
            onSaveReviewAndScore={handleSaveReviewAndScore}
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

      <Footer />

      {/* TARJETA RÁPIDA INTERACTIVA */}
      {quickModalShow && (
        <QuickShowModal
          initialShow={quickModalShow}
          allShows={allShows}
          ratings={ratings}
          onClose={() => setQuickModalShow(null)}
          onToggleFlag={handleToggleShowFlag}
          onSetGeneralScore={handleSetGeneralScore}
          onOpenFullDetail={openShowDetail}
        />
      )}

      {/* MODAL DE AUTENTICACIÓN FIREBASE */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}