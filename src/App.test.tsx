import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the initial product shell and empty state', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Test Design Studio' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'ローカルファーストなテスト設計ワークスペース',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('プロジェクトを作成して、テスト設計を始めましょう。'),
    ).toBeInTheDocument()
  })
})
