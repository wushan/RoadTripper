import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-100 px-6 text-center">
          <div className="mb-4 text-6xl">{'\u{1F635}'}</div>
          <h1 className="mb-2 text-xl font-bold text-gray-800">
            {'\u767C\u751F\u932F\u8AA4'}
          </h1>
          <p className="mb-2 text-gray-600">
            {'\u61C9\u7528\u7A0B\u5F0F\u9047\u5230\u4E86\u554F\u984C\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002'}
          </p>
          {this.state.error && (
            <p className="mb-6 font-mono text-sm text-gray-400">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleRetry}
            className="rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
          >
            {'\u91CD\u65B0\u8F09\u5165'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
