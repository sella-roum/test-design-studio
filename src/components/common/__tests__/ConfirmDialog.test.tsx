import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    title: '確認',
    message: '本当に実行しますか？',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and message', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('確認')).toBeInTheDocument();
    expect(screen.getByText('本当に実行しますか？')).toBeInTheDocument();
  });

  it('has dialog role and aria attributes', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title');
  });

  it('calls onCancel when Escape is pressed', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    await userEvent.click(screen.getByText('キャンセル'));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    await userEvent.click(screen.getByText('削除する'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('closes on overlay click', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    const overlay = dialog.parentElement!;
    expect(overlay.className).toContain('dialog-overlay');
    fireEvent.click(overlay);
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside dialog', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it('renders custom button labels', () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="承諾する" cancelLabel="戻る" />);
    expect(screen.getByText('承諾する')).toBeInTheDocument();
    expect(screen.getByText('戻る')).toBeInTheDocument();
  });

  it('applies danger style by default', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const confirmBtn = screen.getByText('削除する');
    expect(confirmBtn.className).toContain('btn-danger');
  });

  it('applies primary style when danger is false', () => {
    render(<ConfirmDialog {...defaultProps} danger={false} />);
    const confirmBtn = screen.getByText('削除する');
    expect(confirmBtn.className).toContain('btn-primary');
  });
});
