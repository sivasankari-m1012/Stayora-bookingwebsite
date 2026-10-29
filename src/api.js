// Tiny client for the backend (backend/ -> npm start, port 4000). Vite proxies /api in dev.
const BASE = import.meta.env.VITE_API_URL ?? "";

async function request(path, init) {
  let res;
  try {
    res = await fetch(BASE + path, init);
  } catch {
    throw new Error("Can't reach the server. Start the backend: cd backend && npm start");
  }
  if ([502, 503, 504].includes(res.status)) {
    throw new Error("Backend is not running (502). Open a terminal: cd backend && npm start");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error?.message || `Request failed (${res.status})`);
  return body;
}

export const api = {
  availability: (months = 12) => request(`/api/availability?months=${months}`),
  book: (payload, key) =>
    request("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": key },
      body: JSON.stringify(payload),
    }),
  cancel: (ref) => request(`/api/bookings/${ref}`, { method: "DELETE" }),
};
