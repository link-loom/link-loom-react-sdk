import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyHeadMeta, hasSeoFields, resolveHeadMeta } from '../head-meta.js';

// A minimal <head>: enough for querySelector by tag and one attribute, createElement and appendChild.
const fakeDocument = () => {
  const children = [];
  const makeElement = (tag) => {
    const attributes = new Map();
    return {
      tag,
      setAttribute: (name, value) => attributes.set(name, value),
      getAttribute: (name) => attributes.get(name),
      hasAttribute: (name) => attributes.has(name),
      remove() {
        children.splice(children.indexOf(this), 1);
      },
    };
  };
  const head = {
    children,
    appendChild: (element) => children.push(element),
    querySelector: (selector) => {
      const [, tag, attribute, value] = selector.match(/^(\w+)\[([\w:-]+)="([^"]+)"\]$/);
      return children.find((element) => element.tag === tag && element.getAttribute(attribute) === value) || null;
    },
  };
  return { head, createElement: makeElement, makeElement };
};

test('resolveHeadMeta builds the Open Graph title from the page title and the app name', () => {
  const values = resolveHeadMeta({ meta: { title: 'Pricing', description: 'Plans' }, defaults: { image: '/og.jpg' }, appName: 'Acme' });

  assert.equal(values.ogTitle, 'Pricing · Acme');
  assert.equal(values.description, 'Plans');
  assert.equal(values.ogImage, '/og.jpg');
  assert.equal(values.twitterCard, 'summary_large_image');
});

test('applyHeadMeta creates the missing tags and updates the existing ones', () => {
  const doc = fakeDocument();
  const shipped = doc.makeElement('meta');
  shipped.setAttribute('name', 'description');
  shipped.setAttribute('content', 'From index.html');
  doc.head.appendChild(shipped);

  applyHeadMeta(doc, { description: 'Plans', canonical: 'https://acme.test/pricing' });

  assert.equal(doc.head.querySelector('meta[name="description"]').getAttribute('content'), 'Plans');
  assert.equal(doc.head.querySelector('link[rel="canonical"]').getAttribute('href'), 'https://acme.test/pricing');
});

test('applyHeadMeta removes only the tags it created when a value goes away', () => {
  const doc = fakeDocument();
  const shipped = doc.makeElement('meta');
  shipped.setAttribute('name', 'description');
  doc.head.appendChild(shipped);
  applyHeadMeta(doc, { robots: 'noindex' });

  applyHeadMeta(doc, {});

  assert.equal(doc.head.querySelector('meta[name="robots"]'), null);
  assert.notEqual(doc.head.querySelector('meta[name="description"]'), null);
});

test('hasSeoFields tells a page that declares SEO from one that does not', () => {
  assert.equal(hasSeoFields({ title: 'Only a title' }), false);
  assert.equal(hasSeoFields({ robots: 'noindex' }), true);
});
