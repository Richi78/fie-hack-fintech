import { useState, type FormEvent } from "react";
import "./Chatbot.css";

const suggestions = [
  "Cuanto vendi este mes?",
  "Que producto vendi mas?",
  "Que metodo de pago usan mas?",
  "Tengo ventas pendientes?",
];

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type ChatbotResponse = {
  answer: string;
  intent: string;
  suggestions: string[];
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const DEFAULT_BUSINESS_ID = import.meta.env.VITE_DEMO_BUSINESS_ID ?? "1";

const initialMessages: ChatMessage[] = [
  {
    id: "assistant-welcome",
    role: "assistant",
    text: "Preguntame sobre tus ventas, productos, metodos de pago, canales, ubicaciones o cobros pendientes.",
  },
];

function getAuthToken() {
  return localStorage.getItem("token") ?? localStorage.getItem("authToken");
}

function getBusinessId() {
  return localStorage.getItem("businessId") ?? DEFAULT_BUSINESS_ID;
}

export function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [quickPrompts, setQuickPrompts] = useState(suggestions);

  async function sendMessage(message: string) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    const token = getAuthToken();
    if (!token) {
      setError("Necesitas iniciar sesion para consultar los datos del negocio.");
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmedMessage,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chatbot/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessId: getBusinessId(),
          message: trimmedMessage,
        }),
      });

      const data = (await response.json()) as Partial<ChatbotResponse> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo obtener una respuesta.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: data.answer ?? "No encontre informacion suficiente para responder.",
        },
      ]);

      if (data.suggestions?.length) {
        setQuickPrompts(data.suggestions);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo conectar con el asistente.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <section className="chatbot">
      <div className="section-heading">
        <div>
          <span className="section-heading__eyebrow">Asistente IA</span>
          <h2>Chatbot de ventas</h2>
        </div>
        <p>
          Consulta tus ventas, productos, canales y cobros pendientes con datos
          reales del negocio.
        </p>
      </div>

      <div className="chatbot__grid">
        <article className="panel chat-panel">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Conversacion</span>
              <h3>Analista del negocio</h3>
            </div>
            <span className="panel__badge">
              {isLoading ? "Consultando" : "En linea"}
            </span>
          </div>

          <div
            className="chat-panel__messages"
            aria-label="Mensajes del chatbot"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message chat-message--${message.role}`}
              >
                <strong>
                  {message.role === "assistant" ? "Asistente" : "Emprendedor"}
                </strong>
                <p>{message.text}</p>
              </div>
            ))}

            {isLoading ? (
              <div className="chat-message chat-message--assistant">
                <strong>Asistente</strong>
                <p>Estoy revisando los datos del negocio...</p>
              </div>
            ) : null}
          </div>

          {error ? <p className="chat-panel__error">{error}</p> : null}

          <form className="chat-panel__composer" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ej: Que producto vendi mas este mes?"
              disabled={isLoading}
            />
            <button type="submit" className="primary-action" disabled={isLoading}>
              {isLoading ? "Enviando" : "Enviar"}
            </button>
          </form>
        </article>

        <article className="panel chat-panel__side">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Sugerencias</span>
              <h3>Preguntas rapidas</h3>
            </div>
          </div>

          <div className="suggestion-list">
            {quickPrompts.map((item) => (
              <button
                key={item}
                type="button"
                className="suggestion-chip"
                onClick={() => void sendMessage(item)}
                disabled={isLoading}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="assistant-tips">
            <article>
              <span>Alcance MVP</span>
              <p>Ventas, productos, pagos, canales, ubicaciones y pendientes.</p>
            </article>
            <article>
              <span>Datos protegidos</span>
              <p>La IA recibe agregados, no registros completos ni la clave API.</p>
            </article>
          </div>
        </article>
      </div>
    </section>
  );
}
