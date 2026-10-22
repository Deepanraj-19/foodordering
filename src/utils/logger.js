// Centralized Logger for Web Page Actions and State Events
// Displays structured, colorized logs in DevTools Console

const BADGES = {
  action: 'background: #fd7e14; color: #fff; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-family: monospace;',
  api: 'background: #0d6efd; color: #fff; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-family: monospace;',
  cart: 'background: #20c997; color: #fff; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-family: monospace;',
  auth: 'background: #6f42c1; color: #fff; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-family: monospace;',
  route: 'background: #0dcaf0; color: #000; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-family: monospace;',
  crud: 'background: #d63384; color: #fff; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-family: monospace;',
};

/**
 * Log any user interaction / action in the web page
 */
export function logAction(category, actionName, data = {}) {
  const badgeStyle = BADGES[category] || BADGES.action;
  const time = new Date().toLocaleTimeString();

  console.groupCollapsed(`%c⚡ [${category.toUpperCase()}]%c ${actionName} %c@ ${time}`, badgeStyle, 'font-weight: bold; color: #212529;', 'color: #888; font-size: 11px;');
  if (data && Object.keys(data).length > 0) {
    console.table ? console.table(data) : console.log(data);
  }
  console.log('%cRaw Action Payload:', 'color: #6c757d;', data);
  console.groupEnd();

  // Dispatch for on-screen console viewer
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:log', {
      detail: { type: category, title: actionName, data, time }
    }));
  }
}

/**
 * Initialize startup banner in console
 */
export function initConsoleBanner() {
  if (typeof window === 'undefined' || window.__foodieBannerInitialized) return;
  window.__foodieBannerInitialized = true;

  console.log(
    '%c🍽️ FoodieExpress — REST API, JWT & User Action Console Tracker\n' +
    '%cExperiment 1-4: REST API (Fetch/Axios), State Management, CRUD Operations & JWT Auth Active\n' +
    '%cAll user actions, JWT lifecycle events, and simulated network API calls are monitored below ↓',
    'background: #b93824; color: white; font-size: 14px; font-weight: bold; padding: 6px 12px; border-radius: 6px;',
    'color: #b93824; font-weight: bold; font-size: 12px; padding: 4px 0;',
    'color: #555; font-size: 11px;'
  );
}
