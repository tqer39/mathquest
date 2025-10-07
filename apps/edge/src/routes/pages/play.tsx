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
    class="relative flex min-h-screen flex-col bg-[var(--mq-surface-strong)] text-[var(--mq-ink)]"
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

        .keypad-button {
          transition:
            transform 0.18s ease,
            background-color 0.18s ease,
            color 0.18s ease,
            opacity 0.18s ease;
        }

        .keypad-button--disabled,
        .keypad-button[aria-disabled='true'] {
          background: rgba(148, 163, 184, 0.25) !important;
          color: rgba(100, 116, 139, 0.7) !important;
          border-color: rgba(148, 163, 184, 0.35) !important;
          box-shadow: none !important;
          transform: none !important;
          pointer-events: none;
          cursor: default;
          opacity: 0.65;
        }

        #countdown-overlay {
          background: radial-gradient(
              circle at 20% 20%,
              rgba(148, 163, 184, 0.25),
              transparent 60%
            ),
            linear-gradient(
              135deg,
              rgba(15, 23, 42, 0.94),
              rgba(10, 14, 26, 0.9)
            );
          backdrop-filter: blur(18px);
          color: #f8fafc;
        }

        #countdown-overlay .countdown-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: clamp(12rem, 32vw, 16rem);
          aspect-ratio: 1;
          border-radius: 9999px;
          background: radial-gradient(
              circle at 50% 25%,
              rgba(241, 245, 249, 0.2),
              rgba(148, 163, 184, 0.05)
            ),
            rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(148, 163, 184, 0.35);
          box-shadow:
            0 22px 55px rgba(15, 23, 42, 0.45),
            inset 0 0 25px rgba(148, 163, 184, 0.12);
          overflow: hidden;
        }

        #countdown-overlay .countdown-card::after {
          content: '';
          position: absolute;
          inset: 12%;
          border-radius: inherit;
          border: 1px solid rgba(148, 163, 184, 0.4);
          filter: blur(0.4px);
          opacity: 0.8;
        }

        #countdown-overlay .countdown-ring {
          position: absolute;
          inset: 4%;
          border-radius: inherit;
          border: 2px solid rgba(59, 130, 246, 0.25);
          animation: countdown-ring-pulse 1.8s ease-in-out infinite;
        }

        @keyframes countdown-ring-pulse {
          0% {
            transform: scale(0.92);
            opacity: 0.75;
          }
          60% {
            transform: scale(1.05);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.08);
            opacity: 0;
          }
        }

        #countdown-overlay .countdown-label {
          font-size: 0.75rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(203, 213, 225, 0.85);
        }

        #countdown-overlay .countdown-number {
          font-size: clamp(3.5rem, 12vw, 5rem);
          font-weight: 800;
          letter-spacing: 0.18em;
          line-height: 1;
          text-shadow: 0 12px 30px rgba(15, 23, 42, 0.65);
        }

        #countdown-overlay .countdown-caption {
          margin-top: 0.65rem;
          font-size: 0.85rem;
          color: rgba(226, 232, 240, 0.8);
        }
      </style>
    `}
    <nav class="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--mq-outline)] bg-[var(--mq-surface)] px-4 py-4 shadow-sm sm:px-8 lg:px-16 xl:px-24">
      <div class="flex flex-col">
        <span class="text-xs font-semibold uppercase tracking-[0.3em] text-[#6c7c90]">
          PLAY MODE
        </span>
        <span id="play-grade-label" class="text-lg font-semibold">
          {gradePresets[0].label}
        </span>
        <span id="play-context-label" class="text-sm text-[#5e718a]"></span>
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
      class="pointer-events-none fixed inset-0 z-20 hidden flex items-center justify-center"
    >
      <div class="countdown-card">
        <div class="countdown-ring" aria-hidden="true"></div>
        <span class="countdown-label">集中モード</span>
        <span id="countdown-number" class="countdown-number">
          3
        </span>
        <span class="countdown-caption">深呼吸して準備完了</span>
      </div>
    </div>

    <main class="grid gap-6 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:px-16 xl:px-24">
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
            class="flex min-h-[48px] items-center justify-center rounded-2xl text-center text-sm font-semibold text-[var(--mq-primary-strong)]"
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
          <div id="working-steps" class="mt-4"></div>
        </div>
      </section>

      <aside class="flex flex-col gap-6 rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] p-6 shadow-lg">
        <div class="rounded-3xl border border-[var(--mq-outline)] bg-white p-6 shadow-sm">
          <p class="text-sm font-semibold text-[#5e718a]">あなたのこたえ</p>
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
                class="keypad-button rounded-2xl bg-[var(--mq-surface-strong)] px-4 py-5 text-2xl font-extrabold text-[var(--mq-ink)] shadow transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)]"
                data-key={digit}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              class="keypad-button rounded-2xl bg-[var(--mq-surface-strong)] px-4 py-5 text-xl font-semibold text-[var(--mq-ink)] shadow transition hover:-translate-y-0.5 hover:bg-[var(--mq-secondary)]"
              data-key="plusminus"
            >
              +/−
            </button>
            <button
              type="button"
              class="keypad-button rounded-2xl bg-[var(--mq-surface-strong)] px-4 py-5 text-2xl font-extrabold text-[var(--mq-ink)] shadow transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)]"
              data-key="0"
            >
              0
            </button>
            <button
              type="button"
              class="keypad-button rounded-2xl bg-[var(--mq-surface-strong)] px-4 py-5 text-2xl font-extrabold text-[var(--mq-ink)] shadow transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)]"
              data-key="."
            >
              .
            </button>
          </div>
          <div class="mt-3">
            <button
              type="button"
              class="keypad-button w-full rounded-2xl bg-[var(--mq-primary)] px-4 py-5 text-2xl font-extrabold text-[var(--mq-ink)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-strong)] hover:text-white"
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
          <div id="result-actions" class="hidden flex flex-col gap-2">
            <button
              id="againBtn"
              type="button"
              class="w-full rounded-2xl bg-[var(--mq-primary)] px-4 py-2 text-sm font-semibold text-[var(--mq-ink)] shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-strong)] hover:text-white"
            >
              もういちど練習する
            </button>
            <button
              id="endResultBtn"
              type="button"
              class="w-full rounded-2xl border border-[var(--mq-outline)] bg-white px-4 py-2 text-sm font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mq-surface-strong)]"
            >
              やめる
            </button>
          </div>
        </div>
      </aside>
    </main>

    {renderPlayClientScript()}
  </div>
);
