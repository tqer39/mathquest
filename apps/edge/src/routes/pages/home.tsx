import type { FC } from 'hono/jsx';
import { html, raw } from 'hono/html';
import type { CurrentUser } from '../../application/session/current-user';

const gradePresets = [
  {
    id: 'grade-1',
    label: '小1',
    description: '10までのたし算',
    mode: 'add',
    max: 10,
  },
  {
    id: 'grade-2',
    label: '小2',
    description: '100までのひき算',
    mode: 'sub',
    max: 100,
  },
  {
    id: 'grade-3',
    label: '小3',
    description: 'かけ算（九九）',
    mode: 'mul',
    max: 81,
  },
  {
    id: 'grade-4',
    label: '小4',
    description: '割り算（あまりあり）',
    mode: 'mix',
    max: 144,
  },
  {
    id: 'grade-5',
    label: '小5',
    description: '小数のたし算・ひき算',
    mode: 'mix',
    max: 200,
  },
  {
    id: 'grade-6',
    label: '小6',
    description: '分数のたし算・ひき算',
    mode: 'mix',
    max: 300,
  },
] as const;

const HOME_SCRIPT = html`<script type="module">
    const gradePresets = JSON.parse(
      document.getElementById('grade-presets')?.textContent ?? '[]'
    );
    const STORAGE_KEY = 'mathquest:progress:v1';
    const SOUND_STORAGE_KEY = 'mathquest:sound-enabled';
    const SOUND_SRC =
      'data:audio/wav;base64,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';
    const clickSound = new Audio(SOUND_SRC);
    clickSound.volume = 0.35;
    clickSound.preload = 'auto';

    const soundToggleButton = document.getElementById('toggle-sound');

    const loadSoundEnabled = () => {
      try {
        const raw = localStorage.getItem(SOUND_STORAGE_KEY);
        if (raw === 'false') return false;
        if (raw === 'true') return true;
      } catch (e) {
        console.warn('failed to read sound preference', e);
      }
      return true;
    };

    let soundEnabled = loadSoundEnabled();

    const playClick = () => {
      if (!soundEnabled) return;
      try {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
      } catch (e) {
        console.warn('sound playback failed', e);
      }
    };

    const updateSoundToggle = () => {
      if (!soundToggleButton) return;
      soundToggleButton.dataset.state = soundEnabled ? 'on' : 'off';
      soundToggleButton.textContent = soundEnabled
        ? '🔊 効果音: ON'
        : '🔈 効果音: OFF';
    };

    soundToggleButton?.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      try {
        localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
      } catch (e) {
        console.warn('failed to persist sound preference', e);
      }
      updateSoundToggle();
      if (soundEnabled) playClick();
    });

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => Array.from(document.querySelectorAll(selector));

    const gradeButtons = $$('[data-grade-id]');
    const questionEl = $('#question');
    const startButton = $('#start-button');
    const keypadButtons = $$('[data-keypad]');
    const answerEl = $('#answer-display');
    const feedbackEl = $('#feedback');
    const totalEl = $('#stats-total');
    const correctEl = $('#stats-correct');
    const streakEl = $('#stats-streak');
    const lastPlayedEl = $('#stats-last-played');
    const resetButton = $('#reset-progress');

    const toDateString = (iso) => {
      if (!iso) return 'まだ記録はありません';
      try {
        const d = new Date(iso);
        return [
          String(d.getFullYear()) + '年',
          String(d.getMonth() + 1) + '月',
          String(d.getDate()) + '日',
        ].join('');
      } catch (e) {
        return 'まだ記録はありません';
      }
    };

    const defaultProgress = () => ({
      totalAnswered: 0,
      totalCorrect: 0,
      streak: 0,
      lastAnsweredAt: null,
      lastGrade: 'grade-1',
    });

    const loadProgress = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultProgress();
        const parsed = JSON.parse(raw);
        return {
          ...defaultProgress(),
          ...parsed,
        };
      } catch (e) {
        console.warn('failed to read progress from localStorage', e);
        return defaultProgress();
      }
    };

    const saveProgress = (progress) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    };

    const state = {
      progress: loadProgress(),
      answerBuffer: '',
      currentQuestion: null,
      selectedGrade: 'grade-1',
    };

    const applyActiveGradeStyles = () => {
      gradeButtons.forEach((button) => {
        const isActive = button.dataset.gradeId === state.selectedGrade;
        button.classList.toggle('border-[var(--mq-primary)]', isActive);
        button.classList.toggle('bg-[var(--mq-surface-strong)]', isActive);
        button.classList.toggle('shadow-xl', isActive);
        button.classList.toggle('ring-2', isActive);
        button.classList.toggle('ring-[var(--mq-accent)]', isActive);
        button.classList.toggle('text-[var(--mq-ink)]', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };

    const renderProgress = () => {
      totalEl.textContent = state.progress.totalAnswered + '問';
      correctEl.textContent = state.progress.totalCorrect + '問';
      streakEl.textContent = state.progress.streak + 'れんしょう';
      lastPlayedEl.textContent = toDateString(state.progress.lastAnsweredAt);
    };

    const showFeedback = (type, message) => {
      feedbackEl.textContent = message;
      feedbackEl.dataset.variant = type;
      feedbackEl.classList.remove('opacity-0');
      setTimeout(() => {
        feedbackEl.classList.add('opacity-0');
      }, 2000);
    };

    const setAnswerBuffer = (value) => {
      state.answerBuffer = value.replace(/^0+(d)/, '$1').slice(0, 6);
      answerEl.textContent = state.answerBuffer || '？';
    };

    const attachKeypad = () => {
      keypadButtons.forEach((button) => {
        const action = button.dataset.keypad;
        if (action === 'digit') {
          button.addEventListener('click', () => {
            setAnswerBuffer(state.answerBuffer + button.dataset.value);
            playClick();
          });
        }
        if (action === 'delete') {
          button.addEventListener('click', () => {
            setAnswerBuffer(state.answerBuffer.slice(0, -1));
            playClick();
          });
        }
        if (action === 'submit') {
          button.addEventListener('click', () => {
            playClick();
            submitAnswer();
          });
        }
      });
    };

    const currentPreset = () =>
      gradePresets.find((preset) => preset.id === state.selectedGrade) ??
      gradePresets[0];

    const updateGradeDescription = () => {
      const preset = currentPreset();
      $('#grade-name').textContent = preset.label + ' のもんだい';
      $('#grade-description').textContent = preset.description;
    };

    const nextQuestion = async () => {
      const preset = currentPreset();
      const response = await fetch('/apis/quiz/questions/next', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: preset.mode, max: preset.max }),
      });
      if (!response.ok) {
        showFeedback('error', '問題の取得に失敗しました');
        return;
      }
      const { question } = await response.json();
      state.currentQuestion = question;
      questionEl.dataset.a = String(question.a);
      questionEl.dataset.b = String(question.b);
      questionEl.dataset.op = question.op;
      questionEl.textContent =
        String(question.a) +
        ' ' +
        question.op +
        ' ' +
        String(question.b) +
        ' = ？';
      setAnswerBuffer('');
    };

    const submitAnswer = async () => {
      if (!state.currentQuestion) {
        showFeedback('info', 'スタートボタンで問題をはじめましょう');
        return;
      }
      if (!state.answerBuffer) {
        showFeedback('info', 'こたえを入力してね');
        return;
      }
      const value = Number(state.answerBuffer);
      if (Number.isNaN(value)) {
        showFeedback('error', '数字だけを入力してね');
        return;
      }
      const preset = currentPreset();
      const response = await fetch('/apis/quiz/answers/check', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          a: Number(questionEl.dataset.a),
          b: Number(questionEl.dataset.b),
          op: questionEl.dataset.op,
          value,
          gradeId: state.selectedGrade,
          mode: preset.mode,
          max: preset.max,
        }),
      });
      if (!response.ok) {
        showFeedback('error', '採点に失敗しました');
        return;
      }
      const { ok, correctAnswer } = await response.json();
      state.progress.totalAnswered += 1;
      state.progress.lastAnsweredAt = new Date().toISOString();
      state.progress.lastGrade = state.selectedGrade;
      if (ok) {
        state.progress.totalCorrect += 1;
        state.progress.streak += 1;
        showFeedback('success', 'せいかい！');
      } else {
        state.progress.streak = 0;
        showFeedback('error', 'ざんねん… せいかいは ' + correctAnswer);
      }
      saveProgress(state.progress);
      renderProgress();
      await nextQuestion();
    };

    gradeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedGrade = button.dataset.gradeId;
        applyActiveGradeStyles();
        updateGradeDescription();
        playClick();
        if (state.progress.lastGrade !== state.selectedGrade) {
          state.progress.streak = 0;
          saveProgress(state.progress);
          renderProgress();
        }
      });
    });

    startButton.addEventListener('click', () => {
      state.selectedGrade = state.progress.lastGrade
        ? String(state.progress.lastGrade)
        : state.selectedGrade;
      applyActiveGradeStyles();
      updateGradeDescription();
      nextQuestion();
      playClick();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key >= '0' && event.key <= '9') {
        setAnswerBuffer(state.answerBuffer + event.key);
      }
      if (event.key === 'Backspace') {
        setAnswerBuffer(state.answerBuffer.slice(0, -1));
      }
      if (event.key === 'Enter') {
        submitAnswer();
      }
    });

    resetButton.addEventListener('click', () => {
      if (!confirm('学習記録をリセットしますか？')) return;
      state.progress = defaultProgress();
      saveProgress(state.progress);
      renderProgress();
      setAnswerBuffer('');
      feedbackEl.textContent = '';
      playClick();
    });

    // Initialize
    state.selectedGrade = state.progress.lastGrade || 'grade-1';
    applyActiveGradeStyles();
    updateGradeDescription();
    renderProgress();
    attachKeypad();
    updateSoundToggle();
    // 初回の問題
    nextQuestion();
  </script>
  <script id="grade-presets" type="application/json">
    ${raw(JSON.stringify(gradePresets))}
  </script>`;

type HomeProps = {
  currentUser: CurrentUser | null;
};

const renderUserSummary = (user: CurrentUser) => (
  <div class="hidden items-center gap-3 rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] px-4 py-3 shadow-sm sm:flex">
    <span
      class="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white"
      style={{ backgroundColor: user.avatarColor }}
      aria-hidden="true"
    >
      {user.displayName.split(' ').join('').slice(0, 2)}
    </span>
    <div class="space-y-1 text-[var(--mq-ink)]">
      <p class="text-sm font-semibold">{user.displayName}</p>
      <p class="text-xs text-[#5e718a]">
        {user.grade} / {user.badges.join('・')}
      </p>
    </div>
  </div>
);

export const Home: FC<HomeProps> = ({ currentUser }) => (
  <div class="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
    <nav class="flex flex-col gap-3 rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] px-6 py-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--mq-primary-soft)] text-base font-bold text-[var(--mq-primary-strong)]">
          MQ
        </span>
        <span class="text-lg font-semibold tracking-tight text-[var(--mq-ink)]">
          MathQuest
        </span>
      </div>
      <div class="flex items-center gap-3 sm:gap-4">
        {currentUser ? (
          <>
            <p class="hidden text-sm font-medium text-[#5e718a] sm:block">
              ようこそ！今日も冒険をつづけましょう
            </p>
            {renderUserSummary(currentUser)}
          </>
        ) : (
          <p class="hidden text-sm font-medium text-[#5e718a] sm:block">
            算数の冒険を、やさしいデザインで
          </p>
        )}
        <button
          id="toggle-sound"
          type="button"
          class="inline-flex items-center gap-2 rounded-2xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] px-3 py-2 text-xs font-semibold text-[var(--mq-ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary)]"
          data-state="on"
        >
          🔊 効果音: ON
        </button>
      </div>
    </nav>

    <header class="flex flex-col gap-6 rounded-3xl border border-[var(--mq-outline)] bg-gradient-to-r from-[var(--mq-primary-soft)] via-white to-[var(--mq-accent)] p-8 text-[var(--mq-ink)] shadow-xl lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-3">
        <p class="text-xs font-semibold uppercase tracking-[0.4em] text-[#6c7c90]">
          じぶんのペースで算数練習
        </p>
        <h1 class="text-3xl font-extrabold sm:text-4xl">MathQuest</h1>
        <p class="max-w-xl text-sm sm:text-base text-[#4f6076]">
          ボタンを押して、算数ミッションにチャレンジ！学習記録はブラウザに保存。記録を残したくなったら、会員登録でクラウドにバックアップできます。
        </p>
      </div>
      <button
        id="start-button"
        class="inline-flex items-center justify-center rounded-2xl bg-[var(--mq-primary)] px-6 py-3 text-lg font-semibold text-[var(--mq-ink)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-strong)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary-strong)]"
        type="button"
      >
        スタート！
      </button>
    </header>

    <section class="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <article class="flex flex-col gap-6 rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface-strong)] p-6 shadow-lg sm:p-8">
        <div class="space-y-4">
          <span class="text-xs font-semibold uppercase tracking-wide text-[#6c7c90]">
            学年や単元をえらんでね
          </span>
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {gradePresets.map((preset, index) => (
              <button
                key={preset.id}
                data-grade-id={preset.id}
                data-mode={preset.mode}
                data-max={preset.max}
                aria-pressed={index === 0 ? 'true' : 'false'}
                class="grade-button rounded-2xl border border-transparent bg-[var(--mq-surface)] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary)]"
                type="button"
              >
                <p class="text-sm font-bold text-[#5e718a]">{preset.label}</p>
                <p class="text-base font-semibold text-[var(--mq-ink)]">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
          <p class="rounded-2xl bg-[var(--mq-primary-soft)] px-4 py-3 text-sm text-[var(--mq-ink)]">
            <span class="font-semibold" id="grade-name">
              {gradePresets[0].label} のもんだい
            </span>
            ：<span id="grade-description">{gradePresets[0].description}</span>
          </p>
        </div>

        <div class="rounded-3xl border border-[var(--mq-outline)] bg-gradient-to-br from-[var(--mq-accent)] via-white to-[var(--mq-primary-soft)] p-6 text-[var(--mq-ink)] shadow-inner">
          <p class="text-sm font-medium text-[#5e718a]">もんだい</p>
          <p
            id="question"
            class="mt-4 rounded-2xl bg-white/70 p-6 text-center text-5xl font-extrabold tracking-wider text-[var(--mq-ink)] shadow-lg backdrop-blur"
          >
            0 + 0 = ？
          </p>
          <p class="mt-2 text-xs text-[#5e718a]">
            スタートを押すと新しい問題が届くよ！
          </p>
        </div>

        <div class="flex flex-col gap-5 lg:flex-row">
          <div class="flex-1 space-y-4">
            <div class="rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface)] p-6 text-center">
              <p class="text-sm font-semibold text-[#5e718a]">こたえ</p>
              <p
                id="answer-display"
                class="mt-2 text-4xl font-extrabold tracking-[0.35em] text-[var(--mq-ink)]"
              >
                ？
              </p>
            </div>
            <p
              id="feedback"
              class="rounded-2xl bg-[var(--mq-primary-soft)] px-4 py-2 text-center text-sm font-semibold text-[var(--mq-primary-strong)] opacity-0 transition-opacity duration-200 ease-out"
              data-variant="info"
            ></p>
          </div>

          <div class="flex-1">
            <div class="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  class="rounded-2xl bg-white px-4 py-5 text-2xl font-extrabold text-[var(--mq-ink)] shadow transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary)]"
                  data-keypad="digit"
                  data-value={digit}
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                class="rounded-2xl bg-white px-4 py-5 text-xl font-semibold text-[var(--mq-ink)] shadow transition hover:-translate-y-0.5 hover:bg-[var(--mq-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-secondary)]"
                data-keypad="delete"
              >
                ⌫
              </button>
              <button
                type="button"
                class="rounded-2xl bg-white px-4 py-5 text-2xl font-extrabold text-[var(--mq-ink)] shadow transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary)]"
                data-keypad="digit"
                data-value="0"
              >
                0
              </button>
              <button
                type="button"
                class="rounded-2xl bg-[var(--mq-primary)] px-4 py-5 text-2xl font-extrabold text-[var(--mq-ink)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-strong)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary-strong)]"
                data-keypad="submit"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </article>

      <aside class="flex flex-col gap-5 rounded-3xl border border-[var(--mq-outline)] bg-[var(--mq-surface-strong)] p-6 shadow-lg sm:p-7">
        <h2 class="text-lg font-semibold text-[var(--mq-ink)]">きろく</h2>
        <ul class="space-y-3 text-sm text-[#4f6076]">
          <li class="flex items-center justify-between rounded-2xl bg-[var(--mq-surface)] px-4 py-3">
            <span>こたえた問題</span>
            <span id="stats-total" class="font-semibold text-[var(--mq-ink)]">
              0問
            </span>
          </li>
          <li class="flex items-center justify-between rounded-2xl bg-[var(--mq-surface)] px-4 py-3">
            <span>せいかい</span>
            <span id="stats-correct" class="font-semibold text-[#2e7c79]">
              0問
            </span>
          </li>
          <li class="flex items-center justify-between rounded-2xl bg-[var(--mq-surface)] px-4 py-3">
            <span>れんしゅうきろく</span>
            <span id="stats-streak" class="font-semibold text-[#4a7bb7]">
              0れんしょう
            </span>
          </li>
          <li class="rounded-2xl bg-[var(--mq-surface)] px-4 py-3 text-xs text-[#5e718a]">
            <span class="font-semibold text-[var(--mq-ink)]">
              さいしゅう更新日
            </span>
            <span id="stats-last-played" class="mt-1 block text-[#4f6076]">
              まだ記録はありません
            </span>
          </li>
        </ul>
        <p class="rounded-2xl bg-[var(--mq-secondary)] px-4 py-3 text-xs text-[#7a5544]">
          学習記録はブラウザに保存されています。会員登録すると、サーバーに同期してどこからでも続きができます。
        </p>
        <button
          id="reset-progress"
          type="button"
          class="rounded-2xl border border-[var(--mq-outline)] px-4 py-2 text-sm font-semibold text-[#4f6076] transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary)]"
        >
          学習記録をリセット
        </button>
        <a
          href="/auth/signin"
          class="inline-flex items-center justify-center rounded-2xl bg-[var(--mq-primary)] px-4 py-3 text-sm font-semibold text-[var(--mq-ink)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--mq-primary-strong)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mq-primary-strong)]"
        >
          会員登録・サインインはこちら
        </a>
      </aside>
    </section>

    {HOME_SCRIPT}
  </div>
);
