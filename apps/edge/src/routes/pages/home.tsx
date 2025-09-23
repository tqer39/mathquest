import type { FC } from 'hono/jsx';
import { html } from 'hono/html';

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
  const gradePresets = ${JSON.stringify(gradePresets)};
  const STORAGE_KEY = 'mathquest:progress:v1';

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
      button.classList.toggle('border-sky-500', isActive);
      button.classList.toggle('bg-white', isActive);
      button.classList.toggle('shadow-xl', isActive);
      button.classList.toggle('ring-2', isActive);
      button.classList.toggle('ring-sky-200', isActive);
      button.classList.toggle('text-slate-900', isActive);
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
        });
      }
      if (action === 'delete') {
        button.addEventListener('click', () => {
          setAnswerBuffer(state.answerBuffer.slice(0, -1));
        });
      }
      if (action === 'submit') {
        button.addEventListener('click', () => submitAnswer());
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
    const response = await fetch('/apis/quiz/answers/check', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        a: Number(questionEl.dataset.a),
        b: Number(questionEl.dataset.b),
        op: questionEl.dataset.op,
        value,
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
  });

  // Initialize
  state.selectedGrade = state.progress.lastGrade || 'grade-1';
  applyActiveGradeStyles();
  updateGradeDescription();
  renderProgress();
  attachKeypad();
  // 初回の問題
  nextQuestion();
</script>`;

export const Home: FC = () => (
  <div class="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-10">
    <header class="flex flex-col gap-6 rounded-3xl bg-gradient-to-r from-sky-500 via-sky-400 to-blue-500 p-8 text-white shadow-xl lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-2">
        <p class="text-sm font-semibold uppercase tracking-widest text-sky-100">
          じぶんのペースで算数練習
        </p>
        <h1 class="text-3xl font-extrabold sm:text-4xl">MathQuest</h1>
        <p class="max-w-xl text-sm sm:text-base text-sky-100">
          ボタンを押して、算数ミッションにチャレンジ！学習記録はブラウザに保存。記録を残したくなったら、会員登録でクラウドにバックアップできます。
        </p>
      </div>
      <button
        id="start-button"
        class="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-lg font-semibold text-sky-600 shadow-lg shadow-sky-900/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        type="button"
      >
        スタート！
      </button>
    </header>

    <section class="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <article class="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        <div class="space-y-4">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                class="grade-button rounded-2xl border-2 border-transparent bg-white/70 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                type="button"
              >
                <p class="text-sm font-bold text-slate-500">{preset.label}</p>
                <p class="text-base font-semibold text-slate-900">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
          <p class="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700">
            <span class="font-semibold" id="grade-name">
              {gradePresets[0].label} のもんだい
            </span>
            ：<span id="grade-description">{gradePresets[0].description}</span>
          </p>
        </div>

        <div class="rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-500 p-6 text-white shadow-inner">
          <p class="text-sm font-medium text-sky-100">もんだい</p>
          <p
            id="question"
            class="mt-4 rounded-2xl bg-white/15 p-6 text-center text-5xl font-extrabold tracking-wider shadow-lg backdrop-blur"
          >
            0 + 0 = ？
          </p>
          <p class="mt-2 text-xs text-sky-100">
            スタートを押すと新しい問題が届くよ！
          </p>
        </div>

        <div class="flex flex-col gap-5 lg:flex-row">
          <div class="flex-1 space-y-4">
            <div class="rounded-3xl border-4 border-sky-200 bg-sky-50 p-6 text-center">
              <p class="text-sm font-semibold text-slate-500">こたえ</p>
              <p
                id="answer-display"
                class="mt-2 text-4xl font-extrabold tracking-[0.35em] text-slate-900"
              >
                ？
              </p>
            </div>
            <p
              id="feedback"
              class="rounded-2xl bg-sky-100 px-4 py-2 text-center text-sm font-semibold text-sky-700 transition-opacity duration-200 ease-out opacity-0"
              data-variant="info"
            ></p>
          </div>

          <div class="flex-1">
            <div class="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  class="rounded-2xl bg-white px-4 py-5 text-2xl font-extrabold text-slate-800 shadow hover:-translate-y-0.5 hover:bg-sky-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                  data-keypad="digit"
                  data-value={digit}
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                class="rounded-2xl bg-white px-4 py-5 text-xl font-semibold text-slate-800 shadow hover:-translate-y-0.5 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                data-keypad="delete"
              >
                ⌫
              </button>
              <button
                type="button"
                class="rounded-2xl bg-white px-4 py-5 text-2xl font-extrabold text-slate-800 shadow hover:-translate-y-0.5 hover:bg-sky-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                data-keypad="digit"
                data-value="0"
              >
                0
              </button>
              <button
                type="button"
                class="rounded-2xl bg-sky-600 px-4 py-5 text-2xl font-extrabold text-white shadow-lg shadow-sky-500/40 transition hover:-translate-y-0.5 hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                data-keypad="submit"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </article>

      <aside class="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-lg sm:p-7">
        <h2 class="text-lg font-semibold text-slate-700">きろく</h2>
        <ul class="space-y-3 text-sm text-slate-600">
          <li class="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span>こたえた問題</span>
            <span id="stats-total" class="font-semibold text-slate-900">
              0問
            </span>
          </li>
          <li class="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span>せいかい</span>
            <span id="stats-correct" class="font-semibold text-emerald-600">
              0問
            </span>
          </li>
          <li class="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span>れんしゅうきろく</span>
            <span id="stats-streak" class="font-semibold text-sky-600">
              0れんしょう
            </span>
          </li>
          <li class="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <span class="font-semibold text-slate-600">さいしゅう更新日</span>
            <span id="stats-last-played" class="mt-1 block text-slate-700">
              まだ記録はありません
            </span>
          </li>
        </ul>
        <p class="rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
          学習記録はブラウザに保存されています。会員登録すると、サーバーに同期してどこからでも続きができます。
        </p>
        <button
          id="reset-progress"
          type="button"
          class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
        >
          学習記録をリセット
        </button>
        <a
          href="/auth/signin"
          class="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5 hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          会員登録・サインインはこちら
        </a>
      </aside>
    </section>

    {HOME_SCRIPT}
  </div>
);
