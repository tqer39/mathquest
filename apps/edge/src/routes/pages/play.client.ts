import { html, raw } from 'hono/html';
import { gradePresets } from './grade-presets';

const MODULE_SOURCE = `
(() => {
  const STORAGE_KEY = 'mathquest:progress:v1';
  const SOUND_STORAGE_KEY = 'mathquest:sound-enabled';
  const WORKING_STORAGE_KEY = 'mathquest:show-working';
  const FOCUS_STORAGE_KEY = 'mathquest:focus-mode';
  const QUESTION_COUNT_STORAGE_KEY = 'mathquest:question-count-default';
  const SESSION_STORAGE_KEY = 'mathquest:pending-session';

  const getJSON = (id) => {
    const el = document.getElementById(id);
    if (!el) return [];
    try {
      return JSON.parse(el.textContent || '[]');
    } catch (e) {
      console.warn('failed to parse presets', e);
      return [];
    }
  };

  const gradePresets = getJSON('grade-presets');
  const root = document.getElementById('play-root');
  if (!root) return;

  const qIndexEl = document.getElementById('qIndex');
  const qTotalEl = document.getElementById('qTotal');
  const correctEl = document.getElementById('correct');
  const questionEl = document.getElementById('question');
  const answerInput = document.getElementById('answer');
  const answerDisplay = document.getElementById('answer-display');
  const submitBtn = document.getElementById('submitBtn');
  const skipBtn = document.getElementById('skipBtn');
  const endBtn = document.getElementById('endBtn');
  const againBtn = document.getElementById('againBtn');
  const feedbackEl = document.getElementById('feedback');
  const workingContainer = document.getElementById('working-container');
  const workingEmpty = document.getElementById('working-empty');
  const workingSteps = document.getElementById('working-steps');
  const soundToggle = document.getElementById('toggle-sound');
  const stepsToggle = document.getElementById('toggle-steps');
  const focusToggle = document.getElementById('toggle-focus');
  const gradeLabelEl = document.getElementById('play-grade-label');
  const countdownOverlay = document.getElementById('countdown-overlay');
  const countdownNumber = document.getElementById('countdown-number');
  const resultCorrectEl = document.getElementById('result-correct');
  const resultTotalEl = document.getElementById('result-total');

  if (!submitBtn || !questionEl || !answerInput || !answerDisplay) {
    return;
  }

  const defaultProgress = () => ({
    totalAnswered: 0,
    totalCorrect: 0,
    streak: 0,
    lastAnsweredAt: null,
    lastGrade: gradePresets[0]?.id ?? null,
  });

  const loadProgress = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultProgress();
      const parsed = JSON.parse(raw);
      return { ...defaultProgress(), ...parsed };
    } catch (e) {
      console.warn('failed to load progress', e);
      return defaultProgress();
    }
  };

  const saveProgress = (progress) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('failed to save progress', e);
    }
  };

  const loadBoolean = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === 'true') return true;
      if (raw === 'false') return false;
    } catch (e) {
      console.warn('failed to parse boolean', key, e);
    }
    return fallback;
  };

  const loadQuestionCount = () => {
    try {
      const raw = localStorage.getItem(QUESTION_COUNT_STORAGE_KEY);
      const value = Number(raw);
      if (Number.isFinite(value)) return value;
    } catch (e) {
      console.warn('failed to parse question count', e);
    }
    return 10;
  };

  const loadSession = () => {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('failed to parse session', e);
      return null;
    }
  };

  const session = loadSession();
  if (!session && gradePresets.length === 0) {
    window.location.href = '/start';
    return;
  }

  const findPreset = (id) => gradePresets.find((preset) => preset.id === id);
  const fallbackPreset = gradePresets[0] ?? {
    id: 'grade-1',
    label: '小1',
    description: '10までのたし算・ひき算',
    mode: 'add',
    max: 10,
  };

  const preset = session && findPreset(session.gradeId)
    ? findPreset(session.gradeId)
    : fallbackPreset;

  if (!session) {
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        gradeId: preset.id,
        gradeLabel: preset.label,
        gradeDescription: preset.description,
        mode: preset.mode,
        max: preset.max,
        questionCount: loadQuestionCount(),
        soundEnabled: loadBoolean(SOUND_STORAGE_KEY, true),
        workingEnabled: loadBoolean(WORKING_STORAGE_KEY, true),
        focusEnabled: loadBoolean(FOCUS_STORAGE_KEY, false),
        createdAt: Date.now(),
      })
    );
  }

  const activeSession = loadSession();
  if (!activeSession) {
    window.location.href = '/start';
    return;
  }

  const state = {
    grade: preset,
    questionCount: Number(activeSession.questionCount) || loadQuestionCount(),
    soundEnabled:
      typeof activeSession.soundEnabled === 'boolean'
        ? activeSession.soundEnabled
        : loadBoolean(SOUND_STORAGE_KEY, true),
    workingEnabled:
      typeof activeSession.workingEnabled === 'boolean'
        ? activeSession.workingEnabled
        : loadBoolean(WORKING_STORAGE_KEY, true),
    focusEnabled:
      typeof activeSession.focusEnabled === 'boolean'
        ? activeSession.focusEnabled
        : loadBoolean(FOCUS_STORAGE_KEY, false),
    progress: loadProgress(),
    sessionActive: false,
    sessionAnswered: 0,
    sessionCorrect: 0,
    currentQuestion: null,
    answerBuffer: '',
    awaitingAdvance: false,
  };

  state.questionCount = Math.max(1, Math.min(100, state.questionCount));

  const toggleButton = (button, force) => {
    if (!button) return;
    const nextState = typeof force === 'boolean' ? force : button.dataset.state !== 'on';
    button.dataset.state = nextState ? 'on' : 'off';
    button.classList.toggle('bg-[var(--mq-primary-soft)]', nextState);
    button.classList.toggle('border-[var(--mq-primary)]', nextState);
  };

  toggleButton(soundToggle, state.soundEnabled);
  toggleButton(stepsToggle, state.workingEnabled);
  toggleButton(focusToggle, state.focusEnabled);

  const applyFocusLayout = () => {
    const focusOn = state.focusEnabled;
    root.classList.toggle('focus-mode', focusOn);
    if (focusOn) {
      root.dataset.focus = 'on';
    } else {
      delete root.dataset.focus;
    }
  };

  const applyWorkingVisibility = () => {
    if (!workingContainer) return;
    workingContainer.classList.toggle('hidden', !state.workingEnabled);
  };

  const playSound = (variant) => {
    if (!state.soundEnabled) return;
    const sources = {
      keypad:
        'data:audio/mp3;base64,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'
    };
    const src = sources[variant] || sources.keypad;
    try {
      const audio = new Audio(src);
      audio.volume = variant === 'success' ? 0.85 : 0.6;
      audio.play().catch(() => audio.remove());
      audio.addEventListener('ended', () => audio.remove(), { once: true });
    } catch (e) {
      console.warn('sound playback failed', e);
    }
  };

  const setAnswerBuffer = (value) => {
    state.answerBuffer = value;
    if (answerInput) answerInput.value = value;
    if (answerDisplay) answerDisplay.textContent = value || '？';
  };

  const renderProgress = () => {
    if (qIndexEl) qIndexEl.textContent = String(Math.min(state.sessionAnswered + 1, state.questionCount));
    if (qTotalEl) qTotalEl.textContent = String(state.questionCount);
    if (correctEl) correctEl.textContent = String(state.sessionCorrect);
  };

  const hideFeedback = () => {
    if (feedbackEl) {
      feedbackEl.textContent = '';
      feedbackEl.dataset.variant = '';
    }
  };

  let feedbackTimer = null;
  const showFeedback = (variant, message) => {
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    feedbackEl.dataset.variant = variant;
    feedbackEl.classList.remove('opacity-0');
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(() => {
      feedbackEl.classList.add('opacity-0');
    }, 2000);
  };

  const renderQuestionExpression = (question) => {
    if (!questionEl) return;
    questionEl.textContent =
      String(question.a) + ' ' + question.op + ' ' + String(question.b) + ' = ?';
  };

  const renderWorkingSteps = (question, correctAnswer) => {
    if (!workingContainer || !workingSteps || !workingEmpty) return;
    if (!state.workingEnabled) {
      workingSteps.innerHTML = '';
      workingEmpty.classList.remove('hidden');
      return;
    }
    if (!question || typeof correctAnswer === 'undefined') {
      workingSteps.innerHTML = '';
      workingEmpty.classList.remove('hidden');
      return;
    }
    workingEmpty.classList.add('hidden');
    const steps = [];
    if (Array.isArray(question.extras)) {
      question.extras.forEach((line) => {
        if (typeof line === 'string') steps.push(line);
      });
    }
    steps.push('= ' + correctAnswer);
    workingSteps.innerHTML = '';
    steps.forEach((line) => {
      const li = document.createElement('li');
      li.textContent = line;
      workingSteps.appendChild(li);
    });
  };

  const updateSessionStorage = () => {
    const payload = {
      gradeId: state.grade.id,
      gradeLabel: state.grade.label,
      gradeDescription: state.grade.description,
      mode: state.grade.mode,
      max: state.grade.max,
      questionCount: state.questionCount,
      soundEnabled: state.soundEnabled,
      workingEnabled: state.workingEnabled,
      focusEnabled: state.focusEnabled,
      createdAt: Date.now(),
    };
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('failed to refresh session storage', e);
    }
  };

  const updatePreferences = () => {
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, String(state.soundEnabled));
      localStorage.setItem(WORKING_STORAGE_KEY, String(state.workingEnabled));
      localStorage.setItem(FOCUS_STORAGE_KEY, String(state.focusEnabled));
      localStorage.setItem(QUESTION_COUNT_STORAGE_KEY, String(state.questionCount));
    } catch (e) {
      console.warn('failed to persist preferences', e);
    }
  };

  const runCountdown = async () => {
    if (!countdownOverlay || !countdownNumber) return;
    countdownOverlay.classList.remove('hidden');
    const ticks = ['3', '2', '1', 'Go!'];
    for (const value of ticks) {
      countdownNumber.textContent = value;
      await new Promise((resolve) => setTimeout(resolve, value === 'Go!' ? 600 : 900));
    }
    countdownOverlay.classList.add('hidden');
  };

  const statefulFetch = async (path, payload) => {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return response.json();
  };

  const nextQuestion = async () => {
    state.awaitingAdvance = false;
    renderWorkingSteps(null);
    renderProgress();
    try {
      const { question } = await statefulFetch('/apis/quiz/questions/next', {
        gradeId: state.grade.id,
        mode: state.grade.mode,
        max: state.grade.max,
      });
      state.currentQuestion = question;
      state.answerBuffer = '';
      renderQuestionExpression(question);
      setAnswerBuffer('');
      hideFeedback();
      if (qIndexEl) qIndexEl.textContent = String(state.sessionAnswered + 1);
    } catch (e) {
      console.error(e);
      showFeedback('error', '問題の取得に失敗しました。しばらくしてから再度お試しください。');
    }
  };

  const finishSession = () => {
    state.sessionActive = false;
    state.awaitingAdvance = false;
    if (resultCorrectEl) resultCorrectEl.textContent = String(state.sessionCorrect);
    if (resultTotalEl) resultTotalEl.textContent = String(state.sessionAnswered);
    if (againBtn) {
      againBtn.classList.remove('hidden');
    }
    showFeedback('info', 'おつかれさま！もう一度練習する場合はボタンを押してね');
  };

  const handleAnswer = async (value) => {
    if (!state.currentQuestion) {
      showFeedback('info', 'カウントダウン後に問題が表示されます');
      return;
    }
    try {
      const { ok, correctAnswer } = await statefulFetch('/apis/quiz/answers/check', {
        question: {
          a: state.currentQuestion.a,
          b: state.currentQuestion.b,
          op: state.currentQuestion.op,
          extras: Array.isArray(state.currentQuestion.extras)
            ? state.currentQuestion.extras
            : [],
        },
        value,
        gradeId: state.grade.id,
        mode: state.grade.mode,
        max: state.grade.max,
      });

      state.progress.totalAnswered += 1;
      state.progress.lastAnsweredAt = new Date().toISOString();
      state.progress.lastGrade = state.grade.id;
      state.sessionAnswered += 1;
      if (ok) {
        state.progress.totalCorrect += 1;
        state.progress.streak += 1;
        state.sessionCorrect += 1;
        showFeedback('success', 'せいかい！');
        playSound('success');
      } else {
        state.progress.streak = 0;
        showFeedback('error', 'ざんねん… せいかいは ' + correctAnswer);
        playSound('keypad');
      }
      saveProgress(state.progress);
      renderWorkingSteps(state.currentQuestion, correctAnswer);

      if (state.sessionAnswered >= state.questionCount) {
        renderProgress();
        finishSession();
        return;
      }

      if (state.workingEnabled) {
        state.awaitingAdvance = true;
        renderProgress();
        return;
      }

      renderProgress();
      await nextQuestion();
    } catch (e) {
      console.error(e);
      showFeedback('error', '採点に失敗しました。通信環境を確認してください。');
    }
  };

  const handleSubmit = async () => {
    if (!state.sessionActive) return;
    if (state.awaitingAdvance) {
      state.awaitingAdvance = false;
      renderProgress();
      await nextQuestion();
      return;
    }
    const value = Number(state.answerBuffer || answerInput.value);
    if (!Number.isFinite(value)) {
      showFeedback('info', '数字だけを入力してね');
      return;
    }
    await handleAnswer(value);
    setAnswerBuffer('');
  };

  const handleSkip = async () => {
    if (!state.sessionActive || !state.currentQuestion) return;
    state.progress.totalAnswered += 1;
    state.progress.lastAnsweredAt = new Date().toISOString();
    state.progress.lastGrade = state.grade.id;
    state.progress.streak = 0;
    state.sessionAnswered += 1;
    saveProgress(state.progress);
    showFeedback('info', 'スキップしました');
    renderWorkingSteps(state.currentQuestion, '?');
    if (state.sessionAnswered >= state.questionCount) {
      renderProgress();
      finishSession();
      return;
    }
    renderProgress();
    await nextQuestion();
    setAnswerBuffer('');
  };

  const startSession = async () => {
    state.sessionActive = true;
    state.sessionAnswered = 0;
    state.sessionCorrect = 0;
    state.awaitingAdvance = false;
    renderProgress();
    renderWorkingSteps(null);
    hideFeedback();
    if (againBtn) againBtn.classList.add('hidden');
    updatePreferences();
    updateSessionStorage();
    await nextQuestion();
  };

  const restartWithCountdown = async () => {
    await runCountdown();
    await startSession();
  };

  runCountdown().then(() => startSession());

  submitBtn.addEventListener('click', () => {
    handleSubmit();
  });

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      handleSkip();
    });
  }

  if (againBtn) {
    againBtn.addEventListener('click', () => {
      restartWithCountdown();
    });
  }

  if (endBtn) {
    endBtn.addEventListener('click', () => {
      window.location.href = '/start';
    });
  }

  if (answerInput) {
    answerInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (!state.sessionActive) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
      return;
    }
    if (event.key === 'Escape') {
      if (state.focusEnabled) {
        state.focusEnabled = false;
        toggleButton(focusToggle, false);
        updatePreferences();
        updateSessionStorage();
        applyFocusLayout();
      }
      return;
    }
    if (event.key >= '0' && event.key <= '9') {
      setAnswerBuffer(state.answerBuffer + event.key);
      playSound('keypad');
    }
    if (event.key === 'Backspace') {
      setAnswerBuffer(state.answerBuffer.slice(0, -1));
      playSound('keypad');
    }
  });

  document.querySelectorAll('[data-key]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.key;
      if (key === 'submit') {
        playSound('success');
        handleSubmit();
        return;
      }
      if (key === 'back') {
        setAnswerBuffer(state.answerBuffer.slice(0, -1));
        playSound('keypad');
        return;
      }
      setAnswerBuffer(state.answerBuffer + key);
      playSound('keypad');
    });
  });

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      toggleButton(soundToggle, state.soundEnabled);
      updatePreferences();
      updateSessionStorage();
    });
  }

  if (stepsToggle) {
    stepsToggle.addEventListener('click', () => {
      state.workingEnabled = !state.workingEnabled;
      toggleButton(stepsToggle, state.workingEnabled);
      applyWorkingVisibility();
      updatePreferences();
      updateSessionStorage();
    });
  }

  if (focusToggle) {
    focusToggle.addEventListener('click', () => {
      state.focusEnabled = !state.focusEnabled;
      toggleButton(focusToggle, state.focusEnabled);
      applyFocusLayout();
      updatePreferences();
      updateSessionStorage();
    });
  }

  if (gradeLabelEl) {
    gradeLabelEl.textContent = activeSession.gradeLabel || state.grade.label;
  }
  applyFocusLayout();
  applyWorkingVisibility();
  renderProgress();
})();
`;

export const renderPlayClientScript = () => html`
  <script id="grade-presets" type="application/json">
    ${raw(JSON.stringify(gradePresets))}
  </script>
  <script type="module">
    ${raw(MODULE_SOURCE)};
  </script>
`;
