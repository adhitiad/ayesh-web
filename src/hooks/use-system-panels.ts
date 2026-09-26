import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAnalytics,
  getMetrics,
  getRecentUsage,
  getUserUsage,
  getUsers,
  getLogs,
  clearLogs,
  getPromptTemplates,
  createPromptTemplate,
  deletePromptTemplate,
  getKeywords,
  addKeyword,
  deleteKeyword,
  getFeedbackStats,
  getRecentFeedback,
  type UsageRecentItem,
  type PromptTemplate,
  type FeedbackRecentItem,
  type UserItem,
} from '../api';
import type { LogLine } from '../types';
import type { SystemTab } from './use-system-core';

export type { LogLine };

export function useSystemPanels(activeTab: SystemTab) {
  const [logLevel, setLogLevel] = useState('');
  const [usageUidState, setUsageUid] = useState('');
  const [newTplName, setNewTplName] = useState('');
  const [newTplText, setNewTplText] = useState('');
  const [newKwAgent, setNewKwAgent] = useState('');
  const [newKwWord, setNewKwWord] = useState('');

  const qc = useQueryClient();
  const logsEnabled = activeTab === 'logs';

  const analyticsQ = useQuery({
    queryKey: ['system', 'analytics'],
    queryFn: () => getAnalytics().catch(() => null),
    enabled: logsEnabled,
  });
  const metricsQ = useQuery({
    queryKey: ['system', 'metrics'],
    queryFn: () => getMetrics().catch(() => null),
    enabled: logsEnabled,
  });
  const recentUsageQ = useQuery({
    queryKey: ['system', 'recent-usage'],
    queryFn: () => getRecentUsage(20).catch(() => [] as UsageRecentItem[]),
    enabled: logsEnabled,
  });
  const usageUsersQ = useQuery({
    queryKey: ['system', 'usage-users'],
    queryFn: () => getUsers().catch(() => [] as UserItem[]),
    enabled: logsEnabled,
  });
  const logsQ = useQuery({
    queryKey: ['system', 'logs', logLevel],
    queryFn: async () => {
      try {
        return await getLogs(logLevel || undefined, 50);
      } catch (err) {
        alert(`Gagal memuat log: ${err instanceof Error ? err.message : String(err)}`);
        return [] as LogLine[];
      }
    },
    enabled: logsEnabled,
  });

  const usageUid = usageUidState || usageUsersQ.data?.[0]?.id || '';
  const userUsageQ = useQuery({
    queryKey: ['system', 'user-usage', usageUid],
    queryFn: () => getUserUsage(usageUid, 24).catch(() => null),
    enabled: logsEnabled && !!usageUid,
  });

  const templatesQ = useQuery({
    queryKey: ['system', 'prompt', 'templates'],
    queryFn: () => getPromptTemplates().catch(() => [] as PromptTemplate[]),
    staleTime: Infinity,
    enabled: activeTab === 'prompts',
  });
  const keywordsQ = useQuery({
    queryKey: ['system', 'prompt', 'keywords'],
    queryFn: () => getKeywords().catch(() => null),
    staleTime: Infinity,
    enabled: activeTab === 'prompts',
  });

  const feedbackStatsQ = useQuery({
    queryKey: ['system', 'feedback', 'stats'],
    queryFn: () => getFeedbackStats().catch(() => null),
    enabled: activeTab === 'feedback',
  });
  const recentFeedbackQ = useQuery({
    queryKey: ['system', 'feedback', 'recent'],
    queryFn: () => getRecentFeedback(20).catch(() => [] as FeedbackRecentItem[]),
    enabled: activeTab === 'feedback',
  });

  const clearLogsM = useMutation({
    mutationFn: async () => {
      await clearLogs();
      qc.setQueryData<LogLine[]>(['system', 'logs', logLevel], []);
    },
  });

  const loadLogs = async (level: string) => {
    if (level !== logLevel) {
      setLogLevel(level);
      return;
    }
    await qc.invalidateQueries({ queryKey: ['system', 'logs', level] });
  };

  const handleClearLogs = async () => {
    if (!confirm('Hapus semua log aplikasi? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      await clearLogsM.mutateAsync();
    } catch (err) {
      alert(`Gagal menghapus log: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const busyLogs =
    clearLogsM.isPending ||
    logsQ.isFetching ||
    (logsEnabled &&
      (analyticsQ.isLoading ||
        metricsQ.isLoading ||
        recentUsageQ.isLoading ||
        usageUsersQ.isLoading));

  const createTplM = useMutation({
    mutationFn: async ({ name, text }: { name: string; text: string }) => {
      await createPromptTemplate(name, text);
      await qc.invalidateQueries({ queryKey: ['system', 'prompt'] });
    },
  });
  const deleteTplM = useMutation({
    mutationFn: async (name: string) => {
      await deletePromptTemplate(name);
      await qc.invalidateQueries({ queryKey: ['system', 'prompt'] });
    },
  });
  const addKwM = useMutation({
    mutationFn: async ({ agent, word }: { agent: string; word: string }) => {
      await addKeyword(agent, word);
      await qc.invalidateQueries({ queryKey: ['system', 'prompt'] });
    },
  });
  const deleteKwM = useMutation({
    mutationFn: async ({ agent, word }: { agent: string; word: string }) => {
      await deleteKeyword(agent, word);
      await qc.invalidateQueries({ queryKey: ['system', 'prompt'] });
    },
  });

  const handleCreateTemplate = async (e: FormEvent) => {
    e.preventDefault();
    const name = newTplName.trim();
    const text = newTplText.trim();
    if (!name || !text) return;
    try {
      await createTplM.mutateAsync({ name, text });
      setNewTplName('');
      setNewTplText('');
    } catch (err) {
      alert(`Gagal membuat template: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDeleteTemplate = async (name: string) => {
    if (!confirm(`Hapus template prompt "${name}"?`)) return;
    try {
      await deleteTplM.mutateAsync(name);
    } catch (err) {
      alert(`Gagal menghapus template: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleAddKeyword = async (e: FormEvent) => {
    e.preventDefault();
    const agent = newKwAgent.trim();
    const word = newKwWord.trim();
    if (!agent || !word) return;
    try {
      await addKwM.mutateAsync({ agent, word });
      setNewKwWord('');
    } catch (err) {
      alert(`Gagal menambah keyword: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDeleteKeyword = async (agent: string, word: string) => {
    if (!confirm(`Hapus keyword "${word}" dari agent "${agent}"?`)) return;
    try {
      await deleteKwM.mutateAsync({ agent, word });
    } catch (err) {
      alert(`Gagal menghapus keyword: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const busyPrompt =
    createTplM.isPending || deleteTplM.isPending || addKwM.isPending || deleteKwM.isPending;

  return {
    analytics: analyticsQ.data ?? null,
    metrics: metricsQ.data ?? null,
    recentUsage: recentUsageQ.data ?? [],
    usageUsers: usageUsersQ.data ?? [],
    usageUid,
    setUsageUid,
    userUsage: userUsageQ.data ?? null,
    logs: logsQ.data ?? [],
    logLevel,
    setLogLevel,
    busyLogs,
    loadLogs,
    handleClearLogs,
    templates: templatesQ.data ?? [],
    keywords: keywordsQ.data ?? null,
    promptLoaded: templatesQ.isSuccess && keywordsQ.isSuccess,
    newTplName,
    setNewTplName,
    newTplText,
    setNewTplText,
    newKwAgent,
    setNewKwAgent,
    newKwWord,
    setNewKwWord,
    busyPrompt,
    handleCreateTemplate,
    handleDeleteTemplate,
    handleAddKeyword,
    handleDeleteKeyword,
    feedbackStats: feedbackStatsQ.data ?? null,
    recentFeedback: recentFeedbackQ.data ?? [],
    feedbackLoaded: feedbackStatsQ.isSuccess && recentFeedbackQ.isSuccess,
  };
}
