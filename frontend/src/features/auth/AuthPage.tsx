import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import "./AuthPage.css";

type AuthMode = "login" | "register";

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg-orb auth-page__bg-orb--1" />
      <div className="auth-page__bg-orb auth-page__bg-orb--2" />
      <div className="auth-page__bg-orb auth-page__bg-orb--3" />

      <div className="auth-card">
        {/* Header */}
        <div className="auth-card__header">
          <div className="auth-card__logo" aria-hidden="true">
            <span>EH</span>
          </div>
          <h1 className="auth-card__title">Emprende Hub</h1>
          <p className="auth-card__subtitle">
            {mode === "login"
              ? "Inicia sesión para continuar"
              : "Crea tu cuenta y empieza a emprender"}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="auth-card__switcher">
          <button
            type="button"
            className={`auth-card__switch-btn ${mode === "login" ? "is-active" : ""}`}
            onClick={() => switchMode("login")}
            id="auth-switch-login"
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={`auth-card__switch-btn ${mode === "register" ? "is-active" : ""}`}
            onClick={() => switchMode("register")}
            id="auth-switch-register"
          >
            Registrarse
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-card__error" role="alert">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.75" fill="currentColor" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form className="auth-card__form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="auth-field">
              <label htmlFor="auth-name" className="auth-field__label">
                Nombre completo
              </label>
              <input
                id="auth-name"
                type="text"
                className="auth-field__input"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email" className="auth-field__label">
              Correo electrónico
            </label>
            <input
              id="auth-email"
              type="email"
              className="auth-field__input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password" className="auth-field__label">
              Contraseña
            </label>
            <input
              id="auth-password"
              type="password"
              className="auth-field__input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {mode === "register" && (
            <div className="auth-field">
              <label htmlFor="auth-confirm-password" className="auth-field__label">
                Confirmar contraseña
              </label>
              <input
                id="auth-confirm-password"
                type="password"
                className="auth-field__input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          )}

          <button
            type="submit"
            className="auth-card__submit"
            disabled={isSubmitting}
            id="auth-submit-btn"
          >
            {isSubmitting ? (
              <span className="auth-card__spinner" />
            ) : mode === "login" ? (
              "Iniciar Sesión"
            ) : (
              "Crear Cuenta"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-card__footer">
          {mode === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                className="auth-card__link"
                onClick={() => switchMode("register")}
              >
                Regístrate aquí
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                className="auth-card__link"
                onClick={() => switchMode("login")}
              >
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
