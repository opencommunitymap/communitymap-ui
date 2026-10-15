import { expect, test } from '@playwright/test';

test('cookie notice stays behind mobile dialogs and remains dismissible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?canAdd=false');
  await expect(page.getByRole('button', { name: 'Account menu' })).toBeVisible({
    timeout: 15_000,
  });
  const notice = page.getByRole('region', { name: 'Cookie notice' });
  const privacyLink = notice.getByRole('link', {
    name: 'Privacy and Cookie Policy',
  });
  await privacyLink.click();
  const dialog = page.getByRole('dialog', {
    name: 'Privacy and Cookie Policy',
  });
  await expect(dialog).toBeVisible();

  // Check the actual element receiving input where the notice and dialog overlap.
  await expect
    .poll(() =>
      dialog.evaluate((element) => {
        const noticeBounds = document
          .querySelector('[aria-label="Cookie notice"]')!
          .getBoundingClientRect();
        const dialogBounds = element.getBoundingClientRect();
        const left = Math.max(noticeBounds.left, dialogBounds.left);
        const right = Math.min(noticeBounds.right, dialogBounds.right);
        const top = Math.max(noticeBounds.top, dialogBounds.top);
        const bottom = Math.min(noticeBounds.bottom, dialogBounds.bottom);
        return (
          right > left &&
          bottom > top &&
          element.contains(
            document.elementFromPoint((left + right) / 2, (top + bottom) / 2)
          )
        );
      })
    )
    .toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await privacyLink.focus();
  await page.keyboard.press('Tab');
  await expect(notice.getByRole('button', { name: 'Got it' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(notice).toBeHidden();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Account menu' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(notice).toBeHidden();
});

test('account menu, routed dialogs, and sign-in remain accessible', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?canAdd=false');
  await page.getByRole('button', { name: 'Got it' }).click();
  const menu = page.getByRole('button', { name: 'Account menu' });
  await expect(menu).toBeVisible({ timeout: 15_000 });
  await menu.click();
  await page.getByRole('menuitem', { name: 'Terms of Service' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Terms of Service' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(page).toHaveURL(/\/$/);
  await menu.click();
  await page.getByRole('menuitem', { name: 'Privacy Policy' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Privacy and Cookie Policy' })
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Welcome to your community' })
  ).toBeVisible();
  await expect(
    page.getByText('Sign in with Google', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  // FirebaseUI must also support opening again after cleanup.
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    page.getByText('Sign in with Google', { exact: true })
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile posting options fit the screen and require sign-in', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Got it' }).click();
  const toggle = page.getByRole('button', { name: 'Share something nearby' });
  await expect(toggle).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: /Start a chat/ })).toBeHidden();
  await toggle.click();
  await page.getByRole('button', { name: /Start a chat/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(
    page.getByText('Sign in with Google', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Collapse posting options' }).click();
  await expect(page.getByRole('button', { name: /Start a chat/ })).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await page.setViewportSize({ width: 320, height: 640 });
  const brand = await page.getByRole('banner').boundingBox();
  const account = await page
    .getByRole('button', { name: 'Account menu' })
    .boundingBox();
  expect(brand!.x + brand!.width).toBeLessThan(account!.x);
  expect(errors).toEqual([]);
});

for (const [type, button] of [
  ['chat', 'Start a chat'],
  ['request', 'Ask for help'],
  ['offer', 'Offer help'],
] as const) {
  test(`${type} form preserves content and selected expiry`, async ({
    page,
  }) => {
    await page.goto('/e2e/fixtures/forms.html');
    await page.getByRole('button', { name: new RegExp(button) }).click();
    await page
      .getByRole('textbox', { name: 'Topic (optional)' })
      .fill('Hello neighbors');
    await page
      .getByRole('textbox', { name: 'Message', exact: true })
      .fill('Meet us in the park.');
    await page.getByRole('combobox', { name: 'Visible for' }).click();
    await page.getByRole('option', { name: '2 days', exact: true }).click();
    await page.getByRole('button', { name: 'Post', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const posted = JSON.parse((await page.locator('#posted').textContent())!);
    expect(posted).toMatchObject({
      type,
      title: 'Hello neighbors',
      description: 'Meet us in the park.',
    });
    expect(
      Math.abs(Date.parse(posted.valid_until) - Date.now() - 2 * 86400000)
    ).toBeLessThan(10000);
  });
}

test('place and story forms retain their payloads', async ({ page }) => {
  await page.goto('/e2e/fixtures/forms.html');
  await page.getByRole('button', { name: /Add a place/ }).click();
  await page
    .getByRole('textbox', { name: 'Name', exact: true })
    .fill('Neighborhood garden');
  await page
    .getByRole('textbox', { name: 'Very brief description' })
    .fill('A place to grow');
  await page.getByRole('textbox', { name: 'Website URL' }).fill('example.com');
  await page
    .getByRole('textbox', { name: 'Description', exact: true })
    .fill('Open to everyone.');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(
    JSON.parse((await page.locator('#posted').textContent())!)
  ).toMatchObject({
    type: 'place',
    title: 'Neighborhood garden',
    short_description: 'A place to grow',
    description: 'Open to everyone.',
    url: 'example.com',
    valid_until: '2100-01-05T09:00:00.000Z',
  });
  await page.getByRole('button', { name: /Share a story/ }).click();
  await page
    .getByRole('textbox', { name: 'Subject' })
    .fill('A lovely afternoon');
  await page
    .getByRole('textbox', { name: 'Story', exact: true })
    .fill('Today we met our new neighbors.');
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(
    JSON.parse((await page.locator('#posted').textContent())!)
  ).toMatchObject({
    type: 'story',
    title: 'A lovely afternoon',
    description: 'Today we met our new neighbors.',
  });
});

test('comments submit with Enter and clear after success', async ({ page }) => {
  await page.goto('/e2e/fixtures/forms.html');
  const send = page.getByRole('button', { name: 'Send comment' });
  await expect(send).toBeDisabled();
  const input = page.getByRole('textbox', { name: 'Your comment' });
  await input.fill('See you there!');
  await input.press('Enter');
  await expect(page.locator('#commented')).toHaveText('See you there!');
  await expect(input).toHaveValue('');
  await expect(send).toBeDisabled();
});

test('external image uploader can receive keyboard focus inside a post dialog', async ({
  page,
}) => {
  await page.goto('/e2e/fixtures/forms.html?upload');
  await page.getByRole('button', { name: 'Upload logo' }).click();
  const input = page.getByRole('textbox', { name: 'Image URL' });
  await expect(input).toBeFocused();
  await input.pressSequentially('https://example.com/logo.png');
  await page.getByRole('button', { name: 'Use image' }).click();
  await expect(page.locator('#uploaded')).toHaveText(
    'https://example.com/logo.png'
  );
});

test('failed comments preserve the draft for retry', async ({ page }) => {
  await page.goto('/e2e/fixtures/forms.html');
  const input = page.getByRole('textbox', { name: 'Your comment' });
  await input.fill('retry');
  page.once('dialog', (dialog) => dialog.accept());
  await input.press('Enter');
  await expect(input).toHaveValue('retry');
  await expect(
    page.getByRole('button', { name: 'Send comment' })
  ).toBeEnabled();
  await input.fill('Retry succeeded');
  await input.press('Enter');
  await expect(page.locator('#commented')).toHaveText('Retry succeeded');
});
