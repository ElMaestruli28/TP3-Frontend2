// src/components/AuthModal.jsx
import { useState } from "react";
import { loginWithEmail, registerWithEmail, loginAnonymously } from "../servicios/firebase";

export default function AuthModal({ onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    try {
      await loginAnonymously();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="ep-qmodal-overlay" onClick={onClose}>
      <div className="ep-auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ep-auth-header">
          <h2>{isRegister ? "Crear cuenta en Episodia" : "Iniciar Sesión"}</h2>
          <button className="ep-qmodal-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="ep-auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="ep-auth-form">
          <div className="ep-auth-field">
            <label>Correo Electrónico</label>
            <input
              type="email"
              required
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="ep-auth-field">
            <label>Contraseña</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="ep-btn-primary-light" disabled={loading}>
            {loading ? "Procesando..." : isRegister ? "Registrarse" : "Entrar"}
          </button>
        </form>

        <div className="ep-auth-footer-actions">
          <button
            type="button"
            className="ep-auth-switch-btn"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
          </button>

          <div className="ep-auth-divider">o</div>

          <button
            type="button"
            className="ep-btn-secondary-glass"
            onClick={handleAnonymous}
          >
            Entrar como invitado (Anónimo)
          </button>
        </div>
      </div>
    </div>
  );
}