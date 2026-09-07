import { expect, test } from '@playwright/test';

for (const source of ['sdk', 'webapp']) {
  test(`${source} sign-in supports StrictMode and reopening`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/e2e/fixtures/login.html?source=${source}`);

    for (let attempt = 0; attempt < 2; attempt++) {
      await page.getByRole('button', { name: 'Open sign-in' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(
        page.getByText('Sign in with Google', { exact: true })
      ).toBeVisible();
      await page.getByRole('button', { name: 'Close dialog' }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }

    expect(errors).toEqual([]);
  });
}
