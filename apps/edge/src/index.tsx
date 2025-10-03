import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { secureHeaders } from 'hono/secure-headers';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import type { Env } from './env';
import { i18n } from './middlewares/i18n';
import { quiz } from './routes/apis/quiz';
import { Home } from './routes/pages/home';
import { resolveCurrentUser } from './application/session/current-user';
import { Document } from './views/layouts/document';
import { auth } from './routes/apis/auth';

const app = new Hono<{ Bindings: Env; Variables: { lang: 'ja' | 'en' } }>();

app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', prettyJSON());
app.use('*', i18n());

// Avoid noisy errors for favicon requests during local dev
app.get('/favicon.ico', (c) => c.body(null, 204));

// Simple health endpoint for手動確認
app.get('/hello', (c) => c.text('Hello World'));

// SSR renderer
app.use(
  '*',
  jsxRenderer<{ title?: string; description?: string }>((props, c) => {
    const lang = c.get('lang') ?? 'ja';
    return (
      <Document lang={lang} title={props.title} description={props.description}>
        {props.children}
      </Document>
    );
  })
);

// Public top
app.get('/', async (c) => {
  const currentUser = await resolveCurrentUser(c.env, c.req.raw);
  return c.render(<Home currentUser={currentUser} />, {
    title: 'MathQuest | じぶんのペースで楽しく算数練習',
    description:
      '学年別の単元から選んで算数を練習。匿名で始めて、記録を残したくなったら会員登録できる学習アプリです。',
  });
});

// BFF API
app.route('/apis/quiz', quiz);
app.route('/auth', auth);

export default app;
