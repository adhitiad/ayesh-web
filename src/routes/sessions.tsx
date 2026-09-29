import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCwIcon, AlertCircleIcon, CheckCircle2Icon } from '@/components/icons';
import {
  getSessions,
  getSessionDetail,
  getSessionChat,
  updateSession,
  clearSessionMemory,
  deleteSession,
  getMemory,
} from '../api';
import { setCurrentSessionId } from '../stores/chat';
import { AuthGuard } from '../components/auth/auth-guard';
import { Button } from '../components/ui/button';
import { SessionList } from '../components/sessions/session-list';
import { SessionDetailView } from '../components/sessions/session-detail';

export const Route = createFileRoute('/sessions')({
  component: () => (
    <AuthGuard>
      <SessionsPage />
    </AuthGuard>
  ),
});

function SessionsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailView, setDetailView] = useState<'chat' | 'memory'>('chat');
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editNama, setEditNama] = useState('');
  const [editContext, setEditContext] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  const onSavedNotice = (text: string) => {
    setSavedNotice(text);
    window.setTimeout(() => setSavedNotice(''), 4000);
  };

  const sessionsQ = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => (await getSessions()).sessions ?? [],
  });
  const detailQ = useQuery({
    queryKey: ['session', selectedId, 'detail'],
    queryFn: async () => {
      if (!selectedId) throw new Error('tidak ada sesi terpilih');
      return getSessionDetail(selectedId);
    },
    enabled: !!selectedId,
  });
  const chatQ = useQuery({
    queryKey: ['session', selectedId, 'chat'],
    queryFn: async () => {
      if (!selectedId) throw new Error('tidak ada sesi terpilih');
      return getSessionChat(selectedId);
    },
    enabled: !!selectedId,
  });
  const memoryQ = useQuery({
    queryKey: ['session-memory', selectedId],
    queryFn: async () => {
      if (!selectedId) return [];
      try {
        const res = await getMemory(selectedId);
        return res.messages ?? [];
      } catch (err) {
        alert(`Gagal memuat memori sesi: ${err instanceof Error ? err.message : String(err)}`);
        return [];
      }
    },
    enabled: detailView === 'memory' && !!selectedId,
  });

  const sessions = sessionsQ.data ?? [];
  const detail = selectedId ? (detailQ.data ?? null) : null;
  const chatDetail = selectedId ? (chatQ.data ?? null) : null;
  const memory = memoryQ.data ?? [];
  const loading = sessionsQ.isPending || sessionsQ.isFetching;
  const loadingDetail =
    detailQ.isPending || detailQ.isFetching || chatQ.isPending || chatQ.isFetching;
  const loadingMemory = memoryQ.isPending || memoryQ.isFetching;
  const error = sessionsQ.isError
    ? sessionsQ.error.message
    : detailQ.isError
      ? detailQ.error.message
      : chatQ.isError
        ? chatQ.error.message
        : '';

  const refreshSessions = () => qc.invalidateQueries({ queryKey: ['sessions'] });

  const loadChatDetail = (id: string) => {
    setSelectedId(id);
    setDetailView('chat');
    setEditing(false);
  };

  const startEdit = () => {
    setEditNama(detail?.nama || chatDetail?.nama || '');
    setEditContext(detail?.context ?? chatDetail?.context ?? '');
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedId) return;
    setSavingEdit(true);
    try {
      await updateSession(selectedId, editNama.trim(), editContext);
      await qc.invalidateQueries({ queryKey: ['session', selectedId] });
      setDetailView('chat');
      setEditing(false);
      void qc.invalidateQueries({ queryKey: ['sessions'] });
      onSavedNotice('Info sesi berhasil diperbarui.');
    } catch (err) {
      alert(`Gagal menyimpan info sesi: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleLoadMemory = (id: string) => {
    setDetailView('memory');
    setEditing(false);
    void qc.invalidateQueries({ queryKey: ['session-memory', id] });
  };

  const openInChat = (id: string) => {
    setCurrentSessionId(id);
    void navigate({ to: '/' });
  };

  const handleClearMemory = async (id: string) => {
    if (!confirm(`Hapus seluruh memori pesan untuk sesi "${id}"?`)) return;
    setActionBusy(id);
    try {
      await clearSessionMemory(id);
      if (selectedId === id) {
        if (detailView === 'memory') {
          await qc.invalidateQueries({ queryKey: ['session-memory', id] });
        }
        setDetailView('chat');
        setEditing(false);
        await qc.invalidateQueries({ queryKey: ['session', id] });
      }
      void qc.invalidateQueries({ queryKey: ['sessions'] });
    } catch (err) {
      alert(`Gagal: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionBusy(null);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm(`Hapus permanen sesi "${id}"?`)) return;
    setActionBusy(id);
    try {
      await deleteSession(id);
      if (selectedId === id) setSelectedId(null);
      void qc.invalidateQueries({ queryKey: ['sessions'] });
    } catch (err) {
      alert(`Gagal menghapus sesi: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Manajemen Sesi Obrolan</h1>
          <p className="text-sm text-muted-foreground">
            Daftar sesi obrolan yang tersimpan di database backend ayesh-core.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refreshSessions()}
          disabled={loading}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCwIcon className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          Segarkan
        </Button>
      </div>

      {savedNotice && (
        <div
          className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2Icon className="size-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircleIcon className="size-4 shrink-0" />
          <span>
            Error memuat data sesi: {error} (Pastikan API Key sudah dikonfigurasi di Pengaturan)
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <SessionList
          sessions={sessions}
          loading={loading}
          selectedId={selectedId}
          actionBusy={actionBusy}
          onSelect={loadChatDetail}
          onOpenInChat={openInChat}
          onDelete={(id) => void handleDeleteSession(id)}
        />
        <SessionDetailView
          selectedId={selectedId}
          loadingDetail={loadingDetail}
          detail={detail}
          chatDetail={chatDetail}
          detailView={detailView}
          setDetailView={setDetailView}
          editing={editing}
          setEditing={setEditing}
          startEdit={startEdit}
          editNama={editNama}
          setEditNama={setEditNama}
          editContext={editContext}
          setEditContext={setEditContext}
          savingEdit={savingEdit}
          handleSaveEdit={() => void handleSaveEdit()}
          handleLoadMemory={handleLoadMemory}
          handleClearMemory={(id) => void handleClearMemory(id)}
          actionBusy={actionBusy}
          openInChat={openInChat}
          memory={memory}
          loadingMemory={loadingMemory}
        />
      </div>
    </div>
  );
}
