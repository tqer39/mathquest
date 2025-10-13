import { html, raw } from 'hono/html';

const MODULE_SOURCE = `
(() => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSudokuPage);
  } else {
    initializeSudokuPage();
  }

  function initializeSudokuPage() {
    // グリッドサイズの設定
    const GRID_CONFIGS = {
      4: { size: 4, boxRows: 2, boxCols: 2 },
      6: { size: 6, boxRows: 2, boxCols: 3 },
      9: { size: 9, boxRows: 3, boxCols: 3 }
    };

    const EFFECTS_STORAGE_KEY = 'mathquest:sudoku-effects-enabled';
    let currentGridSize = 9;
    let effectsEnabled = true;

    // 数独ソルバー - バックトラッキングアルゴリズム
    function solveSudoku(grid, size) {
      const emptyCell = findEmptyCell(grid, size);
      if (!emptyCell) return true; // 完成

      const [row, col] = emptyCell;

      for (let num = 1; num <= size; num++) {
        if (isValidPlacement(grid, row, col, num, size)) {
          grid[row][col] = num;

          if (solveSudoku(grid, size)) {
            return true;
          }

          grid[row][col] = 0; // バックトラック
        }
      }

      return false;
    }

    function findEmptyCell(grid, size) {
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (grid[row][col] === 0) {
            return [row, col];
          }
        }
      }
      return null;
    }

    function isValidPlacement(grid, row, col, num, size) {
      const config = GRID_CONFIGS[size];

      // 行チェック
      for (let x = 0; x < size; x++) {
        if (grid[row][x] === num) return false;
      }

      // 列チェック
      for (let x = 0; x < size; x++) {
        if (grid[x][col] === num) return false;
      }

      // ボックスチェック
      const startRow = Math.floor(row / config.boxRows) * config.boxRows;
      const startCol = Math.floor(col / config.boxCols) * config.boxCols;
      for (let i = 0; i < config.boxRows; i++) {
        for (let j = 0; j < config.boxCols; j++) {
          if (grid[startRow + i][startCol + j] === num) return false;
        }
      }

      return true;
    }

    // 数独パズル生成
    function generateSudoku(size, difficulty = 'easy') {
      const grid = Array.from({ length: size }, () => Array(size).fill(0));

      // ランダムな完成した数独を生成
      fillGrid(grid, size);

      // 難易度に応じてセルを削除
      const cellsToRemove = {
        4: { easy: 8, medium: 10 },
        6: { easy: 18, medium: 22, hard: 26 },
        9: { easy: 30, medium: 40, hard: 50 }
      }[size][difficulty] || Math.floor(size * size * 0.4);

      const solution = grid.map(row => [...row]);
      removeCells(grid, size, cellsToRemove);

      return { puzzle: grid, solution };
    }

    function fillGrid(grid, size) {
      const numbers = Array.from({ length: size }, (_, i) => i + 1);

      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (grid[row][col] === 0) {
            shuffleArray(numbers);

            for (const num of numbers) {
              if (isValidPlacement(grid, row, col, num, size)) {
                grid[row][col] = num;

                if (fillGrid(grid, size)) {
                  return true;
                }

                grid[row][col] = 0;
              }
            }

            return false;
          }
        }
      }

      return true;
    }

    function removeCells(grid, size, count) {
      let removed = 0;
      while (removed < count) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);

        if (grid[row][col] !== 0) {
          grid[row][col] = 0;
          removed++;
        }
      }
    }

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    // DOM要素
    const sudokuGrid = document.getElementById('sudoku-grid');
    const numberButtons = Array.from(document.querySelectorAll('.number-pad-button'));
    const clearButton = document.getElementById('clear-button');
    const checkButton = document.getElementById('check-button');
    const newGameButton = document.getElementById('new-game-button');
    const hintButton = document.getElementById('hint-button');
    const feedbackEl = document.getElementById('feedback');
    const remainingCountEl = document.getElementById('remaining-count');
    const difficultyLabelEl = document.getElementById('difficulty-label');
    const sizeLabelEl = document.getElementById('size-label');
    const presetSelector = document.getElementById('preset-selector');
    const gameContainer = document.getElementById('game-container');
    const presetButtons = Array.from(document.querySelectorAll('.preset-button'));

    let currentPuzzle = null;
    let currentSolution = null;
    let selectedCell = null;

    // 完成チェック関数
    function checkCompletion(row, col) {
      if (!effectsEnabled) return;

      const cells = Array.from(document.querySelectorAll('.sudoku-cell'));
      const config = GRID_CONFIGS[currentGridSize];

      // 行のチェック
      const rowCells = cells.filter(cell => Number(cell.dataset.row) === row);
      if (rowCells.every(cell => cell.value !== '')) {
        const rowValues = rowCells.map(cell => Number(cell.value));
        if (new Set(rowValues).size === currentGridSize) {
          rowCells.forEach(cell => {
            cell.classList.add('sudoku-cell--complete');
            setTimeout(() => cell.classList.remove('sudoku-cell--complete'), 1200);
          });
        }
      }

      // 列のチェック
      const colCells = cells.filter(cell => Number(cell.dataset.col) === col);
      if (colCells.every(cell => cell.value !== '')) {
        const colValues = colCells.map(cell => Number(cell.value));
        if (new Set(colValues).size === currentGridSize) {
          colCells.forEach(cell => {
            cell.classList.add('sudoku-cell--complete');
            setTimeout(() => cell.classList.remove('sudoku-cell--complete'), 1200);
          });
        }
      }

      // ブロックのチェック
      const startRow = Math.floor(row / config.boxRows) * config.boxRows;
      const startCol = Math.floor(col / config.boxCols) * config.boxCols;
      const blockCells = [];
      for (let i = 0; i < config.boxRows; i++) {
        for (let j = 0; j < config.boxCols; j++) {
          const blockRow = startRow + i;
          const blockCol = startCol + j;
          const cell = cells.find(
            c => Number(c.dataset.row) === blockRow && Number(c.dataset.col) === blockCol
          );
          if (cell) blockCells.push(cell);
        }
      }
      if (blockCells.every(cell => cell.value !== '')) {
        const blockValues = blockCells.map(cell => Number(cell.value));
        if (new Set(blockValues).size === blockCells.length) {
          blockCells.forEach(cell => {
            cell.classList.add('sudoku-cell--complete');
            setTimeout(() => cell.classList.remove('sudoku-cell--complete'), 1200);
          });
        }
      }
    }

    // 重複チェック関数
    function checkDuplicates(row, col, value) {
      if (!effectsEnabled || !value) return;

      const cells = Array.from(document.querySelectorAll('.sudoku-cell'));
      const config = GRID_CONFIGS[currentGridSize];
      const duplicateCells = [];

      // 行の重複チェック（readOnlyも含める）
      const rowCells = cells.filter(cell =>
        Number(cell.dataset.row) === row &&
        cell.value === value
      );
      if (rowCells.length > 1) {
        duplicateCells.push(...rowCells);
      }

      // 列の重複チェック（readOnlyも含める）
      const colCells = cells.filter(cell =>
        Number(cell.dataset.col) === col &&
        cell.value === value
      );
      if (colCells.length > 1) {
        duplicateCells.push(...colCells);
      }

      // ブロックの重複チェック（readOnlyも含める）
      const startRow = Math.floor(row / config.boxRows) * config.boxRows;
      const startCol = Math.floor(col / config.boxCols) * config.boxCols;
      const blockCells = [];
      for (let i = 0; i < config.boxRows; i++) {
        for (let j = 0; j < config.boxCols; j++) {
          const blockRow = startRow + i;
          const blockCol = startCol + j;
          const cell = cells.find(
            c => Number(c.dataset.row) === blockRow &&
                 Number(c.dataset.col) === blockCol &&
                 c.value === value
          );
          if (cell) blockCells.push(cell);
        }
      }
      if (blockCells.length > 1) {
        duplicateCells.push(...blockCells);
      }

      // 重複セルにエラーエフェクトを適用（削除しない）
      const uniqueDuplicates = [...new Set(duplicateCells)];
      uniqueDuplicates.forEach(cell => {
        cell.classList.add('sudoku-cell--duplicate-error');
      });
    }

    // グリッドを動的に生成
    function createGrid(size) {
      if (!sudokuGrid) return;

      sudokuGrid.innerHTML = '';
      sudokuGrid.setAttribute('data-size', size);
      currentGridSize = size;

      for (let i = 0; i < size * size; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.inputMode = 'numeric';
        input.maxLength = 1;
        input.className = 'sudoku-cell';
        input.dataset.index = i;
        input.dataset.row = Math.floor(i / size);
        input.dataset.col = i % size;

        // イベントリスナー
        input.addEventListener('focus', () => {
          selectedCell = input;
        });

        input.addEventListener('input', (e) => {
          const value = e.target.value;
          const maxNum = currentGridSize;

          // 数字のみを許可
          if (value && (!/^[1-9]$/.test(value) || Number(value) > maxNum)) {
            e.target.value = '';
            return;
          }

          e.target.classList.remove('sudoku-cell--error');
          e.target.classList.remove('sudoku-cell--duplicate-error');
          updateRemainingCount();

          // 値が入力された場合、完成チェックと重複チェック
          if (value) {
            const row = Number(e.target.dataset.row);
            const col = Number(e.target.dataset.col);
            checkDuplicates(row, col, value);
            setTimeout(() => checkCompletion(row, col), 100);

            // すべてのマスが埋まったら自動的に答え合わせ
            setTimeout(() => {
              const allCells = Array.from(document.querySelectorAll('.sudoku-cell'));
              const allFilled = allCells.every(cell => cell.value !== '');
              if (allFilled) {
                performAnswerCheck();
              }
            }, 150);
          }
        });

        sudokuGrid.appendChild(input);
      }

      // 数字パッドも更新
      updateNumberPad(size);
    }

    // 数字パッドを更新
    function updateNumberPad(size) {
      numberButtons.forEach((button, index) => {
        const num = index + 1;
        if (num <= size) {
          button.style.display = '';
          button.disabled = false;
        } else {
          button.style.display = 'none';
        }
      });
    }

    // 新しいゲームを開始
    function startNewGame(size, difficulty = 'easy') {
      createGrid(size);

      const { puzzle, solution } = generateSudoku(size, difficulty);
      currentPuzzle = puzzle;
      currentSolution = solution;

      // グリッドを更新
      const cells = Array.from(document.querySelectorAll('.sudoku-cell'));
      cells.forEach((cell, index) => {
        const row = Math.floor(index / size);
        const col = index % size;
        const value = puzzle[row][col];

        if (value !== 0) {
          cell.value = value;
          cell.readOnly = true;
          cell.classList.remove('sudoku-cell--error');
        } else {
          cell.value = '';
          cell.readOnly = false;
          cell.classList.remove('sudoku-cell--error');
        }
      });

      updateRemainingCount();
      clearFeedback();

      const difficultyLabels = {
        easy: 'かんたん',
        medium: 'ふつう',
        hard: 'むずかしい'
      };
      if (difficultyLabelEl) {
        difficultyLabelEl.textContent = difficultyLabels[difficulty] || 'かんたん';
      }
      if (sizeLabelEl) {
        sizeLabelEl.textContent = size + '×' + size;
      }

      // プリセット選択を非表示、ゲームを表示
      if (presetSelector) presetSelector.classList.add('hidden');
      if (gameContainer) gameContainer.classList.remove('hidden');
    }

    // 残りのマス数を更新
    function updateRemainingCount() {
      if (!remainingCountEl) return;

      const cells = Array.from(document.querySelectorAll('.sudoku-cell'));
      const emptyCount = cells.filter(cell => !cell.readOnly && cell.value === '').length;
      remainingCountEl.textContent = emptyCount;
    }

    // プリセットボタン
    presetButtons.forEach(button => {
      button.addEventListener('click', () => {
        const size = Number(button.dataset.size);
        const difficulty = button.dataset.difficulty;
        startNewGame(size, difficulty);
      });
    });

    // 数字パッドボタン
    numberButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (!selectedCell || selectedCell.readOnly) return;

        const number = button.dataset.number;
        selectedCell.value = number;
        selectedCell.classList.remove('sudoku-cell--error');
        selectedCell.classList.remove('sudoku-cell--duplicate-error');
        updateRemainingCount();

        // 完成チェックと重複チェック
        const row = Number(selectedCell.dataset.row);
        const col = Number(selectedCell.dataset.col);
        checkDuplicates(row, col, number);
        setTimeout(() => checkCompletion(row, col), 100);

        // すべてのマスが埋まったら自動的に答え合わせ
        setTimeout(() => {
          const allCells = Array.from(document.querySelectorAll('.sudoku-cell'));
          const allFilled = allCells.every(cell => cell.value !== '');
          if (allFilled) {
            performAnswerCheck();
          }
        }, 150);
      });
    });

    // 消去ボタン
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        if (!selectedCell || selectedCell.readOnly) return;

        selectedCell.value = '';
        selectedCell.classList.remove('sudoku-cell--error');
        selectedCell.classList.remove('sudoku-cell--duplicate-error');
        updateRemainingCount();
      });
    }

    // 答え合わせ関数（再利用可能）
    function performAnswerCheck() {
      const cells = Array.from(document.querySelectorAll('.sudoku-cell'));
      const config = GRID_CONFIGS[currentGridSize];

      // 空のマスがあるかチェック
      const hasEmpty = cells.some(cell => cell.value === '');
      if (hasEmpty) {
        showFeedback('まだ空いているマスがあります', 'info');
        return;
      }

      // 数独のルールに基づいて検証
      let isValid = true;
      const errorCells = [];

      // 各行をチェック
      for (let row = 0; row < currentGridSize; row++) {
        const rowCells = cells.filter(cell => Number(cell.dataset.row) === row);
        const rowValues = rowCells.map(cell => Number(cell.value));
        if (new Set(rowValues).size !== currentGridSize) {
          isValid = false;
          errorCells.push(...rowCells);
        }
      }

      // 各列をチェック
      for (let col = 0; col < currentGridSize; col++) {
        const colCells = cells.filter(cell => Number(cell.dataset.col) === col);
        const colValues = colCells.map(cell => Number(cell.value));
        if (new Set(colValues).size !== currentGridSize) {
          isValid = false;
          errorCells.push(...colCells);
        }
      }

      // 各ブロックをチェック
      for (let blockRow = 0; blockRow < currentGridSize; blockRow += config.boxRows) {
        for (let blockCol = 0; blockCol < currentGridSize; blockCol += config.boxCols) {
          const blockCells = [];
          for (let i = 0; i < config.boxRows; i++) {
            for (let j = 0; j < config.boxCols; j++) {
              const cell = cells.find(
                c => Number(c.dataset.row) === blockRow + i &&
                     Number(c.dataset.col) === blockCol + j
              );
              if (cell) blockCells.push(cell);
            }
          }
          const blockValues = blockCells.map(cell => Number(cell.value));
          if (new Set(blockValues).size !== blockCells.length) {
            isValid = false;
            errorCells.push(...blockCells);
          }
        }
      }

      // エラー表示を更新
      cells.forEach(cell => cell.classList.remove('sudoku-cell--error'));
      if (!isValid) {
        const uniqueErrorCells = [...new Set(errorCells)];
        uniqueErrorCells.forEach(cell => cell.classList.add('sudoku-cell--error'));
        showFeedback('❌ まちがいがあります。赤いマスをかくにんしてね', 'error', true);
      } else {
        showFeedback('🎉 正解です！おめでとう！', 'success', true);
        // すべてのセルを編集不可にする
        cells.forEach(cell => {
          cell.classList.add('completed');
          cell.readOnly = true;
        });
      }
    }

    // 答え合わせボタン
    if (checkButton) {
      checkButton.addEventListener('click', performAnswerCheck);
    }

    // 新しいゲームボタン
    if (newGameButton) {
      newGameButton.addEventListener('click', () => {
        // プリセット選択画面に戻る
        if (presetSelector) presetSelector.classList.remove('hidden');
        if (gameContainer) gameContainer.classList.add('hidden');
      });
    }

    // ヒントボタン
    if (hintButton) {
      hintButton.addEventListener('click', () => {
        if (!currentSolution) return;

        const cells = Array.from(document.querySelectorAll('.sudoku-cell'));
        // 空のセルからランダムに1つ選んでヒントを表示
        const emptyCells = cells.filter(cell => !cell.readOnly && cell.value === '');
        if (emptyCells.length === 0) {
          showFeedback('すべてのマスが埋まっています', 'info');
          return;
        }

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const index = cells.indexOf(randomCell);
        const row = Math.floor(index / currentGridSize);
        const col = index % currentGridSize;

        randomCell.value = currentSolution[row][col];
        randomCell.classList.remove('sudoku-cell--error');
        randomCell.classList.remove('sudoku-cell--duplicate-error');
        updateRemainingCount();
        showFeedback('ヒント: 1つのマスを埋めました', 'success');

        // 完成チェック
        setTimeout(() => checkCompletion(row, col), 100);

        // すべてのマスが埋まったら自動的に答え合わせ
        setTimeout(() => {
          const allCells = Array.from(document.querySelectorAll('.sudoku-cell'));
          const allFilled = allCells.every(cell => cell.value !== '');
          if (allFilled) {
            performAnswerCheck();
          }
        }, 150);
      });
    }

    function showFeedback(message, type = 'info', persistent = false) {
      if (!feedbackEl) return;

      feedbackEl.textContent = message;
      feedbackEl.className = 'flex min-h-[64px] items-center justify-center rounded-2xl text-center text-base font-bold px-4 py-3 border-2 shadow-lg transition-all duration-300';

      if (type === 'success') {
        feedbackEl.classList.add('bg-gradient-to-r', 'from-green-50', 'to-emerald-50', 'text-green-700', 'border-green-300', 'feedback--success');
      } else if (type === 'error') {
        feedbackEl.classList.add('bg-gradient-to-r', 'from-red-50', 'to-rose-50', 'text-red-700', 'border-red-300');
      } else {
        feedbackEl.classList.add('bg-gradient-to-r', 'from-blue-50', 'to-indigo-50', 'text-blue-700', 'border-blue-300');
      }

      // 答え合わせ結果以外は自動的に消える
      if (!persistent) {
        setTimeout(() => {
          clearFeedback();
        }, 3500);
      }
    }

    function clearFeedback() {
      if (!feedbackEl) return;
      feedbackEl.textContent = '';
      feedbackEl.className = 'flex min-h-[64px] items-center justify-center rounded-2xl text-center text-base font-bold px-4 py-3';
    }

    // 初期化: プリセット選択画面を表示
    if (presetSelector) presetSelector.classList.remove('hidden');
    if (gameContainer) gameContainer.classList.add('hidden');

    // LocalStorageから画面効果の設定を読み込む
    try {
      const storedEffects = localStorage.getItem(EFFECTS_STORAGE_KEY);
      effectsEnabled = storedEffects !== 'false'; // デフォルトはtrue
    } catch (e) {
      console.warn('failed to load effects setting', e);
    }
  }
})();
`;

export const renderSudokuClientScript = () => html`
  <script type="module">
    ${raw(MODULE_SOURCE)};
  </script>
`;
