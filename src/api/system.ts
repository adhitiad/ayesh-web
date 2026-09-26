import { z } from 'zod';
import { request } from '../libs/http';
import {
  type AuditLogItem,
  type HealthStatus,
  type KeywordList,
  type LogLine,
  type PromptTemplate,
  type UsageRecentItem,
  type UsageSummary,
  type UserUsageSummary,
  auditLogListSchema,
  healthStatusSchema,
  keywordAddResultSchema,
  keywordDeleteResultSchema,
  keywordListSchema,
  logLineListSchema,
  metricsSchema,
  promptTemplateListSchema,
  promptTemplateResultSchema,
  recentUsageSchema,
  statusSchema,
  usageSummarySchema,
  userUsageSummarySchema,
} from '../types';

export function healthCheck(): Promise<HealthStatus> {
  return request(healthStatusSchema, { url: '/health' });
}

export function getMetrics(): Promise<Record<string, unknown>> {
  return request(metricsSchema, { url: '/metrics' });
}

export function getAnalytics(): Promise<Record<string, unknown>> {
  return request(metricsSchema, { url: '/analytics' });
}

export function getUsageSummary(hours = 24): Promise<UsageSummary> {
  return request(usageSummarySchema, { url: '/usage/summary', params: { hours } });
}

export function getRecentUsage(limit = 20): Promise<UsageRecentItem[]> {
  return request(recentUsageSchema, { url: '/usage/recent', params: { limit } });
}

export function getUserUsage(uid: string, hours = 24): Promise<UserUsageSummary> {
  return request(userUsageSummarySchema, {
    url: `/usage/user/${encodeURIComponent(uid)}`,
    params: { hours },
  });
}

export function getPromptTemplates(): Promise<PromptTemplate[]> {
  return request(promptTemplateListSchema, { url: '/templates' });
}

export function createPromptTemplate(
  name: string,
  text: string,
): Promise<{ ok: boolean; name: string }> {
  return request(promptTemplateResultSchema, {
    url: '/templates',
    method: 'POST',
    data: { name, text },
  });
}

export function deletePromptTemplate(name: string): Promise<{ ok: boolean; name: string }> {
  return request(promptTemplateResultSchema, {
    url: `/templates/${encodeURIComponent(name)}`,
    method: 'DELETE',
  });
}

export function getKeywords(): Promise<KeywordList> {
  return request(keywordListSchema, { url: '/keywords' });
}

export function addKeyword(
  agent: string,
  keyword: string,
  allowedTools: string[] = [],
): Promise<{ ok: boolean; agent: string; keyword: string; allowed_tools: string[] }> {
  return request(keywordAddResultSchema, {
    url: '/keywords',
    method: 'POST',
    data: { agent, keyword, allowed_tools: allowedTools },
  });
}

export function deleteKeyword(
  agent: string,
  keyword: string,
): Promise<{ ok: boolean; agent: string; keyword: string }> {
  return request(keywordDeleteResultSchema, {
    url: '/keywords',
    method: 'DELETE',
    params: { agent, keyword },
  });
}

export function getLogs(level?: string, limit = 50): Promise<LogLine[]> {
  return request(logLineListSchema, {
    url: '/logs',
    params: { level: level || undefined, limit },
  });
}

export function clearLogs(): Promise<{ status: string }> {
  return request(statusSchema, { url: '/logs', method: 'DELETE' });
}

export function getAuditLogs(limit = 50): Promise<AuditLogItem[]> {
  return request(auditLogListSchema, { url: '/audit', params: { limit } });
}

export function verifyAuditChain(): Promise<Record<string, unknown>> {
  return request(metricsSchema, { url: '/audit/verify' });
}

export function getMetricsPrometheus(): Promise<string> {
  return request(z.string(), {
    url: '/metrics/prometheus',
    responseType: 'text',
    headers: { Accept: 'text/plain' },
  });
}
