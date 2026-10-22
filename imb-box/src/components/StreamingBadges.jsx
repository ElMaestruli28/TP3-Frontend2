// src/components/StreamingBadges.jsx
import { useState } from "react";
import {
  REGIONS,
  detectUserRegion,
  getStreamingPlatforms,
} from "../utilidades/streamingHelpers";

// Logos vectoriales (SVG) oficiales en miniatura para cada globo
function PlatformLogo({ id, color }) {
  switch (id) {
    case "netflix":
      return (
        <svg viewBox="0 0 24 24" className="ep-platform-svg">
          <path
            fill={color}
            d="M5 2h4l6 13.5V2h4v20h-4L9 8.5V22H5V2z"
          />
        </svg>
      );
    case "max":
      return (
        <svg viewBox="0 0 24 24" className="ep-platform-svg">
          <circle cx="12" cy="12" r="10" fill={color} />
          <path
            fill="#ffffff"
            d="M7 9h2.2l1.8 4 1.8-4H15v6h-1.6v-3.5L11.7 15h-1.4L8.6 11.5V15H7V9z"
          />
        </svg>
      );
    case "prime":
      return (
        <svg viewBox="0 0 24 24" className="ep-platform-svg">
          <circle cx="12" cy="12" r="10" fill="#00A8E1" />
          <path
            fill="#ffffff"
            d="M6.5 14.2c3.2 2.3 7.8 2.5 11 0.3M16 13.5l2.2 0.8-0.6 2.2"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "disney":
      return (
        <svg viewBox="0 0 24 24" className="ep-platform-svg">
          <circle cx="12" cy="12" r="10" fill="#06163A" stroke="#38BDF8" strokeWidth="1.5" />
          <path
            fill="#ffffff"
            d="M8 8h3.5c2.8 0 4.5 1.6 4.5 4s-1.7 4-4.5 4H8V8zm2 1.8v4.4h1.4c1.6 0 2.6-.9 2.6-2.2s-1-2.2-2.6-2.2H10z"
          />
        </svg>
      );
    case "crunchyroll":
      return (
        <svg viewBox="0 0 24 24" className="ep-platform-svg">
          <circle cx="12" cy="12" r="10" fill={color} />
          <circle cx="13.2" cy="12.5" r="6" fill="#08090d" />
          <circle cx="15" cy="10.8" r="2.2" fill="#ffffff" />
        </svg>
      );
    case "apple":
      return (
        <svg viewBox="0 0 24 24" className="ep-platform-svg">
          <path
            fill="#ffffff"
            d="M16.5 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.8-2.7-.7-1.4 0-2.7.8-3.4 2.1-1.5 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.6 2 1-.1 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.7 1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.2-.8-2.2-3.2zM14.5 6.4c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z"
          />
        </svg>
      );
    case "hulu":
      return (
        <svg viewBox="0 0 24 24" className="ep-platform-svg">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#1CE783" />
          <path
            fill="#08090d"
            d="M7 7h2.4v3.4h2.2V7H14v10h-2.4v-4.2H9.4V17H7V7z"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="ep-platform-svg">
          <circle cx="12" cy="12" r="10" fill={color || "#0064FF"} />
          <polygon points="10,8 16,12 10,16" fill="#ffffff" />
        </svg>
      );
  }
}

export default function StreamingBadges({ show, compact = false }) {
  const [region, setRegion] = useState(() => detectUserRegion());

  if (!show) return null;

  const platforms = getStreamingPlatforms(show, region);
  const originalNetwork = show.webChannel?.name || show.network?.name;

  return (
    <div className={`ep-streaming-container ${compact ? "compact" : ""}`}>
      {!compact && (
        <div className="ep-streaming-header">
          <span className="ep-streaming-title">
            Dónde ver según tu región:
          </span>

          {/* Selector de Región del Mundo */}
          <div className="ep-region-switcher">
            {REGIONS.map((r) => (
              <button
                key={r.code}
                type="button"
                className={`ep-region-btn ${region === r.code ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setRegion(r.code);
                }}
              >
                <span>{r.flag}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fila de Globos (Pills) con Logo + Nombre de la plataforma */}
      <div className="ep-streaming-globes-row">
        {platforms.map((platform) => (
          <a
            key={platform.id}
            href={platform.getSearchUrl(show.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="ep-stream-globe"
            style={{
              backgroundColor: platform.bg,
              borderColor: platform.border,
            }}
            onClick={(e) => e.stopPropagation()}
            title={`Ver ${show.name} en ${platform.name}`}
          >
            <span className="ep-stream-logo-wrap">
              <PlatformLogo id={platform.id} color={platform.color} />
            </span>
            <span className="ep-stream-name">{platform.name}</span>
          </a>
        ))}

        {/* Globo adicional con la emisora original si es distinta */}
        {!compact && originalNetwork && (
          <div
            className="ep-stream-globe ep-original-network-globe"
            title="Cadena / Emisora original"
          >
            <span className="ep-stream-logo-wrap ep-tv-icon">📺</span>
            <span className="ep-stream-name">
              Emisión original: {originalNetwork}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}