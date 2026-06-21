import type { UiNodeTreeNode } from '../../lib/models/uiNode';

type UiNodeTreeProps = {
  tree: UiNodeTreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
};

function formatRole(role?: string): string {
  if (!role) return '';
  const map: Record<string, string> = {
    button: 'btn',
    textbox: 'text',
    link: 'link',
    heading: 'h',
    checkbox: 'chk',
    combobox: 'cmb',
    listbox: 'lst',
    radio: 'rdo',
    table: 'tbl',
    dialog: 'dlg',
  };
  return map[role] || role.slice(0, 3);
}

export function UiNodeTree({
  tree,
  selectedId,
  onSelect,
  onAddChild,
  onEdit,
  onRemove,
}: UiNodeTreeProps) {
  if (tree.length === 0) return null;

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          selectedId={selectedId}
          depth={0}
          onSelect={onSelect}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}

type TreeNodeProps = {
  node: UiNodeTreeNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
};

function TreeNode({
  node,
  selectedId,
  depth,
  onSelect,
  onAddChild,
  onEdit,
  onRemove,
}: TreeNodeProps) {
  const isSelected = selectedId === node.id;
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          paddingLeft: 12 + depth * 20,
          borderRadius: 6,
          cursor: 'pointer',
          background: isSelected ? 'var(--color-primary-soft)' : 'transparent',
          fontSize: 'var(--fs-body)',
        }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', width: 12 }}>▼</span>
        ) : (
          <span style={{ width: 12 }} />
        )}
        {node.role && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--color-primary)',
              background: 'var(--color-primary-soft)',
              padding: '1px 4px',
              borderRadius: 3,
              textTransform: 'uppercase',
            }}
          >
            {formatRole(node.role)}
          </span>
        )}
        <span
          style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {node.name}
        </span>
        <span
          style={{ fontSize: 11, color: 'var(--color-text-muted)' }}
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(node.id);
          }}
        >
          +子
        </span>
        <span
          style={{ fontSize: 11, color: 'var(--color-text-secondary)', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(node.id);
          }}
        >
          編集
        </span>
        <span
          style={{ fontSize: 11, color: 'var(--color-danger)', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(node.id);
          }}
        >
          削除
        </span>
      </div>
      {hasChildren && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              depth={depth + 1}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
