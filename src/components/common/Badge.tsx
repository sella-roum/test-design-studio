type BadgeVariant = 'active' | 'deprecated' | 'removed';

type BadgeProps = {
  variant: BadgeVariant;
  label?: string;
};

const LABELS: Record<BadgeVariant, string> = {
  active: '有効',
  deprecated: '非推奨',
  removed: '削除済み',
};

export function Badge({ variant, label }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{label ?? LABELS[variant]}</span>;
}
