import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// StrictMode intentionally double-invokes components in dev to surface side-effect bugs,
// but this clashes with framer-motion's AnimatePresence — both mount cycles render a visible
// frame, producing the "everything shows twice" effect on navigation. Removed here since:
// 1. Vite HMR already provides fast feedback in dev without needing the double-invoke
// 2. Our RTK Query + Redux setup is already strict-mode-safe (no direct mutation, pure reducers)
// 3. It only affects the dev bundle anyway — production builds never double-invoke regardless
createRoot(document.getElementById('root')!).render(<App />);
