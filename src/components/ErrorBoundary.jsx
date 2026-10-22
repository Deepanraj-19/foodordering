import React from 'react';
export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error('FoodieExpress UI error:', error, info); }
  render() {
    if (this.state.hasError) return <main className="panel"><h2>Something went wrong.</h2><p>Please refresh the page and try again.</p><button onClick={() => this.setState({ hasError: false })}>Try Again</button></main>;
    return this.props.children;
  }
}
