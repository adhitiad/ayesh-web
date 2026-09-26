import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  healthCheck,
  getUsageSummary,
  getPendingApprovals,
  approveRequest,
  denyRequest,
  getJobs,
  createJob,
  toggleJob,
  runJobOnce,
  deleteJob,
  getTasks,
  submitTask,
  getAuditLogs,
  verifyAuditChain,
  type PendingApproval,
  type ScheduledJob,
  type AsyncTask,
  type AuditLogItem,
} from '../api';

export type SystemTab = 'overview' | 'jobs' | 'tasks' | 'audit' | 'logs' | 'prompts' | 'feedback';

export function useSystemCore() {
  const [activeTab, setActiveTab] = useState<SystemTab>('overview');
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Form New Job
  const [showJobForm, setShowJobForm] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [newJobPrompt, setNewJobPrompt] = useState('');
  const [newJobInterval, setNewJobInterval] = useState<string>('300');
  const [newJobDailyAt, setNewJobDailyAt] = useState('');
  const [scheduleType, setScheduleType] = useState<'interval' | 'daily'>('interval');

  // Form Submit Task
  const [newTaskMessage, setNewTaskMessage] = useState('');

  // Audit Verification
  const [auditResult, setAuditResult] = useState<Record<string, unknown> | null>(null);

  const qc = useQueryClient();

  const healthQ = useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => healthCheck().catch(() => null),
    retry: false,
  });
  const usageQ = useQuery({
    queryKey: ['system', 'usage'],
    queryFn: () => getUsageSummary(24).catch(() => null),
  });
  const approvalsQ = useQuery({
    queryKey: ['system', 'approvals'],
    queryFn: () => getPendingApprovals().catch(() => [] as PendingApproval[]),
  });
  const jobsQ = useQuery({
    queryKey: ['system', 'jobs'],
    queryFn: () =>
      getJobs().then(
        (d) => d.jobs ?? [],
        () => [] as ScheduledJob[],
      ),
  });
  const tasksQ = useQuery({
    queryKey: ['system', 'tasks'],
    queryFn: () =>
      getTasks().then(
        (d) => d.tasks ?? [],
        () => [] as AsyncTask[],
      ),
  });
  const auditQ = useQuery({
    queryKey: ['system', 'audit'],
    queryFn: () => getAuditLogs(30).catch(() => [] as AuditLogItem[]),
  });

  const health = healthQ.data ?? null;
  const usage = usageQ.data ?? null;
  const approvals = approvalsQ.data ?? [];
  const jobs = jobsQ.data ?? [];
  const tasks = tasksQ.data ?? [];
  const auditLogs = auditQ.data ?? [];
  const error = '';

  const loading =
    healthQ.isPending ||
    usageQ.isPending ||
    approvalsQ.isPending ||
    jobsQ.isPending ||
    tasksQ.isPending ||
    auditQ.isPending ||
    refreshing;

  const loadData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['system', 'health'] }),
        qc.invalidateQueries({ queryKey: ['system', 'usage'] }),
        qc.invalidateQueries({ queryKey: ['system', 'approvals'] }),
        qc.invalidateQueries({ queryKey: ['system', 'jobs'] }),
        qc.invalidateQueries({ queryKey: ['system', 'tasks'] }),
        qc.invalidateQueries({ queryKey: ['system', 'audit'] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const approveM = useMutation({
    mutationFn: async (id: string) => {
      await approveRequest(id);
      qc.setQueryData<PendingApproval[]>(['system', 'approvals'], (prev) =>
        (prev ?? []).filter((a) => a.id !== id),
      );
      void qc.invalidateQueries({ queryKey: ['system', 'approvals'] });
    },
  });

  const denyM = useMutation({
    mutationFn: async (id: string) => {
      await denyRequest(id);
      qc.setQueryData<PendingApproval[]>(['system', 'approvals'], (prev) =>
        (prev ?? []).filter((a) => a.id !== id),
      );
      void qc.invalidateQueries({ queryKey: ['system', 'approvals'] });
    },
  });

  const toggleJobM = useMutation({
    mutationFn: async (job: ScheduledJob) => {
      await toggleJob(job.id, !job.enabled);
      qc.setQueryData<ScheduledJob[]>(['system', 'jobs'], (prev) =>
        (prev ?? []).map((j) => (j.id === job.id ? { ...j, enabled: !job.enabled } : j)),
      );
      void qc.invalidateQueries({ queryKey: ['system', 'jobs'] });
    },
  });

  const runJobM = useMutation({
    mutationFn: (id: string) => runJobOnce(id),
  });

  const deleteJobM = useMutation({
    mutationFn: async (id: string) => {
      await deleteJob(id);
      qc.setQueryData<ScheduledJob[]>(['system', 'jobs'], (prev) =>
        (prev ?? []).filter((j) => j.id !== id),
      );
      void qc.invalidateQueries({ queryKey: ['system', 'jobs'] });
    },
  });

  const createJobM = useMutation({
    mutationFn: async (payload: {
      name: string;
      prompt: string;
      interval_detik?: number;
      daily_at?: string;
    }) => {
      const created = await createJob(payload);
      await qc.invalidateQueries({ queryKey: ['system', 'jobs'] });
      return created;
    },
  });

  const submitTaskM = useMutation({
    mutationFn: async (message: string) => {
      const res = await submitTask(message);
      await qc.invalidateQueries({ queryKey: ['system', 'tasks'] });
      return res;
    },
  });

  const verifyAuditM = useMutation({
    mutationFn: verifyAuditChain,
    onSuccess: (res) => setAuditResult(res),
  });

  const creatingJob = createJobM.isPending;
  const submittingTask = submitTaskM.isPending;
  const verifyingAudit = verifyAuditM.isPending;

  const handleApprove = async (id: string) => {
    setBusyAction(id);
    try {
      await approveM.mutateAsync(id);
    } catch (err) {
      alert(`Gagal menyetujui: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleDeny = async (id: string) => {
    setBusyAction(id);
    try {
      await denyM.mutateAsync(id);
    } catch (err) {
      alert(`Gagal menolak: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleToggleJob = async (job: ScheduledJob) => {
    setBusyAction(job.id);
    try {
      await toggleJobM.mutateAsync(job);
    } catch (err) {
      alert(`Gagal mengubah status job: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleRunJob = async (id: string) => {
    setBusyAction(id);
    try {
      await runJobM.mutateAsync(id);
      alert('Job berhasil dieksekusi sekali di latar belakang.');
    } catch (err) {
      alert(`Gagal mengeksekusi job: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Hapus scheduled job ini?')) return;
    setBusyAction(id);
    try {
      await deleteJobM.mutateAsync(id);
    } catch (err) {
      alert(`Gagal menghapus job: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleCreateJob = async (e: FormEvent) => {
    e.preventDefault();
    if (!newJobName.trim() || !newJobPrompt.trim()) return;
    const payload: { name: string; prompt: string; interval_detik?: number; daily_at?: string } = {
      name: newJobName.trim(),
      prompt: newJobPrompt.trim(),
    };
    if (scheduleType === 'interval') {
      payload.interval_detik = parseInt(newJobInterval, 10) || 300;
    } else {
      payload.daily_at = newJobDailyAt || '08:00';
    }
    try {
      await createJobM.mutateAsync(payload);
      setNewJobName('');
      setNewJobPrompt('');
      setShowJobForm(false);
      alert('Scheduled Job berhasil dibuat!');
    } catch (err) {
      alert(`Gagal membuat job: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleSubmitTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskMessage.trim()) return;
    try {
      const res = await submitTaskM.mutateAsync(newTaskMessage.trim());
      alert(`Tugas asinkron berhasil dikirim! Task ID: ${res.task_id}`);
      setNewTaskMessage('');
    } catch (err) {
      alert(`Gagal mengirim tugas: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleVerifyAudit = async () => {
    try {
      await verifyAuditM.mutateAsync();
    } catch (err) {
      alert(`Gagal memverifikasi audit: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return {
    activeTab,
    setActiveTab,
    health,
    usage,
    approvals,
    jobs,
    tasks,
    auditLogs,
    loading,
    busyAction,
    error,
    loadData,
    showJobForm,
    setShowJobForm,
    newJobName,
    setNewJobName,
    newJobPrompt,
    setNewJobPrompt,
    newJobInterval,
    setNewJobInterval,
    newJobDailyAt,
    setNewJobDailyAt,
    scheduleType,
    setScheduleType,
    creatingJob,
    newTaskMessage,
    setNewTaskMessage,
    submittingTask,
    verifyingAudit,
    auditResult,
    handleApprove,
    handleDeny,
    handleToggleJob,
    handleRunJob,
    handleDeleteJob,
    handleCreateJob,
    handleSubmitTask,
    handleVerifyAudit,
  };
}
