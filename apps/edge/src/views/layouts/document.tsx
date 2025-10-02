import { html } from 'hono/html';
import type { FC, JSX } from 'hono/jsx';

export type DocumentProps = {
  lang: 'ja' | 'en';
  title?: string;
  description?: string;
  children?: JSX.Element | JSX.Element[];
};

export const Document: FC<DocumentProps> = ({
  lang,
  title = 'MathQuest',
  description = '毎日の算数練習をもっと楽しく。MathQuest で学年別の問題にチャレンジしよう。',
  children,
}) => {
  const year = new Date().getFullYear();
  return html`
    <!doctype html>
    <html lang=${lang} class="scroll-smooth">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
        <meta name="description" content=${description} />
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%2378c2c3'/%3E%3Ctext x='50%25' y='54%25' text-anchor='middle' fill='%231f2a4a' font-family='Zen Kaku Gothic New, sans-serif' font-size='28' font-weight='700'%3EMQ%3C/text%3E%3C/svg%3E"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossorigin
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          :root {
            color-scheme: light;
            --mq-bg: #f4f7fb;
            --mq-ink: #1f2a4a;
            --mq-surface: rgba(255, 255, 255, 0.85);
            --mq-surface-strong: #ffffff;
            --mq-primary: #78c2c3;
            --mq-primary-strong: #4fa2b1;
            --mq-primary-soft: #d8eef1;
            --mq-secondary: #f6d6c5;
            --mq-accent: #b4d7ee;
            --mq-outline: rgba(120, 194, 195, 0.45);
          }
          body {
            font-family:
              'Zen Kaku Gothic New',
              system-ui,
              -apple-system,
              Segoe UI,
              Roboto,
              'Noto Sans JP',
              sans-serif;
            min-height: 100vh;
          }
          #top-nav {
            position: sticky;
            top: 1.5rem;
            z-index: 40;
            transition: all 0.25s ease;
          }
          #app-root[data-sticky='on'] #top-nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            margin: 0 auto;
            border-radius: 0;
            padding-block: 0.75rem;
            padding-inline: min(6vw, 3.5rem);
            background: var(--mq-surface-strong);
            box-shadow: 0 10px 24px rgba(31, 42, 74, 0.15);
            border-bottom: 1px solid var(--mq-outline);
          }
          #app-root[data-sticky='on'] {
            padding-top: 128px;
          }
          #app-root[data-focus-mode='on'] {
            padding-top: 32px;
          }
          #app-root[data-focus-mode='on'] #top-nav {
            display: none;
          }
          #feedback[data-variant='success'] {
            background: rgba(22, 163, 74, 0.12);
            color: #166534;
          }
          #feedback[data-variant='error'] {
            background: rgba(239, 68, 68, 0.15);
            color: #b91c1c;
          }
        </style>
      </head>
      <body class="bg-[var(--mq-bg)] text-[var(--mq-ink)]">
        ${children}
        <footer class="mt-16 border-t border-[var(--mq-outline)] bg-white/80">
          <div
            class="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-[#5e718a] sm:flex-row sm:items-center sm:justify-between"
          >
            <a
              href="https://github.com/takeruooyama/mathquest"
              class="inline-flex items-center gap-2 font-semibold text-[var(--mq-primary-strong)] transition hover:-translate-y-0.5 hover:text-[var(--mq-ink)]"
              target="_blank"
              rel="noreferrer"
            >
              GitHub Repository
            </a>
            <span>© ${year} MathQuest</span>
          </div>
        </footer>
      </body>
    </html>
  `;
};
