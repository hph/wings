/**
 * Calculate the dimensions of characters in the monospaced font
 * as defined by the configuration object.
 */
export default function computeFontDimensions (config) {
  const testString = 'The quick brown fox jumps over the lazy dog';
  const el = document.createElement('span');
  el.innerText = testString;
  el.style.lineHeight = config.theme.lineHeight;
  el.style.fontFamily = config.theme.fontFamily;
  el.style.fontSize = config.theme.fontSize;
  el.style.whiteSpace = 'nowrap';
  el.style.position = 'absolute';
  el.style.top = 0;
  el.style.left = 0;
  el.style.opacity = 0;
  document.body.appendChild(el);
  const { width, height } = el.getBoundingClientRect();
  el.remove();
  return {
    height,
    width: width / testString.length,
  };
}
