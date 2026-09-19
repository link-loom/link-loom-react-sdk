// Updates attributes on every node of `types` touched by the selection, in one transaction.
export const updateBlocksInSelection = ({ tr, state, dispatch }, types, computeAttributes) => {
  const { from, to } = state.selection;
  let changed = false;

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!types.includes(node.type.name)) {
      return true;
    }

    const nextAttributes = computeAttributes(node.attrs);
    if (!nextAttributes) {
      return false;
    }

    changed = true;
    if (dispatch) {
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...nextAttributes });
    }
    return false;
  });

  return changed;
};
