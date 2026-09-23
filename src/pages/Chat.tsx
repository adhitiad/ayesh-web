import { useEffect, useRef, useState } from 'react';
import { chatStreamTokens, getSettings } from '../api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setError('');
    setInput('');
    setBusy(true);
    setMessages((m) => [...m, { role: 'user', content: text }, { role: 'assistant', content: '' }]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let agent = '';

    try {
      await chatStreamTokens(
        text,
        {
          onStatus: (d) => {
            if (typeof d.agent === 'string') agent = d.agent;
          },
          onToken: (token) => {
            setMessages((m) => {
              const next = [...m];
              const last = next[next.length - 1];
              next[next.length - 1] = { ...last, content: last.content + token };
              return next;
            });
          },
          onDone: () => {},
          onError: (d) => {
            setError(String(d.detail ?? 'stream error'));
          },
        },
        undefined,
        ctrl.signal
      );
      if (agent) {
        setMessages((m) => {
          const next = [...m];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, agent };
          return next;
        });
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const stop = () => abortRef.current?.abort();

  void getSettings;

  return (
    <div>
      <div className="chat-messages">
        {messages.length === 0 && <div className="msg assistant">Halo, aku Ayesh. Mulai percakapan.</div>}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.content || (busy && i === messages.length - 1 ? '…' : '')}
            {m.agent && <span className="meta">agent: {m.agent}</span>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input">
        <textarea
          value={input}
          placeholder="Tulis pesan… (Enter kirim, Shift+Enter baris baru)"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={busy}
        />
        {busy ? (
          <button onClick={stop}>Stop</button>
        ) : (
          <button onClick={() => void send()}>Kirim</button>
        )}
      </div>
      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}
