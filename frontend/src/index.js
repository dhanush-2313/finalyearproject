import React from "react"
import ReactDOM from "react-dom/client" // React 18 requires this import
import App from "./App.js" // Ensure correct path
import ErrorBoundary from "./components/ErrorBoundary"

const rootElement = document.getElementById("root")

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
} else {
  console.error("❌ Root element not found. Check if 'index.html' contains <div id='root'></div>.")
}

