import { request } from '../libs/http';
import {
  type AsyncTask,
  type MarketplaceTool,
  type PlanDetail,
  type PlanListResponse,
  type ScheduledJob,
  asyncTaskSchema,
  jobListSchema,
  jobRequestSchema,
  jobToggleSchema,
  marketplaceInstallSchema,
  marketplaceListSchema,
  marketplaceUninstallSchema,
  planDetailSchema,
  planListResponseSchema,
  planStatusRequestSchema,
  planStatusUpdateSchema,
  scheduledJobSchema,
  statusIdSchema,
  statusSchema,
  taskListSchema,
  taskRequestSchema,
  taskSubmitSchema,
} from '../types';

export function getJobs(offset = 0, limit = 50): Promise<{ jobs: ScheduledJob[] }> {
  return request(jobListSchema, { url: '/jobs', params: { offset, limit } });
}

export function createJob(data: {
  name: string;
  prompt: string;
  interval_detik?: number;
  daily_at?: string;
}): Promise<ScheduledJob> {
  return request(scheduledJobSchema, {
    url: '/jobs',
    method: 'POST',
    data: jobRequestSchema.parse(data),
  });
}

export function toggleJob(
  jobId: string,
  enabled: boolean,
): Promise<{ status: string; enabled: boolean }> {
  return request(jobToggleSchema, {
    url: `/jobs/${encodeURIComponent(jobId)}`,
    method: 'PATCH',
    params: { enabled },
  });
}

export function runJobOnce(jobId: string): Promise<{ status: string; id: string }> {
  return request(statusIdSchema, { url: `/jobs/${encodeURIComponent(jobId)}/run`, method: 'POST' });
}

export function deleteJob(jobId: string): Promise<{ status: string }> {
  return request(statusSchema, { url: `/jobs/${encodeURIComponent(jobId)}`, method: 'DELETE' });
}

export function submitTask(
  message: string,
  sessionId?: string,
): Promise<{ status: string; task_id: string }> {
  return request(taskSubmitSchema, {
    url: '/tasks',
    method: 'POST',
    data: taskRequestSchema.parse({ message, session_id: sessionId }),
  });
}

export function getTasks(offset = 0, limit = 20): Promise<{ tasks: AsyncTask[] }> {
  return request(taskListSchema, { url: '/tasks', params: { offset, limit } });
}

export function getTask(taskId: string): Promise<AsyncTask> {
  return request(asyncTaskSchema, { url: `/tasks/${encodeURIComponent(taskId)}` });
}

export async function getMarketplace(): Promise<MarketplaceTool[]> {
  const data = await request(marketplaceListSchema, { url: '/marketplace' });
  return data.tools ?? [];
}

export function installMarketplaceTool(name: string): Promise<{
  name: string;
  version: string;
  tools: string[];
  agents: string[];
  installed: boolean;
}> {
  return request(marketplaceInstallSchema, {
    url: `/marketplace/${encodeURIComponent(name)}/install`,
    method: 'POST',
  });
}

export function uninstallMarketplaceTool(name: string): Promise<{
  name: string;
  uninstalled: boolean;
  tools: string[];
}> {
  return request(marketplaceUninstallSchema, {
    url: `/marketplace/${encodeURIComponent(name)}`,
    method: 'DELETE',
  });
}

export function getPlans(status?: string, limit?: number): Promise<PlanListResponse> {
  return request(planListResponseSchema, {
    url: '/plans',
    params: { status: status || undefined, limit },
  });
}

export function getPlan(planId: string): Promise<PlanDetail> {
  return request(planDetailSchema, { url: `/plans/${encodeURIComponent(planId)}` });
}

export function updatePlanStatus(
  planId: string,
  status: 'aktif' | 'selesai' | 'batal',
): Promise<{ ok: boolean; id: string; status: string }> {
  return request(planStatusUpdateSchema, {
    url: `/plans/${encodeURIComponent(planId)}`,
    method: 'PATCH',
    data: planStatusRequestSchema.parse({ status }),
  });
}
