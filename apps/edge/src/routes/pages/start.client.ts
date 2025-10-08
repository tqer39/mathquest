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

  // 学年の順序を取得する関数（比較用）
  const getGradeOrder = (gradeId) => {
    const index = gradeLevels.findIndex((g) => g.id === gradeId);
    return index === -1 ? 0 : index;
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
      const card = label.querySelector('.calc-type-card');

      // カードクリックで選択/解除を切り替え
      card.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (radio.checked) {
          // 既に選択されている場合は選択を解除
          radio.checked = false;
          filterThemesByCalculationType(null);
          updateStartButtonState();
        } else {
          // 選択されていない場合は選択
          radio.checked = true;
          radio.dispatchEvent(new Event('change'));
        }
      });

      radio.addEventListener('change', () => {
        if (radio.checked) {
          filterThemesByCalculationType(calcType.mode);
          // 計算種類選択後にボタンの状態を更新
          updateStartButtonState();
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
    // テーマ選択状態変更後にボタンの状態を更新
    updateStartButtonState();
  };

  const filterThemesByCalculationType = (calculationMode) => {
    // 現在選択されている学年を取得
    const currentGrade = gradeRadios.find((radio) => radio.checked)?.value;
    const currentGradeOrder = currentGrade ? getGradeOrder(currentGrade) : 0;

    themeButtons.forEach((button) => {
      const themeMode = button.dataset.mode;
      const themeMinGrade = button.dataset.minGrade;

      // 計算種類でフィルタリング
      const matchesCalculationType = !calculationMode || themeMode === calculationMode;

      // 学年でフィルタリング（テーマの最低学年要件をチェック）
      const themeMinGradeOrder = themeMinGrade ? getGradeOrder(themeMinGrade) : 0;
      const matchesGradeRequirement = currentGradeOrder >= themeMinGradeOrder;

      const shouldShow = matchesCalculationType && matchesGradeRequirement;

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
    // 状態変更後にボタンの状態を更新
    updateStartButtonState();
  };

  const updateStartButtonState = () => {
    if (!startButton) return;

    // 計算種類が選択されているかチェック
    const calculationTypeSelected = document.querySelector('input[name="calculation-type-selection"]:checked');

    // テーマが選択されているかチェック
    const themeSelected = activeThemeId !== null;

    // 計算種類またはテーマが選択されている場合のみボタンを有効にする
    const shouldEnable = calculationTypeSelected || themeSelected;

    startButton.disabled = !shouldEnable;

    if (shouldEnable) {
      startButton.classList.remove('opacity-50', 'cursor-not-allowed');
      startButton.classList.add('hover:-translate-y-0.5', 'hover:bg-[var(--mq-primary-strong)]');
    } else {
      startButton.classList.add('opacity-50', 'cursor-not-allowed');
      startButton.classList.remove('hover:-translate-y-0.5', 'hover:bg-[var(--mq-primary-strong)]');
    }
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

  // 初期表示で小1の計算種類を表示（未選択状態）
  renderCalculationTypes('grade-1', false);

  // 計算種類が未選択なので全テーマを表示
  filterThemesByCalculationType(null);

  // 初期状態でボタンの状態を更新
  updateStartButtonState();

  const resetToInitialState = () => {
    // 学年選択を小1に戻す
    if (gradeRadios.length > 0) {
      gradeRadios.forEach((radio, index) => {
        radio.checked = index === 0;
      });
      selectedGradeId = gradeRadios[0].value;
      setSelectedPreset(selectedGradeId);
    }

    // 計算種類を小1用に戻す（未選択状態）
    renderCalculationTypes('grade-1', false);

    // テーマ選択をクリア
    setThemeSelection(null);

    // 計算種類が未選択なので全テーマを表示
    filterThemesByCalculationType(null);

    // クリア後のボタン状態を更新
    updateStartButtonState();

    // 問題数を10問に戻す
    if (questionCountRadios.length > 0) {
      questionCountRadios.forEach((radio) => {
        radio.checked = Number(radio.value) === 10;
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
    // デフォルトは10問
    return 10;
  };

  const applyQuestionCount = (value) => {
    let matched = false;
    questionCountRadios.forEach((radio) => {
      if (Number(radio.value) === value) {
        radio.checked = true;
        matched = true;
      }
    });
    if (!matched) {
      // 10問オプションを探して選択、見つからなければ最初の選択肢
      const tenQuestionRadio = questionCountRadios.find(radio => Number(radio.value) === 10);
      if (tenQuestionRadio) {
        tenQuestionRadio.checked = true;
      } else if (questionCountRadios[0]) {
        questionCountRadios[0].checked = true;
      }
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

    console.log('Starting session with questionCount:', questionCount);
    console.log('Checked radio value:', questionCountRadios.find((radio) => radio.checked)?.value);

    const selectedCalculationRadio = document.querySelector(
      'input[name="calculation-type-selection"]:checked'
    );
    const selectedCalculationType = selectedCalculationRadio
      ? calculationTypes.find((calc) => calc.id === selectedCalculationRadio.value)
      : null;

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
    const baseGradePreset =
      findPreset(currentGradeId) ||
      (progress.lastLevel ? findPreset(progress.lastLevel) : null) ||
      (gradeLevels.find((level) => level.id === currentGradeId) ?? gradeLevels[0]) ||
      null;
    const isThemeSelected = activeThemeId !== null;
    const themePreset = isThemeSelected ? grade : null;

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
      baseGradeId: baseGradePreset?.id || currentGradeId,
      baseGradeLabel: baseGradePreset?.label || '',
      baseGradeDescription: baseGradePreset?.description || '',
      baseGradeMode: baseGradePreset?.mode || '',
      baseGradeMax: baseGradePreset?.max ?? null,
      baseGrade: baseGradePreset
        ? {
            id: baseGradePreset.id,
            label: baseGradePreset.label,
            description: baseGradePreset.description,
            mode: baseGradePreset.mode,
            max: baseGradePreset.max,
          }
        : null,
      theme: themePreset
        ? {
            id: themePreset.id,
            label: themePreset.label,
            description: themePreset.description,
          }
        : null,
      calculationType: selectedCalculationType
        ? {
            id: selectedCalculationType.id,
            label: selectedCalculationType.label,
            description: selectedCalculationType.description,
            mode: selectedCalculationType.mode,
          }
        : null,
    };

    try {
      // 既存のセッションをクリアして新しいセッションを確実に保存
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      console.log('Session saved:', session);
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
      // 学年変更後のボタン状態を更新
      updateStartButtonState();
    });
  });
  }
})();
`;

export const renderStartClientScript = (
  presets: readonly GradePreset[],
  calculationTypes: unknown,
  gradeLevels: unknown
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
