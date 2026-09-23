export interface Settings {
  baseUrl: string;
  apiKey: string;
}

const DEFAULTS: Settings = { baseUrl: '', apiKey: '' };

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem('ayesh.settings');
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem('ayesh.settings', JSON.stringify(s));
}

function headers(): Record<string, string> {
  const { baseUrl, apiKey } = getSettings();
  void baseUrl;
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) h['X-API-Key'] = apiKey;
  return h;
}

export function apiBase(): string {
  const { baseUrl } = getSettings();
  return (baseUrl || '').replace(/\/+$/, '');
}

export interface StreamHandlers {
  onStatus?: (data: Record<string, unknown>) => void;
  onToken: (token: string) => void;
  onDone: (data: Record<string, unknown>) => void;
  onError: (data: Record<string, unknown>) => void;
}

export async function healthCheck(): Promise<Record<string, unknown>> {
  const res = await fetch(`${apiBase()}/health`, { headers: headers() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function chatUnary(message: string, sessionId?: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${apiBase()}/chat`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

export async function chatStreamTokens(
  message: string,
  handlers: StreamHandlers,
  sessionId?: string,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${apiBase()}/chat/stream/tokens`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ message, session_id: sessionId }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const dispatch = (raw: string) => {
    let event = 'message';
    const dataLines: string[] = [];
    for (const line of raw.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
      else if (line.startsWith(':')) return; // comment/ping
    }
    if (dataLines.length === 0) return;
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(dataLines.join('\n'));
    } catch {
      return;
    }
    if (event === 'status') handlers.onStatus?.(data);
    else if (event === 'token' && typeof data.token === 'string') handlers.onToken(data.token);
    else if (event === 'done') handlers.onDone(data);
    else if (event === 'error') handlers.onError(data);
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      dispatch(buffer.slice(0, idx));
      buffer = buffer.slice(idx + 2);
    }
  }
}
