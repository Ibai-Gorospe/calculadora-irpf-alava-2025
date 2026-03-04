import { useEffect, useRef } from "react";

const STORAGE_KEY = "irpf-alava-2025-state";
const DEBOUNCE_MS = 500;

export function useAutoSave(state) {
  const timerRef = useRef(null);
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) { /* quota exceeded or private browsing */ }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [state]);
}

export function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function clearSavedState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
