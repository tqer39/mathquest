(() => {
  const el = (id) => document.getElementById(id);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const startBtn = el('startBtn');
  const submitBtn = el('submitBtn');
  const skipBtn = el('skipBtn');
  const endBtn = el('endBtn');
  const againBtn = el('againBtn');
  const modeSel = el('mode');
  const rangeSel = el('range');
  const questionsSel = el('questions');
  const questionEl = el('question');
  const answerEl = el('answer');
  const feedbackEl = el('feedback');
  const qIndexEl = el('qIndex');
  const qTotalEl = el('qTotal');
  const correctEl = el('correct');
  const timeEl = el('time');
  const finalCorrectEl = el('finalCorrect');
  const finalTotalEl = el('finalTotal');
  const finalTimeEl = el('finalTime');
  const messageEl = el('message');
  const gameSec = el('game');
  const resultSec = el('result');

  let settings = {
    mode: 'mix',
    max: 20,
    total: 10,
  };

  const state = {
    index: 0,
    correct: 0,
    a: 0,
    b: 0,
    op: '+',
    ans: 0,
    startedAt: 0,
    timerId: null,
  };

  function choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pickOp(mode) {
    if (mode === 'mix') return choice(['+', '-', '×']);
    if (mode === 'add') return '+';
    if (mode === 'sub') return '-';
    return '×'; // mul
  }

  function randInt(n) {
    return Math.floor(Math.random() * (n + 1));
  }

  function genQuestion() {
    const op = pickOp(settings.mode);
    let a = randInt(settings.max);
    let b = randInt(settings.max);
    if (op === '-') {
      if (b > a) [a, b] = [b, a]; // マイナス回避
    }
    if (op === '×') {
      // かけ算は少しだけ易しく（小さめの値を優先）
      a = randInt(Math.max(10, Math.floor(settings.max / 2)));
      b = randInt(Math.max(10, Math.floor(settings.max / 2)));
    }
    const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
    return { a, b, op, ans };
  }

  function showQuestion() {
    const { a, b, op } = state;
    questionEl.textContent = `${a} ${op} ${b} = ?`;
    answerEl.value = '';
    answerEl.focus();
    feedback('');
    qIndexEl.textContent = String(state.index + 1);
    correctEl.textContent = String(state.correct);
  }

  function feedback(text, ok = null) {
    feedbackEl.textContent = text;
    feedbackEl.classList.remove('ok', 'bad');
    if (ok === true) feedbackEl.classList.add('ok');
    if (ok === false) feedbackEl.classList.add('bad');
  }

  function startTimer() {
    state.startedAt = performance.now();
    if (state.timerId) cancelAnimationFrame(state.timerId);
    const tick = () => {
      const t = (performance.now() - state.startedAt) / 1000;
      timeEl.textContent = t.toFixed(1);
      state.timerId = requestAnimationFrame(tick);
    };
    state.timerId = requestAnimationFrame(tick);
  }

  function stopTimer() {
    if (state.timerId) cancelAnimationFrame(state.timerId);
    state.timerId = null;
  }

  function startGame() {
    settings = {
      mode: modeSel.value,
      max: Number(rangeSel.value),
      total: Number(questionsSel.value),
    };
    qTotalEl.textContent = String(settings.total);
    state.index = 0;
    state.correct = 0;
    nextQuestion(true);
    gameSec.classList.remove('hidden');
    resultSec.classList.add('hidden');
    startTimer();
  }

  function nextQuestion(initial = false) {
    if (!initial) state.index += 1;
    if (state.index >= settings.total) return finish();
    const q = genQuestion();
    state.a = q.a;
    state.b = q.b;
    state.op = q.op;
    state.ans = q.ans;
    showQuestion();
  }

  function checkAnswer() {
    const raw = answerEl.value.trim();
    if (raw === '') {
      feedback('数字を入れてね');
      return;
    }
    const val = Number(raw);
    if (!Number.isFinite(val)) {
      feedback('正しい数字を入れてね');
      return;
    }
    if (val === state.ans) {
      state.correct += 1;
      feedback('せいかい！', true);
      pulse(questionEl, 'ok');
    } else {
      feedback(`ちがうよ… せいかいは ${state.ans}`, false);
      pulse(questionEl, 'bad');
    }
    setTimeout(() => nextQuestion(false), 400);
  }

  function pulse(elm, kind) {
    elm.classList.remove('pulse-ok', 'pulse-bad');
    void elm.offsetWidth; // reflow
    elm.classList.add(kind === 'ok' ? 'pulse-ok' : 'pulse-bad');
  }

  function finish() {
    stopTimer();
    const t = Number(timeEl.textContent || '0');
    finalCorrectEl.textContent = String(state.correct);
    finalTotalEl.textContent = String(settings.total);
    finalTimeEl.textContent = t.toFixed(1);
    const ratio = state.correct / settings.total;
    if (ratio === 1) messageEl.textContent = 'パーフェクト！すごい！';
    else if (ratio >= 0.7) messageEl.textContent = 'とてもよくできました！';
    else messageEl.textContent = 'つぎもがんばろう！';
    gameSec.classList.add('hidden');
    resultSec.classList.remove('hidden');
  }

  startBtn.addEventListener('click', startGame);
  submitBtn.addEventListener('click', checkAnswer);
  skipBtn.addEventListener('click', () => {
    feedback(`スキップ！ せいかいは ${state.ans}`);
    setTimeout(() => nextQuestion(false), 300);
  });
  endBtn.addEventListener('click', finish);
  againBtn.addEventListener('click', () => {
    resultSec.classList.add('hidden');
    startGame();
  });

  answerEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAnswer();
  });

  // テンキー入力
  $$('.numpad button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      if (!key) return;
      if (key === 'back') {
        answerEl.value = answerEl.value.slice(0, -1);
      } else {
        // 先頭の0は抑制。ただし「0」そのものはOK。
        const next = answerEl.value + key;
        answerEl.value = next.replace(/^(-?)0+(\d)/, '$1$2');
      }
      answerEl.focus();
    });
  });

  // 初期表示
  qTotalEl.textContent = String(settings.total);
})();
