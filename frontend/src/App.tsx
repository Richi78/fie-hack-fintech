import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Navbar, type AppView } from "./components/layout/Navbar";
import { Login } from "./features/auth/Login";
import { Chatbot } from "./features/chatbot/Chatbot";
import { Dashboard } from "./features/dashboard/Dashboard";
import { Sales } from "./features/sales/Sales";
import "./App.css";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type SessionState = {
  token: string;
  user: SessionUser;
};

const views: Record<AppView, ReactElement> = {
  dashboard: <Dashboard />,
  sales: <Sales />,
  chatbot: <Chatbot />,
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

function App() {
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const [session, setSession] = useState<SessionState | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token") ?? localStorage.getItem("authToken");

    if (!storedToken) {
      setIsCheckingSession(false);
      return;
    }

    const token = storedToken;

    async function validateSession() {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = (await response.json()) as {
          user?: SessionUser;
        };

        if (!response.ok || !data.user) {
          throw new Error("Sesion invalida");
        }

        setSession({ token, user: data.user });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("businessId");
      } finally {
        setIsCheckingSession(false);
      }
    }

    void validateSession();
  }, []);

  function handleAuthenticated(nextSession: SessionState) {
    setSession(nextSession);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("businessId");
    setSession(null);
    setActiveView("dashboard");
  }

  if (isCheckingSession) {
    return (
      <main className="session-loading">
        <div className="session-loading__panel">
          <span className="eyebrow">Comunidad Tinka</span>
          <h1>Validando tu acceso</h1>
          <p>Estamos confirmando tu sesion para mostrar tu informacion.</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return <Login onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="app-shell">
      <Navbar
        activeView={activeView}
        onChangeView={setActiveView}
        userName={session.user.name}
        onLogout={handleLogout}
      />

      <main className="app-main">
        <section className="app-view">{views[activeView]}</section>
      </main>
    </div>
  );
}

export default App;
