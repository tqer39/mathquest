export const gradeLevels = [
  {
    id: 'grade-1',
    label: '小1',
    description: '10までのたし算・ひき算',
    mode: 'add',
    max: 10,
  },
  {
    id: 'grade-2',
    label: '小2',
    description: '100までのひき算',
    mode: 'sub',
    max: 100,
  },
  {
    id: 'grade-3',
    label: '小3',
    description: 'かけ算（九九）',
    mode: 'mul',
    max: 81,
  },
  {
    id: 'grade-4',
    label: '小4',
    description: '割り算（あまりあり）',
    mode: 'mix',
    max: 144,
  },
  {
    id: 'grade-5',
    label: '小5',
    description: '小数のたし算・ひき算',
    mode: 'mix',
    max: 200,
  },
  {
    id: 'grade-6',
    label: '小6',
    description: '分数のたし算・ひき算（通分あり）',
    mode: 'mix',
    max: 300,
  },
] as const;

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
] as const;

export const gradePresets = [...gradeLevels, ...practiceThemes] as const;

export type GradePreset = (typeof gradePresets)[number];
