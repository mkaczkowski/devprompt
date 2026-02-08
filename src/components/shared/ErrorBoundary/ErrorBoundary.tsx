import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorFallbackUI } from '@/components/shared/ErrorBoundary/ErrorFallbackUI';
import { captureException } from '@/lib/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Report error to Sentry with component stack
    captureException(error, { componentStack: errorInfo.componentStack ?? undefined });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Reset the error boundary state
   */
  reset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallbackUI error={this.state.error} onRetry={this.reset} onReload={this.handleReload} />;
    }

    return this.props.children;
  }
}
