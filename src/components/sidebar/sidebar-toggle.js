// The layout engine (Adminto's app.js) owns the sidebar's size. Its menu button, the Command Center
// and every collapse control go through this one event, so they all stay in step.
export const SIDEBAR_TOGGLE_EVENT = 'toggle-sidebar';

export const toggleSidebar = () => window.dispatchEvent(new Event(SIDEBAR_TOGGLE_EVENT));
