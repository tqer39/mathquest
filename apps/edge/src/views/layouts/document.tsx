import { html } from 'hono/html';
import type { FC } from 'hono/jsx';

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
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.4/dist/tailwind.min.css"
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
      />
      <style>
        :root {
          color-scheme: light;
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
    <body class="bg-sky-50 text-slate-900">
      ${children}
    </body>
  </html>
`;
