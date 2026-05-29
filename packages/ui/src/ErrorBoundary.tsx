import React, { Component, ReactNode } from 'react';
import { Button } from '../Button';
import { Card } from '../Card';
import { DESIGN_TOKENS } from '../tokens';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.ComponentType<{ error: Error; resetError: () => void }> = ({
  error,
  resetError,
}) => (
  <Card>
    <div style={{ textAlign: 'center', padding: DESIGN_TOKENS.spacing.lg }}>
      <h3>Something went wrong</h3>
      <p style={{ color: DESIGN_TOKENS.colors.textSecondary, marginBottom: DESIGN_TOKENS.spacing.md }}>
        {error.message}
      </p>
      <Button label="Try Again" onClick={resetError} variant="secondary" />
    </div>
  </Card>
);

export { ErrorBoundary };