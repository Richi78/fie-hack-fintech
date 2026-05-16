import { useAuth } from "./context/AuthContext";
import { Navbar, type AppView } from "./components/layout/Navbar";
import { AuthPage } from "./features/auth/AuthPage";
import { Chatbot } from "./features/chatbot/Chatbot";
import { Dashboard } from "./features/dashboard/Dashboard";
import { Sales } from "./features/sales/Sales";
import { useState } from "react";
import "./App.css";

const views: Record<AppView, JSX.Element> = {
  dashboard: <Dashboard />,
  sales: <Sales />,
  chatbot: <Chatbot />,
};

function App() {
  const { user, isLoading, logout } = useAuth();
  const [activeView, setActiveView] = useState<AppView>("dashboard");

  // Show a full-screen loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" />
      </div>
    );
  }

  // If not logged in, show the auth page
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-shell">
      <Navbar
        activeView={activeView}
        onChangeView={setActiveView}
        user={user}
        onLogout={logout}
      />

      <main className="app-main">
        <section className="app-view">{views[activeView]}</section>
      </main>
    </div>
  );
}

export default App;
