import type { FC } from 'hono/jsx';

export type LoginPageProps = {
  status?: 'idle' | 'sent' | 'error';
  message?: string;
  email?: string;
  redirect?: string;
};

export const Login: FC<LoginPageProps> = ({
  status = 'idle',
  message,
  email,
  redirect,
}) => (
  <div class="flex min-h-screen w-full flex-col items-center justify-center bg-[var(--mq-surface)] px-4 py-12">
    <div class="w-full max-w-md space-y-6 rounded-3xl border border-[var(--mq-outline)] bg-white p-8 text-[var(--mq-ink)] shadow-xl">
      <header class="space-y-2 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-[#6c7c90]">
          MathQuest
        </p>
        <h1 class="text-2xl font-bold">メールリンクでログイン</h1>
        <p class="text-sm text-[#5e718a]">
          会員登録済みのメールアドレス宛にログインリンクを送信します。リンクは60分間有効です。
        </p>
      </header>

      {message ? (
        <div
          class={
            status === 'error'
              ? 'rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'
              : 'rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600'
          }
        >
          {message}
        </div>
      ) : null}

      <form
        method="post"
        action={
          redirect
            ? `/auth/login/email?redirect=${encodeURIComponent(redirect)}`
            : '/auth/login/email'
        }
        class="space-y-4"
      >
        <label class="block space-y-2">
          <span class="text-sm font-semibold text-[var(--mq-ink)]">
            メールアドレス
          </span>
          <input
            type="email"
            name="email"
            required
            value={email ?? ''}
            class="w-full rounded-2xl border border-[var(--mq-outline)] px-4 py-3 text-sm text-[var(--mq-ink)] shadow-sm focus:border-[var(--mq-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--mq-primary-soft)]"
            placeholder="example@mathquest.jp"
          />
        </label>
        <button
          type="submit"
          class="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--mq-primary)] px-4 py-3 text-sm font-semibold text-[var(--mq-ink)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-strong)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary-strong)]"
        >
          ログインリンクを送信する
        </button>
      </form>

      <p class="text-center text-xs text-[#5e718a]">
        学習記録はログインするとクラウドに同期されます。
        <br />
        <a
          class="text-[var(--mq-primary)] hover:text-[var(--mq-primary-strong)]"
          href="/"
        >
          ホームに戻る
        </a>
      </p>
    </div>
  </div>
);
