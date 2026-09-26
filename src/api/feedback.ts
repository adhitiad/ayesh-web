import { request } from '../libs/http';
import {
  type FeedbackPayload,
  type FeedbackRecentItem,
  type FeedbackStats,
  feedbackPayloadSchema,
  feedbackRecentListSchema,
  feedbackStatsSchema,
  statusSchema,
} from '../types';

export function submitFeedback(payload: FeedbackPayload): Promise<{ status: string }> {
  return request(statusSchema, {
    url: '/feedback',
    method: 'POST',
    data: feedbackPayloadSchema.parse(payload),
  });
}

export function getFeedbackStats(): Promise<FeedbackStats> {
  return request(feedbackStatsSchema, { url: '/feedback/stats' });
}

export function getRecentFeedback(limit = 10): Promise<FeedbackRecentItem[]> {
  return request(feedbackRecentListSchema, { url: '/feedback/recent', params: { limit } });
}
