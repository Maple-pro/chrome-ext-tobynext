import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import type { BrowserContext, Page } from '@playwright/test';
import { chromium, expect, test } from '@playwright/test';

let context: BrowserContext;
let page: Page;
let profile: string;
let collectionId: string;
let bookmarkIds: string[];

test.beforeAll(async () => {
  profile = await mkdtemp(join(tmpdir(), 'tobynext-test-'));
  const extension = resolve(process.env.TEST_EXTENSION_DIR || 'dist');
  context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    executablePath: process.env.TEST_CHROME_EXECUTABLE,
    headless: true,
    args: [
      `--disable-extensions-except=${extension}`,
      `--load-extension=${extension}`,
    ],
  });
  page = await context.newPage();
  await page.goto('chrome://newtab');
  await expect(page.locator('#space-name')).toHaveText('My Collection');
  const fixture = await page.evaluate(async () => {
    const { currentSpace } = await chrome.storage.local.get('currentSpace');
    const collection = await chrome.bookmarks.create({
      parentId: currentSpace,
      title: 'Test collection',
    });
    const bookmarks = [];
    for (const title of ['Alpha', 'Beta', 'Gamma']) {
      bookmarks.push(
        await chrome.bookmarks.create({
          parentId: collection.id,
          title,
          url: `https://example.com/${title}`,
        })
      );
    }
    return {
      collectionId: collection.id,
      bookmarkIds: bookmarks.map((bookmark) => bookmark.id),
    };
  });
  collectionId = fixture.collectionId;
  bookmarkIds = fixture.bookmarkIds;
  await expect(page.locator('#bookmark-container')).toHaveCount(3);
});
test.afterAll(async () => {
  await context?.close();
  if (profile) await rm(profile, { recursive: true, force: true });
});

test('modal input, confirm, cancel and backdrop never open the underlying bookmark', async () => {
  const row = page.locator('#bookmark-container').filter({ hasText: 'Alpha' });
  const pages = context.pages().length;
  await row.hover();
  await row.getByRole('button', { name: 'Rename bookmark' }).click();
  const dialog = page.getByRole('dialog', { name: 'Rename Bookmark' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox').fill('Renamed');
  await page.mouse.click(2, 2);
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'RENAME', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('#bookmark-title').first()).toHaveText('Renamed');
  expect(context.pages()).toHaveLength(pages);
  const renamed = page
    .locator('#bookmark-container')
    .filter({ hasText: 'Renamed' });
  await renamed.hover();
  await renamed.getByRole('button', { name: 'Rename bookmark' }).click();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  expect(context.pages()).toHaveLength(pages);
  await renamed.hover();
  await renamed.getByRole('button', { name: 'Rename bookmark' }).click();
  await dialog.getByRole('button', { name: 'CANCEL' }).click();
  expect(context.pages()).toHaveLength(pages);
});

test('native drag reorders both ways using live Chrome bookmark indices', async () => {
  const rows = page.locator('#bookmark-container');
  const pages = context.pages().length;
  await rows.first().dragTo(rows.last(), { targetPosition: { x: 100, y: 35 } });
  await expect
    .poll(() =>
      page.evaluate(
        async (id) => (await chrome.bookmarks.getChildren(id)).map((b) => b.id),
        collectionId
      )
    )
    .toEqual([bookmarkIds[1], bookmarkIds[2], bookmarkIds[0]]);
  await rows.last().dragTo(rows.first(), { targetPosition: { x: 100, y: 2 } });
  await expect
    .poll(() =>
      page.evaluate(
        async (id) => (await chrome.bookmarks.getChildren(id)).map((b) => b.id),
        collectionId
      )
    )
    .toEqual(bookmarkIds);
  expect(context.pages()).toHaveLength(pages);
});

test('search close stays closed and concurrent new tabs reuse the same root', async () => {
  await page.locator('#search-container').click();
  await page.getByRole('dialog').getByRole('button', { name: 'CLOSE' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const second = await context.newPage();
  await second.goto('chrome://newtab');
  await expect(second.locator('#space-name')).toHaveText('My Collection');
  expect(
    await page.evaluate(
      async () =>
        (await chrome.bookmarks.search({ title: 'TobyNext' })).filter(
          (b) => !b.url
        ).length
    )
  ).toBe(1);
  await second.close();
});

test('cross-collection drops and tab saves use the correct target without closing the tab', async () => {
  const fixture = await page.evaluate(async () => {
    const stored = await chrome.storage.local.get('currentSpace');
    const collection = await chrome.bookmarks.create({
      parentId: stored.currentSpace,
      title: 'Empty target',
    });
    const tab = await chrome.tabs.create({
      url: 'https://example.invalid/saved',
      active: false,
    });
    return { collection: collection.id, tab: tab.id! };
  });
  const target = page.locator(`[data-collection-id="${fixture.collection}"]`);
  await expect(target).toBeVisible();
  await page.locator(`[data-bookmark-id="${bookmarkIds[0]}"]`).dragTo(target);
  await expect
    .poll(() =>
      page.evaluate(
        async (id) => (await chrome.bookmarks.get(id))[0].parentId,
        bookmarkIds[0]
      )
    )
    .toBe(fixture.collection);
  const tab = page.locator(`[data-tab-id="${fixture.tab}"]`);
  await expect(tab).toBeVisible();
  await tab.dragTo(target.locator('#collection-title-container'));
  await expect
    .poll(() =>
      page.evaluate(
        async (id) => (await chrome.bookmarks.getChildren(id)).length,
        fixture.collection
      )
    )
    .toBe(2);
  expect(
    await page.evaluate(
      async (id) => (await chrome.tabs.get(id)).id,
      fixture.tab
    )
  ).toBe(fixture.tab);
  await page.evaluate((id) => chrome.tabs.remove(id), fixture.tab);
});

test('spaces reorder through the shared drag interaction', async () => {
  const ids = await page.evaluate(async () => {
    const stored = await chrome.storage.local.get([
      'currentWorkspace',
      'currentSpace',
    ]);
    const other = await chrome.bookmarks.create({
      parentId: stored.currentWorkspace,
      title: 'Second space',
    });
    return {
      first: stored.currentSpace as string,
      second: other.id,
      workspace: stored.currentWorkspace as string,
    };
  });
  const second = page.locator(`[data-space-id="${ids.second}"]`);
  await expect(second).toBeVisible();
  await second.dragTo(page.locator(`[data-space-id="${ids.first}"]`), {
    targetPosition: { x: 60, y: 2 },
  });
  await expect
    .poll(() =>
      page.evaluate(
        async (id) =>
          (await chrome.bookmarks.getChildren(id)).map((node) => node.id),
        ids.workspace
      )
    )
    .toEqual([ids.second, ids.first]);
});

test('dragging a collection into another space keeps it under that space', async () => {
  const ids = await page.evaluate(async () => {
    const stored = await chrome.storage.local.get([
      'currentWorkspace',
      'currentSpace',
    ]);
    const destination = await chrome.bookmarks.create({
      parentId: stored.currentWorkspace,
      title: 'Collection destination',
    });
    return {
      destination: destination.id,
      workspace: stored.currentWorkspace as string,
    };
  });
  const target = page.locator(`[data-space-id="${ids.destination}"]`);
  await expect(target).toBeVisible();
  await page.locator(`[data-collection-id="${collectionId}"]`).dragTo(target, {
    sourcePosition: { x: 8, y: 20 },
  });
  await expect
    .poll(() =>
      page.evaluate(
        async (id) => (await chrome.bookmarks.get(id))[0].parentId,
        collectionId
      )
    )
    .toBe(ids.destination);
  expect(
    await page.evaluate(
      async ({ workspace, collection }) =>
        (await chrome.bookmarks.getChildren(workspace)).some(
          (node) => node.id === collection
        ),
      { workspace: ids.workspace, collection: collectionId }
    )
  ).toBe(false);
});
