import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CpuIcon, PlusIcon, Loader2Icon } from '@/components/icons';
import {
  listUserLLMConfigs,
  createUserLLMConfig,
  updateUserLLMConfig,
  deleteUserLLMConfig,
  setLLMFallbackChain,
  type UserLLMConfig,
  type UserLLMConfigPayload,
} from '../../api';
import { Button } from '../ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '../ui/empty';
import { Notice, errMsg, type NoticeState } from './notice';
import { LlmConfigCard } from './llm-config-card';
import { LlmFallbackEditor } from './llm-fallback-editor';
import { LlmConfigForm, emptyLlmForm, type LlmFormState } from './llm-config-form';

interface LlmConfigsPanelProps {
  uid: string;
  userName: string;
  onNotice: (n: NoticeState) => void;
}

export function LlmConfigsPanel({ uid, userName, onNotice }: LlmConfigsPanelProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState<LlmFormState>(emptyLlmForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [fallbackId, setFallbackId] = useState<string | null>(null);
  const [fallbackChain, setFallbackChain] = useState<string[]>([]);
  const [savingFallback, setSavingFallback] = useState(false);

  const configsQ = useQuery({
    queryKey: ['llm-configs', uid],
    queryFn: () => listUserLLMConfigs(uid),
  });
  const configs = configsQ.data ?? [];
  const loading = configsQ.isPending || configsQ.isFetching;
  const loadError = configsQ.isError ? errMsg(configsQ.error) : '';
  const load = () => qc.invalidateQueries({ queryKey: ['llm-configs', uid] });

  const openAdd = () => {
    setForm(emptyLlmForm());
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (c: UserLLMConfig) => {
    setForm({
      provider: c.provider,
      model: c.model,
      temperature: c.temperature != null ? String(c.temperature) : '',
      api_key: '',
      is_default: c.is_default,
      is_public: c.is_public,
    });
    setEditingId(c.id);
    setFormOpen(true);
  };

  const cancelForm = () => {
    setForm(emptyLlmForm());
    setEditingId(null);
    setFormOpen(false);
  };

  const save = async () => {
    const provider = form.provider.trim();
    const model = form.model.trim();
    if (!provider || !model) {
      onNotice({ kind: 'fail', text: 'Provider dan model wajib diisi.' });
      return;
    }
    const temperature = form.temperature.trim() === '' ? null : Number(form.temperature);
    if (temperature !== null && (Number.isNaN(temperature) || temperature < 0 || temperature > 2)) {
      onNotice({ kind: 'fail', text: 'Temperature harus berupa angka antara 0 dan 2.' });
      return;
    }
    setSaving(true);
    try {
      const payload: UserLLMConfigPayload = {
        provider,
        model,
        temperature,
        is_default: form.is_default,
        is_public: form.is_public,
      };
      if (form.api_key) payload.api_key = form.api_key;
      if (editingId) {
        await updateUserLLMConfig(uid, editingId, payload);
        onNotice({ kind: 'ok', text: 'Konfigurasi LLM berhasil diperbarui.' });
      } else {
        await createUserLLMConfig(uid, payload);
        onNotice({ kind: 'ok', text: 'Konfigurasi LLM berhasil ditambahkan.' });
      }
      setForm(emptyLlmForm());
      setEditingId(null);
      setFormOpen(false);
      await load();
    } catch (err) {
      onNotice({ kind: 'fail', text: `Gagal menyimpan konfigurasi: ${errMsg(err)}` });
    } finally {
      setSaving(false);
    }
  };

  const del = async (c: UserLLMConfig) => {
    if (!window.confirm(`Hapus konfigurasi ${c.provider}/${c.model}?`)) return;
    setBusyId(c.id);
    try {
      await deleteUserLLMConfig(uid, c.id);
      onNotice({ kind: 'ok', text: `Konfigurasi ${c.provider}/${c.model} dihapus.` });
      if (fallbackId === c.id) setFallbackId(null);
      await load();
    } catch (err) {
      onNotice({ kind: 'fail', text: `Gagal menghapus: ${errMsg(err)}` });
    } finally {
      setBusyId('');
    }
  };

  const setDefault = async (c: UserLLMConfig, value: boolean) => {
    setBusyId(c.id);
    onNotice({ kind: '', text: '' });
    try {
      await updateUserLLMConfig(uid, c.id, {
        provider: c.provider,
        model: c.model,
        temperature: c.temperature,
        is_default: value,
        is_public: c.is_public,
      });
      onNotice({
        kind: 'ok',
        text: value
          ? `"${c.provider}/${c.model}" ditetapkan sebagai default.`
          : 'Default dibatalkan.',
      });
      await load();
    } catch (err) {
      onNotice({ kind: 'fail', text: `Gagal mengubah default: ${errMsg(err)}` });
    } finally {
      setBusyId('');
    }
  };

  const setPublic = async (c: UserLLMConfig, value: boolean) => {
    setBusyId(c.id);
    onNotice({ kind: '', text: '' });
    try {
      await updateUserLLMConfig(uid, c.id, {
        provider: c.provider,
        model: c.model,
        temperature: c.temperature,
        is_default: c.is_default,
        is_public: value,
      });
      onNotice({
        kind: 'ok',
        text: value
          ? `"${c.provider}/${c.model}" kini bisa dipilih publik.`
          : 'Status publik dibatalkan.',
      });
      await load();
    } catch (err) {
      onNotice({ kind: 'fail', text: `Gagal mengubah status publik: ${errMsg(err)}` });
    } finally {
      setBusyId('');
    }
  };

  const openFallback = (c: UserLLMConfig) => {
    setFallbackId(c.id);
    setFallbackChain(c.fallback_config_ids ?? []);
    onNotice({ kind: '', text: '' });
  };

  const cancelFallback = () => {
    setFallbackId(null);
    setFallbackChain([]);
  };

  const fallbackConfig = fallbackId ? (configs.find((c) => c.id === fallbackId) ?? null) : null;

  const saveFallback = async () => {
    if (!fallbackId || !fallbackConfig) return;
    setSavingFallback(true);
    try {
      await setLLMFallbackChain(
        uid,
        fallbackId,
        fallbackChain,
        fallbackConfig.provider,
        fallbackConfig.model,
      );
      onNotice({ kind: 'ok', text: 'Rantai fallback berhasil disimpan.' });
      setFallbackId(null);
      setFallbackChain([]);
      await load();
    } catch (err) {
      onNotice({ kind: 'fail', text: `Gagal menyimpan fallback: ${errMsg(err)}` });
    } finally {
      setSavingFallback(false);
    }
  };

  return (
    <div className="rounded-lg border bg-muted/20">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
        <div className="flex items-center gap-2">
          <CpuIcon className="size-4 text-muted-foreground" />
          <p className="font-medium">Konfigurasi LLM · {userName}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={openAdd} className="gap-2">
          <PlusIcon className="size-3.5" />
          Tambah Konfigurasi
        </Button>
      </div>

      <div className="space-y-3 p-4">
        {loadError && (
          <Notice state={{ kind: 'fail', text: `Gagal memuat konfigurasi LLM: ${loadError}` }} />
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Memuat konfigurasi…
          </div>
        ) : configs.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CpuIcon className="size-4" />
              </EmptyMedia>
              <EmptyTitle>Belum ada konfigurasi LLM</EmptyTitle>
              <EmptyDescription>
                Tambahkan provider dan model untuk pengguna ini. Konfigurasi default menjadi pilihan
                utama routing.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          configs.map((c) => (
            <div key={c.id} className="space-y-2">
              <LlmConfigCard
                config={c}
                busy={busyId === c.id}
                onEdit={() => openEdit(c)}
                onDelete={() => void del(c)}
                onToggleDefault={() => void setDefault(c, !c.is_default)}
                onTogglePublic={() => void setPublic(c, !c.is_public)}
                onFallback={() => openFallback(c)}
              />
              {fallbackId === c.id && fallbackConfig && (
                <LlmFallbackEditor
                  configs={configs}
                  primary={fallbackConfig}
                  chain={fallbackChain}
                  setChain={setFallbackChain}
                  saving={savingFallback}
                  onSave={() => void saveFallback()}
                  onCancel={cancelFallback}
                />
              )}
            </div>
          ))
        )}

        {formOpen && (
          <LlmConfigForm
            editingId={editingId}
            form={form}
            setForm={setForm}
            saving={saving}
            onSave={() => void save()}
            onCancel={cancelForm}
          />
        )}
      </div>
    </div>
  );
}
