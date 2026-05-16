import { useState, type FormEvent } from "react";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const DEMO_BUSINESS_ID = import.meta.env.VITE_DEMO_BUSINESS_ID ?? "1";

type LoginUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type LoginResponse = {
  token: string;
  user: LoginUser;
};

type LoginProps = {
  onAuthenticated: (session: LoginResponse) => void;
};

export function Login({ onAuthenticated }: LoginProps) {
  const [email, setEmail] = useState("chatbot.demo@tinka.test");
  const [password, setPassword] = useState("DemoChatbot123!");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Completa tu correo y tu contrasena.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json()) as Partial<LoginResponse> & {
        error?: string;
      };

      if (!response.ok || !data.token || !data.user) {
        throw new Error(data.error ?? "No se pudo iniciar sesion.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("businessId", DEMO_BUSINESS_ID);

      onAuthenticated({
        token: data.token,
        user: data.user,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo iniciar sesion.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-hero">
        <div className="login-hero__content">
          <span className="login-hero__eyebrow">Comunidad Tinka</span>
          <h1>Ingresa a tu registro de ventas</h1>
          <p>
            Revisa tu resumen, registra movimientos y consulta el chatbot con
            datos reales de tu negocio.
          </p>
        </div>
      </section>

      <section className="login-access" aria-labelledby="login-title">
        <div className="login-access__intro">
          <span className="login-access__eyebrow">Acceso privado</span>
          <h2 id="login-title">Iniciar sesion</h2>
          <p>Tu informacion se muestra solo dentro de tu cuenta activa.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>Correo</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tucorreo@negocio.com"
              disabled={isSubmitting}
            />
          </label>

          <label className="login-field">
            <span>Contrasena</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa tu contrasena"
              disabled={isSubmitting}
            />
          </label>

          {error ? (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          ) : (
            <p className="login-form__hint">
              Usa el usuario demo cargado en la base para probar el chatbot.
            </p>
          )}

          <button
            type="submit"
            className="login-form__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Validando acceso" : "Continuar"}
          </button>
        </form>
      </section>
    </main>
  );
}
