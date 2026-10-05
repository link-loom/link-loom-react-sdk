import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { itemKeyOf, itemLabelOf, itemValueOf, itemsOf, runCategorySearch } from '../omniSearch.helpers.js';

describe('omni search results', () => {
  it('reads the items of a bare list, an envelope or a page', () => {
    const items = [{ id: 1 }];

    assert.deepEqual(itemsOf(items), items);
    assert.deepEqual(itemsOf({ result: { items } }), items);
    assert.deepEqual(itemsOf({ items }), items);
    assert.deepEqual(itemsOf(null), []);
    assert.deepEqual(itemsOf({}), []);
  });

  it('asks the service of a category with the query as payload.query.search', async () => {
    const calls = [];
    const service = class Service {};
    const items = await runCategorySearch({
      category: { id: 'work', service, payload: { queryselector: 'all', organization_id: 'org-1' } },
      query: 'acme',
      fetchCollection: async (request) => {
        calls.push(request);
        return { result: { items: [{ id: 'w1' }] } };
      },
    });

    assert.deepEqual(items, [{ id: 'w1' }]);
    assert.equal(calls[0].service, service);
    assert.deepEqual(calls[0].payload, {
      queryselector: 'all',
      organization_id: 'org-1',
      query: { search: 'acme' },
    });
  });

  it('asks the own search of a category and never the service', async () => {
    const items = await runCategorySearch({
      category: { id: 'apps', search: async ({ query }) => [{ id: query }], service: class {} },
      query: 'acme',
      fetchCollection: async () => {
        throw new Error('the service must not be asked');
      },
    });

    assert.deepEqual(items, [{ id: 'acme' }]);
  });

  it('answers no results, not an error, when the own search of a category fails', async () => {
    const items = await runCategorySearch({
      category: {
        id: 'apps',
        search: async () => {
          throw new Error('offline');
        },
      },
      query: 'acme',
      fetchCollection: async () => [],
    });

    assert.deepEqual(items, []);
  });

  it('keys and values a result by the category when it says how, else by the item', () => {
    const item = { id: 'rec-1', title: 'Acme' };

    assert.equal(itemKeyOf({}, item), 'rec-1');
    assert.equal(itemKeyOf({ itemKey: (hit) => `app:${hit.id}` }, item), 'app:rec-1');
    assert.equal(itemValueOf({}, item), 'Acme');
    assert.equal(itemValueOf({}, { id: 'x' }), 'item-x');
    assert.equal(itemValueOf({ itemValue: (hit) => `app:${hit.id}` }, item), 'app:rec-1');
    assert.equal(itemLabelOf({ label: 'L' }), 'L');
    assert.equal(itemLabelOf({}), 'Unknown Item');
  });
});
