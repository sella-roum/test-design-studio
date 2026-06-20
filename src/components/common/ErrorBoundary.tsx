import { Component, type ReactNode } from 'react';
import type { FallbackProps } from './FallbackProps';

type Props = {
  children: ReactNode;
  fallback?: (props: FallbackProps) => ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetError: () => this.setState({ error: null }),
        });
      }
      return (
        <div className="error-page">
          <h2>予期しないエラーが発生しました</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>{this.state.error.message}</p>
          <button className="btn btn-primary" onClick={() => this.setState({ error: null })}>
            再試行
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
