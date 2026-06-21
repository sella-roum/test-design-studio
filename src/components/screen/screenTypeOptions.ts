import type { ScreenType } from '../../lib/models/screen';

export const SCREEN_TYPE_OPTIONS: { value: ScreenType; label: string }[] = [
  { value: 'list', label: '一覧' },
  { value: 'detail', label: '詳細' },
  { value: 'create', label: '作成' },
  { value: 'edit', label: '編集' },
  { value: 'confirm', label: '確認' },
  { value: 'complete', label: '完了' },
  { value: 'error', label: 'エラー' },
  { value: 'settings', label: '設定' },
  { value: 'login', label: 'ログイン' },
  { value: 'dashboard', label: 'ダッシュボード' },
  { value: 'admin', label: '管理' },
  { value: 'other', label: 'その他' },
];

export const SCREEN_TYPE_LABELS: Record<ScreenType, string> = Object.fromEntries(
  SCREEN_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ScreenType, string>;
