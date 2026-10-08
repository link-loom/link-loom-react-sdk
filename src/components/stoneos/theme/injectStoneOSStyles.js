import tokensCss from '../tokens.css?raw';
import injectStyleSheet from './injectStyleSheet.js';
import { STOS_FONT_FACES_CSS } from './fontFaces.js';

const TOKENS_ATTRIBUTE = 'data-stos-tokens';

/**
 * Injects the kit's stylesheet (tokens, fonts and the rules of its pieces) once. StoneOSThemeProvider calls it; a
 * host that paints the kit with its own MUI theme and `--stos-*` variables calls it at startup instead.
 */
export default function injectStoneOSStyles() {
  injectStyleSheet(TOKENS_ATTRIBUTE, `${STOS_FONT_FACES_CSS}\n${tokensCss}`);
}
