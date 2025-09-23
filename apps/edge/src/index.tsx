import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { secureHeaders } from 'hono/secure-headers';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import type { Env } from './env';
import { i18n } from './middlewares/i18n';
import { quiz } from './routes/apis/quiz';
import { Home } from './routes/pages/home';
import { Document } from './views/layouts/document';

const app = new Hono<{ Bindings: Env; Variables: { lang: 'ja' | 'en' } }>();

app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', prettyJSON());
app.use('*', i18n());

// SSR renderer
app.get(
  '*',
  jsxRenderer((props, c) => {
    const lang = c.get('lang') ?? 'ja';
    return (
      <Document lang={lang} title={props.title} description={props.description}>
        {props.children}
      </Document>
    );
  })
);

// Public top
app.get('/', (c) =>
  c.render(<Home />, {
    title: 'MathQuest | じぶんのペースで楽しく算数練習',
    description:
      '学年別の単元から選んで算数を練習。匿名で始めて、記録を残したくなったら会員登録できる学習アプリです。',
  })
);

// Dummy signin page for redirect target
app.get('/auth/signin', (c) => c.text('サインイン（ダミー）'));

// BFF API
app.route('/apis/quiz', quiz);

export default app;
