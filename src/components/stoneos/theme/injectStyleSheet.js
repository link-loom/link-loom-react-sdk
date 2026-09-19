// Injects a <style> once per attribute. Runtime hosts do not always load the build's extracted
// stylesheet, so kit CSS ships inside JS and is appended to <head> on first render.
const injectStyleSheet = (attribute, cssText) => {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.head.querySelector(`style[${attribute}]`)) {
    return;
  }

  const style = document.createElement('style');
  style.setAttribute(attribute, '');
  style.textContent = cssText;
  document.head.appendChild(style);
};

export default injectStyleSheet;
