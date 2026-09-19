import { Extension } from '@tiptap/core';
import { NodeSelection, Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { blockStartOf } from './block-actions.js';

// Width of the gutter (the "+" button and the grip) placed to the left of the hovered block.
export const BLOCK_GUTTER_WIDTH_PX = 48;
const GUTTER_ROW_HEIGHT_PX = 24;
const HIDE_DELAY_MS = 180;

export const BLOCK_DRAG_HANDLE_KEY = new PluginKey('stosBlockDragHandle');

const topLevelIndexAt = (doc, position) => {
  if (!doc.childCount) {
    return -1;
  }
  const index = doc.resolve(Math.min(Math.max(position, 0), doc.content.size)).index(0);
  return Math.min(index, doc.childCount - 1);
};

const shiftedSelection = ({ selection, doc, blockStart, blockEnd, delta, newBlockStart }) => {
  if (selection instanceof NodeSelection && selection.from === blockStart) {
    return NodeSelection.create(doc, newBlockStart);
  }

  const isInside = (position) => position > blockStart && position < blockEnd;
  if (isInside(selection.anchor) && isInside(selection.head)) {
    return TextSelection.create(doc, selection.anchor + delta, selection.head + delta);
  }

  return TextSelection.near(doc.resolve(Math.min(newBlockStart + 1, doc.content.size)));
};

// Moves the top-level block at `fromIndex` so it sits before the block that `beforeIndex` names in the
// current document (`beforeIndex === doc.childCount` appends it last). Both neighbours of the block are
// no-ops, so a drop next to where the block already is leaves the document untouched.
export const moveTopLevelBlockTo =
  (fromIndex, beforeIndex) =>
  ({ state, dispatch }) => {
    const { doc, selection } = state;
    if (fromIndex < 0 || fromIndex >= doc.childCount) {
      return false;
    }

    const targetIndex = Math.min(Math.max(beforeIndex, 0), doc.childCount);
    if (targetIndex === fromIndex || targetIndex === fromIndex + 1) {
      return false;
    }

    if (!dispatch) {
      return true;
    }

    const node = doc.child(fromIndex);
    const blockStart = blockStartOf(doc, fromIndex);
    const blockEnd = blockStart + node.nodeSize;
    // Positions after the removed block shift left by its size once it is deleted.
    const insertAt = blockStartOf(doc, targetIndex);
    const newBlockStart = targetIndex > fromIndex ? insertAt - node.nodeSize : insertAt;

    const transaction = state.tr.delete(blockStart, blockEnd).insert(newBlockStart, node);
    transaction.setSelection(
      shiftedSelection({
        selection,
        doc: transaction.doc,
        blockStart,
        blockEnd,
        delta: newBlockStart - blockStart,
        newBlockStart,
      }),
    );
    dispatch(transaction.scrollIntoView());
    return true;
  };

// Moves the top-level block holding the selection one position up (-1) or down (+1).
export const moveTopLevelBlock = (direction) => (props) => {
  const index = topLevelIndexAt(props.state.doc, props.state.selection.from);
  if (index < 0) {
    return false;
  }
  return moveTopLevelBlockTo(index, direction < 0 ? index - 1 : index + 2)(props);
};

const HIDDEN_STATE = { visible: false, blockIndex: -1, top: 0, left: 0 };

// Tracks the hovered top-level block and publishes { visible, blockIndex, top, left } (layout pixels
// relative to the editor container) to the React gutter (BlockGutter). The hover region is the whole
// container, gutter included (the gutter is rendered inside it), so moving onto the handle keeps it.
class BlockHandleController {
  constructor(view, storage) {
    this.view = view;
    this.storage = storage;
    this.container = null;
    this.hideTimer = null;
    this.state = HIDDEN_STATE;
    this.listeners = new Set();
    this.pinned = false;
    this.dragging = false;
    // The React gutter renders into this element (not into the React-owned editor container, whose children
    // EditorContent moves on unmount); it travels with the editor DOM and is re-attached to the container.
    this.host = document.createElement('div');
    this.host.className = 'stos-block-gutter-host';
    // Line drawn between two blocks while a block is dragged over the page.
    this.indicator = document.createElement('div');
    this.indicator.className = 'stos-block-drop-indicator';
    this.indicator.setAttribute('aria-hidden', 'true');
    this.host.appendChild(this.indicator);
    this.dragIndex = -1;
    this.dropIndex = -1;

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDomOver = () => this.bindContainer();
    view.dom.addEventListener('mouseover', this.onDomOver);
    this.bindContainer();
    storage.controller = this;
  }

  // The editor DOM is re-parented when the React wrapper mounts: listeners follow its current parent.
  bindContainer() {
    const container = this.view.dom.parentElement;
    if (container && this.host.parentElement !== container) {
      container.appendChild(this.host);
    }
    if (container === this.container) {
      return container;
    }
    this.unbindContainer();
    this.container = container;
    container?.addEventListener('mousemove', this.onMouseMove);
    container?.addEventListener('mouseleave', this.onMouseLeave);
    return container;
  }

  unbindContainer() {
    this.container?.removeEventListener('mousemove', this.onMouseMove);
    this.container?.removeEventListener('mouseleave', this.onMouseLeave);
    this.container = null;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  publish(next) {
    this.state = next;
    this.listeners.forEach((listener) => listener(next));
  }

  cancelHide() {
    clearTimeout(this.hideTimer);
    this.hideTimer = null;
  }

  scheduleHide() {
    this.cancelHide();
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      if (!this.pinned && !this.dragging) {
        this.publish(HIDDEN_STATE);
      }
    }, HIDE_DELAY_MS);
  }

  // A menu opened from the gutter keeps it on its block until closed.
  setPinned(pinned) {
    this.pinned = pinned;
    if (pinned) {
      this.cancelHide();
      return;
    }
    this.scheduleHide();
  }

  blockElementAt(clientY) {
    return Array.from(this.view.dom.children).find((element) => {
      const rect = element.getBoundingClientRect();
      return clientY >= rect.top && clientY <= rect.bottom;
    });
  }

  onMouseMove(event) {
    const container = this.bindContainer();
    if (!container || !this.view.editable || this.pinned || this.dragging) {
      return;
    }

    this.cancelHide();
    if (event.target instanceof Element && event.target.closest('[data-block-gutter]')) {
      return;
    }

    const element = this.blockElementAt(event.clientY);
    const index = element ? topLevelIndexAt(this.view.state.doc, this.view.posAtDOM(element, 0)) : -1;
    if (index < 0) {
      this.scheduleHide();
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    // Screen distances inside a zoomed sheet are scaled; the gutter is positioned in layout pixels.
    const scale = container.offsetWidth ? containerRect.width / container.offsetWidth || 1 : 1;
    const lineHeight = parseFloat(window.getComputedStyle(element).lineHeight);
    const firstLineOffset = Number.isFinite(lineHeight) ? Math.max((lineHeight - GUTTER_ROW_HEIGHT_PX) / 2, 0) : 0;
    const top = Math.round((elementRect.top - containerRect.top) / scale + firstLineOffset);
    const left = Math.round((elementRect.left - containerRect.left) / scale - BLOCK_GUTTER_WIDTH_PX);

    if (this.state.visible && this.state.blockIndex === index && this.state.top === top && this.state.left === left) {
      return;
    }
    this.publish({ visible: true, blockIndex: index, top, left });
  }

  onMouseLeave() {
    if (this.pinned || this.dragging) {
      return;
    }
    this.scheduleHide();
  }

  // The page area that accepts a dropped block. The editor's own drop handling only covers the content
  // box, but dragging straight up from the grip keeps the pointer in the page margin beside it, so the
  // whole sheet (or, in web layout, the editor container and the gutter) answers for the drop.
  dropRoot() {
    const dom = this.view.dom;
    return dom.closest('.stos-doc-sheet') || dom.closest('.stos-doc-canvas') || dom.parentElement || dom;
  }

  acceptsDrop(target) {
    if (!(target instanceof Node)) {
      return false;
    }
    return this.dropRoot().contains(target) || this.host.contains(target);
  }

  // Index of the block the dragged block would be inserted before (childCount = last).
  dropIndexAt(clientY) {
    const blocks = Array.from(this.view.dom.children);
    const index = blocks.findIndex((element) => {
      const rect = element.getBoundingClientRect();
      return clientY < rect.top + rect.height / 2;
    });
    return index < 0 ? blocks.length : index;
  }

  showIndicator(index) {
    const container = this.bindContainer();
    const blocks = Array.from(this.view.dom.children);
    if (!container || !blocks.length) {
      return;
    }

    const anchor = blocks[Math.min(index, blocks.length - 1)];
    const edge = index >= blocks.length ? 'bottom' : 'top';
    const containerRect = container.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const scale = container.offsetWidth ? containerRect.width / container.offsetWidth || 1 : 1;

    this.indicator.style.top = `${Math.round((anchorRect[edge] - containerRect.top) / scale)}px`;
    this.indicator.dataset.visible = 'true';
  }

  hideIndicator() {
    delete this.indicator.dataset.visible;
  }

  startDrag(event) {
    const { state } = this.view;
    const { blockIndex } = this.state;
    if (blockIndex < 0 || blockIndex >= state.doc.childCount || !event.dataTransfer) {
      event.preventDefault();
      return;
    }

    const blockStart = blockStartOf(state.doc, blockIndex);
    this.view.dispatch(state.tr.setSelection(NodeSelection.create(state.doc, blockStart)));

    const slice = this.view.state.selection.content();
    const { dom, text } = this.view.serializeForClipboard(slice);
    event.dataTransfer.clearData();
    // Dropping outside the page hands the block to whatever other surface accepts it.
    event.dataTransfer.setData('text/html', dom.innerHTML);
    event.dataTransfer.setData('text/plain', text);
    event.dataTransfer.effectAllowed = 'move';

    const blockDom = this.view.nodeDOM(blockStart);
    if (blockDom instanceof Element) {
      event.dataTransfer.setDragImage(blockDom, 0, 0);
    }

    this.dragIndex = blockIndex;
    this.dropIndex = -1;
    this.dragging = true;
    // The listeners live only for the duration of this drag, and capture so the block move replaces the
    // editor's text-level drop handling instead of racing it.
    document.addEventListener('dragover', this.onDragOver, true);
    document.addEventListener('drop', this.onDrop, true);
    document.addEventListener('dragend', this.onDragEnd, true);
  }

  onDragOver(event) {
    if (!this.dragging || !this.acceptsDrop(event.target)) {
      this.hideIndicator();
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dropIndex = this.dropIndexAt(event.clientY);
    this.showIndicator(this.dropIndex);
  }

  onDrop(event) {
    if (!this.dragging || !this.acceptsDrop(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const targetIndex = this.dropIndexAt(event.clientY);
    const fromIndex = this.dragIndex;
    this.endDrag();
    moveTopLevelBlockTo(fromIndex, targetIndex)({ state: this.view.state, dispatch: this.view.dispatch.bind(this.view) });
  }

  onDragEnd() {
    this.endDrag();
  }

  endDrag() {
    document.removeEventListener('dragover', this.onDragOver, true);
    document.removeEventListener('drop', this.onDrop, true);
    document.removeEventListener('dragend', this.onDragEnd, true);
    this.hideIndicator();
    this.view.dragging = null;
    this.dragIndex = -1;
    this.dropIndex = -1;
    this.dragging = false;
    this.publish(HIDDEN_STATE);
  }

  destroy() {
    this.cancelHide();
    this.endDrag();
    this.view.dom.removeEventListener('mouseover', this.onDomOver);
    this.unbindContainer();
    this.host.remove();
    this.listeners.clear();
    if (this.storage.controller === this) {
      this.storage.controller = null;
    }
  }
}

// Notion-like gutter at the left of the hovered top-level block ("+" to insert below, grip to drag or
// open the block menu), rendered by RichDocumentEditor through `editor.storage.blockDragHandle.controller`.
// Keyboard: Alt+Shift+ArrowUp/Down moves the block.
export const BlockDragHandle = Extension.create({
  name: 'blockDragHandle',

  addStorage() {
    return { controller: null };
  },

  addCommands() {
    return {
      moveBlockUp: () => moveTopLevelBlock(-1),
      moveBlockDown: () => moveTopLevelBlock(1),
    };
  },

  addKeyboardShortcuts() {
    return {
      'Alt-Shift-ArrowUp': () => this.editor.commands.moveBlockUp(),
      'Alt-Shift-ArrowDown': () => this.editor.commands.moveBlockDown(),
    };
  },

  addProseMirrorPlugins() {
    const storage = this.storage;
    return [new Plugin({ key: BLOCK_DRAG_HANDLE_KEY, view: (view) => new BlockHandleController(view, storage) })];
  },
});

export default BlockDragHandle;
