import type { SessionItem } from '../../api';
import { MessageSquareIcon, CalendarIcon, ExternalLinkIcon, Trash2Icon } from '@/components/icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '../ui/empty';
import { Spinner } from '../ui/spinner';

interface SessionListProps {
  sessions: SessionItem[];
  loading: boolean;
  selectedId: string | null;
  actionBusy: string | null;
  onSelect: (id: string) => void;
  onOpenInChat: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SessionList({
  sessions,
  loading,
  selectedId,
  actionBusy,
  onSelect,
  onOpenInChat,
  onDelete,
}: SessionListProps) {
  return (
    <div className="space-y-3 lg:col-span-5">
      <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
        Daftar Sesi
      </h2>
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : sessions.length === 0 ? (
        <Empty className="border-dashed p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareIcon className="size-4" />
            </EmptyMedia>
            <EmptyTitle>Belum Ada Sesi</EmptyTitle>
            <EmptyDescription>
              Belum ada riwayat sesi obrolan yang tercatat di backend.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => {
            const isSelected = selectedId === s.id;
            return (
              <Card
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`cursor-pointer transition-all hover:bg-muted/40 ${
                  isSelected ? 'border-primary ring-1 ring-primary' : ''
                }`}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="font-mono text-xs font-semibold break-all">
                      {s.nama || s.id}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {s.agent_type || 'general'}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">ID: {s.id}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between p-4 pt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="size-3" />
                    {new Date(s.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      title="Buka di Chat"
                      onClick={() => onOpenInChat(s.id)}
                    >
                      <ExternalLinkIcon className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:bg-destructive/10"
                      title="Hapus Sesi"
                      disabled={actionBusy === s.id}
                      onClick={() => onDelete(s.id)}
                    >
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
