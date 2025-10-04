import type { FC } from 'hono/jsx';
import { html } from 'hono/html';
import type { CurrentUser } from '../../application/session/current-user';
import { renderPlayClientScript } from './play.client';
import { gradePresets } from './grade-presets';

export const Play: FC<{ currentUser: CurrentUser | null }> = ({
  currentUser,
}) => (
  <div
    id="play-root"
    class="relative flex min-h-screen flex-col gap-6 bg-[var(--mq-surface-strong)] px-4 py-8 sm:px-8 lg:px-16 xl:px-24 text-[var(--mq-ink)]"
    data-user-state={currentUser ? 'known' : 'anonymous'}
  >
    {html`
      <style>
        .setting-toggle--on,
        .setting-toggle[data-state='on'] {
          background: var(--mq-primary-soft) !important;
          border-color: var(--mq-primary) !important;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
          transform: translateY(-1px);
        }
        .setting-toggle--on span:first-child,
        .setting-toggle[data-state='on'] span:first-child {
          color: var(--mq-primary-strong) !important;
        }
      </style>
    `}
    <nav class="flex items-center justify-between rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] px-6 py-4 shadow-sm">
      <div class="flex flex-col">
        <span class="text-xs font-semibold uppercase tracking-[0.3em] text-[#6c7c90]">
          PLAY MODE
        </span>
        <span id="play-grade-label" class="text-lg font-semibold">
          {gradePresets[0].label}
        </span>
        <span id="play-theme-label" class="text-sm text-[#5e718a]"></span>
      </div>
      <button
        id="endBtn"
        type="button"
        class="inline-flex items-center gap-2 rounded-2xl border border-[var(--mq-outline)] bg-white px-4 py-2 text-sm font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary)]"
      >
        やめる
      </button>
    </nav>

    <div
      id="countdown-overlay"
      class="pointer-events-none fixed inset-0 z-20 hidden items-center justify-center bg-[rgba(15,23,42,0.85)] text-white"
    >
      <span
        id="countdown-number"
        class="text-7xl font-extrabold tracking-[0.4em]"
      >
        3
      </span>
    </div>

    <main class="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section class="flex flex-col gap-6 rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] p-6 shadow-lg">
        <div class="flex flex-col gap-2 rounded-2xl bg-[var(--mq-primary-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4 text-sm font-semibold text-[var(--mq-primary-strong)]">
            <span>
              Q <span id="qIndex">0</span>/<span id="qTotal">0</span>
            </span>
            <span>
              正解 <span id="correct">0</span>
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button
              id="toggle-sound"
              type="button"
              data-state="on"
              class="setting-toggle inline-flex items-center gap-2 rounded-2xl border border-[var(--mq-outline)] bg-white px-3 py-2 text-xs font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)]"
            >
              <span>🔊 効果音</span>
            </button>
            <button
              id="toggle-steps"
              type="button"
              data-state="on"
              class="setting-toggle inline-flex items-center gap-2 rounded-2xl border border-[var(--mq-outline)] bg-white px-3 py-2 text-xs font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)]"
            >
              <span>🧮 途中式</span>
            </button>
          </div>
        </div>

        <div class="space-y-4 rounded-3xl border border-[var(--mq-outline)] bg-white p-6 shadow-sm">
          <p class="text-sm font-semibold text-[#5e718a]">もんだい</p>
          <div
            id="question"
            class="text-center text-5xl font-extrabold tracking-[0.35em]"
          >
            ？ + ？
          </div>
          <div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <label class="sr-only" htmlFor="answer">
              答え
            </label>
            <input
              id="answer"
              type="text"
              inputMode="numeric"
              class="w-full max-w-xs rounded-2xl border border-[var(--mq-outline)] px-4 py-3 text-center text-2xl font-semibold shadow-sm focus:border-[var(--mq-primary)] focus:outline-none"
            />
            <button
              id="submitBtn"
              type="button"
              class="inline-flex items-center justify-center rounded-2xl bg-[var(--mq-primary)] px-5 py-3 text-lg font-semibold text-[var(--mq-ink)] shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-strong)] hover:text-white"
            >
              こたえる
            </button>
          </div>
          <div
            id="feedback"
            class="min-h-[32px] text-center text-sm font-semibold text-[var(--mq-primary-strong)]"
          ></div>
          <div class="flex justify-center">
            <button
              id="skipBtn"
              type="button"
              class="inline-flex items-center gap-2 rounded-2xl border border-[var(--mq-outline)] bg-white px-4 py-2 text-sm font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mq-secondary)]"
            >
              スキップ
            </button>
          </div>
        </div>

        <div
          id="working-container"
          class="rounded-3xl border border-[var(--mq-outline)] bg-white p-6 text-[var(--mq-ink)] shadow-sm"
        >
          <p class="text-sm font-semibold text-[#5e718a]">途中式</p>
          <p
            id="working-empty"
            class="mt-4 rounded-2xl bg-white/60 px-4 py-3 text-center text-xs font-medium text-[#6c7c90]"
          >
            こたえを送信すると、計算の流れがここに出るよ。
          </p>
          <ol
            id="working-steps"
            class="mt-4 space-y-2 text-lg font-semibold"
          ></ol>
        </div>
      </section>

      <aside class="flex flex-col gap-6 rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] p-6 shadow-lg">
        <div class="rounded-3xl border border-[var(--mq-outline)] bg-white p-6 shadow-sm">
          <p class="text-sm font-semibold text-[#5e718a]">こたえ</p>
          <p
            id="answer-display"
            class="mt-2 text-center text-5xl font-extrabold tracking-[0.35em] text-[var(--mq-ink)]"
          >
            ？
          </p>
        </div>
        <div class="rounded-3xl border border-[var(--mq-outline)] bg-white p-6 shadow-sm">
          <p class="text-sm font-semibold text-[#5e718a]">テンキー</p>
          <div class="mt-4 grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                class="rounded-2xl bg-[var(--mq-surface-strong)] px-4 py-5 text-2xl font-extrabold text-[var(--mq-ink)] shadow transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)]"
                data-key={digit}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              class="rounded-2xl bg-[var(--mq-surface-strong)] px-4 py-5 text-xl font-semibold text-[var(--mq-ink)] shadow transition hover:-translate-y-0.5 hover:bg-[var(--mq-secondary)]"
              data-key="back"
            >
              ⌫
            </button>
            <button
              type="button"
              class="rounded-2xl bg-[var(--mq-surface-strong)] px-4 py-5 text-2xl font-extrabold text-[var(--mq-ink)] shadow transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)]"
              data-key="0"
            >
              0
            </button>
            <button
              type="button"
              class="rounded-2xl bg-[var(--mq-primary)] px-4 py-5 text-2xl font-extrabold text-[var(--mq-ink)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-strong)] hover:text-white"
              data-key="submit"
            >
              =
            </button>
          </div>
        </div>

        <div class="space-y-3 rounded-3xl border border-[var(--mq-outline)] bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-[var(--mq-ink)]">結果</h2>
          <p class="text-sm text-[#4f6076]">
            正解 <span id="result-correct">0</span> /{' '}
            <span id="result-total">0</span>
          </p>
          <button
            id="againBtn"
            type="button"
            class="hidden w-full rounded-2xl bg-[var(--mq-primary)] px-4 py-2 text-sm font-semibold text-[var(--mq-ink)] shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-strong)] hover:text-white"
          >
            もういちど練習する
          </button>
        </div>
      </aside>
    </main>

    {renderPlayClientScript()}
  </div>
);
