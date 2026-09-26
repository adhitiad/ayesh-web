import { z } from 'zod';

export const scheduledJobSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  prompt: z.string(),
  interval_detik: z.number().nullable(),
  daily_at: z.string().nullable(),
  enabled: z.boolean(),
  last_run: z.string().nullable(),
  created_at: z.string(),
});

export const jobListSchema = z.looseObject({
  jobs: z.array(scheduledJobSchema),
});

export const jobRequestSchema = z.object({
  name: z.string(),
  prompt: z.string(),
  interval_detik: z.number().int().positive().nullable().optional(),
  daily_at: z.string().nullable().optional(),
});

export const jobToggleSchema = z.looseObject({
  status: z.string(),
  enabled: z.boolean(),
});

export const asyncTaskSchema = z.looseObject({
  id: z.string(),
  message: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  result: z.string().optional(),
  agent_type: z.string().optional(),
  created_at: z.string(),
  finished_at: z.string().optional(),
  session_id: z.string().optional(),
});

export const taskListSchema = z.looseObject({
  tasks: z.array(asyncTaskSchema),
});

export const taskRequestSchema = z.object({
  message: z.string(),
  session_id: z.string().nullable().optional(),
});

export const taskSubmitSchema = z.looseObject({
  status: z.string(),
  task_id: z.string(),
});

export type ScheduledJob = z.infer<typeof scheduledJobSchema>;
export type AsyncTask = z.infer<typeof asyncTaskSchema>;
export type JobRequest = z.infer<typeof jobRequestSchema>;
export type TaskRequest = z.infer<typeof taskRequestSchema>;
