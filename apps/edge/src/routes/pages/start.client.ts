import { html, raw } from 'hono/html';
import type { GradePreset } from './grade-presets';

const MODULE_SOURCE = `
(() => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStartPage);
  } else {
    initializeStartPage();
  }

  function initializeStartPage() {
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

  const presets = getJSON('grade-presets');
  const calculationTypes = getJSON('calculation-types');
  const gradeLevels = getJSON('grade-levels');

  // 学年ごとの利用可能な計算種類
  const gradeCalculationTypes = {
    'grade-1': ['calc-add', 'calc-sub'],
    'grade-2': ['calc-add', 'calc-sub'],
    'grade-3': ['calc-add', 'calc-sub', 'calc-mul'],
    'grade-4': ['calc-add', 'calc-sub', 'calc-mul', 'calc-div'],
    'grade-5': ['calc-add', 'calc-sub', 'calc-mul', 'calc-div', 'calc-mix'],
    'grade-6': ['calc-add', 'calc-sub', 'calc-mul', 'calc-div', 'calc-mix'],
  };
  const gradeRadios = Array.from(
    document.querySelectorAll('input[name="grade-selection"]')
  );
  const themeButtons = Array.from(
    document.querySelectorAll('#theme-grid button')
  );
  const selectedGradeLabel = document.getElementById('selected-grade-label');
  const calculationTypeGrid = document.getElementById('calculation-type-grid');
  const questionCountRadios = Array.from(
    document.querySelectorAll('input[name="question-count"]')
  );
  const soundToggle = document.getElementById('toggle-sound');
  const stepsToggle = document.getElementById('toggle-steps');
  const startButton = document.getElementById('start-session');
  const clearButton = document.getElementById('clear-selections');

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
    if (isActive) {
      button.classList.add('theme-card--selected');
      button.style.setProperty('background', 'var(--mq-primary-soft)', 'important');
      button.style.setProperty('border-color', 'var(--mq-primary)', 'important');
      button.style.setProperty(
        'box-shadow',
        '0 12px 28px rgba(15, 23, 42, 0.16)',
        'important'
      );
      button.style.setProperty('transform', 'translateY(-2px)', 'important');
    } else {
      button.classList.remove('theme-card--selected');
      button.style.removeProperty('background');
      button.style.removeProperty('border-color');
      button.style.removeProperty('box-shadow');
      button.style.removeProperty('transform');
    }

    const title = button.querySelector('[data-role="theme-title"]');
    if (title) {
      if (isActive) {
        title.style.setProperty('color', 'var(--mq-primary-strong)', 'important');
      } else {
        title.style.removeProperty('color');
      }
    }

    const description = button.querySelector('[data-role="theme-description"]');
    if (description) {
      if (isActive) {
        description.style.setProperty('color', 'var(--mq-primary-strong)', 'important');
      } else {
        description.style.removeProperty('color');
      }
    }
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

  const renderCalculationTypes = (gradeId, autoSelect = false) => {
    if (!calculationTypeGrid) return;

    const availableCalcTypes = gradeCalculationTypes[gradeId] || [];
    const availableTypes = calculationTypes.filter(calcType =>
      availableCalcTypes.includes(calcType.id)
    );

    calculationTypeGrid.innerHTML = '';

    availableTypes.forEach((calcType, index) => {
      const label = document.createElement('label');
      label.className = 'group cursor-pointer';
      label.innerHTML = \`
        <input
          type="radio"
          name="calculation-type-selection"
          value="\${calcType.id}"
          data-mode="\${calcType.mode}"
          class="peer sr-only"
          \${autoSelect && index === 0 ? 'checked' : ''}
        />
        <div class="calc-type-card rounded-2xl border border-transparent bg-white p-4 text-left shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-[var(--mq-primary)] group-hover:bg-[var(--mq-primary-soft)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--mq-primary)] peer-checked:border-[var(--mq-primary)] peer-checked:bg-[var(--mq-primary-soft)] peer-checked:shadow-xl">
          <p class="text-sm font-bold text-[var(--mq-primary-strong)]">
            \${calcType.label}
          </p>
          <p class="text-base font-semibold text-[var(--mq-ink)]">
            \${calcType.description}
          </p>
        </div>
      \`;

      const radio = label.querySelector('input[type="radio"]');
      radio.addEventListener('change', () => {
        if (radio.checked) {
          filterThemesByCalculationType(calcType.mode);
        }
      });

      calculationTypeGrid.appendChild(label);
    });
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

  const filterThemesByCalculationType = (calculationMode) => {
    themeButtons.forEach((button) => {
      const themeMode = button.dataset.mode;
      const shouldShow = !calculationMode || themeMode === calculationMode;

      if (shouldShow) {
        button.style.display = '';
      } else {
        button.style.display = 'none';
        // 非表示になったテーマが選択されている場合は選択を解除
        if (activeThemeId === button.dataset.gradeId) {
          setThemeSelection(null);
        }
      }
    });
  };


  // テーマは初期状態では何も選択しない
  setThemeSelection(null);

  const gradeToUse = selectedGradeId && gradeIdExists(selectedGradeId)
    ? selectedGradeId
    : fallbackGradeId;
  if (gradeToUse) {
    selectedGradeId = gradeToUse;
    applyGradeRadio(gradeToUse);
  }

  if (!selectedGradeId && presets[0]) {
    selectedGradeId = presets[0].id;
    applyGradeRadio(selectedGradeId);
  }

  setSelectedPreset(selectedGradeId);

  // 初期表示で小1の計算種類を表示（最初の選択肢を自動選択）
  renderCalculationTypes('grade-1', true);

  // 初期表示時にたし算のテーマに絞る
  filterThemesByCalculationType('add');

  const resetToInitialState = () => {
    // 学年選択を小1に戻す
    if (gradeRadios.length > 0) {
      gradeRadios.forEach((radio, index) => {
        radio.checked = index === 0;
      });
      selectedGradeId = gradeRadios[0].value;
      setSelectedPreset(selectedGradeId);
    }

    // 計算種類を小1用に戻す（最初の選択肢を自動選択）
    renderCalculationTypes('grade-1', true);

    // テーマ選択をクリア
    setThemeSelection(null);

    // たし算のテーマに絞る
    filterThemesByCalculationType('add');

    // 問題数を初期値（最初の選択肢）に戻す
    if (questionCountRadios.length > 0) {
      questionCountRadios.forEach((radio, index) => {
        radio.checked = index === 0;
      });
    }

    // 設定トグルを初期状態に戻す
    toggleButton(soundToggle, false);
    toggleButton(stepsToggle, false);

    // プログレスも初期化
    progress.lastLevel = selectedGradeId;
    progress.lastGrade = selectedGradeId;
  };

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
  toggleButton(soundToggle, loadBoolean(SOUND_STORAGE_KEY, false));
  toggleButton(stepsToggle, loadBoolean(WORKING_STORAGE_KEY, false));

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const themeId = button.dataset.gradeId;
      if (!themeId) return;

      if (activeThemeId === themeId) {
        // 既に選択されているテーマをクリックした場合は選択解除
        setThemeSelection(null);
        const currentGradeId = ensureGradeSelection();
        if (currentGradeId) {
          setSelectedPreset(currentGradeId);
          progress.lastLevel = currentGradeId;
        }
      } else {
        // 新しいテーマを選択
        setThemeSelection(themeId);
        setSelectedPreset(themeId);
        progress.lastLevel = ensureGradeSelection();
      }
    });
  });

  [soundToggle, stepsToggle].forEach((button) => {
    if (!button) return;
    button.addEventListener('click', () => toggleButton(button));
  });

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      resetToInitialState();
    });
  }

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

    try {
      localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
      localStorage.setItem(WORKING_STORAGE_KEY, String(workingEnabled));
      localStorage.setItem(QUESTION_COUNT_STORAGE_KEY, String(questionCount));
    } catch (e) {
      console.warn('failed to persist settings', e);
    }

    progress.lastLevel = ensureGradeSelection();
    progress.lastGrade = grade.id;
    saveProgress(progress);

    const currentGradeId = ensureGradeSelection();
    const currentGrade = findPreset(currentGradeId);
    const isThemeSelected = activeThemeId !== null;

    const session = {
      gradeId: grade.id,
      gradeLabel: grade.label,
      gradeDescription: grade.description,
      mode: grade.mode,
      max: grade.max,
      questionCount,
      soundEnabled,
      workingEnabled,
      createdAt: Date.now(),
      // 学年とテーマの区別情報を追加
      baseGradeId: currentGrade?.id || currentGradeId,
      baseGradeLabel: currentGrade?.label || '',
      isThemeSelected: isThemeSelected,
      themeLabel: isThemeSelected ? grade.label : null,
    };

    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('failed to write session storage', e);
    }

    window.location.href = '/play';
  });

  // 初期化完了後に学年変更イベントリスナーを登録
  gradeRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;

      // 学年を変更したらテーマ選択をクリア
      setThemeSelection(null);
      setSelectedPreset(radio.value);
      progress.lastLevel = radio.value;

      // 計算種類を更新（未選択状態で表示）
      renderCalculationTypes(radio.value);
      // 計算種類が未選択になるのでテーマフィルタリングもリセット
      filterThemesByCalculationType(null);
    });
  });
  }
})();
`;

export const renderStartClientScript = (
  presets: readonly GradePreset[],
  calculationTypes: any,
  gradeLevels: any
) => html`
  <script id="grade-presets" type="application/json">
    ${raw(JSON.stringify(presets))}
  </script>
  <script id="calculation-types" type="application/json">
    ${raw(JSON.stringify(calculationTypes))}
  </script>
  <script id="grade-levels" type="application/json">
    ${raw(JSON.stringify(gradeLevels))}
  </script>
  <script type="module">
    ${raw(MODULE_SOURCE)};
  </script>
`;
