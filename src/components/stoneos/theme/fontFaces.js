import inter400 from '../../../fonts/stoneos/inter-latin-400-normal.woff2?base64';
import inter500 from '../../../fonts/stoneos/inter-latin-500-normal.woff2?base64';
import inter600 from '../../../fonts/stoneos/inter-latin-600-normal.woff2?base64';

const INTER_FACES = [
  { weight: 400, locals: ['Inter', 'Inter Regular', 'Inter-Regular'], data: inter400 },
  { weight: 500, locals: ['Inter Medium', 'Inter-Medium'], data: inter500 },
  { weight: 600, locals: ['Inter SemiBold', 'Inter-SemiBold'], data: inter600 },
];

const LATIN_UNICODE_RANGE =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

export const STOS_FONT_FACES_CSS = INTER_FACES.map(
  ({ weight, locals, data }) => `@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: ${locals.map((name) => `local('${name}')`).join(', ')}, url(data:font/woff2;base64,${data}) format('woff2');
  unicode-range: ${LATIN_UNICODE_RANGE};
}`,
).join('\n');
