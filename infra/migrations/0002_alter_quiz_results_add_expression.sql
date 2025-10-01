ALTER TABLE quiz_results ADD COLUMN expression TEXT NOT NULL DEFAULT '';
ALTER TABLE quiz_results ADD COLUMN extras_json TEXT NOT NULL DEFAULT '[]';
