const BASE = "/api";

function getToken() {
  return localStorage.getItem("bf_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();

  if (res.status === 401) {
    localStorage.removeItem("bf_token");
    localStorage.removeItem("bf_user");
    window.location.href = "/login";
    throw new Error(data.error || "Session expired");
  }

  if (!data.success) throw new Error(data.error || "Request failed");
  return data.data;
}

export const api = {
  register:    (body) => request("/auth/register", { method: "POST", body }),
  login:       (body) => request("/auth/login",    { method: "POST", body }),
  me:          ()     => request("/auth/me"),

  getBooks:    (p = {}) => request(`/books?${new URLSearchParams(p)}`),
  getBook:     (id)     => request(`/books/${id}`),
  createBook:  (body)   => request("/books",       { method: "POST",   body }),
  updateBook:  (id, b)  => request(`/books/${id}`, { method: "PUT",    body: b }),
  deleteBook:  (id)     => request(`/books/${id}`, { method: "DELETE" }),

  getPodcasts:   (p = {}) => request(`/podcasts?${new URLSearchParams(p)}`),
  getPodcast:    (id)     => request(`/podcasts/${id}`),
  createPodcast: (body)   => request("/podcasts",       { method: "POST",   body }),
  updatePodcast: (id, b)  => request(`/podcasts/${id}`, { method: "PUT",    body: b }),
  deletePodcast: (id)     => request(`/podcasts/${id}`, { method: "DELETE" }),

  getMediaList:  (p = {}) => request(`/media?${new URLSearchParams(p)}`),
  getMedia:      (id)     => request(`/media/${id}`),
  createMedia:   (body)   => request("/media",       { method: "POST",   body }),
  updateMedia:   (id, b)  => request(`/media/${id}`, { method: "PUT",    body: b }),
  deleteMedia:   (id)     => request(`/media/${id}`, { method: "DELETE" }),

  getStats:       (year) => request(`/stats?year=${year}`),
  getSettings:    ()     => request("/settings"),
  updateSettings: (body) => request("/settings", { method: "PUT", body }),
};

export async function fetchBookCover(title, author) {
  try {
    const q = encodeURIComponent(`${title} ${author || ""}`);
    const res = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=1`);
    const data = await res.json();
    const id = data?.docs?.[0]?.cover_i;
    if (id) return `https://covers.openlibrary.org/b/id/${id}-M.jpg`;
  } catch (_) {}
  return null;
}

export async function fetchPodcastCover(showName) {
  try {
    const q = encodeURIComponent(showName);
    const res = await fetch(`https://itunes.apple.com/search?term=${q}&media=podcast&limit=1`);
    const data = await res.json();
    return data?.results?.[0]?.artworkUrl600 || null;
  } catch (_) {}
  return null;
}

export async function fetchMovieCover(title) {
  try {
    const q = encodeURIComponent(title);
    const res = await fetch(`https://www.omdbapi.com/?t=${q}&apikey=trilogy`);
    const data = await res.json();
    if (data?.Poster && data.Poster !== "N/A") return data.Poster;
  } catch (_) {}
  return null;
}