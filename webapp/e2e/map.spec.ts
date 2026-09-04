import { expect, test } from '@playwright/test';

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
