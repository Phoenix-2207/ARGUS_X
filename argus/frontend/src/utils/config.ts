// ═══════════════════════════════════════════════════════════════════════
// ARGUS-X — Backend Configuration
// Priority: window.__ARGUS_CONFIG__ → VITE env vars → auto-detect → localhost
// ═══════════════════════════════════════════════════════════════════════

interface ArgusConfig {
  apiUrl?: string;
  wsUrl?: string;
}

declare global {
  interface Window {
    __ARGUS_CONFIG__?: ArgusConfig;
  }
}

const _cfg: ArgusConfig =
  (typeof window !== 'undefined' && window.__ARGUS_CONFIG__) || {};

// Vite env var fallback (set via .env or deployment config)
const _viteApiUrl = import.meta.env.VITE_API_URL || '';
const _viteWsUrl = import.meta.env.VITE_WS_URL || '';

const _loc = typeof window !== 'undefined' ? window.location : ({} as Location);

// Auto-detect: only use same-origin when hostname is localhost (local dev).
// In production, backend must be configured explicitly via env or __ARGUS_CONFIG__.
const _backendHost =
  _loc.hostname === 'localhost'
    ? 'localhost:8000'
    : _loc.host || 'localhost:8000';

const _proto = _loc.protocol === 'https:' ? 'https' : 'http';
const _wsproto = _loc.protocol === 'https:' ? 'wss' : 'ws';

// Resolution order: __ARGUS_CONFIG__ → VITE env → auto-detect
export const API_URL = _cfg.apiUrl || _viteApiUrl || `${_proto}://${_backendHost}`;
export const WS_URL = _cfg.wsUrl || _viteWsUrl || `${_wsproto}://${_backendHost}`;
