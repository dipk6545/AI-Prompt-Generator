import { useState, useEffect, useRef } from 'react';

interface OllamaStatus {
  running: boolean;
  models: string[];
}

const CACHE_KEY = 'promptcraft_ollama_status';
const BACKEND_BASE = 'http://127.0.0.1:8080';
const POLL_INTERVAL = 3000;       // poll every 3s
const FAIL_THRESHOLD = 3;         // need 3 consecutive failures before showing red

function loadCached(): OllamaStatus {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { running: false, models: [] };
}

function saveCache(status: OllamaStatus) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(status));
  } catch { /* ignore */ }
}

async function fetchOllamaStatus(): Promise<OllamaStatus | null> {
  const urls = [
    '/api/providers/ollama/status',
    `${BACKEND_BASE}/api/providers/ollama/status`,
  ];
  for (const url of urls) {
    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        const data = await resp.json();
        const result: OllamaStatus = {
          running: !!data.running,
          models: Array.isArray(data.models) ? data.models : [],
        };
        saveCache(result);
        return result;
      }
    } catch {
      // try next URL
    }
  }
  return null;  // null = poll failed (don't immediately reset)
}

/**
 * Polls Ollama status every 3 seconds.
 * Uses localStorage cache for instant display on refresh.
 * Requires 3 consecutive poll failures before switching to "not running"
 * so a brief hiccup during generation doesn't flash the dot red.
 */
export const useOllamaStatus = (): OllamaStatus => {
  const [status, setStatus] = useState<OllamaStatus>(loadCached);
  const failCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      const result = await fetchOllamaStatus();
      if (cancelled) return;

      if (result) {
        // Success — reset fail counter, update state
        failCountRef.current = 0;
        setStatus(result);
      } else {
        // Failed — only flip to "not running" after FAIL_THRESHOLD consecutive failures
        failCountRef.current += 1;
        if (failCountRef.current >= FAIL_THRESHOLD) {
          setStatus({ running: false, models: [] });
        }
        // Otherwise keep showing the last good state
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return status;
};
