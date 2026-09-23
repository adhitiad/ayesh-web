import type { ReactNode } from 'react';
import { Link, Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import '../styles.css';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Ayesh Web' },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <div className="app">
        <header className="app-header">
          <h1>Ayesh</h1>
          <nav>
            <Link to="/" activeProps={{ className: 'active' }}>
              Chat
            </Link>
            <Link to="/settings" activeProps={{ className: 'active' }}>
              Settings
            </Link>
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
