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

// 学年の順序を取得する関数（比較用）
const getGradeOrder = (gradeId: string): number => {
  const index = gradeLevels.findIndex((g) => g.id === gradeId);
  return index === -1 ? 0 : index;
};

// 学年と計算種類に応じて利用可能なテーマを取得する関数
export const getAvailableThemes = (
  gradeId: string,
  calculationMode?: string
) => {
  const currentGradeOrder = getGradeOrder(gradeId);

  return practiceThemes.filter((theme) => {
    // 計算種類でフィルタリング
    if (calculationMode && theme.mode !== calculationMode) {
      return false;
    }

    // 学年の最低要件でフィルタリング
    const themeMinGradeOrder = getGradeOrder(theme.minGrade);
    return currentGradeOrder >= themeMinGradeOrder;
  });
};

export const practiceThemes = [
  {
    id: 'practice-add-two',
    label: 'たし算（基礎）',
    description: 'たし算の基礎練習（答えが50以下）',
    mode: 'add',
    max: 50,
    minGrade: 'grade-1',
  },
  {
    id: 'practice-sub-two',
    label: 'ひき算（基礎）',
    description: 'ひき算の基礎練習（答えが50以下）',
    mode: 'sub',
    max: 50,
    minGrade: 'grade-1',
  },
  {
    id: 'practice-add-three',
    label: 'たし算（少し大きい数）',
    description: 'たし算の練習（答えが60以下）',
    mode: 'add',
    max: 60,
    minGrade: 'grade-3',
  },
  {
    id: 'practice-add-four',
    label: 'たし算（大きい数）',
    description: 'たし算の練習（答えが80以下）',
    mode: 'add',
    max: 80,
    minGrade: 'grade-3',
  },
  {
    id: 'practice-add-mixed-digits',
    label: 'たし算（応用）',
    description: 'たし算の応用練習（答えが120以下）',
    mode: 'add',
    max: 120,
    minGrade: 'grade-3',
  },
  {
    id: 'practice-sub-double-digit',
    label: 'ひき算（応用）',
    description: 'ひき算の応用練習（答えが99以下）',
    mode: 'sub',
    max: 99,
    minGrade: 'grade-3',
  },
  {
    id: 'practice-mix-three',
    label: 'たし算・ひき算（基礎）',
    description: 'たし算とひき算の練習（答えが70以下）',
    mode: 'mix',
    max: 70,
    minGrade: 'grade-5',
  },
  {
    id: 'practice-mix-four',
    label: 'たし算・ひき算（応用）',
    description: 'たし算とひき算の応用練習（答えが90以下）',
    mode: 'mix',
    max: 90,
    minGrade: 'grade-5',
  },
  {
    id: 'practice-mul-table',
    label: 'かけ算（基礎）',
    description: 'かけ算の基礎練習（答えが81以下）',
    mode: 'mul',
    max: 81,
    minGrade: 'grade-3',
  },
  {
    id: 'practice-mul-easy',
    label: 'かけ算（やさしい）',
    description: 'かけ算の入門練習（答えが25以下）',
    mode: 'mul',
    max: 25,
    minGrade: 'grade-3',
  },
  {
    id: 'practice-mul-hard',
    label: 'かけ算（むずかしい）',
    description: 'かけ算の応用練習（答えが180以下）',
    mode: 'mul',
    max: 180,
    minGrade: 'grade-3',
  },
  {
    id: 'practice-mul-double',
    label: 'かけ算（とてもむずかしい）',
    description: 'かけ算の高度な練習（答えが400以下）',
    mode: 'mul',
    max: 400,
    minGrade: 'grade-3',
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
