import { Component } from 'react';

/** Catches render errors so one broken page doesn't blank the whole app. */
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UI error:', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-sand px-4 text-center">
        <p className="font-display text-xl text-ink">Something went wrong on this page.</p>
        <p className="max-w-md text-sm text-black/50">{String(this.state.error?.message || this.state.error)}</p>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => window.location.assign('/')}>
            Go to dashboard
          </button>
          <button className="btn-ghost" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
