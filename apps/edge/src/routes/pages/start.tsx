import type { FC } from 'hono/jsx';
import { html } from 'hono/html';
import type { CurrentUser } from '../../application/session/current-user';
import {
  gradeLevels,
  calculationTypes,
  practiceThemes,
  gradePresets,
} from './grade-presets';
import { renderStartClientScript } from './start.client';

const baseQuestionCountOptions = [10, 20, 30] as const;

// ローカル開発環境の判定を簡素化
const isDevelopment = true; // デバッグ用に常に true に設定

console.log('Development mode enabled for 1-question option');

const questionCountOptions = (
  isDevelopment ? [1, ...baseQuestionCountOptions] : baseQuestionCountOptions
) as readonly number[];

export const Start: FC<{ currentUser: CurrentUser | null }> = ({
  currentUser,
}) => (
  <div
    id="start-root"
    class="flex min-h-screen w-full flex-col gap-8 px-4 py-8 sm:px-8 lg:px-16 xl:px-24"
    data-user-state={currentUser ? 'known' : 'anonymous'}
  >
    {html`
      <style>
        #theme-grid .theme-card--selected,
        #theme-grid .theme-card[data-selected='true'] {
          background: var(--mq-primary-soft) !important;
          border-color: var(--mq-primary) !important;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
          transform: translateY(-2px);
        }
        #theme-grid .theme-card--selected [data-role='theme-title'],
        #theme-grid .theme-card[data-selected='true'] [data-role='theme-title'],
        #theme-grid .theme-card--selected [data-role='theme-description'],
        #theme-grid
          .theme-card[data-selected='true']
          [data-role='theme-description'] {
          color: var(--mq-primary-strong) !important;
        }
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
    <nav class="flex flex-col gap-3 rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] px-6 py-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--mq-primary-soft)] text-base font-bold text-[var(--mq-primary-strong)]">
          MQ
        </span>
        <span class="text-lg font-semibold tracking-tight text-[var(--mq-ink)]">
          れんしゅうの じゅんび
        </span>
      </div>
      <a
        href="/"
        class="inline-flex items-center gap-2 rounded-2xl border border-[var(--mq-outline)] bg-white px-3 py-2 text-xs font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary)]"
      >
        ← トップに戻る
      </a>
    </nav>

    <header class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[#6c7c90]">
        Step 1
      </p>
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-extrabold text-[var(--mq-ink)]">
          学年と設定をえらぼう
        </h1>
        <button
          id="clear-selections"
          type="button"
          class="inline-flex items-center gap-2 rounded-2xl border border-[var(--mq-outline)] bg-white px-4 py-2 text-sm font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-red-50 hover:border-red-300 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >
          🗑️ クリア
        </button>
      </div>
      <p class="max-w-2xl text-sm text-[#4f6076]">
        学年と計算の種類をえらんでください。テーマを選ぶと、特定の範囲に集中して練習できます。右側では効果音・途中式の表示と問題数を設定できます。設定はブラウザに保存されるので、次回も同じ設定で始められます。
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section id="grade-step" class="space-y-5">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-[var(--mq-ink)]">
            学年をえらぶ
          </h2>
          <p
            id="selected-grade-label"
            class="text-sm font-semibold text-[#5e718a]"
          >
            {gradeLevels[0].label}：{gradeLevels[0].description}
          </p>
        </div>
        <div
          id="grade-level-grid"
          class="grid gap-3 sm:grid-cols-3 xl:grid-cols-6"
        >
          {gradeLevels.map((preset, index) => (
            <label key={preset.id} class="group cursor-pointer">
              <input
                type="radio"
                name="grade-selection"
                value={preset.id}
                data-group="level"
                class="peer sr-only"
                defaultChecked={index === 0}
              />
              <div class="grade-card rounded-2xl border border-transparent bg-white p-4 text-left shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-[var(--mq-primary)] group-hover:bg-[var(--mq-primary-soft)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--mq-primary)] peer-checked:border-[var(--mq-primary)] peer-checked:bg-[var(--mq-primary-soft)] peer-checked:shadow-xl">
                <p class="text-sm font-bold text-[var(--mq-primary-strong)]">
                  {preset.label}
                </p>
                <p class="text-base font-semibold text-[var(--mq-ink)]">
                  {preset.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        <div id="mode-selection-section" class="space-y-2">
          <p class="text-sm font-semibold text-[var(--mq-ink)]">
            モードをえらぶ
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="group cursor-pointer">
              <input
                type="radio"
                name="mode-selection"
                value="math"
                data-group="mode"
                class="peer sr-only"
                defaultChecked={true}
              />
              <div class="mode-card rounded-2xl border border-transparent bg-white p-4 text-left shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-[var(--mq-primary)] group-hover:bg-[var(--mq-primary-soft)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--mq-primary)] peer-checked:border-[var(--mq-primary)] peer-checked:bg-[var(--mq-primary-soft)] peer-checked:shadow-xl">
                <p class="text-sm font-bold text-[var(--mq-primary-strong)]">
                  🧮 計算する
                </p>
                <p class="text-base font-semibold text-[var(--mq-ink)]">
                  算数の問題を解こう
                </p>
              </div>
            </label>
            <label class="group cursor-pointer">
              <input
                type="radio"
                name="mode-selection"
                value="game"
                data-group="mode"
                class="peer sr-only"
              />
              <div class="mode-card rounded-2xl border border-transparent bg-white p-4 text-left shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-[var(--mq-primary)] group-hover:bg-[var(--mq-primary-soft)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--mq-primary)] peer-checked:border-[var(--mq-primary)] peer-checked:bg-[var(--mq-primary-soft)] peer-checked:shadow-xl">
                <p class="text-sm font-bold text-[var(--mq-primary-strong)]">
                  🎮 ゲームする
                </p>
                <p class="text-base font-semibold text-[var(--mq-ink)]">
                  数独で遊ぼう
                </p>
              </div>
            </label>
          </div>
        </div>

        <div id="calculation-type-section" class="space-y-2">
          <p class="text-sm font-semibold text-[var(--mq-ink)]">
            計算の種類をえらぶ
          </p>
          <div
            id="calculation-type-grid"
            class="grid gap-3 sm:grid-cols-3 xl:grid-cols-5"
          >
            {/* JavaScriptで動的に生成される */}
          </div>
        </div>

        <div id="theme-section" class="space-y-2">
          <p class="text-sm font-semibold text-[var(--mq-ink)]">
            テーマでえらぶ（任意）
          </p>
          <p class="text-xs text-[#5e718a]">
            集中して取り組みたいテーマがあれば、こちらから選択できます。
          </p>
          <div id="theme-grid" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {practiceThemes.map((preset) => (
              <button
                key={preset.id}
                type="button"
                data-grade-id={preset.id}
                data-mode={preset.mode}
                data-max={preset.max}
                data-min-grade={preset.minGrade}
                data-selected="false"
                class="theme-card group rounded-2xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--mq-primary)] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary)]"
                aria-pressed="false"
              >
                <p
                  data-role="theme-title"
                  class="text-sm font-bold text-[#5e718a] transition-colors"
                >
                  {preset.label}
                </p>
                <p
                  data-role="theme-description"
                  class="text-sm font-semibold text-[var(--mq-ink)] transition-colors"
                >
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        id="settings-step"
        class="space-y-5 rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] p-6 shadow-lg"
      >
        <h2 class="text-xl font-semibold text-[var(--mq-ink)]">プレイ設定</h2>
        <fieldset class="space-y-3">
          <legend class="text-xs font-semibold uppercase tracking-wide text-[#6c7c90]">
            問題数
          </legend>
          <div class="flex flex-wrap gap-3 text-sm font-semibold">
            {questionCountOptions.map((count) => (
              <label
                key={count}
                class="inline-flex items-center gap-2 rounded-xl border border-transparent bg-white px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--mq-primary)] cursor-pointer"
              >
                <input
                  type="radio"
                  name="question-count"
                  value={count}
                  defaultChecked={count === 10}
                  class="h-4 w-4 accent-[var(--mq-primary-strong)]"
                />
                {count}問
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset class="space-y-3">
          <legend class="text-xs font-semibold uppercase tracking-wide text-[#6c7c90]">
            ON / OFF 設定
          </legend>
          <div class="grid gap-3 sm:grid-cols-2">
            <button
              id="toggle-sound"
              type="button"
              data-state="off"
              class="setting-toggle inline-flex flex-col gap-2 rounded-2xl border border-[var(--mq-outline)] bg-white px-4 py-3 text-left text-sm font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary)]"
            >
              <span>🔊 効果音</span>
              <span class="text-xs text-[#5e718a]">
                キー操作や正解時のサウンド
              </span>
            </button>
            <button
              id="toggle-steps"
              type="button"
              data-state="off"
              class="setting-toggle inline-flex flex-col gap-2 rounded-2xl border border-[var(--mq-outline)] bg-white px-4 py-3 text-left text-sm font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary)]"
            >
              <span>🧮 途中式</span>
              <span class="text-xs text-[#5e718a]">計算の流れを自動で表示</span>
            </button>
          </div>
        </fieldset>

        <button
          id="start-session"
          type="button"
          class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--mq-primary)] px-6 py-3 text-lg font-semibold text-[var(--mq-ink)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-strong)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary-strong)]"
        >
          つぎへ（カウントダウン）
        </button>
        <p class="text-xs text-[#5e718a]">
          設定はブラウザに保存されます。
          <a
            href="/auth/login"
            class="text-[var(--mq-primary)] hover:text-[var(--mq-primary-strong)] transition-colors cursor-pointer underline"
          >
            会員登録
          </a>
          すると学習記録をクラウドにも同期できます。
        </p>
      </section>
    </div>

    {renderStartClientScript(gradePresets, calculationTypes, gradeLevels)}
  </div>
);
