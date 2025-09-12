import type { FC } from 'hono/jsx';
import { html } from 'hono/html';

const Layout: FC<{ title?: string; children?: any }> = ({
  title,
  children,
}) => html`
  <!doctype html>
  <html lang="ja">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title ?? '算数クイズ（Edge-SSR）'}</title>
      <style>
        body {
          font-family:
            system-ui,
            -apple-system,
            Segoe UI,
            Roboto,
            Noto Sans JP,
            sans-serif;
          margin: 0;
          background: #f7fafc;
          color: #1f2937;
        }
        .wrap {
          max-width: 720px;
          margin: 0 auto;
          padding: 16px;
        }
        header,
        footer {
          text-align: center;
          padding: 16px;
        }
        .card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          padding: 16px;
        }
        .controls {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          align-items: end;
        }
        select,
        button {
          font-size: 18px;
        }
        select {
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        button {
          cursor: pointer;
          border: 0;
          border-radius: 10px;
          padding: 10px 14px;
          background: #2563eb;
          color: #fff;
        }
        .q {
          font-size: 48px;
          text-align: center;
          font-weight: 700;
          margin: 16px 0;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>算数クイズ（Edge-SSR）</h1>
        <p>無料3回まで → 以降はサインイン</p>
      </header>
      <main class="wrap">${children}</main>
      <footer><small>© ed-games</small></footer>
      <script type="module">
        const api = (p) => p;
        const byId = (id) => document.getElementById(id);
        const start = byId('start');
        const mode = byId('mode');
        const range = byId('range');
        const qEl = byId('q');
        const aEl = byId('a');
        async function next() {
          const res = await fetch('/apis/quiz/questions/next', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              mode: mode.value,
              max: Number(range.value),
            }),
          });
          const { question } = await res.json();
          qEl.textContent =
            '' + question.a + ' ' + question.op + ' ' + question.b + ' = ?';
          qEl.dataset.a = question.a;
          qEl.dataset.b = question.b;
          qEl.dataset.op = question.op;
        }
        start.addEventListener('click', () => next());
        byId('check').addEventListener('click', async () => {
          const a = Number(qEl.dataset.a),
            b = Number(qEl.dataset.b),
            op = qEl.dataset.op,
            v = Number(aEl.value || '');
          if (Number.isNaN(v)) return alert('数字を入れてね');
          const res = await fetch('/apis/quiz/answers/check', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ a, b, op, value: v }),
          });
          const data = await res.json();
          alert(
            data.ok
              ? 'せいかい！'
              : 'ちがうよ… せいかいは ' + data.correctAnswer
          );
          await next();
        });
        next();
      </script>
    </body>
  </html>
`;

export const Home: FC = () => (
  <Layout title="算数クイズ（Edge-SSR）">
    <section class="card">
      <div class="controls">
        <div>
          <label for="mode">出題</label>
          <select id="mode">
            <option value="add">たし算</option>
            <option value="sub">ひき算</option>
            <option value="mul">かけ算</option>
            <option value="mix" selected>
              ミックス
            </option>
          </select>
        </div>
        <div>
          <label for="range">数の大きさ</label>
          <select id="range">
            <option value="10">0〜10</option>
            <option value="20" selected>
              0〜20
            </option>
            <option value="100">0〜100</option>
          </select>
        </div>
        <div style="align-self:center">
          <button id="start">スタート/次の問題</button>
        </div>
      </div>
      <div class="q" id="q">
        1 + 1 = ?
      </div>
      <div style="display:flex;gap:8px;justify-content:center;align-items:center">
        <input
          id="a"
          type="text"
          inputmode="numeric"
          style="font-size:20px;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;width:160px;text-align:center"
        />
        <button id="check">こたえる</button>
      </div>
    </section>
  </Layout>
);
