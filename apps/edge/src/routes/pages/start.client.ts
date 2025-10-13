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

    // 状態管理
    const state = {
      selectedGrade: null,
      selectedActivity: null, // 'math' or 'game'
      selectedCalculationType: null,
      selectedTheme: null,
      selectedGame: null,
    };

    // DOM要素
    const step1Grade = document.getElementById('step-1-grade');
    const step2Activity = document.getElementById('step-2-activity');
    const step3CalcType = document.getElementById('step-3-calc-type');
    const step4Theme = document.getElementById('step-4-theme');
    const step4Game = document.getElementById('step-4-game');

    const gradeBtns = document.querySelectorAll('.grade-btn');
    const activityBtns = document.querySelectorAll('.activity-btn');
    const calcTypeGrid = document.getElementById('calculation-type-grid');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const gameBtns = document.querySelectorAll('.game-btn');

    const soundToggle = document.getElementById('toggle-sound');
    const stepsToggle = document.getElementById('toggle-steps');
    const startButton = document.getElementById('start-session');
    const clearButton = document.getElementById('clear-selections');
    const questionCountRadios = document.querySelectorAll('input[name="question-count"]');
    const questionCountFieldset = document.querySelector('fieldset:has(input[name="question-count"])');

    // ステップ表示制御
    function showStep(stepElement) {
      if (stepElement) {
        stepElement.classList.remove('step-hidden');
        updateStepNumbers();
      }
    }

    function hideStep(stepElement) {
      if (stepElement) {
        stepElement.classList.add('step-hidden');
        updateStepNumbers();
      }
    }

    // ステップ番号を更新
    function updateStepNumbers() {
      const allSteps = [step1Grade, step2Activity, step3CalcType, step4Theme, step4Game];
      let currentStep = 0;

      allSteps.forEach(stepElement => {
        if (stepElement && !stepElement.classList.contains('step-hidden')) {
          currentStep++;
          const stepNumberElement = stepElement.querySelector('.step-number');
          if (stepNumberElement) {
            stepNumberElement.textContent = \`STEP \${currentStep}\`;
          }
        }
      });
    }

    function hideAllStepsAfter(stepNumber) {
      if (stepNumber < 2) {
        hideStep(step2Activity);
      }
      if (stepNumber < 3) {
        hideStep(step3CalcType);
      }
      if (stepNumber < 4) {
        hideStep(step4Theme);
        hideStep(step4Game);
      }
    }

    // ボタン選択状態の制御
    function selectButton(buttons, selectedButton) {
      buttons.forEach(btn => {
        btn.classList.remove('selection-card--selected');
        btn.style.borderColor = '';
      });
      if (selectedButton) {
        selectedButton.classList.add('selection-card--selected');
      }
    }

    // STEP 1: 学年選択（任意・トグル可能）
    gradeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;

        const gradeId = btn.dataset.gradeId;

        // トグル機能: 選択中のボタンを押すと未選択に
        if (state.selectedGrade === gradeId) {
          state.selectedGrade = null;
          btn.classList.remove('selection-card--selected');
        } else {
          state.selectedGrade = gradeId;
          selectButton(gradeBtns, btn);
        }

        // テーマフィルタリングを更新（計算種類が選択されている場合）
        if (state.selectedCalculationType) {
          filterThemesByCalculationType(state.selectedCalculationType.mode);
        }

        updateStartButtonState();
      });
    });

    // STEP 2: 活動選択
    activityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const activity = btn.dataset.activity;
        state.selectedActivity = activity;
        selectButton(activityBtns, btn);

        // すべての後続ステップを非表示
        hideAllStepsAfter(2);

        // 途中式トグルと問題数の表示/非表示を制御
        if (stepsToggle) {
          if (activity === 'math') {
            stepsToggle.style.display = '';
          } else {
            stepsToggle.style.display = 'none';
          }
        }
        if (questionCountFieldset) {
          if (activity === 'math') {
            questionCountFieldset.style.display = '';
          } else {
            questionCountFieldset.style.display = 'none';
          }
        }

        // STEP 3を表示
        if (activity === 'math') {
          showStep(step3CalcType);
          renderCalculationTypes();
        } else if (activity === 'game') {
          showStep(step4Game);
        }

        updateStartButtonState();
      });
    });

    // 計算の種類をレンダリング
    function renderCalculationTypes() {
      if (!calcTypeGrid) return;

      const gradeCalculationTypes = {
        'grade-1': ['calc-add', 'calc-sub', 'calc-add-sub-mix'],
        'grade-2': ['calc-add', 'calc-sub', 'calc-add-sub-mix'],
        'grade-3': ['calc-add', 'calc-sub', 'calc-add-sub-mix', 'calc-mul'],
        'grade-4': ['calc-add', 'calc-sub', 'calc-add-sub-mix', 'calc-mul', 'calc-div'],
        'grade-5': ['calc-add', 'calc-sub', 'calc-add-sub-mix', 'calc-mul', 'calc-div', 'calc-mix'],
        'grade-6': ['calc-add', 'calc-sub', 'calc-add-sub-mix', 'calc-mul', 'calc-div', 'calc-mix'],
      };

      // 学年が選択されている場合はその学年の計算種類、未選択の場合は小1の計算種類
      const defaultCalcTypes = ['calc-add', 'calc-sub', 'calc-add-sub-mix'];
      const availableCalcTypes = state.selectedGrade
        ? gradeCalculationTypes[state.selectedGrade] || defaultCalcTypes
        : defaultCalcTypes;

      const availableTypes = calculationTypes.filter(calcType =>
        availableCalcTypes.includes(calcType.id)
      );

      renderCalculationTypeButtons(availableTypes);
    }

    // 計算種類ボタンを生成
    function renderCalculationTypeButtons(availableTypes) {
      if (!calcTypeGrid) return;

      calcTypeGrid.innerHTML = '';

      availableTypes.forEach((calcType) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'calc-type-btn rounded-2xl border-2 border-transparent bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--mq-primary)]';
        button.dataset.calcTypeId = calcType.id;
        button.dataset.mode = calcType.mode;
        button.innerHTML = \`
          <p class="text-sm font-bold text-[var(--mq-primary-strong)]">\${calcType.label}</p>
          <p class="text-sm font-semibold text-[var(--mq-ink)]">\${calcType.description}</p>
        \`;

        button.addEventListener('click', () => {
          state.selectedCalculationType = calcType;
          const allCalcBtns = calcTypeGrid.querySelectorAll('.calc-type-btn');
          selectButton(allCalcBtns, button);

          hideAllStepsAfter(3);
          showStep(step4Theme);
          // 学年選択の有無に関わらず、計算種類に応じてテーマをフィルタリング
          filterThemesByCalculationType(calcType.mode);

          updateStartButtonState();
        });

        calcTypeGrid.appendChild(button);
      });
    }

    // テーマをフィルタリング
    function filterThemesByCalculationType(calculationMode) {
      const currentGrade = state.selectedGrade;
      const currentGradeOrder = gradeLevels.findIndex(g => g.id === currentGrade);

      themeBtns.forEach(btn => {
        const themeMode = btn.dataset.mode;
        const themeMinGrade = btn.dataset.minGrade;
        const themeMinGradeOrder = gradeLevels.findIndex(g => g.id === themeMinGrade);

        const matchesCalculationType = !calculationMode || themeMode === calculationMode;
        // 学年が未選択の場合は学年制限をチェックしない
        const matchesGradeRequirement = currentGradeOrder === -1 || currentGradeOrder >= themeMinGradeOrder;

        if (matchesCalculationType && matchesGradeRequirement) {
          btn.style.display = '';
        } else {
          btn.style.display = 'none';
        }
      });
    }

    // STEP 4A: テーマ選択
    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const themeId = btn.dataset.themeId;

        if (state.selectedTheme === themeId) {
          state.selectedTheme = null;
          btn.classList.remove('selection-card--selected');
        } else {
          state.selectedTheme = themeId;
          themeBtns.forEach(b => b.classList.remove('selection-card--selected'));
          btn.classList.add('selection-card--selected');
        }

        updateStartButtonState();
      });
    });

    // STEP 4B: ゲーム選択
    gameBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const game = btn.dataset.game;
        state.selectedGame = game;
        selectButton(gameBtns, btn);

        updateStartButtonState();
      });
    });

    // スタートボタンの状態更新
    function updateStartButtonState() {
      if (!startButton) return;

      let canStart = false;

      // ゲームモードの場合
      if (state.selectedActivity === 'game' && state.selectedGame) {
        canStart = true;
      }

      // 計算モードの場合（学年は任意）
      if (state.selectedActivity === 'math' && state.selectedCalculationType) {
        canStart = true;
      }

      startButton.disabled = !canStart;
    }

    // トグルボタン
    function toggleButton(button) {
      if (!button) return;
      const nextState = button.dataset.state !== 'on';
      button.dataset.state = nextState ? 'on' : 'off';
      if (nextState) {
        button.classList.add('setting-toggle--on');
      } else {
        button.classList.remove('setting-toggle--on');
      }
    }

    if (soundToggle) {
      soundToggle.addEventListener('click', () => toggleButton(soundToggle));
    }
    if (stepsToggle) {
      stepsToggle.addEventListener('click', () => toggleButton(stepsToggle));
    }

    // リセットボタン
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        // 状態をリセット
        state.selectedGrade = null;
        state.selectedActivity = null;
        state.selectedCalculationType = null;
        state.selectedTheme = null;
        state.selectedGame = null;

        // 全てのステップを非表示（STEP 1とSTEP 2は常に表示）
        hideAllStepsAfter(2);

        // 途中式トグルと問題数を表示に戻す（デフォルト状態）
        if (stepsToggle) {
          stepsToggle.style.display = '';
        }
        if (questionCountFieldset) {
          questionCountFieldset.style.display = '';
        }

        // 全ての選択を解除
        gradeBtns.forEach(btn => btn.classList.remove('selection-card--selected'));
        activityBtns.forEach(btn => btn.classList.remove('selection-card--selected'));
        themeBtns.forEach(btn => btn.classList.remove('selection-card--selected'));
        gameBtns.forEach(btn => btn.classList.remove('selection-card--selected'));
        if (calcTypeGrid) {
          calcTypeGrid.querySelectorAll('.calc-type-btn').forEach(btn => {
            btn.classList.remove('selection-card--selected');
          });
        }

        updateStartButtonState();
      });
    }

    // スタートボタン
    if (startButton) {
      startButton.addEventListener('click', () => {
        if (startButton.disabled) return;

        // ゲームモードの場合
        if (state.selectedActivity === 'game' && state.selectedGame === 'sudoku') {
          window.location.href = '/sudoku';
          return;
        }

        // 計算モードの場合（学年は任意）
        if (state.selectedActivity === 'math' && state.selectedCalculationType) {
          const soundEnabled = soundToggle?.dataset.state === 'on';
          const workingEnabled = stepsToggle?.dataset.state === 'on';
          const questionCount = Number(
            Array.from(questionCountRadios).find(r => r.checked)?.value || 10
          );

          try {
            localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
            localStorage.setItem(WORKING_STORAGE_KEY, String(workingEnabled));
            localStorage.setItem(QUESTION_COUNT_STORAGE_KEY, String(questionCount));
          } catch (e) {
            console.warn('failed to persist settings', e);
          }

          const gradePreset = state.selectedGrade ? (presets.find(p => p.id === state.selectedGrade) || gradeLevels.find(l => l.id === state.selectedGrade)) : gradeLevels[0];
          const themePreset = state.selectedTheme ? presets.find(p => p.id === state.selectedTheme) : null;

          const session = {
            gradeId: state.selectedGrade || gradePreset.id,
            gradeLabel: gradePreset?.label || '',
            gradeDescription: gradePreset?.description || '',
            mode: state.selectedCalculationType.mode,
            max: gradePreset?.max || null,
            questionCount,
            soundEnabled,
            workingEnabled,
            createdAt: Date.now(),
            baseGradeId: state.selectedGrade || gradePreset.id,
            baseGradeLabel: gradePreset?.label || '',
            baseGradeDescription: gradePreset?.description || '',
            baseGradeMode: gradePreset?.mode || '',
            baseGradeMax: gradePreset?.max || null,
            baseGrade: gradePreset ? {
              id: gradePreset.id,
              label: gradePreset.label,
              description: gradePreset.description,
              mode: gradePreset.mode,
              max: gradePreset.max,
            } : null,
            theme: themePreset ? {
              id: themePreset.id,
              label: themePreset.label,
              description: themePreset.description,
            } : null,
            calculationType: {
              id: state.selectedCalculationType.id,
              label: state.selectedCalculationType.label,
              description: state.selectedCalculationType.description,
              mode: state.selectedCalculationType.mode,
            },
          };

          try {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
            console.log('Session saved:', session);
          } catch (e) {
            console.warn('failed to write session storage', e);
          }

          window.location.href = '/play';
        }
      });
    }

    // 初期化: STEP 1とSTEP 2は常に表示
    if (step1Grade) step1Grade.classList.remove('step-hidden');
    if (step2Activity) step2Activity.classList.remove('step-hidden');
    updateStartButtonState();

    // ローカルストレージから設定を復元
    try {
      const soundEnabled = localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
      const workingEnabled = localStorage.getItem(WORKING_STORAGE_KEY) === 'true';

      if (soundToggle) {
        soundToggle.dataset.state = soundEnabled ? 'on' : 'off';
        if (soundEnabled) soundToggle.classList.add('setting-toggle--on');
      }
      if (stepsToggle) {
        stepsToggle.dataset.state = workingEnabled ? 'on' : 'off';
        if (workingEnabled) stepsToggle.classList.add('setting-toggle--on');
      }
    } catch (e) {
      console.warn('failed to load settings', e);
    }
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
