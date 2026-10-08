import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RECORD_CONTAINER_NAME, hasUnsavedChanges, recordDialogPaperSx } from '../entityDialog.helpers.js';
import { MAX_REASON_LENGTH, MIN_REASON_LENGTH, isReasonValid } from '../reasonDialog.helpers.js';

describe('recordDialogPaperSx', () => {
  it('makes the paper a size container, named for the narrow-width rules', () => {
    const sx = recordDialogPaperSx();

    assert.equal(sx.containerType, 'inline-size');
    assert.equal(sx.containerName, RECORD_CONTAINER_NAME);
    assert.equal(RECORD_CONTAINER_NAME, 'stos-record');
  });

  it('lets the app name the container', () => {
    assert.equal(recordDialogPaperSx('app-body').containerName, 'app-body');
  });

  it('keeps one width, scrolls as a whole and takes the modal shell of the kit', () => {
    const sx = recordDialogPaperSx();

    assert.equal(sx.width, 'min(880px, 94vw)');
    assert.equal(sx.overflowY, 'auto');
    assert.equal(sx.borderRadius, '10px');
  });

  it('drops the icons of the tabs on a phone', () => {
    assert.deepEqual(recordDialogPaperSx()['@media (max-width: 480px)']['& .MuiTab-iconWrapper'], { display: 'none' });
  });
});

describe('hasUnsavedChanges', () => {
  it('is what the content reported through the ref', () => {
    assert.equal(hasUnsavedChanges({ current: true }), true);
    assert.equal(hasUnsavedChanges({ current: false }), false);
    assert.equal(hasUnsavedChanges(undefined), false);
  });
});

describe('isReasonValid', () => {
  it('asks for five characters that are not blanks', () => {
    assert.equal(MIN_REASON_LENGTH, 5);
    assert.equal(MAX_REASON_LENGTH, 500);
    assert.equal(isReasonValid('four'), false);
    assert.equal(isReasonValid('  four  '), false);
    assert.equal(isReasonValid('fives'), true);
    assert.equal(isReasonValid('  fives '), true);
  });

  it('asks for nothing when the reason is optional', () => {
    assert.equal(isReasonValid('', false), true);
    assert.equal(isReasonValid(undefined, false), true);
  });
});
