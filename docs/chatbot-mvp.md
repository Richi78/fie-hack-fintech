# Chatbot IA Gemini - MVP

## Objetivo

El chatbot responde preguntas de analitica de ventas del negocio del usuario. El backend consulta PostgreSQL con Prisma y envia a Gemini solo datos agregados, no registros completos ni acceso directo a la base de datos.

## Variables de entorno

Backend:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=tu_api_key_local
GEMINI_MODEL=gemini-2.5-flash-lite
```

Frontend opcional:

```env
VITE_API_URL=http://localhost:3000/api
VITE_DEMO_BUSINESS_ID=1
```

La API key solo debe existir en el backend. Nunca debe exponerse en Vite ni en codigo del frontend.

## Endpoint

`POST /api/chatbot/message`

Headers:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

Body:

```json
{
  "businessId": "1",
  "message": "Que producto vendi mas este mes?"
}
```

Respuesta:

```json
{
  "answer": "Tu producto con mayor ingreso este mes fue...",
  "intent": "top_products",
  "facts": {},
  "suggestions": []
}
```

## Preguntas soportadas

- "Cuanto vendi este mes?"
- "Que producto vendi mas?"
- "Que metodo de pago usan mas?"
- "Que canal genera mas ventas?"
- "Donde vendo mejor?"
- "Que clientes compraron mas?"
- "Tengo ventas pendientes?"
- "Como voy comparado con el periodo anterior?"

## Limites del MVP

- No responde utilidad neta real porque no hay tabla de egresos/gastos.
- No responde inventario o stock porque el esquema no guarda existencias.
- No responde metas financieras porque no hay tabla de objetivos.
- No guarda historial persistido de conversaciones.
- El rango maximo de consulta es 12 meses.
- Los rankings se limitan a 10 elementos como maximo.

## Seguridad de datos

- Gemini no genera SQL.
- Gemini no recibe credenciales de base de datos.
- El backend valida que `businessId` pertenezca al usuario autenticado.
- Las consultas usan agregados, rankings y totales calculados por Prisma.
- Las ventas `CANCELADO` y `REEMBOLSADO` no entran en totales generales.
