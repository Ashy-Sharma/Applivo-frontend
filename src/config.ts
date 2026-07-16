export const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const WS_BASE_URL: string =
    import.meta.env.VITE_WS_BASE_URL ?? API_BASE_URL;

export const SESSION_POLL_INTERVAL_MS = 2500;
