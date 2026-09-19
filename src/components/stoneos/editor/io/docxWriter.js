import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Footer,
  Header,
  HeadingLevel,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  ImageRun,
  LevelFormat,
  LineRuleType,
  Packer,
  PageBreak,
  PageNumber,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  TextWrappingSide,
  TextWrappingType,
  VerticalPositionRelativeFrom,
  WidthType,
  convertMillimetersToTwip,
} from 'docx';
import { resolvePageLayout, mmToPx, PAGE_SIZES_MM } from '../pageLayout.js';
import { INDENT_STEP_PX } from '../extensions/indent.extension.js';
import { resolveStorageImages } from './resolveStorageImages.js';

const BULLET_REFERENCE = 'stos-bullet';
const ORDERED_REFERENCE = 'stos-ordered';
const MAX_LIST_LEVEL = 8;
const TWIPS_PER_POINT = 20;
const TWIPS_PER_PIXEL = 15;
const MONO_FONT = 'JetBrains Mono';
const DEFAULT_FONT = 'Inter';
const DEFAULT_FONT_SIZE_PT = 11;
const CODE_SHADING = 'F2F4F8';
const BORDER_COLOR = 'D3D9E3';
const EMUS_PER_PIXEL = 9525;
const FLOAT_GAP_PX = 12;
const SUBTITLE_STYLE_ID = 'Subtitle';

const HEADING_LEVELS = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
};

const ALIGNMENTS = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
};

const CALLOUT_FILLS = { info: 'E6F5FB', success: 'E7F6EE', warning: 'FFF6E5', danger: 'FCEBEC', note: 'F2F4F8' };
const CALLOUT_BORDERS = { info: '37B6E0', success: '2FB673', warning: 'FFB020', danger: 'E5484D', note: '737F94' };

const BULLET_GLYPHS = ['•', '◦', '▪'];
const ORDERED_FORMATS = [LevelFormat.DECIMAL, LevelFormat.LOWER_LETTER, LevelFormat.LOWER_ROMAN];

// ---------------------------------------------------------------------------
// Value conversions
// ---------------------------------------------------------------------------

const toHexColor = (value) => {
  const color = String(value || '').trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color);
  if (hex) {
    const digits = hex[1].length === 3 ? hex[1].replace(/./g, '$&$&') : hex[1];
    return digits.toUpperCase();
  }

  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(color);
  if (!rgb) {
    return null;
  }
  return rgb
    .slice(1, 4)
    .map((channel) => Math.min(255, Number(channel)).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
};

const toPoints = (value) => {
  const match = /^(-?\d+(?:\.\d+)?)(pt|px|em|rem)?$/.exec(String(value || '').trim());
  if (!match) {
    return null;
  }
  const amount = Number(match[1]);
  if (match[2] === 'px') {
    return amount * 0.75;
  }
  if (match[2] === 'em' || match[2] === 'rem') {
    return amount * DEFAULT_FONT_SIZE_PT;
  }
  return amount;
};

const firstFontFamily = (value) =>
  String(value || '')
    .split(',')[0]
    .replace(/['"]/g, '')
    .trim() || null;

const toLineSpacing = (lineHeight) => {
  const numeric = Number(lineHeight);
  if (Number.isFinite(numeric) && numeric > 0) {
    return { line: Math.round(numeric * 240), lineRule: LineRuleType.AUTO };
  }
  const points = toPoints(lineHeight);
  return points ? { line: Math.round(points * TWIPS_PER_POINT), lineRule: LineRuleType.AT_LEAST } : {};
};

// ---------------------------------------------------------------------------
// Document styles (the DocumentStyles extension CSS) → docx styles
// ---------------------------------------------------------------------------

const STYLE_TARGETS = {
  p: 'normal',
  h1: 'heading1',
  h2: 'heading2',
  h3: 'heading3',
  h4: 'heading4',
  h5: 'heading5',
  h6: 'heading6',
  "p[data-style='title']": 'title',
  "p[data-style='subtitle']": 'subtitle',
};

const parseDocumentStyles = (css) => {
  const styles = {};
  const rulePattern = /([^{}]+)\{([^{}]*)\}/g;
  let rule = rulePattern.exec(String(css || ''));

  while (rule) {
    const selector = rule[1].trim().split(/\s+/).pop();
    const target = STYLE_TARGETS[selector];
    if (target) {
      const declarations = Object.fromEntries(
        rule[2]
          .split(';')
          .map((declaration) => declaration.split(':').map((part) => part && part.trim()))
          .filter(([property, value]) => property && value),
      );
      const size = toPoints(declarations['font-size']);
      const color = toHexColor(declarations.color);
      styles[target] = {
        ...(declarations['font-family'] && { font: firstFontFamily(declarations['font-family']) }),
        ...(size && { size: Math.round(size * 2) }),
        ...(color && { color }),
        ...(/^(600|700|800|900|bold)$/.test(declarations['font-weight'] || '') && { bold: true }),
        ...(declarations['font-style'] === 'italic' && { italics: true }),
      };
    }
    rule = rulePattern.exec(String(css || ''));
  }

  return styles;
};

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

const detectImageType = (bytes, contentType) => {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) {
    return 'png';
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return 'jpg';
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49) {
    return 'gif';
  }
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
    return 'bmp';
  }
  return /png|jpe?g|gif|bmp/.exec(contentType || '')?.[0]?.replace('jpeg', 'jpg') || null;
};

const readImageSize = (blob) =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });

const loadImage = async (attributes, maxWidthPx) => {
  try {
    const response = await fetch(attributes.src);
    if (!response.ok) {
      return null;
    }
    const blob = await response.blob();
    const data = new Uint8Array(await blob.arrayBuffer());
    const type = detectImageType(data, blob.type);
    if (!type) {
      return null;
    }

    const natural = (await readImageSize(blob)) || { width: 480, height: 320 };
    const width = Number(attributes.width) || natural.width;
    const height = Number(attributes.height) || Math.round((width * natural.height) / natural.width);
    const scale = width > maxWidthPx ? maxWidthPx / width : 1;

    return { type, data, transformation: { width: Math.round(width * scale), height: Math.round(height * scale) } };
  } catch {
    return null;
  }
};

const FLOAT_ALIGNMENTS = { left: HorizontalPositionAlign.LEFT, right: HorizontalPositionAlign.RIGHT };

// Left/right images float at the margin with the text wrapping around them, as in the editor.
const imageRunOptions = (image, align) => {
  if (!FLOAT_ALIGNMENTS[align]) {
    return image;
  }
  const gap = FLOAT_GAP_PX * EMUS_PER_PIXEL;
  return {
    ...image,
    floating: {
      horizontalPosition: { relative: HorizontalPositionRelativeFrom.MARGIN, align: FLOAT_ALIGNMENTS[align] },
      verticalPosition: { relative: VerticalPositionRelativeFrom.PARAGRAPH, offset: 0 },
      wrap: { type: TextWrappingType.SQUARE, side: TextWrappingSide.BOTH_SIDES },
      margins: align === 'left' ? { right: gap, bottom: gap } : { left: gap, bottom: gap },
    },
  };
};

const TABLE_BORDER_SIDES = ['top', 'bottom', 'left', 'right', 'insideHorizontal', 'insideVertical'];
const VISIBLE_TABLE_BORDERS = {
  all: TABLE_BORDER_SIDES,
  outer: ['top', 'bottom', 'left', 'right'],
  none: [],
  horizontal: ['top', 'bottom', 'insideHorizontal'],
};

const tableBorders = (border) => {
  const visibleSides = VISIBLE_TABLE_BORDERS[border];
  if (!visibleSides) {
    return undefined;
  }
  return Object.fromEntries(
    TABLE_BORDER_SIDES.map((side) => [
      side,
      visibleSides.includes(side)
        ? { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR }
        : { style: BorderStyle.NONE, size: 0, color: 'auto' },
    ]),
  );
};

const collectImages = (node, images = []) => {
  if (node?.type === 'image' && node.attrs?.src) {
    images.push(node.attrs);
  }
  (node?.content || []).forEach((child) => collectImages(child, images));
  return images;
};

// ---------------------------------------------------------------------------
// ProseMirror JSON → docx
// ---------------------------------------------------------------------------

const runOptionsFromMarks = (marks = []) =>
  marks.reduce((options, mark) => {
    const attributes = mark.attrs || {};
    switch (mark.type) {
      case 'bold':
        return { ...options, bold: true };
      case 'italic':
        return { ...options, italics: true };
      case 'underline':
        return { ...options, underline: {} };
      case 'strike':
        return { ...options, strike: true };
      case 'subscript':
        return { ...options, subScript: true };
      case 'superscript':
        return { ...options, superScript: true };
      case 'code':
        return { ...options, font: MONO_FONT, shading: { type: ShadingType.CLEAR, fill: CODE_SHADING, color: 'auto' } };
      case 'highlight': {
        const fill = toHexColor(attributes.color) || 'FFF3B0';
        return { ...options, shading: { type: ShadingType.CLEAR, fill, color: 'auto' } };
      }
      case 'textStyle': {
        const color = toHexColor(attributes.color);
        const size = toPoints(attributes.fontSize);
        const font = firstFontFamily(attributes.fontFamily);
        return {
          ...options,
          ...(color && { color }),
          ...(size && { size: Math.round(size * 2) }),
          ...(font && { font }),
        };
      }
      default:
        return options;
    }
  }, {});

const linkOf = (marks = []) => marks.find((mark) => mark.type === 'link')?.attrs?.href || null;

const createInlineChildren = (nodes = [], baseRunOptions = {}) =>
  nodes.flatMap((node) => {
    if (node.type === 'hardBreak') {
      return [new TextRun({ ...baseRunOptions, break: 1 })];
    }
    if (node.type === 'mergeField') {
      return [new TextRun({ ...baseRunOptions, text: `{{${node.attrs?.name || ''}}}` })];
    }
    if (node.type !== 'text') {
      return [];
    }

    const options = { ...baseRunOptions, ...runOptionsFromMarks(node.marks), text: node.text || '' };
    const href = linkOf(node.marks);
    if (!href) {
      return [new TextRun(options)];
    }
    return [new ExternalHyperlink({ link: href, children: [new TextRun({ ...options, style: 'Hyperlink' })] })];
  });

const paragraphFormatting = (attributes = {}) => {
  const spacing = {
    ...toLineSpacing(attributes.lineHeight),
    ...(toPoints(attributes.spaceBefore) !== null && { before: Math.round(toPoints(attributes.spaceBefore) * TWIPS_PER_POINT) }),
    ...(toPoints(attributes.spaceAfter) !== null && { after: Math.round(toPoints(attributes.spaceAfter) * TWIPS_PER_POINT) }),
  };

  return {
    ...(ALIGNMENTS[attributes.textAlign] && { alignment: ALIGNMENTS[attributes.textAlign] }),
    ...(Object.keys(spacing).length && { spacing }),
    ...(attributes.indent && { indent: { left: attributes.indent * INDENT_STEP_PX * TWIPS_PER_PIXEL } }),
  };
};

const createConverter = ({ images, contentWidthPx }) => {
  let orderedInstance = 0;

  const convertBlocks = (nodes = [], context = {}) => nodes.flatMap((node) => convertBlock(node, context));

  const withContext = (paragraphOptions, context) => ({
    ...paragraphOptions,
    ...(context.indentLeft && !paragraphOptions.numbering && {
      indent: { left: context.indentLeft + (paragraphOptions.indent?.left || 0) },
    }),
    ...(context.shading && { shading: context.shading }),
    ...(context.border && { border: context.border }),
  });

  const convertList = (node, context, ordered) => {
    const level = Math.min(context.listLevel ?? 0, MAX_LIST_LEVEL);
    if (ordered && !(level > 0 && context.orderedInstance)) {
      orderedInstance += 1;
    }
    const instance = ordered && !(level > 0 && context.orderedInstance) ? orderedInstance : context.orderedInstance;

    return (node.content || []).flatMap((item) =>
      (item.content || []).flatMap((child, childIndex) => {
        if (child.type === 'bulletList' || child.type === 'orderedList' || child.type === 'taskList') {
          return convertBlock(child, { ...context, listLevel: level + 1, orderedInstance: instance });
        }
        if (childIndex > 0 || child.type !== 'paragraph') {
          return convertBlock(child, { ...context, indentLeft: (level + 1) * 720 });
        }
        return [
          new Paragraph(
            withContext(
              {
                ...paragraphFormatting(child.attrs),
                numbering: ordered
                  ? { reference: ORDERED_REFERENCE, level, instance }
                  : { reference: BULLET_REFERENCE, level },
                children: createInlineChildren(child.content, context.runOptions),
              },
              context,
            ),
          ),
        ];
      }),
    );
  };

  const convertTaskList = (node, context) => {
    const level = context.listLevel ?? 0;
    return (node.content || []).flatMap((item) =>
      (item.content || []).flatMap((child, childIndex) => {
        if (child.type === 'taskList' || child.type === 'bulletList' || child.type === 'orderedList') {
          return convertBlock(child, { ...context, listLevel: level + 1 });
        }
        const indentLeft = level * 720 + 360;
        if (childIndex > 0 || child.type !== 'paragraph') {
          return convertBlock(child, { ...context, indentLeft: indentLeft + 360 });
        }
        const checkbox = item.attrs?.checked ? '☑ ' : '☐ ';
        return [
          new Paragraph({
            ...paragraphFormatting(child.attrs),
            indent: { left: indentLeft },
            children: [new TextRun({ text: checkbox }), ...createInlineChildren(child.content, context.runOptions)],
          }),
        ];
      }),
    );
  };

  // `width`: 'full' (default), 'auto' (fit content) or pixels; `border`: all | outer | none | horizontal.
  const tableWidthOptions = (width, columnWidths) => {
    if (width === 'auto') {
      return { width: { size: 0, type: WidthType.AUTO }, columnWidths };
    }
    const pixels = Number(width);
    if (!(pixels > 0)) {
      return { width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths };
    }
    const total = Math.round(Math.min(pixels, contentWidthPx) * TWIPS_PER_PIXEL);
    const currentTotal = columnWidths.reduce((sum, columnWidth) => sum + columnWidth, 0) || 1;
    return {
      width: { size: total, type: WidthType.DXA },
      columnWidths: columnWidths.map((columnWidth) => Math.round((columnWidth * total) / currentTotal)),
    };
  };

  const convertTable = (node, context) => {
    const rows = node.content || [];
    const firstRowWidths = (rows[0]?.content || []).flatMap((cell) =>
      Array.isArray(cell.attrs?.colwidth) ? cell.attrs.colwidth : Array.from({ length: cell.attrs?.colspan || 1 }, () => null),
    );
    const columnCount = Math.max(1, firstRowWidths.length);
    const knownWidths = firstRowWidths.every((width) => Number(width) > 0);
    const columnWidths = knownWidths
      ? firstRowWidths.map((width) => Math.round(width * TWIPS_PER_PIXEL))
      : Array.from({ length: columnCount }, () => Math.round((contentWidthPx * TWIPS_PER_PIXEL) / columnCount));
    const borders = tableBorders(node.attrs?.border);

    return [
      new Table({
        ...tableWidthOptions(node.attrs?.width, columnWidths),
        ...(borders && { borders }),
        rows: rows.map(
          (row) =>
            new TableRow({
              tableHeader: (row.content || []).every((cell) => cell.type === 'tableHeader'),
              children: (row.content || []).map((cell) => {
                const isHeader = cell.type === 'tableHeader';
                const cellChildren = convertBlocks(cell.content, {
                  ...context,
                  indentLeft: 0,
                  runOptions: isHeader ? { ...context.runOptions, bold: true } : context.runOptions,
                });
                return new TableCell({
                  columnSpan: cell.attrs?.colspan || 1,
                  rowSpan: cell.attrs?.rowspan || 1,
                  ...(isHeader && { shading: { type: ShadingType.CLEAR, fill: CODE_SHADING, color: 'auto' } }),
                  children: cellChildren.length ? cellChildren : [new Paragraph({})],
                });
              }),
            }),
        ),
      }),
      new Paragraph({}),
    ];
  };

  function convertBlock(node, context = {}) {
    const attributes = node.attrs || {};

    switch (node.type) {
      case 'paragraph':
        return [
          new Paragraph(
            withContext(
              {
                ...paragraphFormatting(attributes),
                ...(attributes.docStyle === 'title' && { heading: HeadingLevel.TITLE }),
                ...(attributes.docStyle === 'subtitle' && { style: SUBTITLE_STYLE_ID }),
                children: createInlineChildren(node.content, context.runOptions),
              },
              context,
            ),
          ),
        ];
      case 'heading':
        return [
          new Paragraph(
            withContext(
              {
                ...paragraphFormatting(attributes),
                heading: HEADING_LEVELS[attributes.level] || HeadingLevel.HEADING_1,
                children: createInlineChildren(node.content, context.runOptions),
              },
              context,
            ),
          ),
        ];
      case 'bulletList':
        return convertList(node, context, false);
      case 'orderedList':
        return convertList(node, context, true);
      case 'taskList':
        return convertTaskList(node, context);
      case 'blockquote':
        return convertBlocks(node.content, {
          ...context,
          indentLeft: (context.indentLeft || 0) + 360,
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: BORDER_COLOR, space: 8 } },
        });
      case 'callout': {
        const variant = CALLOUT_FILLS[attributes.variant] ? attributes.variant : 'info';
        return convertBlocks(node.content, {
          ...context,
          shading: { type: ShadingType.CLEAR, fill: CALLOUT_FILLS[variant], color: 'auto' },
          border: { left: { style: BorderStyle.SINGLE, size: 18, color: CALLOUT_BORDERS[variant], space: 8 } },
        });
      }
      case 'codeBlock': {
        const lines = (node.content || []).map((child) => child.text || '').join('').split('\n');
        return lines.map(
          (line) =>
            new Paragraph(
              withContext(
                {
                  spacing: { before: 0, after: 0 },
                  shading: { type: ShadingType.CLEAR, fill: CODE_SHADING, color: 'auto' },
                  children: [new TextRun({ text: line, font: MONO_FONT })],
                },
                context,
              ),
            ),
        );
      }
      case 'horizontalRule':
        return [
          new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR, space: 1 } }, children: [] }),
        ];
      case 'pageBreak':
        return [new Paragraph({ children: [new PageBreak()] })];
      case 'image': {
        const image = images.get(attributes.src);
        if (!image) {
          return attributes.alt ? [new Paragraph({ children: [new TextRun({ text: attributes.alt, italics: true })] })] : [];
        }
        return [
          new Paragraph(
            withContext(
              {
                ...(attributes.align === 'center' && { alignment: AlignmentType.CENTER }),
                children: [new ImageRun(imageRunOptions(image, attributes.align))],
              },
              context,
            ),
          ),
        ];
      }
      case 'table':
        return convertTable(node, context);
      case 'toggle': {
        const [summary, content] = node.content || [];
        return [
          new Paragraph(
            withContext({ children: createInlineChildren(summary?.content, { ...context.runOptions, bold: true }) }, context),
          ),
          ...convertBlocks(content?.content, { ...context, indentLeft: (context.indentLeft || 0) + 360 }),
        ];
      }
      case 'tableOfContents':
        return (attributes.items || []).map(
          (item) =>
            new Paragraph({
              indent: { left: (Math.max(item.level, 1) - 1) * 360 },
              children: [new TextRun({ text: item.text })],
            }),
        );
      default:
        return convertBlocks(node.content, context);
    }
  }

  return convertBlocks;
};

// ---------------------------------------------------------------------------
// Header / footer
// ---------------------------------------------------------------------------

// '{page}' and '{pages}' become page-number fields.
const createTemplateRuns = (template) =>
  String(template)
    .split(/(\{page\}|\{pages\})/)
    .filter(Boolean)
    .map((part) => {
      if (part === '{page}') {
        return new TextRun({ children: [PageNumber.CURRENT], size: 18 });
      }
      if (part === '{pages}') {
        return new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 });
      }
      return new TextRun({ text: part, size: 18 });
    });

const createTemplateParagraph = (template) =>
  new Paragraph({ alignment: AlignmentType.CENTER, children: createTemplateRuns(template) });

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const createNumbering = () => ({
  config: [
    {
      reference: BULLET_REFERENCE,
      levels: Array.from({ length: MAX_LIST_LEVEL + 1 }, (_, level) => ({
        level,
        format: LevelFormat.BULLET,
        text: BULLET_GLYPHS[level % BULLET_GLYPHS.length],
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720 * (level + 1), hanging: 360 } } },
      })),
    },
    {
      reference: ORDERED_REFERENCE,
      levels: Array.from({ length: MAX_LIST_LEVEL + 1 }, (_, level) => ({
        level,
        format: ORDERED_FORMATS[level % ORDERED_FORMATS.length],
        text: `%${level + 1}.`,
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720 * (level + 1), hanging: 360 } } },
      })),
    },
  ],
});

const createStyles = (documentStylesCss) => {
  const custom = parseDocumentStyles(documentStylesCss);
  const headingStyle = (key, sizePt) => ({ run: { size: sizePt * 2, bold: true, color: '1B2233', ...custom[key] } });

  return {
    default: {
      document: { run: { font: DEFAULT_FONT, size: DEFAULT_FONT_SIZE_PT * 2, color: '1B2233', ...custom.normal } },
      heading1: headingStyle('heading1', 22),
      heading2: headingStyle('heading2', 16),
      heading3: headingStyle('heading3', 14),
      heading4: headingStyle('heading4', 12),
      heading5: headingStyle('heading5', 11),
      heading6: headingStyle('heading6', 10),
      title: { run: { size: 28 * 2, bold: true, color: '1B2233', ...custom.title }, paragraph: { spacing: { after: 80 } } },
    },
    paragraphStyles: [
      {
        id: SUBTITLE_STYLE_ID,
        name: SUBTITLE_STYLE_ID,
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 15 * 2, color: '515D72', ...custom.subtitle },
        paragraph: { spacing: { after: 240 } },
      },
    ],
  };
};

export const writeDocx = async ({
  json: sourceJson,
  resolveStorageUrl = null,
  title = '',
  pageLayout = null,
  documentStylesCss = '',
  header = null,
  footer = '{page}',
} = {}) => {
  const json = await resolveStorageImages(sourceJson, resolveStorageUrl);
  const layout = resolvePageLayout(pageLayout);
  const baseSize = PAGE_SIZES_MM[layout.size];
  const contentWidthPx = mmToPx(layout.width - layout.margins.left - layout.margins.right);

  const imageEntries = await Promise.all(
    collectImages(json).map(async (attributes) => [attributes.src, await loadImage(attributes, contentWidthPx)]),
  );
  const images = new Map(imageEntries.filter(([, image]) => image));

  const convertBlocks = createConverter({ images, contentWidthPx });
  const children = convertBlocks(json?.content || []);

  const docxDocument = new Document({
    title,
    creator: 'StoneOS',
    styles: createStyles(documentStylesCss),
    numbering: createNumbering(),
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertMillimetersToTwip(baseSize.width),
              height: convertMillimetersToTwip(baseSize.height),
              orientation: layout.orientation === 'landscape' ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
            },
            margin: {
              top: convertMillimetersToTwip(layout.margins.top),
              right: convertMillimetersToTwip(layout.margins.right),
              bottom: convertMillimetersToTwip(layout.margins.bottom),
              left: convertMillimetersToTwip(layout.margins.left),
            },
          },
        },
        ...(header && { headers: { default: new Header({ children: [createTemplateParagraph(header)] }) } }),
        ...(footer && { footers: { default: new Footer({ children: [createTemplateParagraph(footer)] }) } }),
        children: children.length ? children : [new Paragraph({})],
      },
    ],
  });

  return Packer.toBlob(docxDocument);
};
