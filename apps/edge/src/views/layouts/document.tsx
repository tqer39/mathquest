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
}) => html`
  <!doctype html>
  <html lang=${lang} class="scroll-smooth">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
      <meta name="description" content=${description} />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
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
      </style>
    </head>
    <body class="bg-[var(--mq-bg)] text-[var(--mq-ink)]">
      ${children}
    </body>
  </html>
`;
