import { expect, test } from '@playwright/test';

test('keeps loading when zooming out and panning across world copies', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  const mapLoads: { minLng: number; maxLng: number }[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', async (message) => {
    if (message.text().startsWith('Load by')) {
      mapLoads.push(await message.args()[1].jsonValue());
    }
  });
  await page.route('https://tiles.openfreemap.org/styles/*', (route) =>
    route.fulfill({ json: { version: 8, sources: {}, layers: [] } })
  );
  await page.goto('/?canAdd=false&centerLat=0&centerLng=180');

  const canvas = page.locator('.maplibregl-canvas');
  await expect(canvas).toBeVisible();
  await expect.poll(() => mapLoads.some((b) => b.maxLng > 180)).toBe(true);

  // At this zoom the viewport spans more than one complete world.
  for (let zoom = 18; zoom > 0; zoom--) {
    const loadCount = mapLoads.length;
    await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
    await expect.poll(() => mapLoads.length).toBeGreaterThan(loadCount);
  }
  await expect
    .poll(() => mapLoads.some((b) => b.maxLng - b.minLng >= 360))
    .toBe(true);

  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  if (bounds) {
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;
    for (const distance of [300, -600, 300]) {
      const loadCount = mapLoads.length;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + distance, y, { steps: 10 });
      await page.mouse.up();
      await expect.poll(() => mapLoads.length).toBeGreaterThan(loadCount);
      await expect(canvas).toBeVisible();
    }
  }
  expect(mapLoads.some((b) => b.minLng < -180)).toBe(true);
  expect(pageErrors).toEqual([]);
});

test('renders map themes and a client-side route', async ({ page }) => {
  const pageErrors: string[] = [];
  const mapLoads: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.text().startsWith('Load by')) {
      mapLoads.push(message.text());
    }
  });

  await page.goto('/?canAdd=false');

  await expect(page.locator('.maplibregl-map')).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.locator('.maplibregl-canvas')).toBeVisible();
  await expect(page.locator('.maplibregl-ctrl-attrib')).toContainText(
    'OpenFreeMap',
    { timeout: 15_000 }
  );
  await expect.poll(() => mapLoads.length).toBeGreaterThan(0);

  const canvas = page.locator('.maplibregl-canvas');
  const canvasBounds = await canvas.boundingBox();
  expect(canvasBounds).not.toBeNull();
  if (canvasBounds) {
    const startX = canvasBounds.x + canvasBounds.width / 2;
    const startY = canvasBounds.y + canvasBounds.height / 2;

    for (const distance of [60, -60, 60]) {
      const loadCount = mapLoads.length;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + distance, startY, { steps: 10 });
      await page.mouse.up();
      await expect.poll(() => mapLoads.length).toBeGreaterThan(loadCount);
    }
  }

  await expect(canvas).toBeVisible();

  for (const theme of ['silver', 'dark']) {
    await page.goto(`/?canAdd=false&theme=${theme}`);
    await expect(page.locator('.maplibregl-map')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('.maplibregl-ctrl-attrib')).toContainText(
      'OpenFreeMap',
      { timeout: 15_000 }
    );
  }

  await page.goto('/terms?canAdd=false');
  await expect(
    page.getByRole('heading', { name: 'Open Community Map Legal' })
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.maplibregl-map')).toBeVisible();
  expect(pageErrors).toEqual([]);
});
