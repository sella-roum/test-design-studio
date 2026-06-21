import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ToastProvider } from './components/common/Toast';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ToastProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ToastProvider>,
  );
}

describe('App', () => {
  it('renders the app shell with sidebar', () => {
    renderWithProviders(<AppShell />);

    const brandElements = screen.getAllByText('Test Design Studio');
    expect(brandElements).toHaveLength(2);
    expect(brandElements[0]).toBeInTheDocument();

    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('プロジェクト')).toBeInTheDocument();
  });
});
