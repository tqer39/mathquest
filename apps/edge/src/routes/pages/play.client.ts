import { html, raw } from 'hono/html';
import { gradePresets } from './grade-presets';

const MODULE_SOURCE = `
(() => {
  const STORAGE_KEY = 'mathquest:progress:v1';
  const SOUND_STORAGE_KEY = 'mathquest:sound-enabled';
  const WORKING_STORAGE_KEY = 'mathquest:show-working';
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
  const endResultBtn = document.getElementById('endResultBtn');
  const resultActions = document.getElementById('result-actions');
  const feedbackEl = document.getElementById('feedback');
  const workingContainer = document.getElementById('working-container');
  const workingEmpty = document.getElementById('working-empty');
  const workingSteps = document.getElementById('working-steps');
  const soundToggle = document.getElementById('toggle-sound');
  const stepsToggle = document.getElementById('toggle-steps');
  const gradeLabelEl = document.getElementById('play-grade-label');
  const contextLabelEl = document.getElementById('play-context-label');
  const countdownOverlay = document.getElementById('countdown-overlay');
  const countdownNumber = document.getElementById('countdown-number');
  const resultCorrectEl = document.getElementById('result-correct');
  const resultTotalEl = document.getElementById('result-total');
  const keypadButtons = Array.from(
    document.querySelectorAll('[data-key]')
  ).filter((btn) => btn.dataset.key !== 'submit');
  const keypadSubmitButton = document.querySelector('[data-key="submit"]');

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

  const themeFromSession = session?.theme?.id
    ? findPreset(session.theme.id) || {
        id: session.theme.id,
        label: session.theme.label,
        description: session.theme.description,
      }
    : null;

  const baseGradeFromSession = session?.baseGrade?.id
    ? findPreset(session.baseGrade.id) || {
        id: session.baseGrade.id,
        label: session.baseGrade.label,
        description: session.baseGrade.description,
        mode: session.baseGrade.mode,
        max: session.baseGrade.max,
      }
    : null;

  const legacyBaseGrade = session?.baseGradeId
    ? findPreset(session.baseGradeId) || {
        id: session.baseGradeId,
        label: session.baseGradeLabel || preset.label,
        description: session.baseGradeDescription || preset.description,
        mode: session.baseGradeMode || preset.mode,
        max: session.baseGradeMax || preset.max,
      }
    : null;

  const progressSnapshot = loadProgress();

  const baseGradePreset =
    baseGradeFromSession ||
    legacyBaseGrade ||
    (progressSnapshot?.lastLevel ? findPreset(progressSnapshot.lastLevel) : null) ||
    (preset.id.startsWith('grade-') ? preset : fallbackPreset);

  const activeTheme =
    themeFromSession || (!preset.id.startsWith('grade-') ? preset : null);

  const calculationType = session?.calculationType?.id
    ? {
        id: session.calculationType.id,
        label: session.calculationType.label,
        description: session.calculationType.description,
        mode: session.calculationType.mode,
      }
    : null;

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
        baseGrade: baseGradePreset
          ? {
              id: baseGradePreset.id,
              label: baseGradePreset.label,
              description: baseGradePreset.description,
              mode: baseGradePreset.mode,
              max: baseGradePreset.max,
            }
          : null,
        theme:
          activeTheme && activeTheme.id !== baseGradePreset?.id
            ? {
                id: activeTheme.id,
                label: activeTheme.label,
                description: activeTheme.description,
              }
            : null,
        calculationType,
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
    baseGrade: baseGradePreset,
    theme:
      activeTheme && (!baseGradePreset || activeTheme.id !== baseGradePreset.id)
        ? activeTheme
        : null,
    calculationType,
    questionCount: (() => {
      const sessionCount = Number(activeSession.questionCount);
      const fallbackCount = loadQuestionCount();
      return sessionCount || fallbackCount;
    })(),
    soundEnabled:
      typeof activeSession.soundEnabled === 'boolean'
        ? activeSession.soundEnabled
        : loadBoolean(SOUND_STORAGE_KEY, true),
    workingEnabled:
      typeof activeSession.workingEnabled === 'boolean'
        ? activeSession.workingEnabled
        : loadBoolean(WORKING_STORAGE_KEY, true),
    progress: progressSnapshot,
    sessionActive: false,
    sessionAnswered: 0,
    sessionCorrect: 0,
    currentQuestion: null,
    answerBuffer: '',
    awaitingAdvance: false,
  };

  state.questionCount = Math.max(1, Math.min(100, state.questionCount));

  const determineModeLabel = (mode) => {
    switch (mode) {
      case 'add':
        return 'たし算';
      case 'sub':
        return 'ひき算';
      case 'mul':
        return 'かけ算';
      case 'div':
        return 'わり算';
      case 'mix':
        return 'ミックス';
      default:
        return '算数ミッション';
    }
  };

  const updateContextLabel = () => {
    if (!gradeLabelEl || !contextLabelEl) return;

    const baseLabel = state.baseGrade?.label ?? state.grade.label;
    const baseDescription = state.baseGrade?.description ?? state.grade.description ?? '';
    const baseMode = state.baseGrade?.mode ?? state.grade.mode;

    if (state.theme) {
      gradeLabelEl.textContent = baseLabel + ' / ' + state.theme.label;
      contextLabelEl.textContent = state.theme.description ?? baseDescription;
      return;
    }

    const modeLabel = state.calculationType?.label
      ? state.calculationType.label
      : determineModeLabel(state.calculationType?.mode || baseMode);

    gradeLabelEl.textContent = baseLabel + ' / ' + modeLabel;
    contextLabelEl.textContent = state.calculationType?.description ?? baseDescription;
  };

  updateContextLabel();

  const toggleButton = (button, force) => {
    if (!button) return;
    const nextState =
      typeof force === 'boolean'
        ? force
        : button.dataset.state !== 'on';
    button.dataset.state = nextState ? 'on' : 'off';
    if (nextState) {
      button.classList.add('setting-toggle--on');
      button.style.setProperty('background', 'var(--mq-primary-soft)', 'important');
      button.style.setProperty('border-color', 'var(--mq-primary)', 'important');
      button.style.setProperty('box-shadow', '0 10px 24px rgba(15, 23, 42, 0.14)', 'important');
      button.style.setProperty('transform', 'translateY(-1px)', 'important');
    } else {
      button.classList.remove('setting-toggle--on');
      button.style.removeProperty('background');
      button.style.removeProperty('border-color');
      button.style.removeProperty('box-shadow');
      button.style.removeProperty('transform');
    }

    const title = button.querySelector('span:first-child');
    if (title) {
      if (nextState) {
        title.style.setProperty('color', 'var(--mq-primary-strong)', 'important');
      } else {
        title.style.removeProperty('color');
      }
    }
  };

  toggleButton(soundToggle, state.soundEnabled);
  toggleButton(stepsToggle, state.workingEnabled);

  const applyWorkingVisibility = () => {
    if (!workingContainer) return;
    workingContainer.classList.toggle('hidden', !state.workingEnabled);
  };

  const setKeypadEnabled = (enabled) => {
    keypadButtons.forEach((button) => {
      if (!(button instanceof HTMLElement)) return;
      button.classList.toggle('keypad-button--disabled', !enabled);
      button.setAttribute('aria-disabled', enabled ? 'false' : 'true');
      button.tabIndex = enabled ? 0 : -1;
    });
  };

  const setSubmitButtonEnabled = (enabled) => {
    if (submitBtn) {
      submitBtn.classList.toggle('keypad-button--disabled', !enabled);
      submitBtn.setAttribute('aria-disabled', enabled ? 'false' : 'true');
      submitBtn.tabIndex = enabled ? 0 : -1;
    }
  };

  const updateSubmitButtonText = (isAdvancing) => {
    if (submitBtn) {
      submitBtn.textContent = isAdvancing ? 'つぎの問題' : 'こたえる';
    }
  };

  const setKeypadSubmitButtonState = (enabled, isAdvancing) => {
    if (!keypadSubmitButton) return;
    keypadSubmitButton.classList.toggle('keypad-button--disabled', !enabled);
    keypadSubmitButton.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    keypadSubmitButton.tabIndex = enabled ? 0 : -1;
    keypadSubmitButton.textContent = isAdvancing ? '→' : '=';
  };

  const setSkipButtonEnabled = (enabled) => {
    if (!skipBtn) return;
    skipBtn.classList.toggle('keypad-button--disabled', !enabled);
    skipBtn.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    skipBtn.tabIndex = enabled ? 0 : -1;
  };

  const hasWorkingSteps = (question) => {
    // すべての問題で途中式を表示可能にする
    return question && question.a !== undefined && question.b !== undefined;
  };

  const setStepsToggleEnabled = (enabled) => {
    if (!stepsToggle) return;
    if (enabled) {
      stepsToggle.removeAttribute('disabled');
      stepsToggle.style.removeProperty('opacity');
      stepsToggle.style.removeProperty('cursor');
    } else {
      stepsToggle.setAttribute('disabled', 'true');
      stepsToggle.style.setProperty('opacity', '0.5', 'important');
      stepsToggle.style.setProperty('cursor', 'not-allowed', 'important');
    }
  };

  const refreshKeypadState = () => {
    const shouldEnable = state.sessionActive && !state.awaitingAdvance;
    setKeypadEnabled(shouldEnable);
  };

  const refreshSubmitButtonState = () => {
    const hasInput = state.answerBuffer.length > 0;
    const isWaiting = state.awaitingAdvance;

    // 待機状態では「つぎの問題」、通常は「こたえる」
    updateSubmitButtonText(isWaiting);

    // 待機状態ではテキストボタンは常に有効、通常は入力がある場合のみ有効
    const shouldEnableSubmit = state.sessionActive && (isWaiting || hasInput);
    setSubmitButtonEnabled(shouldEnableSubmit);

    // キーパッドの = ボタンは待機状態では有効、通常は入力がある場合のみ有効
    const shouldEnableKeypad = state.sessionActive && (isWaiting || hasInput);
    setKeypadSubmitButtonState(shouldEnableKeypad, isWaiting);
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

  let isUpdatingAnswerBuffer = false;
  const setAnswerBuffer = (value) => {
    isUpdatingAnswerBuffer = true;
    state.answerBuffer = value;
    if (answerInput) answerInput.value = value;
    if (answerDisplay) answerDisplay.textContent = value || '？';
    refreshSubmitButtonState();
    isUpdatingAnswerBuffer = false;
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
      feedbackEl.style.opacity = '0';
    }
  };

  let feedbackTimer = null;
  const showFeedback = (variant, message) => {
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    feedbackEl.dataset.variant = variant;
    feedbackEl.style.transition = 'opacity 1s ease-out';
    feedbackEl.style.opacity = '1';
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(() => {
      feedbackEl.style.opacity = '0';
    }, 5000);
  };

  const renderQuestionExpression = (question) => {
    if (!questionEl) return;
    // expressionがある場合はそれを使用、なければa op bを構築
    const expression = question.expression
      ? question.expression
      : String(question.a) + ' ' + question.op + ' ' + String(question.b);
    questionEl.textContent = expression + ' = ?';
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
    if (!hasWorkingSteps(question)) {
      workingSteps.innerHTML = '';
      workingEmpty.classList.remove('hidden');
      return;
    }
    workingEmpty.classList.add('hidden');
    workingSteps.innerHTML = '';

    // 段階的な計算過程を表示
    const container = document.createElement('div');
    container.className = 'space-y-6 py-4';

    let currentSum = question.a;

    // 数値を右寄せ表示する関数（小数・負の数対応）
    const formatNumber = (num) => {
      const str = String(num);
      return str.padStart(10, ' ');
    };

    // 最初の計算: a + b
    const step1 = document.createElement('div');
    step1.className = 'space-y-2';

    const calc1 = document.createElement('div');
    calc1.className = 'flex flex-col items-end gap-1 font-mono';

    const num1 = document.createElement('div');
    num1.className = 'text-xl font-bold';
    num1.textContent = formatNumber(question.a);
    calc1.appendChild(num1);

    const num2 = document.createElement('div');
    num2.className = 'text-xl font-bold';
    num2.textContent = question.op + ' ' + formatNumber(question.b).trimStart();
    calc1.appendChild(num2);

    const div1 = document.createElement('div');
    div1.className = 'w-40 border-t-2 border-[var(--mq-primary)] my-1';
    calc1.appendChild(div1);

    currentSum = question.op === '+' ? currentSum + question.b :
                 question.op === '-' ? currentSum - question.b :
                 question.op === '×' ? currentSum * question.b :
                 question.op === '÷' ? currentSum / question.b : currentSum;

    const ans1 = document.createElement('div');
    ans1.className = 'text-xl font-bold text-[var(--mq-primary-strong)]';
    ans1.textContent = formatNumber(currentSum);
    calc1.appendChild(ans1);

    step1.appendChild(calc1);

    // 説明文（計算過程の説明を含む）
    const explain1 = document.createElement('div');
    explain1.className = 'text-sm text-[#5e718a] space-y-1';

    // 足し算の説明を追加
    if (question.op === '+' && (question.a >= 10 || question.b >= 10)) {
      const ones1 = question.a % 10;
      const tens1 = Math.floor(question.a / 10);
      const ones2 = question.b % 10;
      const tens2 = Math.floor(question.b / 10);
      const onesSum = ones1 + ones2;
      const carry = Math.floor(onesSum / 10);

      const detailDiv = document.createElement('div');
      detailDiv.className = 'text-xs text-[#6c7c90] bg-[var(--mq-primary-soft)] rounded-lg px-3 py-2';

      if (carry > 0) {
        const onesResult = onesSum % 10;
        const tensSum = tens1 + tens2 + carry;

        detailDiv.innerHTML =
          '<div class="font-semibold mb-1">💡 くりあがりの説明:</div>' +
          '<div>① 一のくらい: ' + ones1 + ' + ' + ones2 + ' = ' + onesSum +
          ' → ' + onesResult + ' で ' + carry + ' くりあがる</div>' +
          '<div>② 十のくらい: ' + tens1 + ' + ' + tens2 +
          ' + ' + carry + '(くりあがり) = ' + tensSum + '</div>' +
          '<div class="mt-1 font-semibold">答え: ' + tensSum + onesResult + '</div>';
      } else {
        const onesResult = ones1 + ones2;
        const tensResult = tens1 + tens2;

        detailDiv.innerHTML =
          '<div class="font-semibold mb-1">💡 たし算の説明:</div>' +
          '<div>① 一のくらい: ' + ones1 + ' + ' + ones2 + ' = ' + onesResult + '</div>' +
          '<div>② 十のくらい: ' + tens1 + ' + ' + tens2 + ' = ' + tensResult + '</div>' +
          '<div class="mt-1 font-semibold">答え: ' + tensResult + onesResult + '</div>';
      }

      explain1.appendChild(detailDiv);
    }

    // 引き算の説明を追加
    if (question.op === '-' && (question.a >= 10 || question.b >= 10)) {
      const ones1 = question.a % 10;
      const tens1 = Math.floor(question.a / 10);
      const ones2 = question.b % 10;
      const tens2 = Math.floor(question.b / 10);
      const needsBorrow = ones1 < ones2;

      const detailDiv = document.createElement('div');
      detailDiv.className = 'text-xs text-[#6c7c90] bg-[var(--mq-primary-soft)] rounded-lg px-3 py-2';

      if (needsBorrow) {
        const borrowedOnes = ones1 + 10;
        const onesResult = borrowedOnes - ones2;
        const tensResult = tens1 - 1 - tens2;

        detailDiv.innerHTML =
          '<div class="font-semibold mb-1">💡 くりさがりの説明:</div>' +
          '<div>① 一のくらい: ' + ones1 + ' では ' + ones2 + ' をひけないので、十のくらいから 10 をかりる</div>' +
          '<div>② 一のくらい: ' + borrowedOnes + ' - ' + ones2 + ' = ' + onesResult + '</div>' +
          '<div>③ 十のくらい: ' + tens1 + ' - 1(かりた分) - ' + tens2 + ' = ' + tensResult + '</div>' +
          '<div class="mt-1 font-semibold">答え: ' + tensResult + onesResult + '</div>';
      } else {
        const onesResult = ones1 - ones2;
        const tensResult = tens1 - tens2;

        detailDiv.innerHTML =
          '<div class="font-semibold mb-1">💡 ひき算の説明:</div>' +
          '<div>① 一のくらい: ' + ones1 + ' - ' + ones2 + ' = ' + onesResult + '</div>' +
          '<div>② 十のくらい: ' + tens1 + ' - ' + tens2 + ' = ' + tensResult + '</div>' +
          '<div class="mt-1 font-semibold">答え: ' + tensResult + onesResult + '</div>';
      }

      explain1.appendChild(detailDiv);
    }

    // かけ算の説明を追加
    if (question.op === '×' && (question.a >= 10 || question.b >= 10)) {
      const detailDiv = document.createElement('div');
      detailDiv.className = 'text-xs text-[#6c7c90] bg-[var(--mq-primary-soft)] rounded-lg px-3 py-2';

      // 筆算形式の説明を生成
      const bStr = String(question.b);
      const steps = [];
      let stepResults = [];

      // 各桁ごとの掛け算を計算
      for (let i = bStr.length - 1; i >= 0; i--) {
        const digit = Number(bStr[i]);
        const place = bStr.length - 1 - i;
        const multiplier = digit * Math.pow(10, place);
        const result = question.a * digit * Math.pow(10, place);

        if (digit !== 0) {
          steps.push({
            digit,
            place,
            multiplier,
            result,
            displayResult: question.a * digit
          });
          stepResults.push(result);
        }
      }

      let html = '<div class="font-semibold mb-1">💡 かけ算の説明:</div>';

      // 各桁の計算を説明
      steps.forEach((step, index) => {
        const placeName = step.place === 0 ? '一のくらい' :
                         step.place === 1 ? '十のくらい' :
                         step.place === 2 ? '百のくらい' : step.place + '桁目';
        html += '<div>① ' + placeName + ': ' + question.a + ' × ' + step.digit;
        if (step.place > 0) {
          html += ' (×' + Math.pow(10, step.place) + ')';
        }
        html += ' = ' + step.result + '</div>';
      });

      // 足し算の説明
      if (steps.length > 1) {
        html += '<div>② 各結果を足す: ' + stepResults.join(' + ') + ' = ' + currentSum + '</div>';
      }

      html += '<div class="mt-1 font-semibold">答え: ' + currentSum + '</div>';

      detailDiv.innerHTML = html;
      explain1.appendChild(detailDiv);
    }

    // わり算の説明を追加
    if (question.op === '÷' && (question.a >= 10 || question.b >= 10)) {
      const detailDiv = document.createElement('div');
      detailDiv.className = 'text-xs text-[#6c7c90] bg-[var(--mq-primary-soft)] rounded-lg px-3 py-2';

      detailDiv.innerHTML =
        '<div class="font-semibold mb-1">💡 わり算の説明:</div>' +
        '<div>' + question.a + ' を ' + question.b + ' で割ります</div>' +
        '<div class="mt-1 font-semibold">答え: ' + currentSum + '</div>';

      explain1.appendChild(detailDiv);
    }

    const simpleExplain1 = document.createElement('div');
    simpleExplain1.className = 'text-center';
    simpleExplain1.textContent = question.a + ' ' + question.op + ' ' + question.b + ' = ' + currentSum;
    explain1.appendChild(simpleExplain1);

    step1.appendChild(explain1);

    container.appendChild(step1);

    // extras の各計算を順番に追加
    if (Array.isArray(question.extras)) {
      question.extras.forEach((extra, index) => {
        if (extra && typeof extra === 'object' && extra.op && typeof extra.value !== 'undefined') {
          const prevSum = currentSum;

          const stepDiv = document.createElement('div');
          stepDiv.className = 'space-y-2';

          const calcDiv = document.createElement('div');
          calcDiv.className = 'flex flex-col items-end gap-1 font-mono';

          const prevNum = document.createElement('div');
          prevNum.className = 'text-xl font-bold';
          prevNum.textContent = formatNumber(prevSum);
          calcDiv.appendChild(prevNum);

          const extraNum = document.createElement('div');
          extraNum.className = 'text-xl font-bold';
          extraNum.textContent = extra.op + ' ' + formatNumber(extra.value).trimStart();
          calcDiv.appendChild(extraNum);

          const divider = document.createElement('div');
          divider.className = 'w-40 border-t-2 border-[var(--mq-primary)] my-1';
          calcDiv.appendChild(divider);

          currentSum = extra.op === '+' ? currentSum + extra.value :
                       extra.op === '-' ? currentSum - extra.value :
                       extra.op === '×' ? currentSum * extra.value :
                       extra.op === '÷' ? currentSum / extra.value : currentSum;

          const stepAns = document.createElement('div');
          stepAns.className = 'text-xl font-bold text-[var(--mq-primary-strong)]';
          stepAns.textContent = formatNumber(currentSum);
          calcDiv.appendChild(stepAns);

          stepDiv.appendChild(calcDiv);

          // 説明文（計算過程の説明を含む）
          const explain = document.createElement('div');
          explain.className = 'text-sm text-[#5e718a] space-y-1';

          // 足し算の説明を追加
          if (extra.op === '+' && (prevSum >= 10 || extra.value >= 10)) {
            const ones1 = prevSum % 10;
            const tens1 = Math.floor(prevSum / 10);
            const ones2 = extra.value % 10;
            const tens2 = Math.floor(extra.value / 10);
            const onesSum = ones1 + ones2;
            const carry = Math.floor(onesSum / 10);

            const detailDiv = document.createElement('div');
            detailDiv.className = 'text-xs text-[#6c7c90] bg-[var(--mq-primary-soft)] rounded-lg px-3 py-2';

            if (carry > 0) {
              const onesResult = onesSum % 10;
              const tensSum = tens1 + tens2 + carry;

              detailDiv.innerHTML =
                '<div class="font-semibold mb-1">💡 くりあがりの説明:</div>' +
                '<div>① 一のくらい: ' + ones1 + ' + ' + ones2 + ' = ' + onesSum +
                ' → ' + onesResult + ' で ' + carry + ' くりあがる</div>' +
                '<div>② 十のくらい: ' + tens1 + ' + ' + tens2 +
                ' + ' + carry + '(くりあがり) = ' + tensSum + '</div>' +
                '<div class="mt-1 font-semibold">答え: ' + tensSum + onesResult + '</div>';
            } else {
              const onesResult = ones1 + ones2;
              const tensResult = tens1 + tens2;

              detailDiv.innerHTML =
                '<div class="font-semibold mb-1">💡 たし算の説明:</div>' +
                '<div>① 一のくらい: ' + ones1 + ' + ' + ones2 + ' = ' + onesResult + '</div>' +
                '<div>② 十のくらい: ' + tens1 + ' + ' + tens2 + ' = ' + tensResult + '</div>' +
                '<div class="mt-1 font-semibold">答え: ' + tensResult + onesResult + '</div>';
            }

            explain.appendChild(detailDiv);
          }

          // 引き算の説明を追加
          if (extra.op === '-' && (prevSum >= 10 || extra.value >= 10)) {
            const ones1 = prevSum % 10;
            const tens1 = Math.floor(prevSum / 10);
            const ones2 = extra.value % 10;
            const tens2 = Math.floor(extra.value / 10);
            const needsBorrow = ones1 < ones2;

            const detailDiv = document.createElement('div');
            detailDiv.className = 'text-xs text-[#6c7c90] bg-[var(--mq-primary-soft)] rounded-lg px-3 py-2';

            if (needsBorrow) {
              const borrowedOnes = ones1 + 10;
              const onesResult = borrowedOnes - ones2;
              const tensResult = tens1 - 1 - tens2;

              detailDiv.innerHTML =
                '<div class="font-semibold mb-1">💡 くりさがりの説明:</div>' +
                '<div>① 一のくらい: ' + ones1 + ' では ' + ones2 + ' をひけないので、十のくらいから 10 をかりる</div>' +
                '<div>② 一のくらい: ' + borrowedOnes + ' - ' + ones2 + ' = ' + onesResult + '</div>' +
                '<div>③ 十のくらい: ' + tens1 + ' - 1(かりた分) - ' + tens2 + ' = ' + tensResult + '</div>' +
                '<div class="mt-1 font-semibold">答え: ' + tensResult + onesResult + '</div>';
            } else {
              const onesResult = ones1 - ones2;
              const tensResult = tens1 - tens2;

              detailDiv.innerHTML =
                '<div class="font-semibold mb-1">💡 ひき算の説明:</div>' +
                '<div>① 一のくらい: ' + ones1 + ' - ' + ones2 + ' = ' + onesResult + '</div>' +
                '<div>② 十のくらい: ' + tens1 + ' - ' + tens2 + ' = ' + tensResult + '</div>' +
                '<div class="mt-1 font-semibold">答え: ' + tensResult + onesResult + '</div>';
            }

            explain.appendChild(detailDiv);
          }

          // かけ算の説明を追加
          if (extra.op === '×' && (prevSum >= 10 || extra.value >= 10)) {
            const detailDiv = document.createElement('div');
            detailDiv.className = 'text-xs text-[#6c7c90] bg-[var(--mq-primary-soft)] rounded-lg px-3 py-2';

            detailDiv.innerHTML =
              '<div class="font-semibold mb-1">💡 かけ算の説明:</div>' +
              '<div>' + prevSum + ' × ' + extra.value + ' = ' + currentSum + '</div>' +
              '<div class="mt-1 font-semibold">答え: ' + currentSum + '</div>';

            explain.appendChild(detailDiv);
          }

          // わり算の説明を追加
          if (extra.op === '÷' && (prevSum >= 10 || extra.value >= 10)) {
            const detailDiv = document.createElement('div');
            detailDiv.className = 'text-xs text-[#6c7c90] bg-[var(--mq-primary-soft)] rounded-lg px-3 py-2';

            detailDiv.innerHTML =
              '<div class="font-semibold mb-1">💡 わり算の説明:</div>' +
              '<div>' + prevSum + ' を ' + extra.value + ' で割ります</div>' +
              '<div class="mt-1 font-semibold">答え: ' + currentSum + '</div>';

            explain.appendChild(detailDiv);
          }

          const simpleExplain = document.createElement('div');
          simpleExplain.className = 'text-center';
          simpleExplain.textContent = prevSum + ' ' + extra.op + ' ' + extra.value + ' = ' + currentSum;
          explain.appendChild(simpleExplain);

          stepDiv.appendChild(explain);

          container.appendChild(stepDiv);
        }
      });
    }

    workingSteps.appendChild(container);
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
      baseGrade: state.baseGrade
        ? {
            id: state.baseGrade.id,
            label: state.baseGrade.label,
            description: state.baseGrade.description,
            mode: state.baseGrade.mode,
            max: state.baseGrade.max,
          }
        : null,
      theme: state.theme
        ? {
            id: state.theme.id,
            label: state.theme.label,
            description: state.theme.description,
          }
        : null,
      calculationType: state.calculationType
        ? {
            id: state.calculationType.id,
            label: state.calculationType.label,
            description: state.calculationType.description,
            mode: state.calculationType.mode,
          }
        : null,
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
    refreshKeypadState();
    refreshSubmitButtonState();
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
      if (qIndexEl) qIndexEl.textContent = String(state.sessionAnswered + 1);

      // すべての問題で途中式トグルを有効化
      setStepsToggleEnabled(true);
    } catch (e) {
      console.error(e);
      showFeedback('error', '問題の取得に失敗しました。しばらくしてから再度お試しください。');
    }
  };

  const finishSession = () => {
    state.sessionActive = false;
    state.awaitingAdvance = false;
    refreshKeypadState();
    setSkipButtonEnabled(false);
    if (resultCorrectEl) resultCorrectEl.textContent = String(state.sessionCorrect);
    if (resultTotalEl) resultTotalEl.textContent = String(state.sessionAnswered);
    if (resultActions) {
      resultActions.classList.remove('hidden');
    }
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
        refreshKeypadState();
        refreshSubmitButtonState();
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
    const value = Number(state.answerBuffer);
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
    refreshKeypadState();
    refreshSubmitButtonState();
    setSkipButtonEnabled(true);
    renderProgress();
    renderWorkingSteps(null);
    hideFeedback();
    if (resultActions) resultActions.classList.add('hidden');
    updatePreferences();
    updateSessionStorage();
    await nextQuestion();
  };

  const restartWithCountdown = async () => {
    refreshKeypadState();
    await runCountdown();
    await startSession();
  };

  refreshKeypadState();
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

  if (endResultBtn) {
    endResultBtn.addEventListener('click', () => {
      window.location.href = '/start';
    });
  }

  if (answerInput) {
    answerInput.addEventListener('input', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      // setAnswerBuffer()からの更新の場合はスキップ
      if (isUpdatingAnswerBuffer) return;
      // 半角数字、小数点、マイナス記号のみを許可
      let filtered = target.value.replace(/[^0-9.\-]/g, '');
      // マイナスは先頭のみ許可
      if (filtered.indexOf('-') > 0) {
        filtered = filtered.replace(/-/g, '');
      }
      if (target.value !== filtered) {
        target.value = filtered;
      }
      // state.answerBufferと入力欄を同期
      state.answerBuffer = filtered;
      if (answerDisplay) answerDisplay.textContent = filtered || '？';
      refreshSubmitButtonState();
    });

    answerInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
        return;
      }
      // 半角数字、小数点、マイナス、制御キー以外は入力を拒否
      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      const isNumberKey = event.key >= '0' && event.key <= '9';
      const isDecimalPoint = event.key === '.';
      const isMinus = event.key === '-' && answerInput.selectionStart === 0;
      const isAllowedControlKey = allowedKeys.includes(event.key);

      if (!isNumberKey && !isDecimalPoint && !isMinus && !isAllowedControlKey) {
        event.preventDefault();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (!state.sessionActive || state.awaitingAdvance) return;
    // answerInputにフォーカスがある場合は、そちらのイベントハンドラに任せる
    if (document.activeElement === answerInput) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
      return;
    }
    if (event.key === 'Escape') {
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

  keypadButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!state.sessionActive) return;
      const key = button.dataset.key;
      // 待機状態の場合は数字入力等は無効
      if (state.awaitingAdvance) return;

      // cspell:ignore plusminus
      if (key === 'plusminus') {
        // +/-ボタン: 符号を反転
        if (state.answerBuffer.startsWith('-')) {
          setAnswerBuffer(state.answerBuffer.slice(1));
        } else if (state.answerBuffer.length > 0) {
          setAnswerBuffer('-' + state.answerBuffer);
        }
        playSound('keypad');
        return;
      }

      if (key === '.') {
        // 小数点ボタン: 既に小数点がある場合は追加しない
        if (!state.answerBuffer.includes('.')) {
          setAnswerBuffer(state.answerBuffer + '.');
        }
        playSound('keypad');
        return;
      }

      setAnswerBuffer(state.answerBuffer + key);
      playSound('keypad');
    });
  });

  if (keypadSubmitButton) {
    keypadSubmitButton.addEventListener('click', () => {
      if (!state.sessionActive) return;
      // 待機状態でない場合のみ音を鳴らす
      if (!state.awaitingAdvance) {
        playSound('success');
      }
      handleSubmit();
    });
  }

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
      // 無効化されている場合はクリックを無視
      if (stepsToggle.hasAttribute('disabled')) return;

      state.workingEnabled = !state.workingEnabled;
      toggleButton(stepsToggle, state.workingEnabled);
      applyWorkingVisibility();
      updatePreferences();
      updateSessionStorage();
    });
  }

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
