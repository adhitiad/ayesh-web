import { z } from 'zod';

export const msgSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const chatRequestSchema = z.object({
  message: z.string(),
  session_id: z.string().nullable().optional(),
});

export type StreamStatusData = {
  stage?: string;
  agent?: string;
  session_id?: string;
  request_id?: string;
};

export type StreamDoneData = {
  status?: string;
  request_id?: string;
  [key: string]: unknown;
};

export type StreamErrorData = {
  code?: string;
  detail?: string;
  request_id?: string;
  [key: string]: unknown;
};

export interface StreamHandlers {
  onStatus?: (data: StreamStatusData) => void;
  onToken: (token: string) => void;
  onDone: (data: StreamDoneData) => void;
  onError: (data: StreamErrorData) => void;
}

export type Msg = z.infer<typeof msgSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
