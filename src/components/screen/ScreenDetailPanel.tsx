import type { Screen } from '../../lib/models/screen';
import { Badge } from '../common/Badge';
import { SCREEN_TYPE_LABELS } from './screenTypeOptions';

type ScreenDetailPanelProps = {
  screen: Screen;
  onAddUiNode: () => void;
};

export function ScreenDetailPanel({ screen, onAddUiNode }: ScreenDetailPanelProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 'var(--fs-section-title)', fontWeight: 600 }}>
          {screen.name}
        </h3>
        <Badge variant={screen.status} />
      </div>
      <table className="table" style={{ fontSize: 'var(--fs-body)', marginBottom: 16 }}>
        <tbody>
          <tr>
            <td style={{ fontWeight: 600, width: 120 }}>種別</td>
            <td>
              {screen.screenType ? SCREEN_TYPE_LABELS[screen.screenType] || screen.screenType : '-'}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>目的</td>
            <td>{screen.purpose || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>表示前提</td>
            <td>{screen.preconditions || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>確度</td>
            <td>{screen.confidence || '-'}</td>
          </tr>
        </tbody>
      </table>
      <button className="btn btn-primary btn-sm" onClick={onAddUiNode}>
        UI要素を追加
      </button>
    </div>
  );
}
