import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handler for unhandled promise rejections & runtime errors
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled Promise Rejection caught & handled:', event.reason);
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  console.warn('Global error caught:', event.error || event.message);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

