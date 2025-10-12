import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { secureHeaders } from 'hono/secure-headers';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import type { Env } from './env';
import { i18n } from './middlewares/i18n';
import { quiz } from './routes/apis/quiz';
import { Home } from './routes/pages/home';
import { Start } from './routes/pages/start';
import { Play } from './routes/pages/play';
import { Sudoku } from './routes/pages/sudoku';
import { resolveCurrentUser } from './application/session/current-user';
import { Document } from './views/layouts/document';

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
app.get('/', (c) =>
  c.render(<Home currentUser={resolveCurrentUser(c.env, c.req.raw)} />, {
    title: 'MathQuest | じぶんのペースで楽しく算数練習',
    description:
      '学年別の単元から選んで算数を練習。匿名で始めて、記録を残したくなったら会員登録できる学習アプリです。',
  })
);

app.get('/start', (c) =>
  c.render(<Start currentUser={resolveCurrentUser(c.env, c.req.raw)} />, {
    title: 'MathQuest | 設定ウィザード',
    description:
      '学年・単元とプレイ設定をまとめて選択し、集中モードで算数ミッションを始めましょう。',
  })
);

app.get('/play', (c) =>
  c.render(<Play currentUser={resolveCurrentUser(c.env, c.req.raw)} />, {
    title: 'MathQuest | 練習セッション',
    description:
      '選択した学年の問題に挑戦します。カウントダウン後にテンキーで解答し、途中式を確認できます。',
  })
);

app.get('/sudoku', (c) =>
  c.render(<Sudoku currentUser={resolveCurrentUser(c.env, c.req.raw)} />, {
    title: 'MathQuest | 数独',
    description:
      '数独パズルで論理的思考力を鍛えよう。数字を使った楽しいパズルゲームです。',
  })
);

app.get('/auth/guest-login', (c) => {
  const profileParam = c.req.query('profile');
  const profileIndex = Number(profileParam);
  const index =
    Number.isInteger(profileIndex) && profileIndex >= 0 ? profileIndex : 0;
  const maxAge = 60 * 60 * 24 * 30;
  const response = c.redirect('/', 302);
  response.headers.append(
    'Set-Cookie',
    `mq_guest=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`
  );
  response.headers.append(
    'Set-Cookie',
    `mq_guest_profile=${index}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
  );
  return response;
});

app.get('/auth/logout', (c) => {
  const response = c.redirect('/', 302);
  response.headers.append(
    'Set-Cookie',
    'mq_guest=; Path=/; Max-Age=0; SameSite=Lax'
  );
  response.headers.append(
    'Set-Cookie',
    'mq_guest_profile=; Path=/; Max-Age=0; SameSite=Lax'
  );
  return response;
});

// Dummy signin page for non-local redirect target
app.get('/auth/signin', (c) => c.text('サインイン（ダミー）'));

// BFF API
app.route('/apis/quiz', quiz);

export default app;
