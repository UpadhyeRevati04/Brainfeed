const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Request failed");
  return data.data;
}

export const api = {
  // Books
  getBooks:   (p = {}) => request(`/books?${new URLSearchParams(p)}`),
  getBook:    (id)     => request(`/books/${id}`),
  createBook: (body)   => request("/books", { method: "POST", body }),
  updateBook: (id, b)  => request(`/books/${id}`, { method: "PUT", body: b }),
  deleteBook: (id)     => request(`/books/${id}`, { method: "DELETE" }),

  // Podcasts
  getPodcasts:    (p = {}) => request(`/podcasts?${new URLSearchParams(p)}`),
  getPodcast:     (id)     => request(`/podcasts/${id}`),
  createPodcast:  (body)   => request("/podcasts", { method: "POST", body }),
  updatePodcast:  (id, b)  => request(`/podcasts/${id}`, { method: "PUT", body: b }),
  deletePodcast:  (id)     => request(`/podcasts/${id}`, { method: "DELETE" }),

  // Media (movies/series)
  getMediaList:  (p = {}) => request(`/media?${new URLSearchParams(p)}`),
  getMedia:      (id)     => request(`/media/${id}`),
  createMedia:   (body)   => request("/media", { method: "POST", body }),
  updateMedia:   (id, b)  => request(`/media/${id}`, { method: "PUT", body: b }),
  deleteMedia:   (id)     => request(`/media/${id}`, { method: "DELETE" }),

  // Stats & Settings
  getStats:       (year) => request(`/stats?year=${year}`),
  getSettings:    ()     => request("/settings"),
  updateSettings: (body) => request("/settings", { method: "PUT", body }),
};

// ── Cover Image Fetchers ────────────────────────────────────────────────────

export async function fetchBookCover(title, author) {
  try {
    const q = encodeURIComponent(`${title} ${author || ""}`);
    const res = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=1`);
    const data = await res.json();
    const coverId = data?.docs?.[0]?.cover_i;
    if (coverId) return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
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
  // Uses OMDb free API — user can add their own key; fallback gracefully
  try {
    const q = encodeURIComponent(title);
    const res = await fetch(`https://www.omdbapi.com/?t=${q}&apikey=trilogy`);
    const data = await res.json();
    if (data?.Poster && data.Poster !== "N/A") return data.Poster;
  } catch (_) {}
  return null;
}
