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
  const gradeRadios = Array.from(
    document.querySelectorAll('input[name="grade-selection"]')
  );
  const themeButtons = Array.from(
    document.querySelectorAll('#theme-grid button')
  );
  const selectedGradeLabel = document.getElementById('selected-grade-label');
  const questionCountRadios = Array.from(
    document.querySelectorAll('input[name="question-count"]')
  );
  const soundToggle = document.getElementById('toggle-sound');
  const stepsToggle = document.getElementById('toggle-steps');
  const focusToggle = document.getElementById('toggle-focus');
  const startButton = document.getElementById('start-session');

  if (!startButton || !gradeRadios.length) {
    return;
  }

  const defaultGradeValue = gradeRadios[0]?.value || null;

  const defaultProgress = () => ({
    totalAnswered: 0,
    totalCorrect: 0,
    streak: 0,
    lastAnsweredAt: null,
    lastGrade: defaultGradeValue,
    lastLevel: defaultGradeValue,
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

  const findPreset = (id) => presets.find((p) => p.id === id);
  const gradeIdExists = (id) =>
    gradeRadios.some((radio) => radio.value === id);
  const themeIdExists = (id) =>
    themeButtons.some((button) => button.dataset.gradeId === id);

  const ensureGradeSelection = () => {
    const checked = gradeRadios.find((radio) => radio.checked);
    if (checked) {
      return checked.value;
    }
    if (gradeRadios[0]) {
      gradeRadios[0].checked = true;
      return gradeRadios[0].value;
    }
    return null;
  };

  const applyGradeRadio = (gradeId) => {
    let matched = false;
    gradeRadios.forEach((radio) => {
      const isMatch = radio.value === gradeId;
      radio.checked = isMatch;
      if (isMatch) {
        matched = true;
      }
    });
    if (!matched) {
      return ensureGradeSelection();
    }
    return gradeId;
  };

  const updateThemeButtonAppearance = (button, isActive) => {
    if (!button) return;
    button.dataset.selected = isActive ? 'true' : 'false';
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  };

  const progress = loadProgress();

  let selectedGradeId =
    progress.lastGrade && findPreset(progress.lastGrade)
      ? progress.lastGrade
      : defaultGradeValue;

  const fallbackGradeId =
    progress.lastLevel && gradeIdExists(progress.lastLevel)
      ? progress.lastLevel
      : ensureGradeSelection();

  if (fallbackGradeId) {
    applyGradeRadio(fallbackGradeId);
    progress.lastLevel = fallbackGradeId;
  }

  let activeThemeId = null;

  const updateSelectedLabel = (presetId) => {
    const preset = findPreset(presetId);
    if (preset && selectedGradeLabel) {
      selectedGradeLabel.textContent =
        preset.label + '：' + preset.description;
    }
  };

  const setSelectedPreset = (presetId) => {
    if (!presetId) return;
    selectedGradeId = presetId;
    updateSelectedLabel(presetId);
  };

  const setThemeSelection = (themeId) => {
    activeThemeId = themeId;
    themeButtons.forEach((button) => {
      const isActive = button.dataset.gradeId === themeId;
      updateThemeButtonAppearance(button, isActive);
    });
  };

  if (selectedGradeId && themeIdExists(selectedGradeId)) {
    setThemeSelection(selectedGradeId);
  } else {
    setThemeSelection(null);
    const gradeToUse = selectedGradeId && gradeIdExists(selectedGradeId)
      ? selectedGradeId
      : fallbackGradeId;
    if (gradeToUse) {
      selectedGradeId = gradeToUse;
      applyGradeRadio(gradeToUse);
    }
  }

  if (!selectedGradeId && presets[0]) {
    selectedGradeId = presets[0].id;
    applyGradeRadio(selectedGradeId);
  }

  setSelectedPreset(selectedGradeId);

  const toggleButton = (button, force) => {
    if (!button) return;
    const nextState =
      typeof force === 'boolean'
        ? force
        : button.dataset.state !== 'on';
    button.dataset.state = nextState ? 'on' : 'off';
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
      if (
        Number.isFinite(value) &&
        questionCountRadios.some((r) => Number(r.value) === value)
      ) {
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

  applyQuestionCount(loadQuestionCount());
  toggleButton(soundToggle, loadBoolean(SOUND_STORAGE_KEY, true));
  toggleButton(stepsToggle, loadBoolean(WORKING_STORAGE_KEY, true));
  toggleButton(focusToggle, loadBoolean(FOCUS_STORAGE_KEY, false));

  gradeRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      setThemeSelection(null);
      setSelectedPreset(radio.value);
      progress.lastLevel = radio.value;
    });
  });

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const themeId = button.dataset.gradeId;
      if (!themeId) return;

      if (activeThemeId === themeId) {
        setThemeSelection(null);
        const currentGradeId = ensureGradeSelection();
        if (currentGradeId) {
          setSelectedPreset(currentGradeId);
          progress.lastLevel = currentGradeId;
        }
        return;
      }

      setThemeSelection(themeId);
      setSelectedPreset(themeId);
      progress.lastLevel = ensureGradeSelection();
    });
  });

  [soundToggle, stepsToggle, focusToggle].forEach((button) => {
    if (!button) return;
    button.addEventListener('click', () => toggleButton(button));
  });

  startButton.addEventListener('click', () => {
    if (!selectedGradeId) {
      const ensured = ensureGradeSelection();
      if (ensured && findPreset(ensured)) {
        selectedGradeId = ensured;
      } else if (presets[0]) {
        selectedGradeId = presets[0].id;
      }
    }

    const grade = findPreset(selectedGradeId) || presets[0];
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

    progress.lastLevel = ensureGradeSelection();
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
