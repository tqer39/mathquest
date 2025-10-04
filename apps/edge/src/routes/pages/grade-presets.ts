export const gradeLevels = [
  {
    id: 'grade-1',
    label: '小1',
    description: '小学1年生',
  },
  {
    id: 'grade-2',
    label: '小2',
    description: '小学2年生',
  },
  {
    id: 'grade-3',
    label: '小3',
    description: '小学3年生',
  },
  {
    id: 'grade-4',
    label: '小4',
    description: '小学4年生',
  },
  {
    id: 'grade-5',
    label: '小5',
    description: '小学5年生',
  },
  {
    id: 'grade-6',
    label: '小6',
    description: '小学6年生',
  },
] as const;

export const calculationTypes = [
  {
    id: 'calc-add',
    label: 'たし算',
    description: 'たし算の練習',
    mode: 'add',
  },
  {
    id: 'calc-sub',
    label: 'ひき算',
    description: 'ひき算の練習',
    mode: 'sub',
  },
  {
    id: 'calc-mul',
    label: 'かけ算',
    description: 'かけ算の練習',
    mode: 'mul',
  },
  {
    id: 'calc-div',
    label: 'わり算',
    description: 'わり算の練習',
    mode: 'div',
  },
  {
    id: 'calc-mix',
    label: 'ミックス',
    description: '複合的な計算練習',
    mode: 'mix',
  },
] as const;

// 学年ごとの利用可能な計算種類
export const gradeCalculationTypes = {
  'grade-1': ['calc-add', 'calc-sub'],
  'grade-2': ['calc-add', 'calc-sub'],
  'grade-3': ['calc-add', 'calc-sub', 'calc-mul'],
  'grade-4': ['calc-add', 'calc-sub', 'calc-mul', 'calc-div'],
  'grade-5': ['calc-add', 'calc-sub', 'calc-mul', 'calc-div', 'calc-mix'],
  'grade-6': ['calc-add', 'calc-sub', 'calc-mul', 'calc-div', 'calc-mix'],
} as const;

// 学年に応じて利用可能な計算種類を取得する関数
export const getAvailableCalculationTypes = (gradeId: string) => {
  const availableIds =
    gradeCalculationTypes[gradeId as keyof typeof gradeCalculationTypes] || [];
  return calculationTypes.filter((calcType) =>
    (availableIds as readonly string[]).includes(calcType.id)
  );
};

export const practiceThemes = [
  {
    id: 'practice-add-two',
    label: 'たし算（2項）',
    description: 'たし算のみでくり返し練習（最大50）',
    mode: 'add',
    max: 50,
  },
  {
    id: 'practice-sub-two',
    label: 'ひき算（2項）',
    description: 'ひき算のみでくり返し練習（最大50）',
    mode: 'sub',
    max: 50,
  },
  {
    id: 'practice-add-three',
    label: 'たし算（3項）',
    description: '3つの数をたす練習（最大60）',
    mode: 'add',
    max: 60,
  },
  {
    id: 'practice-add-four',
    label: 'たし算（4項）',
    description: '4つの数をたす練習（最大80）',
    mode: 'add',
    max: 80,
  },
  {
    id: 'practice-add-mixed-digits',
    label: '一桁＋二桁のたし算',
    description: '一桁と二桁のたし算を重点練習',
    mode: 'add',
    max: 120,
  },
  {
    id: 'practice-sub-double-digit',
    label: '二桁同士のひき算',
    description: '二桁と二桁のひき算（答えは0以上）',
    mode: 'sub',
    max: 99,
  },
  {
    id: 'practice-mix-three',
    label: 'たし算・ひき算（3項）',
    description: 'たし算とひき算を交えた3項の練習',
    mode: 'mix',
    max: 70,
  },
  {
    id: 'practice-mix-four',
    label: 'たし算・ひき算（4項）',
    description: 'たし算とひき算を交えた4項の練習',
    mode: 'mix',
    max: 90,
  },
  {
    id: 'practice-mul-table',
    label: 'かけ算九九',
    description: '1の段から9の段まで基本の九九練習',
    mode: 'mul',
    max: 81,
  },
  {
    id: 'practice-mul-easy',
    label: 'かんたんかけ算',
    description: '1×1から5×5までの基礎練習',
    mode: 'mul',
    max: 25,
  },
  {
    id: 'practice-mul-hard',
    label: 'むずかしいかけ算',
    description: '2桁×1桁の応用練習',
    mode: 'mul',
    max: 180,
  },
  {
    id: 'practice-mul-double',
    label: '2桁×2桁のかけ算',
    description: '2桁同士のかけ算練習',
    mode: 'mul',
    max: 400,
  },
] as const;

// 学年と計算種類の組み合わせから実際の練習設定を生成する関数
export const createPracticeSession = (
  gradeId: string,
  calcTypeId: string,
  themeId?: string
) => {
  const grade = gradeLevels.find((g) => g.id === gradeId);
  const calcType = calculationTypes.find((c) => c.id === calcTypeId);
  const theme = themeId ? practiceThemes.find((t) => t.id === themeId) : null;

  if (!grade || !calcType) return null;

  // テーマが選択されている場合はテーマの設定を使用
  if (theme) {
    return {
      gradeId: grade.id,
      gradeLabel: grade.label,
      gradeDescription: grade.description,
      calcTypeId: calcType.id,
      calcTypeLabel: calcType.label,
      themeId: theme.id,
      themeLabel: theme.label,
      themeDescription: theme.description,
      mode: theme.mode,
      max: theme.max,
    };
  }

  // 学年と計算種類の組み合わせから基本設定を生成
  const maxValues = {
    'grade-1': { add: 10, sub: 10, mul: 10, div: 10, mix: 10 },
    'grade-2': { add: 100, sub: 100, mul: 50, div: 50, mix: 100 },
    'grade-3': { add: 200, sub: 200, mul: 81, div: 81, mix: 200 },
    'grade-4': { add: 500, sub: 500, mul: 144, div: 144, mix: 500 },
    'grade-5': { add: 1000, sub: 1000, mul: 200, div: 200, mix: 1000 },
    'grade-6': { add: 2000, sub: 2000, mul: 300, div: 300, mix: 2000 },
  };

  const max =
    maxValues[gradeId as keyof typeof maxValues]?.[calcType.mode] || 100;

  return {
    gradeId: grade.id,
    gradeLabel: grade.label,
    gradeDescription: grade.description,
    calcTypeId: calcType.id,
    calcTypeLabel: calcType.label,
    themeId: null,
    themeLabel: null,
    themeDescription: null,
    mode: calcType.mode,
    max: max,
  };
};

// 後方互換性のため
export const gradePresets = [...gradeLevels, ...practiceThemes] as const;

export type GradePreset = (typeof gradePresets)[number];
