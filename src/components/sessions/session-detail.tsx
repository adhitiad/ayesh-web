import type { Dispatch, SetStateAction } from 'react';
import type { MemoryMessage, SessionChatHistory, SessionItem } from '../../api';
import { cn } from 'cn';
import {
  MessageSquareIcon,
  PencilIcon,
  SaveIcon,
  EraserIcon,
  ExternalLinkIcon,
  Loader2Icon,
  BrainIcon,
} from '@/components/icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '../ui/empty';
import { Spinner } from '../ui/spinner';
import { Separator } from '../ui/separator';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '../ui/field';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface SessionDetailViewProps {
  selectedId: string | null;
  loadingDetail: boolean;
  detail: SessionItem | null;
  chatDetail: SessionChatHistory | null;
  detailView: 'chat' | 'memory';
  setDetailView: Dispatch<SetStateAction<'chat' | 'memory'>>;
  editing: boolean;
  setEditing: Dispatch<SetStateAction<boolean>>;
  startEdit: () => void;
  editNama: string;
  setEditNama: (v: string) => void;
  editContext: string;
  setEditContext: (v: string) => void;
  savingEdit: boolean;
  handleSaveEdit: () => void;
  handleLoadMemory: (id: string) => void;
  handleClearMemory: (id: string) => void;
  actionBusy: string | null;
  openInChat: (id: string) => void;
  memory: MemoryMessage[];
  loadingMemory: boolean;
}

export function SessionDetailView(props: SessionDetailViewProps) {
  const {
    selectedId,
    loadingDetail,
    detail,
    chatDetail,
    detailView,
    setDetailView,
    editing,
    setEditing,
    startEdit,
    editNama,
    setEditNama,
    editContext,
    setEditContext,
    savingEdit,
    handleSaveEdit,
    handleLoadMemory,
    handleClearMemory,
    actionBusy,
    openInChat,
    memory,
    loadingMemory,
  } = props;

  return (
    <div className="space-y-3 lg:col-span-7">
      <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
        {detailView === 'memory' ? 'Memori Tersimpan Sesi' : 'Riwayat Pesan Sesi'}
      </h2>

      {!selectedId ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          <MessageSquareIcon className="mb-2 size-8 text-muted-foreground/60" />
          <p className="text-sm">Pilih salah satu sesi di sebelah kiri untuk melihat percakapan.</p>
        </div>
      ) : loadingDetail ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border p-8">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : chatDetail ? (
        <Card className="flex flex-col">
          <CardHeader className="border-b p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-base break-all">
                  {detail?.nama || chatDetail.nama || chatDetail.session_id}
                </CardTitle>
                <CardDescription className="text-xs">
                  Agen:{' '}
                  <span className="font-semibold text-foreground">{chatDetail.agent_type}</span> ·{' '}
                  {chatDetail.messages.length} pesan
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="flex h-8 overflow-hidden rounded-lg border"
                  role="group"
                  aria-label="Tampilan detail sesi"
                >
                  <button
                    type="button"
                    onClick={() => setDetailView('chat')}
                    className={cn(
                      'px-3 text-xs font-medium transition-colors',
                      detailView === 'chat'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted',
                    )}
                  >
                    Riwayat
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadMemory(chatDetail.session_id)}
                    className={cn(
                      'px-3 text-xs font-medium transition-colors',
                      detailView === 'memory'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted',
                    )}
                  >
                    Memori
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (editing ? setEditing(false) : startEdit())}
                  className="gap-1.5 text-xs"
                >
                  <PencilIcon className="size-3.5" />
                  {editing ? 'Batal Ubah' : 'Ubah Info'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearMemory(chatDetail.session_id)}
                  disabled={actionBusy === chatDetail.session_id}
                  className="gap-1.5 text-xs"
                >
                  <EraserIcon className="size-3.5" />
                  Kosongkan Memori
                </Button>
                <Button
                  size="sm"
                  onClick={() => openInChat(chatDetail.session_id)}
                  className="gap-1.5 text-xs"
                >
                  <ExternalLinkIcon className="size-3.5" />
                  Lanjutkan Obrolan
                </Button>
              </div>
            </div>
          </CardHeader>

          {editing && (
            <div className="space-y-3 border-b bg-muted/30 p-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="sesi-nama">Nama sesi</FieldLabel>
                  <Input
                    id="sesi-nama"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    placeholder="Nama sesi"
                  />
                  <FieldDescription>
                    Nama yang tampil di daftar sesi. Kosongkan untuk memakai ID sesi.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="sesi-context">Konteks sesi</FieldLabel>
                  <Textarea
                    id="sesi-context"
                    rows={3}
                    value={editContext}
                    onChange={(e) => setEditContext(e.target.value)}
                    placeholder="Konteks tambahan yang dibaca agent selama sesi berjalan"
                  />
                  <FieldDescription>
                    Konteks ini ikut disertakan pada percakapan berikutnya dalam sesi ini.
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleSaveEdit()}
                  disabled={savingEdit}
                  className="gap-2"
                >
                  {savingEdit ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <SaveIcon className="size-3.5" />
                  )}
                  {savingEdit ? 'Menyimpan…' : 'Simpan Info Sesi'}
                </Button>
              </div>
            </div>
          )}

          <CardContent className="max-h-[550px] space-y-4 overflow-y-auto p-4">
            {detailView === 'memory' ? (
              loadingMemory ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2Icon className="size-4 animate-spin" />
                  Memuat memori sesi…
                </div>
              ) : memory.length === 0 ? (
                <Empty className="py-6">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BrainIcon className="size-4" />
                    </EmptyMedia>
                    <EmptyTitle>Memori sesi kosong</EmptyTitle>
                    <EmptyDescription>
                      Belum ada catatan memori untuk sesi ini. Memori terisi saat percakapan
                      berjalan.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                memory.map((m, idx) => (
                  <div
                    key={`${m.timestamp}-${idx}`}
                    className="flex flex-col gap-1 rounded-lg border border-border bg-muted/40 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold uppercase tracking-wider">{m.role}</span>
                      <span>
                        {m.timestamp
                          ? new Date(m.timestamp).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                    <Separator className="my-1" />
                    <p className="whitespace-pre-wrap leading-relaxed break-words">{m.content}</p>
                  </div>
                ))
              )
            ) : chatDetail.messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada riwayat pesan dalam sesi ini.
              </p>
            ) : (
              chatDetail.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-1 rounded-lg p-3 text-sm ${
                    m.role === 'user'
                      ? 'border border-primary/20 bg-primary/10 ml-6 text-foreground'
                      : 'border border-border bg-muted/40 mr-6 text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold uppercase tracking-wider">
                      {m.role === 'user' ? 'Pengguna' : 'Asisten AI'}
                    </span>
                    <span>
                      {m.timestamp
                        ? new Date(m.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>
                  <Separator className="my-1" />
                  <p className="whitespace-pre-wrap leading-relaxed break-words">{m.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
