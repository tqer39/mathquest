-- Generated manually to establish initial quiz_results table for D1
CREATE TABLE IF NOT EXISTS quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grade_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  max_value INTEGER NOT NULL,
  operand_a INTEGER NOT NULL,
  operand_b INTEGER NOT NULL,
  operator TEXT NOT NULL,
  correct_answer INTEGER NOT NULL,
  user_answer INTEGER NOT NULL,
  is_correct INTEGER NOT NULL,
  answered_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_grade_answered_at
  ON quiz_results (grade_id, answered_at);

CREATE INDEX IF NOT EXISTS idx_quiz_results_mode_answered_at
  ON quiz_results (mode, answered_at);
