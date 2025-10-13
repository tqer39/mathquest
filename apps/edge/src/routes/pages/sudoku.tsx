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
          border: 1px solid rgba(148, 163, 184, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          font-weight: 600;
          background: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          text-align: center;
        }

        .sudoku-cell:hover:not([readonly]) {
          background: var(--mq-primary-soft);
          border-color: var(--mq-primary);
          transform: scale(1.05);
          z-index: 10;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
        }

        .sudoku-cell:focus {
          outline: none;
          background: var(--mq-primary-soft);
          border-color: var(--mq-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          z-index: 20;
        }

        .sudoku-cell[readonly] {
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          color: var(--mq-ink);
          font-weight: 800;
          cursor: default;
        }

        .sudoku-cell.completed {
          cursor: not-allowed;
          pointer-events: none;
        }

        .sudoku-cell.completed:not(.was-preset) {
          background: linear-gradient(
            135deg,
            rgba(167, 243, 208, 0.3) 0%,
            rgba(134, 239, 172, 0.25) 100%
          );
        }

        .sudoku-cell[readonly].sudoku-cell--complete {
          animation: cellCompleteReadonly 1.2s ease-out;
        }

        .sudoku-cell[readonly].sudoku-cell--duplicate-error {
          background: repeating-linear-gradient(
            45deg,
            #f0cdd1,
            #f0cdd1 10px,
            #e8bcc1 10px,
            #e8bcc1 20px
          ) !important;
          border-color: rgba(239, 68, 68, 0.6) !important;
        }

        @keyframes cellCompleteReadonly {
          0% {
            background: linear-gradient(135deg, #c1e7d4 0%, #a8ddc0 100%);
            box-shadow: inset 0 0 0 3px rgba(134, 239, 172, 0.6);
          }
          30% {
            background: linear-gradient(135deg, #b0e0c7 0%, #9dd9b8 100%);
            box-shadow: inset 0 0 0 5px rgba(134, 239, 172, 0.8);
          }
          60% {
            background: linear-gradient(135deg, #cfe9db 0%, #bce3cd 100%);
            box-shadow: inset 0 0 0 2px rgba(134, 239, 172, 0.4);
          }
          100% {
            background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
            box-shadow: none;
          }
        }

        .sudoku-cell--error {
          background: linear-gradient(
            135deg,
            rgba(254, 202, 202, 0.4) 0%,
            rgba(252, 165, 165, 0.3) 100%
          );
          color: rgb(220, 38, 38);
          animation: shake 0.4s ease-in-out;
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }

        .sudoku-grid {
          display: grid;
          gap: 0;
          border: 3px solid rgba(148, 163, 184, 0.4);
          max-width: 540px;
          margin: 0 auto;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
          background: white;
        }

        .sudoku-grid[data-size='4'] {
          grid-template-columns: repeat(4, 1fr);
        }

        .sudoku-grid[data-size='6'] {
          grid-template-columns: repeat(6, 1fr);
        }

        .sudoku-grid[data-size='9'] {
          grid-template-columns: repeat(9, 1fr);
        }

        /* 4x4グリッド: 2x2ブロック */
        .sudoku-grid[data-size='4']
          .sudoku-cell:nth-child(2n):not(:nth-child(4n)) {
          border-right: 2.5px solid rgba(148, 163, 184, 0.5);
        }

        .sudoku-grid[data-size='4']
          .sudoku-cell:nth-child(n + 5):nth-child(-n + 8) {
          border-bottom: 2.5px solid rgba(148, 163, 184, 0.5);
        }

        /* 6x6グリッド: 2x3ブロック */
        .sudoku-grid[data-size='6']
          .sudoku-cell:nth-child(2n):not(:nth-child(6n)) {
          border-right: 2.5px solid rgba(148, 163, 184, 0.5);
        }

        .sudoku-grid[data-size='6']
          .sudoku-cell:nth-child(n + 7):nth-child(-n + 12),
        .sudoku-grid[data-size='6']
          .sudoku-cell:nth-child(n + 19):nth-child(-n + 24) {
          border-bottom: 2.5px solid rgba(148, 163, 184, 0.5);
        }

        /* 9x9グリッド: 3x3ブロック */
        .sudoku-grid[data-size='9']
          .sudoku-cell:nth-child(3n):not(:nth-child(9n)) {
          border-right: 2.5px solid rgba(148, 163, 184, 0.5);
        }

        .sudoku-grid[data-size='9']
          .sudoku-cell:nth-child(n + 19):nth-child(-n + 27),
        .sudoku-grid[data-size='9']
          .sudoku-cell:nth-child(n + 46):nth-child(-n + 54) {
          border-bottom: 2.5px solid rgba(148, 163, 184, 0.5);
        }

        .number-pad-button {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 1rem;
          border: 2px solid var(--mq-outline);
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          font-size: 1.75rem;
          font-weight: 800;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .number-pad-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at center,
            var(--mq-primary-soft) 0%,
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .number-pad-button:hover:not(:disabled)::before {
          opacity: 1;
        }

        .number-pad-button:hover:not(:disabled) {
          border-color: var(--mq-primary);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15);
        }

        .number-pad-button:active:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
        }

        .number-pad-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .difficulty-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(
            135deg,
            var(--mq-primary-soft) 0%,
            rgba(241, 245, 249, 0.8) 100%
          );
          border-radius: 1rem;
          font-weight: 700;
          color: var(--mq-primary-strong);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        }

        .action-button {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .action-button::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.3) 0%,
            transparent 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .action-button:hover::after {
          opacity: 1;
        }

        @keyframes celebrate {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .feedback--success {
          animation: celebrate 0.5s ease-in-out;
        }

        .sudoku-cell--complete {
          animation: cellComplete 1.2s ease-out;
        }

        @keyframes cellComplete {
          0% {
            background: linear-gradient(
              135deg,
              rgba(167, 243, 208, 0.8) 0%,
              rgba(134, 239, 172, 0.7) 100%
            );
            box-shadow: inset 0 0 0 3px rgba(134, 239, 172, 0.8);
          }
          30% {
            background: linear-gradient(
              135deg,
              rgba(167, 243, 208, 0.9) 0%,
              rgba(134, 239, 172, 0.8) 100%
            );
            box-shadow: inset 0 0 0 5px rgba(134, 239, 172, 1);
          }
          60% {
            background: linear-gradient(
              135deg,
              rgba(167, 243, 208, 0.6) 0%,
              rgba(134, 239, 172, 0.5) 100%
            );
            box-shadow: inset 0 0 0 2px rgba(134, 239, 172, 0.5);
          }
          100% {
            background: white;
            box-shadow: none;
          }
        }

        .sudoku-cell--duplicate-error {
          background: repeating-linear-gradient(
            45deg,
            rgba(254, 202, 202, 0.7),
            rgba(254, 202, 202, 0.7) 10px,
            rgba(252, 165, 165, 0.6) 10px,
            rgba(252, 165, 165, 0.6) 20px
          ) !important;
          border-color: rgba(239, 68, 68, 0.7) !important;
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
        <div id="preset-selector" class="space-y-4">
          <h2 class="text-lg font-semibold text-[var(--mq-ink)]">
            プリセット選択
          </h2>
          <div class="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="preset-button rounded-2xl border-2 border-[var(--mq-outline)] bg-gradient-to-br from-white to-[var(--mq-surface)] p-4 text-left transition hover:-translate-y-1 hover:border-[var(--mq-primary)] hover:shadow-lg"
              data-size="4"
              data-difficulty="easy"
            >
              <div class="flex items-center gap-3">
                <span class="text-3xl">🌱</span>
                <div>
                  <div class="text-base font-bold text-[var(--mq-ink)]">
                    4×4 かんたん
                  </div>
                  <div class="text-xs text-[#5e718a]">初心者向け</div>
                </div>
              </div>
            </button>
            <button
              type="button"
              class="preset-button rounded-2xl border-2 border-[var(--mq-outline)] bg-gradient-to-br from-white to-[var(--mq-surface)] p-4 text-left transition hover:-translate-y-1 hover:border-[var(--mq-primary)] hover:shadow-lg"
              data-size="4"
              data-difficulty="medium"
            >
              <div class="flex items-center gap-3">
                <span class="text-3xl">🌿</span>
                <div>
                  <div class="text-base font-bold text-[var(--mq-ink)]">
                    4×4 ふつう
                  </div>
                  <div class="text-xs text-[#5e718a]">初心者向け</div>
                </div>
              </div>
            </button>
            <button
              type="button"
              class="preset-button rounded-2xl border-2 border-[var(--mq-outline)] bg-gradient-to-br from-white to-[var(--mq-surface)] p-4 text-left transition hover:-translate-y-1 hover:border-[var(--mq-primary)] hover:shadow-lg"
              data-size="6"
              data-difficulty="easy"
            >
              <div class="flex items-center gap-3">
                <span class="text-3xl">🌸</span>
                <div>
                  <div class="text-base font-bold text-[var(--mq-ink)]">
                    6×6 かんたん
                  </div>
                  <div class="text-xs text-[#5e718a]">入門</div>
                </div>
              </div>
            </button>
            <button
              type="button"
              class="preset-button rounded-2xl border-2 border-[var(--mq-outline)] bg-gradient-to-br from-white to-[var(--mq-surface)] p-4 text-left transition hover:-translate-y-1 hover:border-[var(--mq-primary)] hover:shadow-lg"
              data-size="6"
              data-difficulty="medium"
            >
              <div class="flex items-center gap-3">
                <span class="text-3xl">🌺</span>
                <div>
                  <div class="text-base font-bold text-[var(--mq-ink)]">
                    6×6 ふつう
                  </div>
                  <div class="text-xs text-[#5e718a]">入門</div>
                </div>
              </div>
            </button>
            <button
              type="button"
              class="preset-button rounded-2xl border-2 border-[var(--mq-outline)] bg-gradient-to-br from-white to-[var(--mq-surface)] p-4 text-left transition hover:-translate-y-1 hover:border-[var(--mq-primary)] hover:shadow-lg"
              data-size="6"
              data-difficulty="hard"
            >
              <div class="flex items-center gap-3">
                <span class="text-3xl">🌹</span>
                <div>
                  <div class="text-base font-bold text-[var(--mq-ink)]">
                    6×6 むずかしい
                  </div>
                  <div class="text-xs text-[#5e718a]">入門</div>
                </div>
              </div>
            </button>
            <button
              type="button"
              class="preset-button rounded-2xl border-2 border-[var(--mq-outline)] bg-gradient-to-br from-white to-[var(--mq-surface)] p-4 text-left transition hover:-translate-y-1 hover:border-[var(--mq-primary)] hover:shadow-lg"
              data-size="9"
              data-difficulty="easy"
            >
              <div class="flex items-center gap-3">
                <span class="text-3xl">⭐</span>
                <div>
                  <div class="text-base font-bold text-[var(--mq-ink)]">
                    9×9 かんたん
                  </div>
                  <div class="text-xs text-[#5e718a]">標準</div>
                </div>
              </div>
            </button>
            <button
              type="button"
              class="preset-button rounded-2xl border-2 border-[var(--mq-outline)] bg-gradient-to-br from-white to-[var(--mq-surface)] p-4 text-left transition hover:-translate-y-1 hover:border-[var(--mq-primary)] hover:shadow-lg"
              data-size="9"
              data-difficulty="medium"
            >
              <div class="flex items-center gap-3">
                <span class="text-3xl">🌟</span>
                <div>
                  <div class="text-base font-bold text-[var(--mq-ink)]">
                    9×9 ふつう
                  </div>
                  <div class="text-xs text-[#5e718a]">標準</div>
                </div>
              </div>
            </button>
            <button
              type="button"
              class="preset-button rounded-2xl border-2 border-[var(--mq-outline)] bg-gradient-to-br from-white to-[var(--mq-surface)] p-4 text-left transition hover:-translate-y-1 hover:border-[var(--mq-primary)] hover:shadow-lg"
              data-size="9"
              data-difficulty="hard"
            >
              <div class="flex items-center gap-3">
                <span class="text-3xl">💫</span>
                <div>
                  <div class="text-base font-bold text-[var(--mq-ink)]">
                    9×9 むずかしい
                  </div>
                  <div class="text-xs text-[#5e718a]">標準</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div id="game-container" class="hidden space-y-6">
          <div class="flex items-center justify-between gap-4">
            <div class="difficulty-badge">
              <span class="text-2xl">🎯</span>
              <div class="flex flex-col">
                <span class="text-xs uppercase tracking-wide opacity-75">
                  難易度
                </span>
                <span id="difficulty-label" class="text-base font-bold">
                  かんたん
                </span>
              </div>
            </div>
            <div class="difficulty-badge">
              <span class="text-2xl">📏</span>
              <div class="flex flex-col">
                <span class="text-xs uppercase tracking-wide opacity-75">
                  サイズ
                </span>
                <span id="size-label" class="text-base font-bold">
                  9×9
                </span>
              </div>
            </div>
            <div class="difficulty-badge">
              <span class="text-2xl">📝</span>
              <div class="flex flex-col">
                <span class="text-xs uppercase tracking-wide opacity-75">
                  残り
                </span>
                <span id="remaining-count" class="text-base font-bold">
                  0
                </span>
              </div>
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
        </div>
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
            class="action-button mt-3 w-full rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white px-4 py-3 text-sm font-bold text-red-700 shadow-md transition hover:-translate-y-1 hover:border-red-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span class="flex items-center justify-center gap-2">
              <span class="text-lg">✏️</span>
              けす
            </span>
          </button>
        </div>

        <div class="space-y-3 rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] p-6 shadow-lg">
          <h2 class="text-lg font-semibold text-[var(--mq-ink)]">操作</h2>
          <div class="flex flex-col gap-3">
            <button
              id="check-button"
              type="button"
              class="action-button w-full rounded-2xl bg-gradient-to-r from-[var(--mq-primary)] to-[var(--mq-primary-strong)] px-4 py-3 text-base font-bold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span class="flex items-center justify-center gap-2">
                <span class="text-xl">✅</span>
                答え合わせ
              </span>
            </button>
            <button
              id="retry-button"
              type="button"
              class="action-button hidden w-full rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 text-base font-bold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <span class="flex items-center justify-center gap-2">
                <span class="text-xl">🔄</span>
                もういちど
              </span>
            </button>
            <button
              id="new-game-button"
              type="button"
              class="action-button w-full rounded-2xl border-2 border-[var(--mq-outline)] bg-gradient-to-br from-white to-[var(--mq-surface)] px-4 py-3 text-base font-bold text-[var(--mq-ink)] shadow-md transition hover:-translate-y-1 hover:border-[var(--mq-primary)] hover:shadow-lg"
            >
              <span class="flex items-center justify-center gap-2">
                <span class="text-xl">🎲</span>
                新しいゲーム
              </span>
            </button>
            <button
              id="hint-button"
              type="button"
              class="action-button w-full rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white px-4 py-3 text-base font-bold text-amber-700 shadow-md transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span class="flex items-center justify-center gap-2">
                <span class="text-xl">💡</span>
                ヒント
              </span>
            </button>
          </div>
        </div>
      </aside>
    </main>

    {renderSudokuClientScript()}
  </div>
);
