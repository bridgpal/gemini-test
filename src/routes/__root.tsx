/// <reference types="vite/client" />
import * as React from 'react'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import appCss from '~/styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <header style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--color-cream)', 
          borderBottom: '4px solid var(--color-sage)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '800px',
          margin: '0 auto 2rem auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-dark-green)' }}>
               📷 VintageRestorer
             </span>
          </Link>
          <Link to="/about" style={{ color: 'var(--color-dark-green)', textDecoration: 'none', fontWeight: 500 }}>
            How it works
          </Link>
        </header>

        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
