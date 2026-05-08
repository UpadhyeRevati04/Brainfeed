import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api.js";

function makeHook(getAll, getOne, create, update, del) {
  return function useCollection(params = {}) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const key = JSON.stringify(params);

    const fetch = useCallback(async () => {
      try { setLoading(true); setError(null); setItems(await getAll(params)); }
      catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }, [key]);

    useEffect(() => { fetch(); }, [fetch]);

    return {
      items, loading, error, refetch: fetch,
      add:    async (body) => { const item = await create(body); setItems(p => [item, ...p]); return item; },
      edit:   async (id, body) => { const item = await update(id, body); setItems(p => p.map(i => i.id === id ? item : i)); return item; },
      remove: async (id) => { await del(id); setItems(p => p.filter(i => i.id !== id)); },
    };
  };
}

export const useBooks    = makeHook(api.getBooks,     api.getBook,    api.createBook,    api.updateBook,    api.deleteBook);
export const usePodcasts = makeHook(api.getPodcasts,  api.getPodcast, api.createPodcast, api.updatePodcast, api.deletePodcast);
export const useMedia    = makeHook(api.getMediaList, api.getMedia,   api.createMedia,   api.updateMedia,   api.deleteMedia);

export function useStats(year) {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api.getStats(year).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, [year]);
  return { stats, loading };
}

export function useSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading]   = useState(true);
  useEffect(() => {
    api.getSettings().then(d => { setSettings(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  const updateSettings = async (updates) => { const d = await api.updateSettings(updates); setSettings(d); return d; };
  return { settings, loading, updateSettings };
}
