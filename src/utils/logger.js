// Simple, clean console logger for user actions and page events
// Actions are viewed directly in Developer Tools (F12) Console

export function logAction(category, actionName, data = {}) {
  const tag = `[${category.toUpperCase()}]`;
  if (data && Object.keys(data).length > 0) {
    console.log(`${tag} ${actionName}:`, data);
  } else {
    console.log(`${tag} ${actionName}`);
  }
}
