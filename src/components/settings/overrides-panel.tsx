import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SlidersHorizontalIcon, Loader2Icon, PlusIcon } from '@/components/icons';
import {
  getSkills,
  listUserSkillOverrides,
  setUserSkillOverride,
  getUserSkillEnabled,
  bulkUpdateSkillOverrides,
  listUserMcpOverrides,
  setUserMcpOverride,
  getUserMcpEnabled,
  bulkUpdateMcpOverrides,
  type UserSkillOverride,
  type UserMcpOverride,
} from '../../api';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '../ui/field';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '../ui/empty';
import { Notice, errMsg, type NoticeState } from './notice';
import { SegmentedToggle } from './segmented-toggle';

interface OverridesPanelProps {
  uid: string;
  userName: string;
  kind: 'skill' | 'mcp';
  onNotice: (n: NoticeState) => void;
}

export function OverridesPanel({ uid, userName, kind, onNotice }: OverridesPanelProps) {
  const qc = useQueryClient();
  const isSkill = kind === 'skill';
  const title = isSkill ? `Override Skill · ${userName}` : `Override MCP · ${userName}`;
  const [busyName, setBusyName] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [hint, setHint] = useState('');

  const overridesQ = useQuery({
    queryKey: ['overrides', uid, kind],
    queryFn: async () => {
      const [ov, names] = await Promise.all([
        isSkill ? listUserSkillOverrides(uid) : listUserMcpOverrides(uid),
        isSkill ? getSkills().catch(() => [] as string[]) : Promise.resolve<string[]>([]),
      ]);
      const map = new Map<string, boolean | null>();
      for (const n of names) map.set(n, null);
      if (isSkill) {
        for (const o of ov as UserSkillOverride[]) map.set(o.skill_name, o.enabled);
      } else {
        for (const o of ov as UserMcpOverride[]) map.set(o.mcp_name, o.enabled);
      }
      return [...map.entries()]
        .map(([name, enabled]) => ({ name, enabled }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
  });
  const rows = overridesQ.data ?? [];
  const loading = overridesQ.isPending || overridesQ.isFetching;
  const loadError = overridesQ.isError ? errMsg(overridesQ.error) : '';
  const load = () => qc.invalidateQueries({ queryKey: ['overrides', uid, kind] });

  const toggle = async (name: string, value: boolean) => {
    setBusyName(name);
    onNotice({ kind: '', text: '' });
    try {
      if (isSkill) await setUserSkillOverride(uid, name, value);
      else await setUserMcpOverride(uid, name, value);
      onNotice({ kind: 'ok', text: `Override "${name}" disetel ${value ? 'aktif' : 'nonaktif'}.` });
      await load();
    } catch (err) {
      onNotice({ kind: 'fail', text: `Gagal menyimpan override: ${errMsg(err)}` });
    } finally {
      setBusyName('');
    }
  };

  const setAll = async (value: boolean) => {
    if (rows.length === 0) return;
    setBulkBusy(true);
    onNotice({ kind: '', text: '' });
    try {
      if (isSkill) {
        await bulkUpdateSkillOverrides(
          uid,
          rows.map((r) => ({ skill_name: r.name, enabled: value })),
        );
      } else {
        await bulkUpdateMcpOverrides(
          uid,
          rows.map((r) => ({ mcp_name: r.name, enabled: value })),
        );
      }
      onNotice({
        kind: 'ok',
        text: `${rows.length} ${isSkill ? 'skill' : 'MCP'} disetel ${value ? 'aktif' : 'nonaktif'}.`,
      });
      await load();
    } catch (err) {
      onNotice({ kind: 'fail', text: `Gagal override massal: ${errMsg(err)}` });
    } finally {
      setBulkBusy(false);
    }
  };

  const add = async () => {
    const name = newName.trim();
    if (!name) {
      onNotice({ kind: 'fail', text: 'Nama wajib diisi.' });
      return;
    }
    setAdding(true);
    try {
      if (isSkill) await setUserSkillOverride(uid, name, true);
      else await setUserMcpOverride(uid, name, true);
      onNotice({ kind: 'ok', text: `Override "${name}" dibuat (aktif).` });
      setNewName('');
      setHint('');
      await load();
    } catch (err) {
      onNotice({ kind: 'fail', text: `Gagal membuat override: ${errMsg(err)}` });
    } finally {
      setAdding(false);
    }
  };

  const checkExisting = async () => {
    const name = newName.trim();
    if (!name) {
      setHint('');
      return;
    }
    try {
      const res = isSkill
        ? await getUserSkillEnabled(uid, name)
        : await getUserMcpEnabled(uid, name);
      setHint(
        `Override sudah ada: ${res.enabled ? 'aktif' : 'nonaktif'}. Menyimpan akan menimpanya.`,
      );
    } catch {
      setHint('Belum ada override tersimpan untuk nama ini. Akan dibuat baru.');
    }
  };

  return (
    <div className="rounded-lg border bg-muted/20">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
          <p className="font-medium">{title}</p>
          <Badge variant="outline" className="opacity-70">
            {rows.length} {isSkill ? 'skill' : 'server'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void setAll(true)}
            disabled={bulkBusy || loading || rows.length === 0}
          >
            Aktifkan semua
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void setAll(false)}
            disabled={bulkBusy || loading || rows.length === 0}
          >
            Nonaktifkan semua
          </Button>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {loadError && (
          <Notice state={{ kind: 'fail', text: `Gagal memuat override: ${loadError}` }} />
        )}

        <p className="text-xs text-muted-foreground">
          {isSkill
            ? 'Skill tanpa baris override mengikuti konfigurasi global. Klik toggle untuk menulis override eksplisit per pengguna.'
            : 'Server MCP tanpa baris override mengikuti konfigurasi global. Daftar nama MCP tidak punya endpoint list, masukkan nama secara manual bila belum muncul.'}
        </p>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Memuat daftar override…
          </div>
        ) : rows.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SlidersHorizontalIcon className="size-4" />
              </EmptyMedia>
              <EmptyTitle>Belum ada {isSkill ? 'skill' : 'MCP'} untuk dioverride</EmptyTitle>
              <EmptyDescription>
                {isSkill
                  ? 'Backend belum mengembalikan daftar skill, dan belum ada override tersimpan. Tambah nama lewat form di bawah bila perlu.'
                  : 'Belum ada override tersimpan. Tambah nama server MCP lewat form di bawah.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.name} className="rounded-lg border bg-background p-3">
                <SegmentedToggle
                  label={r.name}
                  value={r.enabled ?? true}
                  onChange={(v) => void toggle(r.name, v)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {busyName === r.name
                    ? 'Menyimpan override…'
                    : r.enabled === null
                      ? 'Belum ada override, mengikuti global.'
                      : `Override tersimpan: ${r.enabled ? 'aktif' : 'nonaktif'}.`}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`ov-${kind}-name`}>
                {isSkill ? 'Nama skill' : 'Nama server MCP'}
              </FieldLabel>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  id={`ov-${kind}-name`}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => void checkExisting()}
                  placeholder={isSkill ? 'mis. antislop' : 'mis. context7'}
                  className="min-w-0 flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void add()}
                  disabled={adding}
                  className="gap-2"
                >
                  {adding ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <PlusIcon className="size-3.5" />
                  )}
                  {adding ? 'Menyimpan…' : 'Buat Override Aktif'}
                </Button>
              </div>
              <FieldDescription>{hint || 'Nama case-sensitive sesuai backend.'}</FieldDescription>
            </Field>
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}
