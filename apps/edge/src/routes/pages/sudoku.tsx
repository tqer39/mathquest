import type { FC } from 'hono/jsx';
import { html } from 'hono/html';
import type { CurrentUser } from '../../application/session/current-user';
import { renderSudokuClientScript } from './sudoku.client';

export const Sudoku: FC<{ currentUser: CurrentUser | null }> = ({
  currentUser,
}) => (
  <div
    id="sudoku-root"
    class="relative flex min-h-screen flex-col bg-[var(--mq-surface-strong)] text-[var(--mq-ink)]"
    data-user-state={currentUser ? 'known' : 'anonymous'}
  >
    {html`
      <style>
        .sudoku-cell {
          width: 100%;
          aspect-ratio: 1;
          border: 1px solid var(--mq-outline);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 600;
          background: white;
          transition: background-color 0.2s ease;
        }

        .sudoku-cell:focus {
          outline: 2px solid var(--mq-primary);
          outline-offset: -2px;
          background: var(--mq-primary-soft);
        }

        .sudoku-cell[readonly] {
          background: var(--mq-surface);
          color: var(--mq-ink);
          font-weight: 700;
        }

        .sudoku-cell--error {
          background: rgba(239, 68, 68, 0.1);
          color: rgb(220, 38, 38);
        }

        .sudoku-grid {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 0;
          border: 2px solid var(--mq-ink);
          max-width: 540px;
          margin: 0 auto;
        }

        .sudoku-grid .sudoku-cell:nth-child(3n) {
          border-right: 2px solid var(--mq-ink);
        }

        .sudoku-grid .sudoku-cell:nth-child(n + 19):nth-child(-n + 27),
        .sudoku-grid .sudoku-cell:nth-child(n + 46):nth-child(-n + 54) {
          border-bottom: 2px solid var(--mq-ink);
        }

        .number-pad-button {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 0.75rem;
          border: 1px solid var(--mq-outline);
          background: white;
          font-size: 1.5rem;
          font-weight: 700;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .number-pad-button:hover:not(:disabled) {
          background: var(--mq-primary-soft);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .number-pad-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .number-pad-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      </style>
    `}
    <nav class="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--mq-outline)] bg-[var(--mq-surface)] px-4 py-4 shadow-sm sm:px-8 lg:px-16 xl:px-24">
      <div class="flex flex-col">
        <span class="text-xs font-semibold uppercase tracking-[0.3em] text-[#6c7c90]">
          SUDOKU MODE
        </span>
        <span class="text-lg font-semibold">数独で遊ぼう</span>
      </div>
      <a
        href="/start"
        class="inline-flex items-center gap-2 rounded-2xl border border-[var(--mq-outline)] bg-white px-4 py-2 text-sm font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary)]"
      >
        ← 戻る
      </a>
    </nav>

    <main class="grid gap-6 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:px-16 xl:px-24">
      <section class="flex flex-col gap-6 rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] p-6 shadow-lg">
        <div class="flex items-center justify-between rounded-2xl bg-[var(--mq-primary-soft)] px-4 py-3">
          <div class="text-sm font-semibold text-[var(--mq-primary-strong)]">
            難易度: <span id="difficulty-label">かんたん</span>
          </div>
          <div class="text-sm font-semibold text-[var(--mq-primary-strong)]">
            残り: <span id="remaining-count">0</span>
          </div>
        </div>

        <div class="rounded-3xl border border-[var(--mq-outline)] bg-white p-6 shadow-sm">
          <div id="sudoku-grid" class="sudoku-grid">
            {Array.from({ length: 81 }).map((_, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                class="sudoku-cell"
                data-index={i}
                data-row={Math.floor(i / 9)}
                data-col={i % 9}
              />
            ))}
          </div>
        </div>

        <div
          id="feedback"
          class="flex min-h-[48px] items-center justify-center rounded-2xl text-center text-sm font-semibold"
        ></div>
      </section>

      <aside class="flex flex-col gap-6">
        <div class="rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] p-6 shadow-lg">
          <p class="mb-4 text-sm font-semibold text-[#5e718a]">数字パッド</p>
          <div class="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                class="number-pad-button"
                data-number={num}
              >
                {num}
              </button>
            ))}
          </div>
          <button
            id="clear-button"
            type="button"
            class="mt-3 w-full rounded-2xl border border-[var(--mq-outline)] bg-white px-4 py-3 text-sm font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-red-50"
          >
            消去
          </button>
        </div>

        <div class="space-y-3 rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] p-6 shadow-lg">
          <h2 class="text-lg font-semibold text-[var(--mq-ink)]">操作</h2>
          <div class="flex flex-col gap-2">
            <button
              id="check-button"
              type="button"
              class="w-full rounded-2xl bg-[var(--mq-primary)] px-4 py-2 text-sm font-semibold text-[var(--mq-ink)] shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-strong)] hover:text-white"
            >
              答え合わせ
            </button>
            <button
              id="new-game-button"
              type="button"
              class="w-full rounded-2xl border border-[var(--mq-outline)] bg-white px-4 py-2 text-sm font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mq-surface-strong)]"
            >
              新しいゲーム
            </button>
            <button
              id="hint-button"
              type="button"
              class="w-full rounded-2xl border border-[var(--mq-outline)] bg-white px-4 py-2 text-sm font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mq-secondary)]"
            >
              ヒント
            </button>
          </div>
        </div>
      </aside>
    </main>

    {renderSudokuClientScript()}
  </div>
);
