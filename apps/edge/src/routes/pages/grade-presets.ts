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
  // 小1向け - たし算（10以下・二項）
  {
    id: 'practice-add-10-2',
    label: 'たし算（10まで・2つのかず）',
    description: '1 + 2 のような2つの数のたし算',
    mode: 'add' as const,
    max: 10,
    minGrade: 'grade-1',
    terms: 2 as const,
  },
  // 小1向け - たし算（10以下・三項）
  {
    id: 'practice-add-10-3',
    label: 'たし算（10まで・3つのかず）',
    description: '1 + 2 + 3 のような3つの数のたし算',
    mode: 'add' as const,
    max: 10,
    minGrade: 'grade-1',
    terms: 3 as const,
  },
  // 小1向け - ひき算（10以下・二項）
  {
    id: 'practice-sub-10-2',
    label: 'ひき算（10まで・2つのかず）',
    description: '5 - 2 のような2つの数のひき算',
    mode: 'sub' as const,
    max: 10,
    minGrade: 'grade-1',
    terms: 2 as const,
  },
  // 小1向け - ひき算（10以下・三項）
  {
    id: 'practice-sub-10-3',
    label: 'ひき算（10まで・3つのかず）',
    description: '10 - 3 - 2 のような3つの数のひき算',
    mode: 'sub' as const,
    max: 10,
    minGrade: 'grade-1',
    terms: 3 as const,
  },
  // 小1向け - たし算（20以下・二項）
  {
    id: 'practice-add-20-2',
    label: 'たし算（20まで・2つのかず）',
    description: '10 + 5 のような2つの数のたし算',
    mode: 'add' as const,
    max: 20,
    minGrade: 'grade-1',
    terms: 2 as const,
  },
  // 小1向け - たし算（20以下・三項）
  {
    id: 'practice-add-20-3',
    label: 'たし算（20まで・3つのかず）',
    description: '5 + 7 + 3 のような3つの数のたし算',
    mode: 'add' as const,
    max: 20,
    minGrade: 'grade-1',
    terms: 3 as const,
  },
  // 小1向け - ひき算（20以下・二項）
  {
    id: 'practice-sub-20-2',
    label: 'ひき算（20まで・2つのかず）',
    description: '15 - 8 のような2つの数のひき算',
    mode: 'sub' as const,
    max: 20,
    minGrade: 'grade-1',
    terms: 2 as const,
  },
  // 小1向け - ひき算（20以下・三項）
  {
    id: 'practice-sub-20-3',
    label: 'ひき算（20まで・3つのかず）',
    description: '20 - 7 - 5 のような3つの数のひき算',
    mode: 'sub' as const,
    max: 20,
    minGrade: 'grade-1',
    terms: 3 as const,
  },
  // 小2向け - たし算（50以下・二項）
  {
    id: 'practice-add-50-2',
    label: 'たし算（50まで・2つのかず）',
    description: '25 + 15 のような2つの数のたし算',
    mode: 'add' as const,
    max: 50,
    minGrade: 'grade-2',
    terms: 2 as const,
  },
  // 小2向け - たし算（50以下・三項）
  {
    id: 'practice-add-50-3',
    label: 'たし算（50まで・3つのかず）',
    description: '10 + 15 + 8 のような3つの数のたし算',
    mode: 'add' as const,
    max: 50,
    minGrade: 'grade-2',
    terms: 3 as const,
  },
  // 小2向け - ひき算（50以下・二項）
  {
    id: 'practice-sub-50-2',
    label: 'ひき算（50まで・2つのかず）',
    description: '40 - 18 のような2つの数のひき算',
    mode: 'sub' as const,
    max: 50,
    minGrade: 'grade-2',
    terms: 2 as const,
  },
  // 小2向け - ひき算（50以下・三項）
  {
    id: 'practice-sub-50-3',
    label: 'ひき算（50まで・3つのかず）',
    description: '50 - 20 - 10 のような3つの数のひき算',
    mode: 'sub' as const,
    max: 50,
    minGrade: 'grade-2',
    terms: 3 as const,
  },
  // 小2向け - たし算（100以下・二項）
  {
    id: 'practice-add-100-2',
    label: 'たし算（100まで・2つのかず）',
    description: '45 + 38 のような2つの数のたし算',
    mode: 'add' as const,
    max: 100,
    minGrade: 'grade-2',
    terms: 2 as const,
  },
  // 小2向け - たし算（100以下・三項）
  {
    id: 'practice-add-100-3',
    label: 'たし算（100まで・3つのかず）',
    description: '25 + 30 + 12 のような3つの数のたし算',
    mode: 'add' as const,
    max: 100,
    minGrade: 'grade-2',
    terms: 3 as const,
  },
  // 小2向け - ひき算（100以下・二項）
  {
    id: 'practice-sub-100-2',
    label: 'ひき算（100まで・2つのかず）',
    description: '73 - 29 のような2つの数のひき算',
    mode: 'sub' as const,
    max: 100,
    minGrade: 'grade-2',
    terms: 2 as const,
  },
  // 小2向け - ひき算（100以下・三項）
  {
    id: 'practice-sub-100-3',
    label: 'ひき算（100まで・3つのかず）',
    description: '100 - 40 - 25 のような3つの数のひき算',
    mode: 'sub' as const,
    max: 100,
    minGrade: 'grade-2',
    terms: 3 as const,
  },
  // 小3向け - たし算（200以下・二項）
  {
    id: 'practice-add-200-2',
    label: 'たし算（200まで・2つのかず）',
    description: '125 + 48 のような2つの数のたし算',
    mode: 'add' as const,
    max: 200,
    minGrade: 'grade-3',
    terms: 2 as const,
  },
  // 小3向け - たし算（200以下・三項）
  {
    id: 'practice-add-200-3',
    label: 'たし算（200まで・3つのかず）',
    description: '50 + 75 + 30 のような3つの数のたし算',
    mode: 'add' as const,
    max: 200,
    minGrade: 'grade-3',
    terms: 3 as const,
  },
  // 小3向け - ひき算（200以下・二項）
  {
    id: 'practice-sub-200-2',
    label: 'ひき算（200まで・2つのかず）',
    description: '150 - 73 のような2つの数のひき算',
    mode: 'sub' as const,
    max: 200,
    minGrade: 'grade-3',
    terms: 2 as const,
  },
  // 小3向け - ひき算（200以下・三項）
  {
    id: 'practice-sub-200-3',
    label: 'ひき算（200まで・3つのかず）',
    description: '200 - 80 - 50 のような3つの数のひき算',
    mode: 'sub' as const,
    max: 200,
    minGrade: 'grade-3',
    terms: 3 as const,
  },
  // 小3向け - たし算（500以下・二項）
  {
    id: 'practice-add-500-2',
    label: 'たし算（500まで・2つのかず）',
    description: '235 + 178 のような2つの数のたし算',
    mode: 'add' as const,
    max: 500,
    minGrade: 'grade-3',
    terms: 2 as const,
  },
  // 小3向け - たし算（500以下・三項）
  {
    id: 'practice-add-500-3',
    label: 'たし算（500まで・3つのかず）',
    description: '100 + 200 + 85 のような3つの数のたし算',
    mode: 'add' as const,
    max: 500,
    minGrade: 'grade-3',
    terms: 3 as const,
  },
  // 小3向け - ひき算（500以下・二項）
  {
    id: 'practice-sub-500-2',
    label: 'ひき算（500まで・2つのかず）',
    description: '380 - 145 のような2つの数のひき算',
    mode: 'sub' as const,
    max: 500,
    minGrade: 'grade-3',
    terms: 2 as const,
  },
  // 小3向け - ひき算（500以下・三項）
  {
    id: 'practice-sub-500-3',
    label: 'ひき算（500まで・3つのかず）',
    description: '500 - 200 - 100 のような3つの数のひき算',
    mode: 'sub' as const,
    max: 500,
    minGrade: 'grade-3',
    terms: 3 as const,
  },
  // 小3向け - 小数のたし算（基礎）
  {
    id: 'practice-add-decimal-basic',
    label: 'たし算（小数・基礎）',
    description: '小数点以下1桁までのたし算',
    mode: 'add' as const,
    max: 10,
    minGrade: 'grade-3',
    isDecimal: true,
    terms: 2 as const,
  },
  // 小3向け - 小数のひき算（基礎）
  {
    id: 'practice-sub-decimal-basic',
    label: 'ひき算（小数・基礎）',
    description: '小数点以下1桁までのひき算',
    mode: 'sub' as const,
    max: 10,
    minGrade: 'grade-3',
    isDecimal: true,
    terms: 2 as const,
  },
  // 小4向け - 小数のたし算（応用）
  {
    id: 'practice-add-decimal-adv',
    label: 'たし算（小数・応用）',
    description: '小数点以下2桁までのたし算',
    mode: 'add' as const,
    max: 100,
    minGrade: 'grade-4',
    isDecimal: true,
    terms: 2 as const,
  },
  // 小4向け - 小数のひき算（応用）
  {
    id: 'practice-sub-decimal-adv',
    label: 'ひき算（小数・応用）',
    description: '小数点以下2桁までのひき算',
    mode: 'sub' as const,
    max: 100,
    minGrade: 'grade-4',
    isDecimal: true,
    terms: 2 as const,
  },
  // 小1向け - 逆算（10まで）
  {
    id: 'practice-add-inverse-10',
    label: 'ぎゃくさん（10まで）',
    description: '1 + ? = 10のような逆算',
    mode: 'add-inverse' as const,
    max: 10,
    minGrade: 'grade-1',
    terms: 2 as const,
  },
  // 小1向け - 逆算（20まで）
  {
    id: 'practice-add-inverse-20',
    label: 'ぎゃくさん（20まで）',
    description: '答えが20以下の逆算',
    mode: 'add-inverse' as const,
    max: 20,
    minGrade: 'grade-1',
    terms: 2 as const,
  },
  // 小1向け - たし算・ひき算ミックス（10まで・二項）
  {
    id: 'practice-add-sub-mix-10-2',
    label: 'たし算・ひき算（10まで・2つ）',
    description: '5 + 3 や 8 - 2 のような2つの数',
    mode: 'add-sub-mix' as const,
    max: 10,
    minGrade: 'grade-1',
    terms: 2 as const,
  },
  // 小1向け - たし算・ひき算ミックス（10まで・三項）
  {
    id: 'practice-add-sub-mix-10-3',
    label: 'たし算・ひき算（10まで・3つ）',
    description: '1 + 2 + 3 や 5 + 3 - 2 のような3つの数',
    mode: 'add-sub-mix' as const,
    max: 10,
    minGrade: 'grade-1',
    terms: 3 as const,
  },
  // 小1向け - たし算・ひき算ミックス（20まで・二項）
  {
    id: 'practice-add-sub-mix-20-2',
    label: 'たし算・ひき算（20まで・2つ）',
    description: '12 + 5 や 15 - 7 のような2つの数',
    mode: 'add-sub-mix' as const,
    max: 20,
    minGrade: 'grade-1',
    terms: 2 as const,
  },
  // 小1向け - たし算・ひき算ミックス（20まで・三項）
  {
    id: 'practice-add-sub-mix-20-3',
    label: 'たし算・ひき算（20まで・3つ）',
    description: '5 + 7 + 3 や 10 + 5 - 3 のような3つの数',
    mode: 'add-sub-mix' as const,
    max: 20,
    minGrade: 'grade-1',
    terms: 3 as const,
  },
  // 小2向け - 逆算（50まで）
  {
    id: 'practice-add-inverse-50',
    label: 'ぎゃくさん（50まで）',
    description: '答えが50以下の逆算',
    mode: 'add-inverse' as const,
    max: 50,
    minGrade: 'grade-2',
    terms: 2 as const,
  },
  // 小2向け - 逆算（100まで）
  {
    id: 'practice-add-inverse-100',
    label: 'ぎゃくさん（100まで）',
    description: '答えが100以下の逆算',
    mode: 'add-inverse' as const,
    max: 100,
    minGrade: 'grade-2',
    terms: 2 as const,
  },
  // 小2向け - たし算・ひき算ミックス（50まで・二項）
  {
    id: 'practice-add-sub-mix-50-2',
    label: 'たし算・ひき算（50まで・2つ）',
    description: '23 + 15 や 40 - 12 のような2つの数',
    mode: 'add-sub-mix' as const,
    max: 50,
    minGrade: 'grade-2',
    terms: 2 as const,
  },
  // 小2向け - たし算・ひき算ミックス（50まで・三項）
  {
    id: 'practice-add-sub-mix-50-3',
    label: 'たし算・ひき算（50まで・3つ）',
    description: '10 + 15 + 8 や 30 + 10 - 5 のような3つの数',
    mode: 'add-sub-mix' as const,
    max: 50,
    minGrade: 'grade-2',
    terms: 3 as const,
  },
  // 小2向け - たし算・ひき算ミックス（100まで・二項）
  {
    id: 'practice-add-sub-mix-100-2',
    label: 'たし算・ひき算（100まで・2つ）',
    description: '45 + 38 や 73 - 29 のような2つの数',
    mode: 'add-sub-mix' as const,
    max: 100,
    minGrade: 'grade-2',
    terms: 2 as const,
  },
  // 小2向け - たし算・ひき算ミックス（100まで・三項）
  {
    id: 'practice-add-sub-mix-100-3',
    label: 'たし算・ひき算（100まで・3つ）',
    description: '25 + 30 + 12 や 50 + 20 - 15 のような3つの数',
    mode: 'add-sub-mix' as const,
    max: 100,
    minGrade: 'grade-2',
    terms: 3 as const,
  },
  // 小3向け - たし算・ひき算ミックス（200まで・二項）
  {
    id: 'practice-add-sub-mix-200-2',
    label: 'たし算・ひき算（200まで・2つ）',
    description: '125 + 48 や 150 - 73 のような2つの数',
    mode: 'add-sub-mix' as const,
    max: 200,
    minGrade: 'grade-3',
    terms: 2 as const,
  },
  // 小3向け - たし算・ひき算ミックス（200まで・三項）
  {
    id: 'practice-add-sub-mix-200-3',
    label: 'たし算・ひき算（200まで・3つ）',
    description: '50 + 75 + 30 や 100 + 50 - 25 のような3つの数',
    mode: 'add-sub-mix' as const,
    max: 200,
    minGrade: 'grade-3',
    terms: 3 as const,
  },
  // 小3向け - たし算・ひき算ミックス（500まで・二項）
  {
    id: 'practice-add-sub-mix-500-2',
    label: 'たし算・ひき算（500まで・2つ）',
    description: '235 + 178 や 380 - 145 のような2つの数',
    mode: 'add-sub-mix' as const,
    max: 500,
    minGrade: 'grade-3',
    terms: 2 as const,
  },
  // 小3向け - たし算・ひき算ミックス（500まで・三項）
  {
    id: 'practice-add-sub-mix-500-3',
    label: 'たし算・ひき算（500まで・3つ）',
    description: '100 + 200 + 85 や 300 + 100 - 50 のような3つの数',
    mode: 'add-sub-mix' as const,
    max: 500,
    minGrade: 'grade-3',
    terms: 3 as const,
  },
  // 小5向け - 四則演算ミックス（100まで・二項）
  {
    id: 'practice-mix-100-2',
    label: '四則演算（100まで・2つ）',
    description: '45 + 38 や 12 × 5 のような2つの数',
    mode: 'mix' as const,
    max: 100,
    minGrade: 'grade-5',
    terms: 2 as const,
  },
  // 小5向け - 四則演算ミックス（500まで・二項）
  {
    id: 'practice-mix-500-2',
    label: '四則演算（500まで・2つ）',
    description: '235 + 178 や 25 × 12 のような2つの数',
    mode: 'mix' as const,
    max: 500,
    minGrade: 'grade-5',
    terms: 2 as const,
  },
  // かけ算 - 小3向け（やさしい）
  {
    id: 'practice-mul-easy',
    label: 'かけ算（やさしい）',
    description: '答えが25以下のかけ算',
    mode: 'mul' as const,
    max: 25,
    minGrade: 'grade-3',
    terms: 2 as const,
  },
  // かけ算 - 小3向け（九九）
  {
    id: 'practice-mul-table',
    label: 'かけ算（九九）',
    description: '答えが81以下のかけ算',
    mode: 'mul' as const,
    max: 81,
    minGrade: 'grade-3',
    terms: 2 as const,
  },
  // かけ算 - 小3向け（むずかしい）
  {
    id: 'practice-mul-hard',
    label: 'かけ算（むずかしい）',
    description: '答えが180以下のかけ算',
    mode: 'mul' as const,
    max: 180,
    minGrade: 'grade-3',
    terms: 2 as const,
  },
  // かけ算 - 小3向け（とてもむずかしい）
  {
    id: 'practice-mul-double',
    label: 'かけ算（とてもむずかしい）',
    description: '答えが400以下のかけ算',
    mode: 'mul' as const,
    max: 400,
    minGrade: 'grade-3',
    terms: 2 as const,
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
