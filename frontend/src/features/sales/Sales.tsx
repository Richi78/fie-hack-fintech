import { useState, useEffect, useCallback } from "react";
import "./Sales.css";

const API_URL = "http://localhost:3000/api";

interface Business {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    products: number;
    sales: number;
  };
}

interface BusinessListItemProps {
  business: Business;
  isSelected: boolean;
  onClick: () => void;
}

function BusinessListItem({ business, isSelected, onClick }: BusinessListItemProps) {
  const createdDate = new Date(business.createdAt).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <button
      type="button"
      className={`business-item${isSelected ? " is-selected" : ""}`}
      onClick={onClick}
    >
      <div className="business-item__icon">
        {business.logoUrl ? (
          <img src={business.logoUrl} alt="" />
        ) : (
          <span>{business.name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="business-item__info">
        <strong className="business-item__name">{business.name}</strong>
        {business.description && (
          <span className="business-item__desc">{business.description}</span>
        )}
        <div className="business-item__meta">
          {business.address && <span>{business.address}</span>}
          {business.phone && <span>{business.phone}</span>}
          <span>Creado {createdDate}</span>
        </div>
      </div>
      <div className="business-item__stats">
        <div className="business-item__stat">
          <span className="business-item__stat-value">
            {business._count?.products ?? 0}
          </span>
          <span className="business-item__stat-label">productos</span>
        </div>
        <div className="business-item__stat">
          <span className="business-item__stat-value">
            {business._count?.sales ?? 0}
          </span>
          <span className="business-item__stat-label">ventas</span>
        </div>
      </div>
    </button>
  );
}

interface SalesProps {
  token: string;
}

export function Sales({ token }: SalesProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/businesses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("No se pudieron cargar los negocios");
      }
      const data = await res.json();
      setBusinesses(data.businesses ?? data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return (
    <section className="sales">
      <div className="section-heading">
        <div>
          <span className="section-heading__eyebrow">Tus negocios</span>
          <h2>Mis negocios</h2>
        </div>
        <p>
          Gestiona tus negocios, ver estadísticas y acceder a cada uno para
          gestionar sus productos y ventas.
        </p>
      </div>

      <div className="sales__grid">
        <article className="panel sales-list">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Negocios</span>
              <h3>Tu listado de negocios</h3>
            </div>
            <button
              type="button"
              className="panel__refresh"
              onClick={fetchBusinesses}
              disabled={loading}
            >
              Actualizar
            </button>
          </div>

          <div className="business-list">
            {loading && (
              <div className="business-list__loading">
                <span className="spinner" />
                <span>Cargando negocios...</span>
              </div>
            )}

            {!loading && error && (
              <div className="business-list__error">
                <span>{error}</span>
                <button type="button" onClick={fetchBusinesses}>
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && businesses.length === 0 && (
              <div className="business-list__empty">
                <span>No hay negocios registrados</span>
                <p>
                  Crea tu primer negocio desde el dashboard para comenzar.
                </p>
              </div>
            )}

            {!loading && !error && businesses.length > 0 && (
              <div className="business-list__items">
                {businesses.map((business) => (
                  <BusinessListItem
                    key={business.id}
                    business={business}
                    isSelected={selectedBusiness?.id === business.id}
                    onClick={() =>
                      setSelectedBusiness(
                        selectedBusiness?.id === business.id ? null : business
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}