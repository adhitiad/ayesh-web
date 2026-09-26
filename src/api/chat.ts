import { request } from '../libs/http';
import { ssePost } from '../libs/sse';
import {
  type StreamDoneData,
  type StreamErrorData,
  type StreamHandlers,
  type StreamStatusData,
  chatRequestSchema,
  metricsSchema,
} from '../types';

export function chatStreamTokens(
  message: string,
  handlers: StreamHandlers,
  sessionId?: string,
  signal?: AbortSignal,
): Promise<void> {
  const body = chatRequestSchema.parse({ message, session_id: sessionId });
  return ssePost('/chat/stream/tokens', body, handlers, signal);
}

export function chatStream(
  message: string,
  handlers: {
    onStatus?: (data: StreamStatusData) => void;
    onDone?: (data: StreamDoneData) => void;
    onError?: (data: StreamErrorData) => void;
  },
  sessionId?: string,
  signal?: AbortSignal,
): Promise<void> {
  const body = chatRequestSchema.parse({ message, session_id: sessionId });
  return ssePost('/chat/stream', body, handlers, signal);
}

export function chatNonStreaming(
  message: string,
  sessionId?: string,
): Promise<Record<string, unknown>> {
  const body = chatRequestSchema.parse({ message, session_id: sessionId });
  return request(metricsSchema, { url: '/chat', method: 'POST', data: body });
}
