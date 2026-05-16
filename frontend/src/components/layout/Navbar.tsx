import "./Navbar.css";

export type AppView = "dashboard" | "sales" | "chatbot";

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

const navigation = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Resumen general",
  },
  {
    id: "sales",
    label: "Registro ventas",
    description: "Nueva operación",
  },
  {
    id: "chatbot",
    label: "Chatbot",
    description: "Asistente emprendedor",
  },
] as const satisfies Array<{
  id: AppView;
  label: string;
  description: string;
}>;

interface NavbarProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  user: UserInfo;
  onLogout: () => void;
}

export function Navbar({ activeView, onChangeView, user, onLogout }: NavbarProps) {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <div className="navbar__mark" aria-hidden="true">
          EH
        </div>
        <div>
          <span className="navbar__eyebrow">Emprende Hub</span>
          <strong>Fintech para arrancar tu idea</strong>
        </div>
      </div>

      <nav className="navbar__nav" aria-label="Navegación principal">
        {navigation.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              item.id === activeView ? "navbar__tab is-active" : "navbar__tab"
            }
            onClick={() => onChangeView(item.id)}
            aria-current={item.id === activeView ? "page" : undefined}
          >
            <span>{item.label}</span>
            <small>{item.description}</small>
          </button>
        ))}
      </nav>

      <div className="navbar__user">
        <div className="navbar__avatar" title={user.name}>
          {initials}
        </div>
        <div className="navbar__user-info">
          <strong>{user.name}</strong>
          <small>{user.email}</small>
        </div>
        <button
          type="button"
          className="navbar__logout"
          onClick={onLogout}
          title="Cerrar sesión"
          id="navbar-logout-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
}
