import { useEffect, useRef, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { chatStreamTokens, type Settings } from '../api';

export const Route = createFileRoute('/')({
  component: ChatPage,
});

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setBusy(true);
    setMessages((prev) => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    abortRef.current = new AbortController();
    try {
      await chatStreamTokens(
        text,
        {
          onToken: (token) => {
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = { ...next[next.length - 1], content: next[next.length - 1].content + token };
              return next;
            });
          },
          onDone: () => {},
          onError: (data) => {
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                ...next[next.length - 1],
                content: `⚠️ ${String(data.error ?? 'stream error')}`,
              };
              return next;
            });
          },
        },
        undefined,
        abortRef.current.signal
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
    <div className="chat">
      <div className="messages">
        {messages.length === 0 && <div className="empty">Mulai percakapan dengan Ayesh…</div>}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className="bubble">{m.content || (busy && i === messages.length - 1 ? '…' : '')}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="composer">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) void send();
          }}
          placeholder="Ketik pesan…"
          disabled={busy}
        />
        <button onClick={() => void send()} disabled={busy || !input.trim()}>
          {busy ? '…' : 'Kirim'}
        </button>
      </div>
    </div>
  );
}
