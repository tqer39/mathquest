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
    id: 'calc-add-sub-mix',
    label: 'たし算・ひき算',
    description: 'たし算とひき算の混合練習',
    mode: 'add-sub-mix',
  },
  {
    id: 'calc-add-inverse',
    label: 'ぎゃくさん（たし算）',
    description: '1 + ? = 10のような逆算練習',
    mode: 'add-inverse',
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
    label: '四則演算',
    description: '複合的な計算練習',
    mode: 'mix',
  },
] as const;

// 学年ごとの利用可能な計算種類
export const gradeCalculationTypes = {
  'grade-1': ['calc-add', 'calc-sub', 'calc-add-sub-mix', 'calc-add-inverse'],
  'grade-2': ['calc-add', 'calc-sub', 'calc-add-sub-mix', 'calc-add-inverse'],
  'grade-3': [
    'calc-add',
    'calc-sub',
    'calc-add-sub-mix',
    'calc-add-inverse',
    'calc-mul',
  ],
  'grade-4': [
    'calc-add',
    'calc-sub',
    'calc-add-sub-mix',
    'calc-add-inverse',
    'calc-mul',
    'calc-div',
  ],
  'grade-5': [
    'calc-add',
    'calc-sub',
    'calc-add-sub-mix',
    'calc-add-inverse',
    'calc-mul',
    'calc-div',
    'calc-mix',
  ],
  'grade-6': [
    'calc-add',
    'calc-sub',
    'calc-add-sub-mix',
    'calc-add-inverse',
    'calc-mul',
    'calc-div',
    'calc-mix',
  ],
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
  // 小1向け - たし算（10以下）
  {
    id: 'practice-add-10',
    label: 'たし算（10までのかず）',
    description: '答えが10以下のたし算',
    mode: 'add',
    max: 10,
    minGrade: 'grade-1',
  },
  // 小1向け - ひき算（10以下）
  {
    id: 'practice-sub-10',
    label: 'ひき算（10までのかず）',
    description: '答えが10以下のひき算',
    mode: 'sub',
    max: 10,
    minGrade: 'grade-1',
  },
  // 小1向け - たし算（20以下）
  {
    id: 'practice-add-20',
    label: 'たし算（20までのかず）',
    description: '答えが20以下のたし算',
    mode: 'add',
    max: 20,
    minGrade: 'grade-1',
  },
  // 小1向け - ひき算（20以下）
  {
    id: 'practice-sub-20',
    label: 'ひき算（20までのかず）',
    description: '答えが20以下のひき算',
    mode: 'sub',
    max: 20,
    minGrade: 'grade-1',
  },
  // 小2向け - たし算（50以下）
  {
    id: 'practice-add-50',
    label: 'たし算（50までのかず）',
    description: '答えが50以下のたし算',
    mode: 'add',
    max: 50,
    minGrade: 'grade-2',
  },
  // 小2向け - ひき算（50以下）
  {
    id: 'practice-sub-50',
    label: 'ひき算（50までのかず）',
    description: '答えが50以下のひき算',
    mode: 'sub',
    max: 50,
    minGrade: 'grade-2',
  },
  // 小2向け - たし算（100以下）
  {
    id: 'practice-add-100',
    label: 'たし算（100までのかず）',
    description: '答えが100以下のたし算',
    mode: 'add',
    max: 100,
    minGrade: 'grade-2',
  },
  // 小2向け - ひき算（100以下）
  {
    id: 'practice-sub-100',
    label: 'ひき算（100までのかず）',
    description: '答えが100以下のひき算',
    mode: 'sub',
    max: 100,
    minGrade: 'grade-2',
  },
  // 小3向け - たし算（応用・大きい数）
  {
    id: 'practice-add-200',
    label: 'たし算（200までのかず）',
    description: '答えが200以下のたし算',
    mode: 'add',
    max: 200,
    minGrade: 'grade-3',
  },
  // 小3向け - ひき算（応用・大きい数）
  {
    id: 'practice-sub-200',
    label: 'ひき算（200までのかず）',
    description: '答えが200以下のひき算',
    mode: 'sub',
    max: 200,
    minGrade: 'grade-3',
  },
  // 小3向け - たし算（さらに大きい数）
  {
    id: 'practice-add-500',
    label: 'たし算（500までのかず）',
    description: '答えが500以下のたし算',
    mode: 'add',
    max: 500,
    minGrade: 'grade-3',
  },
  // 小3向け - ひき算（さらに大きい数）
  {
    id: 'practice-sub-500',
    label: 'ひき算（500までのかず）',
    description: '答えが500以下のひき算',
    mode: 'sub',
    max: 500,
    minGrade: 'grade-3',
  },
  // 小3向け - 小数のたし算（基礎）
  {
    id: 'practice-add-decimal-basic',
    label: 'たし算（小数・基礎）',
    description: '小数点以下1桁までのたし算',
    mode: 'add',
    max: 10,
    minGrade: 'grade-3',
    isDecimal: true,
  },
  // 小3向け - 小数のひき算（基礎）
  {
    id: 'practice-sub-decimal-basic',
    label: 'ひき算（小数・基礎）',
    description: '小数点以下1桁までのひき算',
    mode: 'sub',
    max: 10,
    minGrade: 'grade-3',
    isDecimal: true,
  },
  // 小4向け - 小数のたし算（応用）
  {
    id: 'practice-add-decimal-adv',
    label: 'たし算（小数・応用）',
    description: '小数点以下2桁までのたし算',
    mode: 'add',
    max: 100,
    minGrade: 'grade-4',
    isDecimal: true,
  },
  // 小4向け - 小数のひき算（応用）
  {
    id: 'practice-sub-decimal-adv',
    label: 'ひき算（小数・応用）',
    description: '小数点以下2桁までのひき算',
    mode: 'sub',
    max: 100,
    minGrade: 'grade-4',
    isDecimal: true,
  },
  // 小1向け - 逆算（10まで）
  {
    id: 'practice-add-inverse-10',
    label: 'ぎゃくさん（10まで）',
    description: '1 + ? = 10のような逆算',
    mode: 'add-inverse',
    max: 10,
    minGrade: 'grade-1',
  },
  // 小1向け - 逆算（20まで）
  {
    id: 'practice-add-inverse-20',
    label: 'ぎゃくさん（20まで）',
    description: '答えが20以下の逆算',
    mode: 'add-inverse',
    max: 20,
    minGrade: 'grade-1',
  },
  // 小1向け - たし算・ひき算ミックス（10まで）
  {
    id: 'practice-add-sub-mix-10',
    label: 'たし算・ひき算（10まで）',
    description: '答えが10以下のたし算とひき算',
    mode: 'add-sub-mix',
    max: 10,
    minGrade: 'grade-1',
  },
  // 小1向け - たし算・ひき算ミックス（20まで）
  {
    id: 'practice-add-sub-mix-20',
    label: 'たし算・ひき算（20まで）',
    description: '答えが20以下のたし算とひき算',
    mode: 'add-sub-mix',
    max: 20,
    minGrade: 'grade-1',
  },
  // 小2向け - 逆算（50まで）
  {
    id: 'practice-add-inverse-50',
    label: 'ぎゃくさん（50まで）',
    description: '答えが50以下の逆算',
    mode: 'add-inverse',
    max: 50,
    minGrade: 'grade-2',
  },
  // 小2向け - 逆算（100まで）
  {
    id: 'practice-add-inverse-100',
    label: 'ぎゃくさん（100まで）',
    description: '答えが100以下の逆算',
    mode: 'add-inverse',
    max: 100,
    minGrade: 'grade-2',
  },
  // 小2向け - たし算・ひき算ミックス（50まで）
  {
    id: 'practice-add-sub-mix-50',
    label: 'たし算・ひき算（50まで）',
    description: '答えが50以下のたし算とひき算',
    mode: 'add-sub-mix',
    max: 50,
    minGrade: 'grade-2',
  },
  // 小2向け - たし算・ひき算ミックス（100まで）
  {
    id: 'practice-add-sub-mix-100',
    label: 'たし算・ひき算（100まで）',
    description: '答えが100以下のたし算とひき算',
    mode: 'add-sub-mix',
    max: 100,
    minGrade: 'grade-2',
  },
  // 小3向け - たし算・ひき算ミックス（200まで）
  {
    id: 'practice-add-sub-mix-200',
    label: 'たし算・ひき算（200まで）',
    description: '答えが200以下のたし算とひき算',
    mode: 'add-sub-mix',
    max: 200,
    minGrade: 'grade-3',
  },
  // 小3向け - たし算・ひき算ミックス（500まで）
  {
    id: 'practice-add-sub-mix-500',
    label: 'たし算・ひき算（500まで）',
    description: '答えが500以下のたし算とひき算',
    mode: 'add-sub-mix',
    max: 500,
    minGrade: 'grade-3',
  },
  // 小5向け - 四則演算ミックス（基礎）
  {
    id: 'practice-mix-100',
    label: '四則演算（100まで）',
    description: '答えが100以下の四則演算',
    mode: 'mix',
    max: 100,
    minGrade: 'grade-5',
  },
  // 小5向け - 四則演算ミックス（応用）
  {
    id: 'practice-mix-500',
    label: '四則演算（500まで）',
    description: '答えが500以下の四則演算',
    mode: 'mix',
    max: 500,
    minGrade: 'grade-5',
  },
  // かけ算 - 小3向け（やさしい）
  {
    id: 'practice-mul-easy',
    label: 'かけ算（やさしい）',
    description: '答えが25以下のかけ算',
    mode: 'mul',
    max: 25,
    minGrade: 'grade-3',
  },
  // かけ算 - 小3向け（九九）
  {
    id: 'practice-mul-table',
    label: 'かけ算（九九）',
    description: '答えが81以下のかけ算',
    mode: 'mul',
    max: 81,
    minGrade: 'grade-3',
  },
  // かけ算 - 小3向け（むずかしい）
  {
    id: 'practice-mul-hard',
    label: 'かけ算（むずかしい）',
    description: '答えが180以下のかけ算',
    mode: 'mul',
    max: 180,
    minGrade: 'grade-3',
  },
  // かけ算 - 小3向け（とてもむずかしい）
  {
    id: 'practice-mul-double',
    label: 'かけ算（とてもむずかしい）',
    description: '答えが400以下のかけ算',
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
    'grade-1': {
      add: 10,
      sub: 10,
      mul: 10,
      div: 10,
      mix: 10,
      'add-inverse': 10,
      'add-sub-mix': 10,
    },
    'grade-2': {
      add: 100,
      sub: 100,
      mul: 50,
      div: 50,
      mix: 100,
      'add-inverse': 100,
      'add-sub-mix': 100,
    },
    'grade-3': {
      add: 200,
      sub: 200,
      mul: 81,
      div: 81,
      mix: 200,
      'add-inverse': 200,
      'add-sub-mix': 200,
    },
    'grade-4': {
      add: 500,
      sub: 500,
      mul: 144,
      div: 144,
      mix: 500,
      'add-inverse': 500,
      'add-sub-mix': 500,
    },
    'grade-5': {
      add: 1000,
      sub: 1000,
      mul: 200,
      div: 200,
      mix: 1000,
      'add-inverse': 1000,
      'add-sub-mix': 1000,
    },
    'grade-6': {
      add: 2000,
      sub: 2000,
      mul: 300,
      div: 300,
      mix: 2000,
      'add-inverse': 2000,
      'add-sub-mix': 2000,
    },
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
