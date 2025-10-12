import { html, raw } from 'hono/html';

const MODULE_SOURCE = `
(() => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSudokuPage);
  } else {
    initializeSudokuPage();
  }

  function initializeSudokuPage() {
    // 数独ソルバー - バックトラッキングアルゴリズム
    function solveSudoku(grid) {
      const emptyCell = findEmptyCell(grid);
      if (!emptyCell) return true; // 完成

      const [row, col] = emptyCell;

      for (let num = 1; num <= 9; num++) {
        if (isValidPlacement(grid, row, col, num)) {
          grid[row][col] = num;

          if (solveSudoku(grid)) {
            return true;
          }

          grid[row][col] = 0; // バックトラック
        }
      }

      return false;
    }

    function findEmptyCell(grid) {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === 0) {
            return [row, col];
          }
        }
      }
      return null;
    }

    function isValidPlacement(grid, row, col, num) {
      // 行チェック
      for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
      }

      // 列チェック
      for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
      }

      // 3x3ボックスチェック
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (grid[startRow + i][startCol + j] === num) return false;
        }
      }

      return true;
    }

    // 数独パズル生成
    function generateSudoku(difficulty = 'easy') {
      const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

      // ランダムな完成した数独を生成
      fillGrid(grid);

      // 難易度に応じてセルを削除
      const cellsToRemove = {
        easy: 30,
        medium: 40,
        hard: 50
      }[difficulty] || 30;

      const solution = grid.map(row => [...row]);
      removeCells(grid, cellsToRemove);

      return { puzzle: grid, solution };
    }

    function fillGrid(grid) {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === 0) {
            shuffleArray(numbers);

            for (const num of numbers) {
              if (isValidPlacement(grid, row, col, num)) {
                grid[row][col] = num;

                if (fillGrid(grid)) {
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

    function removeCells(grid, count) {
      let removed = 0;
      while (removed < count) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);

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
    const cells = Array.from(document.querySelectorAll('.sudoku-cell'));
    const numberButtons = Array.from(document.querySelectorAll('.number-pad-button'));
    const clearButton = document.getElementById('clear-button');
    const checkButton = document.getElementById('check-button');
    const newGameButton = document.getElementById('new-game-button');
    const hintButton = document.getElementById('hint-button');
    const feedbackEl = document.getElementById('feedback');
    const remainingCountEl = document.getElementById('remaining-count');
    const difficultyLabelEl = document.getElementById('difficulty-label');

    let currentPuzzle = null;
    let currentSolution = null;
    let selectedCell = null;

    // 新しいゲームを開始
    function startNewGame(difficulty = 'easy') {
      const { puzzle, solution } = generateSudoku(difficulty);
      currentPuzzle = puzzle;
      currentSolution = solution;

      // グリッドを更新
      cells.forEach((cell, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
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
    }

    // 残りのマス数を更新
    function updateRemainingCount() {
      if (!remainingCountEl) return;

      const emptyCount = cells.filter(cell => !cell.readOnly && cell.value === '').length;
      remainingCountEl.textContent = emptyCount;
    }

    // セル選択
    cells.forEach(cell => {
      cell.addEventListener('focus', () => {
        selectedCell = cell;
      });

      cell.addEventListener('input', (e) => {
        const value = e.target.value;

        // 数字1-9のみを許可
        if (value && (!/^[1-9]$/.test(value))) {
          e.target.value = '';
          return;
        }

        e.target.classList.remove('sudoku-cell--error');
        updateRemainingCount();
      });
    });

    // 数字パッドボタン
    numberButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (!selectedCell || selectedCell.readOnly) return;

        const number = button.dataset.number;
        selectedCell.value = number;
        selectedCell.classList.remove('sudoku-cell--error');
        updateRemainingCount();
      });
    });

    // 消去ボタン
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        if (!selectedCell || selectedCell.readOnly) return;

        selectedCell.value = '';
        selectedCell.classList.remove('sudoku-cell--error');
        updateRemainingCount();
      });
    }

    // 答え合わせボタン
    if (checkButton) {
      checkButton.addEventListener('click', () => {
        if (!currentSolution) return;

        let isCorrect = true;
        let hasEmpty = false;

        cells.forEach((cell, index) => {
          const row = Math.floor(index / 9);
          const col = index % 9;
          const expectedValue = currentSolution[row][col];

          if (!cell.readOnly) {
            if (cell.value === '') {
              hasEmpty = true;
            } else if (Number(cell.value) !== expectedValue) {
              isCorrect = false;
              cell.classList.add('sudoku-cell--error');
            } else {
              cell.classList.remove('sudoku-cell--error');
            }
          }
        });

        if (hasEmpty) {
          showFeedback('まだ空いているマスがあります', 'info');
        } else if (isCorrect) {
          showFeedback('🎉 正解です！おめでとう！', 'success');
        } else {
          showFeedback('❌ まちがいがあります。赤いマスをかくにんしてね', 'error');
        }
      });
    }

    // 新しいゲームボタン
    if (newGameButton) {
      newGameButton.addEventListener('click', () => {
        startNewGame('easy');
      });
    }

    // ヒントボタン
    if (hintButton) {
      hintButton.addEventListener('click', () => {
        if (!currentSolution) return;

        // 空のセルからランダムに1つ選んでヒントを表示
        const emptyCells = cells.filter(cell => !cell.readOnly && cell.value === '');
        if (emptyCells.length === 0) {
          showFeedback('すべてのマスが埋まっています', 'info');
          return;
        }

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const index = cells.indexOf(randomCell);
        const row = Math.floor(index / 9);
        const col = index % 9;

        randomCell.value = currentSolution[row][col];
        randomCell.classList.remove('sudoku-cell--error');
        updateRemainingCount();
        showFeedback('ヒント: 1つのマスを埋めました', 'success');
      });
    }

    function showFeedback(message, type = 'info') {
      if (!feedbackEl) return;

      feedbackEl.textContent = message;
      feedbackEl.className = 'flex min-h-[48px] items-center justify-center rounded-2xl text-center text-sm font-semibold';

      if (type === 'success') {
        feedbackEl.classList.add('bg-green-50', 'text-green-700');
      } else if (type === 'error') {
        feedbackEl.classList.add('bg-red-50', 'text-red-700');
      } else {
        feedbackEl.classList.add('bg-blue-50', 'text-blue-700');
      }

      setTimeout(() => {
        clearFeedback();
      }, 3000);
    }

    function clearFeedback() {
      if (!feedbackEl) return;
      feedbackEl.textContent = '';
      feedbackEl.className = 'flex min-h-[48px] items-center justify-center rounded-2xl text-center text-sm font-semibold';
    }

    // 初期化
    startNewGame('easy');
  }
})();
`;

export const renderSudokuClientScript = () => html`
  <script type="module">
    ${raw(MODULE_SOURCE)};
  </script>
`;
