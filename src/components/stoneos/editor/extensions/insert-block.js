import { Fragment } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';

// Inserts block nodes at the cursor's block boundary instead of splitting around them: an empty
// textblock is replaced, the start/end of a textblock inserts before/after it, the middle splits it.
// A trailing paragraph is added when the blocks would end their container, so typing can continue.
// `cursorOffset` places the cursor relative to the first inserted node instead of after the blocks.
export const insertBlocks = ({ tr, state, dispatch, commands }, content, { cursorOffset } = {}) => {
  const { $from, empty } = state.selection;
  const nodes = content.map((json) => state.schema.nodeFromJSON(json));

  if (!empty || !$from.parent.isTextblock || $from.depth < 1) {
    return commands.insertContent(content);
  }

  const container = $from.node($from.depth - 1);
  const index = $from.index($from.depth - 1);
  const isEmptyBlock = $from.parent.content.size === 0;
  const isAtStart = $from.parentOffset === 0;
  const isAtEnd = $from.parentOffset === $from.parent.content.size;
  const isLastChild = index === container.childCount - 1;
  const paragraph = state.schema.nodes.paragraph.create();

  const insertion = isEmptyBlock || (isAtEnd && isLastChild) ? [...nodes, paragraph] : nodes;
  const replaceFrom = isEmptyBlock ? index : isAtStart ? index : index + 1;
  const replaceTo = isEmptyBlock ? index + 1 : replaceFrom;
  const isMiddle = !isEmptyBlock && !isAtStart && !isAtEnd;

  if (!isMiddle && !container.canReplace(replaceFrom, replaceTo, Fragment.from(insertion))) {
    return commands.insertContent(content);
  }

  if (!dispatch) {
    return true;
  }

  const nodesSize = nodes.reduce((size, node) => size + node.nodeSize, 0);

  if (isMiddle) {
    tr.split($from.pos);
  }

  const boundary = isEmptyBlock || isAtStart ? $from.before() : isAtEnd ? $from.after() : $from.pos + 1;
  if (isEmptyBlock) {
    tr.replaceWith($from.before(), $from.after(), insertion);
  } else {
    tr.insert(boundary, insertion);
  }

  const trailingOffset = insertion.length > nodes.length ? 1 : 0;
  const cursor = boundary + (cursorOffset === undefined ? nodesSize + trailingOffset : cursorOffset);
  tr.setSelection(TextSelection.near(tr.doc.resolve(cursor), 1));
  return true;
};
