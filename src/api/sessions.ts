import { request } from '../libs/http';
import {
  type MemoryResponse,
  type PendingApproval,
  type SessionChatHistory,
  type SessionItem,
  memoryResponseSchema,
  pendingApprovalListSchema,
  sessionChatHistorySchema,
  sessionItemSchema,
  sessionListSchema,
  statusIdSchema,
  statusSchema,
} from '../types';

export function getSessions(
  offset = 0,
  limit = 50,
): Promise<{ sessions: SessionItem[]; total?: number }> {
  return request(sessionListSchema, { url: '/sessions', params: { offset, limit } });
}

export function getSessionDetail(sessionId: string): Promise<SessionItem> {
  return request(sessionItemSchema, { url: `/sessions/${encodeURIComponent(sessionId)}` });
}

export function getSessionChat(
  sessionId: string,
  offset = 0,
  limit = 50,
): Promise<SessionChatHistory> {
  return request(sessionChatHistorySchema, {
    url: `/sessions/${encodeURIComponent(sessionId)}/chat`,
    params: { offset, limit },
  });
}

export function updateSession(
  sessionId: string,
  nama?: string,
  context?: string,
): Promise<{ status: string }> {
  return request(statusSchema, {
    url: `/sessions/${encodeURIComponent(sessionId)}`,
    method: 'PUT',
    params: { nama, context },
  });
}

export function clearSessionMemory(sessionId: string): Promise<{ status: string }> {
  return request(statusSchema, {
    url: `/memory/${encodeURIComponent(sessionId)}`,
    method: 'DELETE',
  });
}

export function deleteSession(sessionId: string): Promise<{ status: string }> {
  return request(statusSchema, {
    url: `/sessions/${encodeURIComponent(sessionId)}`,
    method: 'DELETE',
  });
}

export function getPendingApprovals(): Promise<PendingApproval[]> {
  return request(pendingApprovalListSchema, { url: '/approvals/pending' });
}

export function approveRequest(aid: string): Promise<{ status: string; id: string }> {
  return request(statusIdSchema, {
    url: `/approvals/${encodeURIComponent(aid)}/approve`,
    method: 'POST',
  });
}

export function denyRequest(aid: string): Promise<{ status: string; id: string }> {
  return request(statusIdSchema, {
    url: `/approvals/${encodeURIComponent(aid)}/deny`,
    method: 'POST',
  });
}

export function getMemory(sessionId: string, offset = 0, limit = 50): Promise<MemoryResponse> {
  return request(memoryResponseSchema, {
    url: `/memory/${encodeURIComponent(sessionId)}`,
    params: { offset, limit },
  });
}
