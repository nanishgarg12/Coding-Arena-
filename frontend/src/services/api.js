import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("codearena_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
  update: (payload) => api.patch("/auth/me", payload)
};

export const battleApi = {
  public: () => api.get("/battles/public"),
  create: (payload) => api.post("/battles", payload),
  get: (roomCode) => api.get(`/battles/${roomCode}`),
  join: (roomCode) => api.post(`/battles/${roomCode}/join`),
  ready: (roomCode, ready) => api.post(`/battles/${roomCode}/ready`, { ready }),
  submit: (roomCode, payload) => api.post(`/battles/${roomCode}/submit`, payload),
  violation: (roomCode, payload) => api.post(`/battles/${roomCode}/violations`, payload)
};

export const problemApi = {
  list: (params) => api.get("/problems", { params })
};

export const leaderboardApi = {
  list: () => api.get("/leaderboard")
};

export const tournamentApi = {
  list: () => api.get("/tournaments"),
  create: (payload) => api.post("/tournaments", payload),
  register: (id) => api.post(`/tournaments/${id}/register`)
};

export const assessmentApi = {
  list: () => api.get("/assessments"),
  create: (payload) => api.post("/assessments", payload)
};
