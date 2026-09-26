import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  MessageCircleIcon,
  BotIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  SquareIcon,
  SendIcon,
  PlusIcon,
  CopyIcon,
  CheckIcon,
} from '@/components/icons';
import { chatStreamTokens, submitFeedback } from '../api';
import { logger } from '../libs/logger';
import {
  getCurrentSessionId,
  loadSession,
  rehydrateChat,
  saveSession,
  startNewSession,
  type Msg,
} from '../stores/chat';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { Message, MessageContent } from '@/components/ui/message';
import { Bubble, BubbleContent, BubbleGroup } from '@/components/ui/bubble';
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from '@/components/ui/message-scroller';

export const Route = createFileRoute('/')({
  component: ChatPage,
});

function isErrorMsg(m: Msg): boolean {
  return m.role === 'assistant' && m.content.startsWith('⚠️');
}

function errorText(content: string): string {
  return content.replace(/^⚠️\s*/, '').trimStart();
}

function ChatPage() {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string>('general');
  const [ratedMessages, setRatedMessages] = useState<Record<number, number>>({});
  const [copiedSession, setCopiedSession] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    rehydrateChat();
    const id = sessionId || getCurrentSessionId();
    if (!sessionId) setSessionId(id);
    setMessages(loadSession(id) ?? []);
    setHydrated(true);
  }, [sessionId]);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => saveSession(sessionId, messages), 300);
    return () => clearTimeout(t);
  }, [messages, sessionId, hydrated]);

  const newSession = () => {
    if (busy) return;
    saveSession(sessionId, messages);
    setMessages([]);
    setSessionId(startNewSession());
    setActiveAgent('general');
  };

  const copySessionId = () => {
    void navigator.clipboard.writeText(sessionId);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2000);
  };

  const stopStream = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setBusy(false);
    }
  };

  const feedbackM = useMutation({
    mutationFn: submitFeedback,
    onError: (e) => {
      logger.warn({ err: e }, 'gagal mengirim feedback');
    },
  });

  const handleRating = (index: number, rating: number) => {
    setRatedMessages((prev) => ({ ...prev, [index]: rating }));
    feedbackM.mutate({
      session_id: sessionId,
      agent_type: activeAgent,
      rating,
      comment: rating === 5 ? 'Jawaban bagus' : 'Jawaban perlu perbaikan',
    });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setBusy(true);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: '' },
    ]);
    abortRef.current = new AbortController();
    try {
      await chatStreamTokens(
        text,
        {
          onStatus: (data) => {
            if (data.agent) setActiveAgent(data.agent);
          },
          onToken: (token) => {
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                ...next[next.length - 1],
                content: next[next.length - 1].content + token,
              };
              return next;
            });
          },
          onDone: () => {},
          onError: (data) => {
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                ...next[next.length - 1],
                content: `⚠️ ${String(data.detail ?? data.error ?? 'Terjadi kesalahan internal.')}`,
              };
              return next;
            });
          },
        },
        sessionId,
        abortRef.current.signal,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], content: `⚠️ ${msg}` };
        return next;
      });
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4" style={{ height: 'calc(100vh - 72px)' }}>
      {/* Session Toolbar */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 font-mono text-[11px]">
            <BotIcon className="size-3 text-primary" />
            <span className="capitalize">{activeAgent}</span>
          </Badge>
          <span className="hidden sm:inline">Sesi:</span>
          <button
            type="button"
            onClick={copySessionId}
            className="flex items-center gap-1 rounded bg-muted/50 px-2 py-0.5 font-mono text-[11px] text-foreground hover:bg-muted"
            title="Klik untuk menyalin Session ID"
          >
            {sessionId.slice(0, 14)}…
            {copiedSession ? (
              <CheckIcon className="size-3 text-emerald-500" />
            ) : (
              <CopyIcon className="size-3" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/sessions" className="hover:text-foreground hover:underline">
            Riwayat Sesi
          </Link>
          <span>·</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={newSession}
            disabled={busy}
            className="h-7 gap-1 px-2 text-xs"
          >
            <PlusIcon className="size-3.5" />
            Sesi Baru
          </Button>
        </div>
      </div>

      {/* Message Scroller Area */}
      <MessageScrollerProvider>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-3 px-1 py-2">
              {messages.length === 0 && (
                <Empty className="flex-1 border-none py-16">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MessageCircleIcon className="size-8" />
                    </EmptyMedia>
                    <EmptyTitle>Mulai percakapan dengan Ayesh</EmptyTitle>
                    <EmptyDescription>
                      Tanyakan riset, tugas coding, rencana aksi, atau orkestrasi sub-agen AI
                      multi-role.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              {messages.map((m, i) => (
                <MessageScrollerItem key={i} scrollAnchor={i === messages.length - 1}>
                  <Message align={m.role === 'user' ? 'end' : 'start'}>
                    <MessageContent>
                      <BubbleGroup>
                        {isErrorMsg(m) ? (
                          <div
                            role="alert"
                            className="flex w-full items-start gap-2 rounded-[10px] border border-[#7a2e3a] bg-[#3a1d22] px-3 py-2 text-sm leading-relaxed text-[#ffb4be]"
                          >
                            <span aria-hidden="true" className="shrink-0">
                              ⚠️
                            </span>
                            <span className="min-w-0 flex-1 whitespace-pre-wrap">
                              {errorText(m.content) || 'Terjadi kesalahan internal.'}
                            </span>
                          </div>
                        ) : (
                          <Bubble
                            variant={m.role === 'user' ? 'default' : 'muted'}
                            align={m.role === 'user' ? 'end' : 'start'}
                          >
                            <BubbleContent className="whitespace-pre-wrap leading-relaxed">
                              {m.content ||
                                (busy && i === messages.length - 1 ? (
                                  <span className="inline-flex items-center gap-2">
                                    <Spinner className="size-3.5" />
                                    <span className="text-xs text-muted-foreground">
                                      Memproses jawaban…
                                    </span>
                                  </span>
                                ) : (
                                  ''
                                ))}
                            </BubbleContent>
                          </Bubble>
                        )}

                        {m.role === 'assistant' && m.content && !busy && !isErrorMsg(m) && (
                          <div className="flex items-center gap-1 pl-1 pt-1 text-muted-foreground">
                            <button
                              type="button"
                              onClick={() => void handleRating(i, 5)}
                              className={`rounded p-1 hover:bg-muted/80 ${
                                ratedMessages[i] === 5
                                  ? 'text-emerald-500'
                                  : 'text-muted-foreground'
                              }`}
                              title="Bagus / Puas"
                            >
                              <ThumbsUpIcon className="size-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleRating(i, 1)}
                              className={`rounded p-1 hover:bg-muted/80 ${
                                ratedMessages[i] === 1
                                  ? 'text-destructive'
                                  : 'text-muted-foreground'
                              }`}
                              title="Kurang Memuaskan"
                            >
                              <ThumbsDownIcon className="size-3" />
                            </button>
                          </div>
                        )}
                      </BubbleGroup>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton direction="end" />
        </MessageScroller>
      </MessageScrollerProvider>

      {/* Input Composer */}
      <div className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Ketik instruksi atau pertanyaan (Enter untuk mengirim, Shift+Enter untuk baris baru)…"
          disabled={busy}
          className="min-h-11 max-h-40 resize-none text-sm"
          rows={1}
        />
        <div className="flex gap-1.5 shrink-0">
          {busy ? (
            <Button onClick={stopStream} variant="destructive" size="lg" className="gap-1.5">
              <SquareIcon className="size-3.5 fill-current" />
              <span>Hentikan</span>
            </Button>
          ) : (
            <Button
              onClick={() => void send()}
              disabled={!input.trim()}
              size="lg"
              className="gap-1.5"
            >
              <SendIcon className="size-3.5" />
              <span>Kirim</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
