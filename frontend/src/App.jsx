import React from "react";
import { ToastProvider } from "./context/ToastContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error(error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: "center", color: "#a24a3a", fontFamily: "sans-serif" }}>
          <h5>Something went wrong.</h5>
          <div style={{ fontSize: ".85rem" }}>{String(this.state.error && this.state.error.message)}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </ErrorBoundary>
  );
}
