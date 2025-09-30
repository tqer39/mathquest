import { html, raw } from 'hono/html';

import type { GradePreset } from './home';

const MODULE_SOURCE = `
(() => {
  const gradePresets = JSON.parse(
    document.getElementById('grade-presets')?.textContent ?? '[]'
  );
  const STORAGE_KEY = 'mathquest:progress:v1';
  const SOUND_STORAGE_KEY = 'mathquest:sound-enabled';
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioCtx ? new AudioCtx() : null;

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
  const soundToggleButton = $('#toggle-sound');

  const playClick = () => {
    if (!soundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      console.warn('sound playback failed', e);
    }
  };

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

  const state = {
    progress: loadProgress(),
    answerBuffer: '',
    currentQuestion: null,
    selectedGrade: 'grade-1',
  };

  let soundEnabled = loadSoundEnabled();

  const updateSoundToggle = () => {
    if (!soundToggleButton) return;
    soundToggleButton.dataset.state = soundEnabled ? 'on' : 'off';
    soundToggleButton.textContent = soundEnabled ? '🔊 効果音: ON' : '🔈 効果音: OFF';
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
    document.getElementById('grade-name').textContent = preset.label + ' のもんだい';
    document.getElementById('grade-description').textContent = preset.description;
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
      String(question.a) + ' ' + question.op + ' ' + String(question.b) + ' = ？';
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
      playClick();
    }
    if (event.key === 'Backspace') {
      setAnswerBuffer(state.answerBuffer.slice(0, -1));
      playClick();
    }
    if (event.key === 'Enter') {
      playClick();
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

  state.selectedGrade = state.progress.lastGrade || 'grade-1';
  applyActiveGradeStyles();
  updateGradeDescription();
  renderProgress();
  attachKeypad();
  updateSoundToggle();
  nextQuestion();
})();
`;

export const renderHomeClientScript = (presets: readonly GradePreset[]) => html`
  <script id="grade-presets" type="application/json">
    ${raw(JSON.stringify(presets))}
  </script>
  <script type="module">
    ${raw(MODULE_SOURCE)};
  </script>
`;
