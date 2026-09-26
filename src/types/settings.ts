import { z } from 'zod';

export const settingsSchema = z.object({
  baseUrl: z.string(),
  apiKey: z.string(),
});

export const settingsDefaults: Settings = { baseUrl: '', apiKey: '' };

export type Settings = z.infer<typeof settingsSchema>;
