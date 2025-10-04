import { html, raw } from 'hono/html';
import type { GradePreset } from './grade-presets';

const STORAGE_KEY = 'mathquest:progress:v1';
const SOUND_STORAGE_KEY = 'mathquest:sound-enabled';
const WORKING_STORAGE_KEY = 'mathquest:show-working';
const FOCUS_STORAGE_KEY = 'mathquest:focus-mode';
const QUESTION_COUNT_STORAGE_KEY = 'mathquest:question-count-default';
const SESSION_STORAGE_KEY = 'mathquest:pending-session';

const MODULE_SOURCE = `
(() => {
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

  const presets = getJSON('grade-presets');
  const gradeLevelButtons = Array.from(
    document.querySelectorAll('#grade-level-grid button')
  );
  const themeButtons = Array.from(
    document.querySelectorAll('#theme-grid button')
  );
  const gradeButtons = gradeLevelButtons.concat(themeButtons);
  const selectedGradeLabel = document.getElementById('selected-grade-label');
  const questionCountRadios = Array.from(
    document.querySelectorAll('input[name="question-count"]')
  );
  const soundToggle = document.getElementById('toggle-sound');
  const stepsToggle = document.getElementById('toggle-steps');
  const focusToggle = document.getElementById('toggle-focus');
  const startButton = document.getElementById('start-session');

  if (!startButton || !gradeButtons.length) {
    return;
  }

  const defaultProgress = () => ({
    totalAnswered: 0,
    totalCorrect: 0,
    streak: 0,
    lastAnsweredAt: null,
    lastGrade: presets[0] ? presets[0].id : null,
  });

  const loadProgress = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultProgress();
      const parsed = JSON.parse(raw);
      return { ...defaultProgress(), ...parsed };
    } catch (e) {
      console.warn('failed to read progress', e);
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

  const progress = loadProgress();

  let selectedGradeId =
    progress.lastGrade && presets.some((p) => p.id === progress.lastGrade)
      ? progress.lastGrade
      : gradeLevelButtons[0]?.dataset.gradeId || presets[0]?.id;

  const setActiveGrade = (gradeId) => {
    selectedGradeId = gradeId;
    gradeButtons.forEach((button) => {
      const active = button.dataset.gradeId === gradeId;
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      const group = button.dataset.group || 'level';
      if (group === 'level') {
        button.classList.toggle('border-[var(--mq-primary)]', active);
        button.classList.toggle('bg-[var(--mq-primary-soft)]', active);
        button.classList.toggle('shadow-xl', active);
      } else {
        button.classList.toggle('border-[var(--mq-primary)]', active);
        button.classList.toggle('bg-white', active);
        button.classList.toggle('bg-[var(--mq-surface)]', !active);
      }
    });
    const preset = presets.find((p) => p.id === gradeId);
    if (preset && selectedGradeLabel) {
      selectedGradeLabel.textContent = \
        preset.label + '：' + preset.description;
    }
  };

  const toggleButton = (button, force) => {
    if (!button) return;
    const nextState =
      typeof force === 'boolean'
        ? force
        : button.dataset.state !== 'on';
    button.dataset.state = nextState ? 'on' : 'off';
    button.classList.toggle('bg-[var(--mq-primary-soft)]', nextState);
    button.classList.toggle('border-[var(--mq-primary)]', nextState);
  };

  const loadBoolean = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === 'true') return true;
      if (raw === 'false') return false;
    } catch (e) {
      console.warn('failed to read boolean pref', key, e);
    }
    return fallback;
  };

  const loadQuestionCount = () => {
    try {
      const raw = localStorage.getItem(QUESTION_COUNT_STORAGE_KEY);
      const value = Number(raw);
      if (Number.isFinite(value) && questionCountRadios.some((r) => Number(r.value) === value)) {
        return value;
      }
    } catch (e) {
      console.warn('failed to read question count', e);
    }
    return Number(questionCountRadios[0]?.value || 10);
  };

  const applyQuestionCount = (value) => {
    let matched = false;
    questionCountRadios.forEach((radio) => {
      if (Number(radio.value) === value) {
        radio.checked = true;
        matched = true;
      }
    });
    if (!matched && questionCountRadios[0]) {
      questionCountRadios[0].checked = true;
    }
  };

  // 初期化
  if (selectedGradeId) {
    setActiveGrade(selectedGradeId);
  }
  applyQuestionCount(loadQuestionCount());
  toggleButton(soundToggle, loadBoolean(SOUND_STORAGE_KEY, true));
  toggleButton(stepsToggle, loadBoolean(WORKING_STORAGE_KEY, true));
  toggleButton(focusToggle, loadBoolean(FOCUS_STORAGE_KEY, false));

  const attachSelectionHandler = (buttonList) => {
    buttonList.forEach((button) => {
      button.addEventListener('click', () => {
        const gid = button.dataset.gradeId;
        if (gid) {
          setActiveGrade(gid);
        }
      });
    });
  };

  attachSelectionHandler(gradeLevelButtons);
  attachSelectionHandler(themeButtons);

  [soundToggle, stepsToggle, focusToggle].forEach((button) => {
    if (!button) return;
    button.addEventListener('click', () => toggleButton(button));
  });

  startButton.addEventListener('click', () => {
    const grade = presets.find((p) => p.id === selectedGradeId) || presets[0];
    if (!grade) {
      alert('学年の読み込みに失敗しました。ページを再読み込みしてください。');
      return;
    }

    const questionCount = Number(
      questionCountRadios.find((radio) => radio.checked)?.value || 10
    );

    const soundEnabled = soundToggle?.dataset.state !== 'off';
    const workingEnabled = stepsToggle?.dataset.state !== 'off';
    const focusEnabled = focusToggle?.dataset.state === 'on';

    try {
      localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
      localStorage.setItem(WORKING_STORAGE_KEY, String(workingEnabled));
      localStorage.setItem(FOCUS_STORAGE_KEY, String(focusEnabled));
      localStorage.setItem(QUESTION_COUNT_STORAGE_KEY, String(questionCount));
    } catch (e) {
      console.warn('failed to persist settings', e);
    }

    progress.lastGrade = grade.id;
    saveProgress(progress);

    const session = {
      gradeId: grade.id,
      gradeLabel: grade.label,
      gradeDescription: grade.description,
      mode: grade.mode,
      max: grade.max,
      questionCount,
      soundEnabled,
      workingEnabled,
      focusEnabled,
      createdAt: Date.now(),
    };

    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('failed to write session storage', e);
    }

    window.location.href = '/play';
  });
})();
`;

export const renderStartClientScript = (
  presets: readonly GradePreset[]
) => html`
  <script id="grade-presets" type="application/json">
    ${raw(JSON.stringify(presets))}
  </script>
  <script type="module">
    ${raw(MODULE_SOURCE)};
  </script>
`;
