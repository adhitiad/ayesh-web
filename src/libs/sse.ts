import { fetchEventSource, type EventSourceMessage } from '@microsoft/fetch-event-source';
import type { StreamDoneData, StreamErrorData, StreamStatusData } from '../types/chat';
import { apiBase, headers } from './http';

export interface SseHandlers {
  onStatus?: (data: StreamStatusData) => void;
  onToken?: (token: string) => void;
  onDone?: (data: StreamDoneData) => void;
  onError?: (data: StreamErrorData) => void;
}

export async function ssePost(
  path: string,
  body: unknown,
  handlers: SseHandlers,
  signal?: AbortSignal,
): Promise<void> {
  if (signal?.aborted) {
    throw new DOMException('The user aborted a request.', 'AbortError');
  }
  const ctrl = new AbortController();
  const relayAbort = () => ctrl.abort();
  signal?.addEventListener('abort', relayAbort);
  let finished = false;

  try {
    await fetchEventSource(`${apiBase()}${path}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
      signal: ctrl.signal,
      openWhenHidden: true,
      async onopen(res) {
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      },
      onmessage(msg: EventSourceMessage) {
        if (finished) return;
        let data: unknown;
        try {
          data = JSON.parse(msg.data);
        } catch {
          return;
        }
        if (msg.event === 'status') {
          handlers.onStatus?.(data as StreamStatusData);
        } else if (msg.event === 'token') {
          const token = (data as { token?: unknown }).token;
          if (typeof token === 'string') handlers.onToken?.(token);
        } else if (msg.event === 'done') {
          handlers.onDone?.(data as StreamDoneData);
          finished = true;
          ctrl.abort();
        } else if (msg.event === 'error') {
          handlers.onError?.(data as StreamErrorData);
          finished = true;
          ctrl.abort();
        }
      },
      onerror(err) {
        throw err;
      },
    });
  } finally {
    signal?.removeEventListener('abort', relayAbort);
  }

  if (finished) return;
  if (signal?.aborted) {
    throw new DOMException('The user aborted a request.', 'AbortError');
  }
}
