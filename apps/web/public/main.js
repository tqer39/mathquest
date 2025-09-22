(() => {
  const el = (id) => document.getElementById(id);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const API = (path) => `http://localhost:8787${path}`;

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
  const gameSec = el('game');
  const resultSec = el('result');
  const finalCorrectEl = el('finalCorrect');
  const finalTotalEl = el('finalTotal');

  let settings = { mode: 'mix', max: 20, total: 10 };
  let state = { index: 0, correct: 0, current: null };

  function feedback(t, kind) {
    feedbackEl.textContent = t;
    feedbackEl.classList.remove('ok', 'bad');
    if (kind === 'ok') feedbackEl.classList.add('ok');
    if (kind === 'bad') feedbackEl.classList.add('bad');
  }

  async function fetchQuestion() {
    const res = await fetch(API('/v1/questions/next'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: settings.mode, max: settings.max }),
    });
    const data = await res.json();
    return data.question;
  }

  async function nextQuestion(initial = false) {
    if (!initial) state.index += 1;
    if (state.index >= settings.total) return finish();
    const q = await fetchQuestion();
    state.current = q;
    questionEl.textContent = `${q.a} ${q.op} ${q.b} = ?`;
    answerEl.value = '';
    qIndexEl.textContent = String(state.index + 1);
    correctEl.textContent = String(state.correct);
    answerEl.focus();
    feedback('');
  }

  async function checkAnswer() {
    const raw = answerEl.value.trim();
    if (!raw) return feedback('数字を入れてね');
    const value = Number(raw);
    if (!Number.isFinite(value)) return feedback('正しい数字を入れてね');
    const q = state.current;
    const res = await fetch(API('/v1/answers/check'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: q.a, b: q.b, op: q.op, value }),
    });
    const data = await res.json();
    if (data.ok) {
      state.correct += 1;
      feedback('せいかい！', 'ok');
    } else {
      feedback(`ちがうよ… せいかいは ${data.correctAnswer}`, 'bad');
    }
    setTimeout(() => nextQuestion(false), 400);
  }

  function startGame() {
    settings = {
      mode: modeSel.value,
      max: Number(rangeSel.value),
      total: Number(questionsSel.value),
    };
    state = { index: 0, correct: 0, current: null };
    qTotalEl.textContent = String(settings.total);
    gameSec.classList.remove('hidden');
    resultSec.classList.add('hidden');
    nextQuestion(true);
  }

  function finish() {
    finalCorrectEl.textContent = String(state.correct);
    finalTotalEl.textContent = String(settings.total);
    gameSec.classList.add('hidden');
    resultSec.classList.remove('hidden');
  }

  startBtn.addEventListener('click', startGame);
  submitBtn.addEventListener('click', checkAnswer);
  endBtn.addEventListener('click', finish);
  againBtn.addEventListener('click', startGame);
  answerEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAnswer();
  });
  $$('.numpad button').forEach((b) =>
    b.addEventListener('click', () => {
      const k = b.dataset.key;
      if (k === 'back') answerEl.value = answerEl.value.slice(0, -1);
      else answerEl.value += k;
      answerEl.focus();
    })
  );
})();
