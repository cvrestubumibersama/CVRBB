import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string> | null = null;

async function tryRefresh(): Promise<string> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("no refresh");
  const { data } = await axios.post("/api/auth/refresh", { refreshToken });
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  return data.accessToken;
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if ((err.response?.status === 401 || err.response?.status === 403) && !original._retry) {
      original._retry = true;
      try {
        refreshing = refreshing ?? tryRefresh();
        const token = await refreshing;
        refreshing = null;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);
