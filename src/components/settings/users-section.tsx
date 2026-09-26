import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  UserRoundIcon,
  UserPlusIcon,
  RotateCwIcon,
  Trash2Icon,
  CpuIcon,
  Loader2Icon,
  KeyRoundIcon,
  CopyIcon,
  CheckIcon,
  XIcon,
} from '@/components/icons';
import { cn } from 'cn';
import { getUsers, createUser, rotateUserKey, deleteUser, type UserItem } from '../../api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Field, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '../ui/empty';
import { Notice, errMsg, type NoticeState } from './notice';
import { RoleBadge, ActiveBadge, RolePicker } from './user-badges';
import { LlmConfigsPanel } from './llm-configs-panel';
import { OverridesPanel } from './overrides-panel';

export function UsersSection() {
  const qc = useQueryClient();
  const [notice, setNotice] = useState<NoticeState>({ kind: '', text: '' });
  const [keyReveal, setKeyReveal] = useState<UserItem | null>(null);
  const [busyId, setBusyId] = useState('');
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createRole, setCreateRole] = useState<UserItem['role']>('user');
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const usersQ = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });
  const users = usersQ.data ?? [];
  const loading = usersQ.isPending;
  const displayNotice: NoticeState = usersQ.isError
    ? { kind: 'fail', text: `Gagal memuat daftar pengguna: ${errMsg(usersQ.error)}` }
    : notice;

  const copy = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice({ kind: 'fail', text: 'Gagal menyalin API key ke clipboard.' });
    }
  };

  const create = async () => {
    const name = createName.trim();
    if (!name) {
      setNotice({ kind: 'fail', text: 'Nama pengguna wajib diisi.' });
      return;
    }
    setCreating(true);
    setNotice({ kind: '', text: '' });
    try {
      const user = await createUser(name, createRole);
      setKeyReveal(user);
      setCreateName('');
      setCreateRole('user');
      void qc.invalidateQueries({ queryKey: ['users'] });
    } catch (err) {
      setNotice({ kind: 'fail', text: `Gagal membuat pengguna: ${errMsg(err)}` });
    } finally {
      setCreating(false);
    }
  };

  const rotate = async (u: UserItem) => {
    if (
      !window.confirm(
        `Rotasi API key untuk "${u.name}"? Key lama tetap valid selama masa tenggang.`,
      )
    )
      return;
    setBusyId(u.id);
    setNotice({ kind: '', text: '' });
    try {
      const res = await rotateUserKey(u.id);
      setKeyReveal({ ...u, api_key: res.api_key, prefix: res.api_key.slice(0, 11) });
      setNotice({ kind: 'ok', text: `API key "${u.name}" berhasil dirotasi.` });
      void qc.invalidateQueries({ queryKey: ['users'] });
    } catch (err) {
      setNotice({ kind: 'fail', text: `Gagal rotasi key: ${errMsg(err)}` });
    } finally {
      setBusyId('');
    }
  };

  const deactivate = async (u: UserItem) => {
    if (
      !window.confirm(
        `Nonaktifkan pengguna "${u.name}"? Konfigurasi LLM dan override ikut dihapus.`,
      )
    )
      return;
    setBusyId(u.id);
    setNotice({ kind: '', text: '' });
    try {
      await deleteUser(u.id);
      setNotice({ kind: 'ok', text: `Pengguna "${u.name}" dinonaktifkan.` });
      if (selectedUid === u.id) setSelectedUid(null);
      void qc.invalidateQueries({ queryKey: ['users'] });
    } catch (err) {
      setNotice({ kind: 'fail', text: `Gagal menonaktifkan: ${errMsg(err)}` });
    } finally {
      setBusyId('');
    }
  };

  const effectiveUid =
    selectedUid && users.some((u) => u.id === selectedUid) ? selectedUid : (users[0]?.id ?? null);
  const selected = effectiveUid ? (users.find((u) => u.id === effectiveUid) ?? null) : null;

  return (
    <Card className="w-full shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserRoundIcon className="size-5 text-muted-foreground" />
          <CardTitle>Manajemen Pengguna &amp; Konfigurasi LLM</CardTitle>
        </div>
        <CardDescription>
          Buat pengguna, rotasi API key, dan atur konfigurasi model LLM per pengguna (default,
          publik, dan rantai fallback).
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Notice state={displayNotice} />

        {keyReveal && keyReveal.api_key && (
          <div className="space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                <KeyRoundIcon className="mt-0.5 size-4 shrink-0" />
                <p>
                  API key untuk <strong>{keyReveal.name}</strong> hanya ditampilkan sekali. Simpan
                  sekarang.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Tutup"
                onClick={() => setKeyReveal(null)}
              >
                <XIcon className="size-4" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 break-all rounded-md bg-background/60 px-3 py-2 text-sm">
                {keyReveal.api_key}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void copy(keyReveal.api_key ?? '')}
                className="gap-2"
              >
                {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
                {copied ? 'Disalin' : 'Salin'}
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="min-w-0 flex-1">
              <Field>
                <FieldLabel htmlFor="new-user-name">Nama pengguna baru</FieldLabel>
                <Input
                  id="new-user-name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="mis. budi@perusahaan"
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="new-user-role">Role</FieldLabel>
              <RolePicker value={createRole} onChange={setCreateRole} />
            </Field>
            <Button
              type="button"
              onClick={() => void create()}
              disabled={creating}
              className="gap-2"
            >
              {creating ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <UserPlusIcon className="size-4" />
              )}
              {creating ? 'Membuat…' : 'Buat Pengguna'}
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            API key baru ditampilkan satu kali setelah pembuatan. Role <code>owner</code> hanya bisa
            dibuat via Bootstrap Owner atau API Admin.
          </p>
        </div>

        <Separator />

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Memuat daftar pengguna…
          </div>
        ) : users.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserRoundIcon className="size-4" />
              </EmptyMedia>
              <EmptyTitle>Belum ada pengguna</EmptyTitle>
              <EmptyDescription>
                Buat pengguna pertama lewat form di atas, atau gunakan Bootstrap Owner bila belum
                ada sama sekali.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-2">
            {users.map((u) => {
              const isSelected = u.id === effectiveUid;
              return (
                <div
                  key={u.id}
                  className={cn(
                    'flex flex-col gap-3 rounded-lg border p-3.5 transition-colors md:flex-row md:items-center',
                    isSelected ? 'border-primary/40 bg-primary/5' : 'border-border bg-background',
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <UserRoundIcon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{u.name}</p>
                        <RoleBadge role={u.role} />
                        <ActiveBadge active={u.active} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {u.prefix ? `prefix ${u.prefix}` : `ID ${u.id}`}
                        {u.old_key_valid_until
                          ? ` · key lama valid s.d. ${new Date(u.old_key_valid_until).toLocaleString()}`
                          : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUid(u.id)}
                      disabled={!u.active}
                      className={cn('gap-2', isSelected && 'border-primary/50 text-primary')}
                    >
                      <CpuIcon className="size-3.5" />
                      Kelola LLM
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void rotate(u)}
                      disabled={busyId === u.id || !u.active}
                      className="gap-2"
                    >
                      {busyId === u.id ? (
                        <Loader2Icon className="size-3.5 animate-spin" />
                      ) : (
                        <RotateCwIcon className="size-3.5" />
                      )}
                      Rotasi Key
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void deactivate(u)}
                      disabled={busyId === u.id}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2Icon className="size-3.5" />
                      Nonaktifkan
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selected && (
          <LlmConfigsPanel
            key={selected.id}
            uid={selected.id}
            userName={selected.name}
            onNotice={setNotice}
          />
        )}

        {selected && (
          <OverridesPanel
            key={`ov-${selected.id}`}
            uid={selected.id}
            userName={selected.name}
            kind="skill"
            onNotice={setNotice}
          />
        )}

        {selected && (
          <OverridesPanel
            key={`ovm-${selected.id}`}
            uid={selected.id}
            userName={selected.name}
            kind="mcp"
            onNotice={setNotice}
          />
        )}
      </CardContent>
    </Card>
  );
}
