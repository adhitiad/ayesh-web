import { useState } from 'react';
import { ChatPage } from './pages/Chat';
import { SettingsPage } from './pages/Settings';

type Page = 'chat' | 'settings';

export function App() {
  const [page, setPage] = useState<Page>('chat');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Ayesh</h1>
        <nav>
          <button className={page === 'chat' ? 'active' : ''} onClick={() => setPage('chat')}>
            Chat
          </button>
          <button className={page === 'settings' ? 'active' : ''} onClick={() => setPage('settings')}>
            Settings
          </button>
        </nav>
      </header>
      <main>{page === 'chat' ? <ChatPage /> : <SettingsPage />}</main>
    </div>
  );
}
